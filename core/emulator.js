import { hex } from './utils';
import Register from './register';
import interpreter from './interpreter';
import hexFont from './hexFont';

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
    constructor(playSound) {
        this.registers = Array(16).fill(null).map((_, i) => {
            let name = `V${i.toString(16)}`.toUpperCase();

            return new Register(name);
        });

        this.memoryRegister = new Register('I');
        this.registers.push(this.memoryRegister);

        this.playSound = playSound;

        this.reset();
    }
    
    reset() {
        this.loaded = false;
        this.instructionCount = 0;
        this.log = [];
        this.stack = [];
        this.pc = MEMORY_START;
        this.registers.forEach((register) => register.value = 0);
        this.delayTimer = 0;
        this.soundTimer = 0;
        this.clearScreen();
    }
    
    load(rom) {
        let romMemory = new Uint8Array(MEMORY_SIZE);

        romMemory.set(new Uint8Array(hexFont));
        romMemory.set(new Uint8Array(rom.data), MEMORY_START);

        this.memory = new DataView(romMemory.buffer);

        this.reset();

        this.loaded = true;
    }

    clearScreen() {
        this.screen = new Array(32).fill(null).map((array) => new Array(64).fill(0));
    }

    step(keysDown) {
        if (!this.loaded) {
            throw new Error('ROM not loaded');
        }

        this.registers.forEach((register) => register.updated = false);

        let instruction = this.memory.getUint16(this.pc);
        
        this.pc += 2;
        
        let command = interpreter(instruction);
        
        let log = `${hex(instruction)}\t`;

        if (command) {
            command(this);
        } else {
            let opCode = instruction;
            let topByte = opCode >>> 12;
            let nnn = opCode & 0x0FFF;
            let kk = opCode & 0x0FF;
            let n = opCode & 0x00F;
            let x = (opCode & 0x0F00) >>> 8;
            let y = (opCode & 0x00F0) >>> 4;

            if (topByte === 0xE) { // Handle keyboard input
                const key = keyMap[this.registers[x].value];
    
                if (kk === 0x9E) { // Skip the next instruction if the key at X is pressed
                    if (keysDown.indexOf(key) !== -1) {
                        this.pc += 2;
    
                        log += `Skip as ${key} is pressed`;
                    } else {
                        log += `No skip as ${key} not pressed`;
                    }
                } else if (kk === 0xA1) { // Skip the next instruction if the key at X isn't pressed
                    if (keysDown.indexOf(key) === -1) {
                        this.pc += 2;
    
                        log += `Skip as ${key} is not pressed`;
                    } else {
                        log += `No skip as ${key} is pressed`;
                    }
                }
            } else if (topByte === 0xF) {
                switch (kk) {
                    case 0x07: // Get value from delay timer (0xFX07)
                        this.registers[x].value = this.delayTimer;
                        log += `Set ${this.registers[x].name} to delay timer`;
                        break;
                    case 0x0A: // Await for key press
                        break;
                    case 0x15:
                        this.delayTimer = this.registers[x].value;
                        log += `Set delay timer to ${this.registers[x].name}`;
                        break;
                    case 0x18:
                        this.soundTimer = this.registers[x].value;
                        log += `Set sound timer to ${this.registers[x].name}`;
                        break;
                    case 0x1E:
                        this.memoryRegister.value += x;
                        log += `Add ${x} to I`;
                        break;
                    case 0x29: // Set I to character font location of register X
                        this.memoryRegister.value = this.registers[x].value * 5;
                        log += `Set memory location for character ${hex(this.registers[x].value, 1)}`;
                        break;
                    case 0x33: // Binary encoded number
                        this.memory.setUint8(this.memoryRegister.value, Math.floor(this.registers[x].value / 100));
                        this.memory.setUint8(this.memoryRegister.value + 1, Math.floor(this.registers[x].value % 100 / 10));
                        this.memory.setUint8(this.memoryRegister.value + 2, Math.floor(this.registers[x].value % 100 % 10));
                        log += `Stored binary encoded value of ${this.registers[x].name}`;
                        break;
                    case 0x55: // reg_dump - Store registers V0 to VX to memory
                        for(let i = 0; i <= x; i++) {
                            this.memory.setInt16(this.memoryRegister.value + i, this.registers[i].value);
                        }
                        
                        log += `Storing values V0 to V${x} in memory`;
                        break;
                    case 0x65: // reg_load Store registers V0 to VX to memory
                        for (let i = 0; i <= x; i++) {
                            this.memoryRegister.value += i;

                            this.registers[i].value = this.memory.getInt16(this.memoryRegister.value);
                        }

                        log += `Storing values V0 to V${x} in memory`;
                        break;
                }
            } else {
                debugger;
            }
        }

        this.processTimers();

        if (this.soundTimer > 0) {
            this.playSound();
        }

        this.log.push(log);

        return {
            screen: this.screen,
            registers: this.registers,
            log: this.log
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