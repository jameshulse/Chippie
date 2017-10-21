import { formatHex } from './utils';
import Register from './register';
import interpreter from './interpreter';
import hexFont from './hexFont';
import * as debug from './debugger';

const CLOCK_SPEED = 540; // hertz
const DELAY_DECAY_RATE = 60; // hertz
const DELAY_RATIO = CLOCK_SPEED / DELAY_DECAY_RATE; // delays per clock cycle
const MEMORY_SIZE = 0xFFF; // 4k
const MEMORY_START = 0x200; // Offset due to original BIOS location etc

export default class Emulator {
    /*
     * Construct a new Emulator Instance
     * 
     *  playSound: Function
     *      Called when a sound should be played
     */
    constructor(playSound, repaint, keyboard) {
        this.registers = Array(16).fill(null).map((_, i) => {
            let name = `V${i.toString(16).toUpperCase()}`;

            return new Register(name);
        });

        this.memoryRegister = new Register('I');
        this.registers.push(this.memoryRegister);

        this.playSound = playSound;
        this.repaint = repaint;
        this.keyboard = keyboard;

        this.reset();
    }
    
    reset() {
        this.delayTimer = 0;
        this.instructionCount = 0;
        this.interval = null;
        this.loaded = false;
        this.pc = MEMORY_START;
        this.registers.forEach((register) => register.value = 0);
        this.running = false;
        this.soundTimer = 0;
        this.stack = [];
        this.halted = false;

        this.clearScreen();
    }
    
    load(rom) {
        let romMemory = new Uint8Array(MEMORY_SIZE);

        romMemory.set(new Uint8Array(hexFont));
        romMemory.set(new Uint8Array(rom.data), MEMORY_START);

        this.memory = new DataView(romMemory.buffer);

        this.reset();

        this.loaded = true;
        
        return debug.parse(rom);
    }

    clearScreen() {
        this.screen = new Array(32).fill(null).map((array) => new Array(64).fill(0));
    }

    run() {
        this.running = true;

        let frame = () => {
            for (let i = 0; i < 10; i++) {
                this.cycle();
            }

            this.interval = requestAnimationFrame(frame);
        }

        this.interval = requestAnimationFrame(frame);
    }

    stop() {
        this.running = false;

        cancelAnimationFrame(this.interval);
    }

    cycle() {
        if (!this.loaded) {
            throw new Error('ROM not loaded');
        }

        if (this.halted) {
            return;
        }

        this.registers.forEach((register) => register.updated = false);

        let instruction = this.memory.getUint16(this.pc);
        let execute = interpreter(instruction);

        execute(this);

        this.processTimers();

        return {
            screen: this.screen,
            registers: this.registers,
            pc: this.pc,
            sourceIndex: (this.pc - 0x200) / 2
        };
    }

    processTimers() {
        this.instructionCount++;
        
        if (this.delayTimer > 0 && this.instructionCount % DELAY_RATIO === 0) {
            this.delayTimer--;
        }

        if (this.soundTimer > 0 && this.instructionCount % DELAY_RATIO === 0) {
            this.soundTimer--;

            if (this.soundTimer === 0) {
                this.playSound();
            }
        }
    }
}