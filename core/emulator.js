import { hex } from './utils';

const CLOCK_SPEED = 540; // hertz
const DELAY_DECAY_RATE = 60; // hertz
const DELAY_RATIO = CLOCK_SPEED / DELAY_DECAY_RATE; // delays per clock cycle
const MEMORY_START = 0x200;

export default class Emulator {
    constructor() {
        this.registers = Array(16).fill(null).map((_, i) => ({
            name: `V${i.toString(16)}`.toUpperCase(),
            value: 0
        }));

        this.memoryRegister = { name: 'I', value: 0 };
        this.delayTimer = 0;

        this.registers.push(this.memoryRegister);
        this.loaded = false;
    }
    
    load(rom) {
        // Offset the ROM memory by 0x200 where all programs start

        let romMemory = new Uint8Array(rom.data.byteLength + MEMORY_START);

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

    step() {
        if (!this.loaded) {
            throw new Error('ROM not loaded');
        }

        this.registers.forEach((register) => register.updated = false);

        // See: https://en.wikipedia.org/wiki/CHIP-8#Virtual_machine_description

        let opCode = this.memory.getUint16(this.programCounter);
        let topByte = opCode >>> 12;
        let nnn = opCode & 0x0FFF;
        let nn = opCode & 0x0FF;
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
            let register = this.registers[x];

            if (register.value === nn) {
                this.programCounter += 2;

                log += `Skip next as ${register.name} === ${nn}`;
            } else {
                log += `No skip as ${register.name} !== ${nn}`;
            }
        } else if (topByte === 0x4) { // Skip next if VX != NN (0xAXNN)
            let register = this.registers[x];

            if (register.value !== nn) {
                this.programCounter += 2;

                log += `Skip next as ${register.name} !== ${nn}`;
            } else {
                log += `No skip as ${register.name} === ${nn}`;
            }
        } else if (topByte === 0x5) { // Skip if VX === VY (0x5XY0)
            let registerX = this.registers[x];
            let registerY = this.registers[y];

            if (registerX.value === registerY.value) {
                this.programCounter += 2;

                log += `Skip next as ${registerX.name} === ${registerY.name}`;
            } else {
                log += `No skip as ${registerX.name} !== ${registerY.name}`;
            }
        } else if (topByte === 0x6) { // Assign register (0x6XNN)
            let register = this.registers[x];

            register.value = nn;
            register.updated = true;

            log += `Set ${register.name} to ${nn}`;
        } else if(topByte === 0x7) { // Add NN to VX (0x7XNN)
            let register = this.registers[x];

            register.value = (register.value + nn) % 256; // 8 bit registers
            register.updated = true;
            
            log += `Add ${nn} to ${register.name}`;
        } else if (topByte === 0x8) { // Assign VX to VY
            // TODO: There are other 0x8 functions

            let registerX = this.registers[x];
            let registerY = this.registers[y];

            registerX.value = registerY.value;
            registerX.updated = true;

            log += `Set ${registerX.name} to value of ${registerY.name}`;
        } else if (topByte === 0xA) { // Assign memory register (0xANNN)
            this.memoryRegister.value = nnn;
            this.memoryRegister.updated = true;

            log += `Set I to ${nnn}`;
        } else if (topByte === 0xC) { // Rand (0xCXNN)
            let register = this.registers[x];
            let rand = Math.floor(Math.random() * 255);

            register.value = nn & rand;
            register.updated = true;

            log += `Randomise ${register.name} with ${nn} & rand:${rand}`;
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
                            this.registers[0xF].updated = true;
                        }

                        this.screen[screenY][screenX] ^= 1;
                    }
                }
            }
            
            log += `Display sprite at (${x},${y}) of height ${spriteHeight} from I`;
        } else if(topByte === 0xE) { // Handle keyboard input
            debugger;
        } else if ((opCode & 0xF007) === 0xF007) { // Get delay timer (0xFX07)
            let register = this.registers[x];

            register.value = this.delayTimer;
            register.updated = true;

            log += `Set ${register.name} to delay timer`;
        } else if ((opCode & 0xF015) === 0xF015) { // Set delay timer (FX15)
            let register = this.registers[x];

            this.delayTimer = register.value;

            log += `Set delay timer to ${register.name}`;
        } else if ((opCode & 0xF01E) === 0xF01E) { // Add X to I(0xFX1E)
            this.memoryRegister.value += x;
            this.memoryRegister.updated = true;

            log += `Add ${x} to I`;
        } else {
            debugger;
        }

        this.instructionCount++;

        if (this.delayTimer > 0 && this.instructionCount % DELAY_RATIO === 0) {
            this.delayTimer--;
        }

        this.log.push(log);

        return {
            screen: this.screen,
            registers: this.registers,
            log: this.log
        };
    }
}