import { hex } from './utils';
import Register from './register';

const CLOCK_SPEED = 540; // hertz
const DELAY_DECAY_RATE = 60; // hertz
const DELAY_RATIO = CLOCK_SPEED / DELAY_DECAY_RATE; // delays per clock cycle
const MEMORY_SIZE = 0xFFF; // 4k
const MEMORY_START = 0x200; // Offset due to original BIOS location etc

const hexFont = [
    0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
    0x20, 0x60, 0x20, 0x20, 0x70, // 1
    0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
    0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
    0x90, 0x90, 0xF0, 0x10, 0x10, // 4
    0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
    0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
    0xF0, 0x10, 0x20, 0x40, 0x40, // 7
    0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
    0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
    0xF0, 0x90, 0xF0, 0x90, 0x90, // A
    0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
    0xF0, 0x80, 0x80, 0x80, 0xF0, // C
    0xE0, 0x90, 0x90, 0x90, 0xE0, // D
    0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
    0xF0, 0x80, 0xF0, 0x80, 0x80, // F
];

const keyMap = {
    0x1: '1', 0x2: '2', 0x3: '3', 0xC: '4',
    0x4: 'q', 0x5: 'w', 0x6: 'e', 0xD: 'r',
    0x7: 'a', 0x8: 's', 0x9: 'd', 0xE: 'f',
    0xA: 'z', 0x0: 'x', 0xB: 'c', 0xF: 'v'
}

export default class Emulator {
    constructor(playSound) {
        this.registers = Array(16).fill(null).map((_, i) => {
            let name = `V${i.toString(16)}`.toUpperCase();

            return new Register(name);
        });

        this.memoryRegister = new Register('I');

        this.delayTimer = 0;
        this.soundTimer = 0;
        this.playSound = playSound;

        this.registers.push(this.memoryRegister);
        this.loaded = false;
    }
    
    load(rom) {
        let romMemory = new Uint8Array(MEMORY_SIZE);

        romMemory.set(new Uint8Array(hexFont));
        romMemory.set(new Uint8Array(rom.data), MEMORY_START);

        this.memory = new DataView(romMemory.buffer);

        // Reset

        this.instructionCount = 0;
        this.log = [];
        this.stack = [];
        this.programCounter = MEMORY_START;
        this.registers.forEach((register) => register.value = 0);
        this.delayTimer = 0;
        this.clearScreen();

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

        // let next = this.processOpcode(this.memory.getUint16(this.programCounter));

        let opCode = this.memory.getUint16(this.programCounter);

        let topByte = opCode >>> 12;
        let nnn = opCode & 0x0FFF;
        let kk = opCode & 0x0FF;
        let n = opCode & 0x00F;
        let x = (opCode & 0x0F00) >>> 8;
        let y = (opCode & 0x00F0) >>> 4;

        let log = `${hex(opCode)}\t`;

        this.programCounter += 2;

        if (opCode === 0x00E0) {
            this.clearScreen();

            log += 'Clear screen';
        } else if (opCode === 0x00EE) {
            this.programCounter = this.stack.pop();

            log += `Return from subroutine to ${this.programCounter}`;
        } else if(topByte === 0x1) { // Goto NNN (0x1NNN)
            this.programCounter = nnn;

            log += `Goto ${nnn}`;
        } else if(topByte === 0x2) { // Call subroutine NNN (0x2NNN)
            this.stack.push(this.programCounter);

            this.programCounter = nnn;

            log += `Call subroutine @ ${nnn}`;
        } else if (topByte === 0x3) { // Skip next if VX equals NN (0x3XNN)
            if (this.registers[x].value === kk) {
                this.programCounter += 2;

                log += `Skip next as ${this.registers[x].name} === ${kk}`;
            } else {
                log += `No skip as ${this.registers[x].name} !== ${kk}`;
            }
        } else if (topByte === 0x4) { // Skip next if VX != NN (0xAXNN)
            if (this.registers[x].value !== kk) {
                this.programCounter += 2;

                log += `Skip next as ${this.registers[x].name} !== ${kk}`;
            } else {
                log += `No skip as ${this.registers[x].name} === ${kk}`;
            }
        } else if (topByte === 0x5) { // Skip if VX === VY (0x5XY0)
            if (this.registers[x].value === this.registers[y].value) {
                this.programCounter += 2;

                log += `Skip next as ${this.registers[x].name} === ${this.registers[y].name}`;
            } else {
                log += `No skip as ${this.registers[x].name} !== ${this.registers[y].name}`;
            }
        } else if (topByte === 0x6) { // Assign register (0x6XNN)
            this.registers[x].value = kk;

            log += `Set ${this.registers[x].name} to ${kk}`;
        } else if(topByte === 0x7) { // Add NN to VX (0x7XNN)
            this.registers[x].value = (this.registers[x].value + kk) % 256; // 8 bit registers
            
            log += `Add ${kk} to ${this.registers[x].name}`;
        } else if (topByte === 0x8) { // Mathematical commands
            switch (n) {
                case 0: // Set VX to the value of VY
                    this.registers[x].value = this.registers[y].value;

                    log += `Set ${this.registers[x].name} to value of ${this.registers[y].name}`;
                    break;
                case 1: // Sets VX to VX | VY. (Bitwise OR operation)
                    this.registers[x].value |= this.registers[y].value;

                    log += `Bitwise: ${this.registers[x].name} OR ${this.registers[y].name}`;
                    break;
                case 2: // Sets VX to VX & VY. (Bitwise AND operation)
                    this.registers[x].value &= this.registers[y].value;

                    log += `Bitwise: ${this.registers[x].name} AND ${this.registers[y].name}`;
                    break;
                case 3: // Sets VX to VX xor VY. (Bitwise XOR operation)
                    this.registers[x].value ^= this.registers[y].value;

                    log += `Bitwise: ${this.registers[x].name} XOR ${this.registers[y].name}`;
                    break;
                case 4:
                    this.registers[x].value += this.registers[y].value;

                    this.registers[0xF].value = 0; // TODO: Somehow set carry flag

                    log += `Add ${this.registers[y].name} to ${this.registers[x].name}`;
                    break;
                case 5:
                    this.registers[x].value -= this.registers[y].value;

                    this.registers[0xF].value = 0; // TODO: Somehow set carry flag

                    log += `Subtract ${this.registers[y].name} from ${this.registers[x].name}`;
                    
                    break;
                case 6: // Sets VX to VY right shifted by 1
                    this.registers[0xF].value = this.registers[y].value & 0x000F;
                    this.registers[x].value = this.registers[y].value >>> 1;

                    log += `Bitwise: ${this.registers[y].name} >>> 1`;
                    break;
                case 7: // Sets VX to VY - VX
                    this.registers[x].value = this.registers[y].value - this.registers[x].value;
                    log += `Subtract ${this.registers[x].name} from ${this.registers[y].name}`;
                    break;
                case 0xE: // Sets VX to VY shifted to the left by 1
                    this.registers[0xF].value = (this.registers[y].value & 0xF000) >>> 12;
                    this.registers[x].value = this.registers[y].value << 1;
                    log += `Bitwise: ${this.registers[y].name} <<< 1`;
                    break;
            }
        } else if (topByte === 0x9) { // Skip if VX !== VY
            if (this.registers[x].value !== this.registers[y].value) {
                this.programCounter += 2;

                log += `Skipping as ${this.registers[x].name} === ${this.registers[y].name}`;
            } else {
                log += `Not skipping as ${this.registers[x].name} !== ${this.registers[y].name}`;
            }
        } else if (topByte === 0xA) { // Assign memory register (0xANNN)
            this.memoryRegister.value = nnn;

            log += `Set I to ${nnn}`;
        } else if (topByte === 0xB) { // Jump to NNN
            this.programCounter = this.registers[0].value + nnn;

            log += `Jump to V0 + ${nnn}: ${this.programCounter}`;
        } else if (topByte === 0xC) { // Rand (0xCXNN)
            let rand = Math.floor(Math.random() * 255);

            this.registers[x].value = kk & rand;

            log += `Randomise ${this.registers[x].name} with ${kk} & rand:${rand}`;
        } else if(topByte === 0xD) { // Display! 0xDXYN
            let spriteX = this.registers[x].value;
            let spriteY = this.registers[y].value;
            let spriteHeight = opCode & 0x000F;

            this.registers[0xF].value = 0; // Reset collision register

            for (let offsetY = 0; offsetY < spriteHeight; offsetY++) {
                let spriteLine = this.memory.getUint8(this.memoryRegister.value + offsetY);
                
                for(let offsetX = 0; offsetX < 8; offsetX++) {
                    let mask = 1 << offsetX;

                    if (spriteLine & mask) {
                        let screenX = (spriteX + (8 - offsetX)) % 64;
                        let screenY = (spriteY + offsetY) % 32;

                        if (this.screen[screenY][screenX] === 1) { // Collision
                            this.registers[0xF].value = 1;
                        }

                        this.screen[screenY][screenX] ^= 1;
                    }
                }
            }
            
            log += `Display sprite at (${x},${y}) of height ${spriteHeight} from I`;
        } else if (topByte === 0xE) { // Handle keyboard input
            const key = keyMap[this.registers[x].value];

            if (kk === 0x9E) { // Skip the next instruction if the key at X is pressed
                if (keysDown.indexOf(key) !== -1) {
                    this.programCounter += 2;

                    log += `Skip as ${key} is pressed`;
                } else {
                    log += `No skip as ${key} not pressed`;
                }
            } else if (kk === 0xA1) { // Skip the next instruction if the key at X isn't pressed
                if (keysDown.indexOf(key) === -1) {
                    this.programCounter += 2;

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
                        this.registers[i].value = this.memory.getInt16(this.memoryRegister.value + i);
                    }
                    log += `Storing values V0 to V${x} in memory`;
                    break;
            }
        } else {
            debugger;
        }

        this.processTimers();

        this.log.push(log);

        return {
            screen: this.screen,
            registers: this.registers,
            log: this.log
        };
    }

    processOpcode(opCode) {
        return {
            command: opCode >>> 12,
            nnn: opCode & 0x0FFF,
            kk: opCode & 0x0FF,
            n: opCode & 0x00F,
            x: (opCode & 0x0F00) >>> 8,
            y: (opCode & 0x00F0) >>> 4
        }
    }

    processTimers() {
        this.instructionCount++;
        
        if (this.delayTimer > 0 && this.instructionCount % DELAY_RATIO === 0) {
            this.delayTimer--;
        }

        if (this.soundTimer > 0) {
             if (this.instructionCount % DELAY_RATIO === 0) {
                 this.soundTimer--;

                 if (this.soundTimer === 0) {
                     this.playSound();
                 }
             }
        }
    }
}