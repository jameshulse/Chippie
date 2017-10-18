import { hex } from './utils';
import Register from './register';
import interpreter from './interpreter';
import hexFont from './hexFont';
import * as debug from './debugger';

const CLOCK_SPEED = 540; // hertz
const DELAY_DECAY_RATE = 60; // hertz
const DELAY_RATIO = CLOCK_SPEED / DELAY_DECAY_RATE; // delays per clock cycle
const MEMORY_SIZE = 0xFFF; // 4k
const MEMORY_START = 0x200; // Offset due to original BIOS location etc

const keyMap = {
    0x1: '1', 0x2: '2', 0x3: '3', 0xC: '4',
    0x4: 'q', 0x5: 'w', 0x6: 'e', 0xD: 'r',
    0x7: 'a', 0x8: 's', 0x9: 'd', 0xE: 'f',
    0xA: 'z', 0x0: 'x', 0xB: 'c', 0xF: 'v'
};

export default class Emulator {
    /*
     * Construct a new Emulator Instance
     * 
     *  playSound: Function
     *      Called when a sound should be played
     */
    constructor(playSound, repaint) {
        this.registers = Array(16).fill(null).map((_, i) => {
            let name = `V${i.toString(16).toUpperCase()}`;

            return new Register(name);
        });

        this.memoryRegister = new Register('I');
        this.registers.push(this.memoryRegister);

        this.playSound = playSound;
        this.repaint = repaint;

        this.reset();
    }
    
    reset() {
        this.delayTimer = 0;
        this.instructionCount = 0;
        this.interval = null;
        this.loaded = false;
        this.log = [];
        this.pc = MEMORY_START;
        this.registers.forEach((register) => register.value = 0);
        this.running = false;
        this.soundTimer = 0;
        this.stack = [];
        this.waitKey = null;

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

        this.interval = setInterval(() => {
            let result = this.cycle();

            this.repaint(result.screen);
        }, 0);
    }

    stop() {
        this.running = false;

        clearInterval(this.interval);
    }

    cycle() {
        if (!this.loaded) {
            throw new Error('ROM not loaded');
        }

        if(this.waitKey) {
            console.log('waiting');
            return;
        }

        this.registers.forEach((register) => register.updated = false);

        let instruction = this.memory.getUint16(this.pc);
        
        this.pc += 2;
        
        let execute = interpreter(instruction);
        let log = `${hex(instruction)}\t`;

        execute(this);

        this.processTimers();

        if (this.soundTimer > 0) {
            this.playSound();
        }

        return {
            screen: this.screen,
            registers: this.registers,
            pc: this.pc,
            sourceIndex: (this.pc - 0x200) / 2
            // log: this.log
        };
    }

    processTimers() {
        this.instructionCount++;
        
        if (this.delayTimer > 0 && this.instructionCount % DELAY_RATIO === 0) {
            this.delayTimer--;
        }

        if (this.soundTimer > 0 && this.instructionCount % DELAY_RATIO === 0) {
            this.soundTimer--;
        }
    }
}