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

        this.registers.push(this.memoryRegister);
        this.loaded = false;
    }
    
    load(rom) {
        this.rom = rom;

        // Reset

        this.instructionCount = 0;
        this.log = [];
        this.stack = [];
        this.programCounter = 0;
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

        let opCode = this.getNextOpcode();
        let topByte = opCode >>> 12;
        let log = `${hex(opCode)}\t`;

        this.programCounter += 2;

        if (opCode === 0x00E0) {
            this.clearScreen();

            log += 'Clear screen';
        } else if (opCode === 0x00EE) {
            this.programCounter = this.stack.pop();

            log += `Return from subroutine to ${this.programCounter + MEMORY_START}`;
        } else if(topByte === 0x1) { // Goto NNN (0x1NNN)
            let location = opCode & 0x0FFF;

            this.programCounter = location - MEMORY_START;

            log += `Goto ${location}`;
        } else if(topByte === 0x2) { // Call subroutine NNN (0x2NNN)
            let routineLocation = opCode & 0x0FFF;

            this.stack.push(this.programCounter);

            this.programCounter = routineLocation - MEMORY_START;

            log += `Call subroutine @ ${routineLocation}`;
        } else if (topByte === 0x3) { // Skip next if VX equals NN (0x3XNN)
            let register = this.registers[(opCode & 0x0F00) >>> 8];
            let value = opCode & 0x00FF;

            if (register.value === value) {
                this.programCounter += 2;

                log += `Skip next as ${register.name} === ${value}`;
            } else {
                log += `No skip as ${register.name} !== ${value}`;
            }
        } else if (topByte === 0x4) { // Skip next if VX != NN (0xAXNN)
            let register = this.registers[(opCode & 0x0F00) >>> 8];
            let value = opCode & 0x00FF;

            if (register.value !== value) {
                this.programCounter += 2;

                log += `Skip next as ${register.name} !== ${value}`;
            } else {
                log += `No skip as ${register.name} === ${value}`;
            }
        } else if (topByte === 0x5) { // Skip if VX === VY (0x5XY0)
            let registerX = this.registers[(opCode & 0x0F00) >>> 8];
            let registerY = this.registers[(opCode & 0x00F0) >>> 4];

            if (registerX.value === registerY.value) {
                this.programCounter += 2;

                log += `Skip next as ${registerX.name} === ${registerY.name}`;
            } else {
                log += `No skip as ${registerX.name} !== ${registerY.name}`;
            }
        } else if (topByte === 0x6) { // Assign register (0x6XNN)
            let register = this.registers[(opCode & 0x0F00) >>> 8];
            let value = (opCode & 0x00FF);

            register.value = value;
            register.updated = true;

            log += `Set ${register.name} to ${value}`;
        } else if(topByte === 0x7) { // Add NN to VX (0x7XNN)
            let register = this.registers[(opCode & 0x0F00) >>> 8];
            let value = (opCode & 0x00FF);

            register.value += value % 256; // 8 bit registers
            register.updated = true;
            
            log += `Add ${value} to ${register.name}`;
        } else if (topByte === 0x8) { // Assign VX to VY
            // TODO: There are overs 0x8 functions

            let registerX = this.registers[(opCode & 0x0F00) >>> 8];
            let registerY = this.registers[(opCode & 0x00F0) >>> 4];

            registerX.value = registerY.value;
            registerX.updated = true;

            log += `Set ${registerX.name} to value of ${registerY.name}`;
        } else if (topByte === 0xA) { // Assign memory register (0xANNN)
            let value = opCode & 0x0FFF;

            this.memoryRegister.value = value;
            this.memoryRegister.updated = true;

            log += `Set I to ${value}`;
        } else if (topByte === 0xC) { // Rand (0xCXNN)
            let register = this.registers[(opCode & 0x0F00) >>> 8];
            let value = opCode & 0x0FFF;
            let rand = Math.floor(Math.random() * 255);

            register.value = value & rand;
            register.updated = true;

            log += `Randomise ${register.name} with ${value} & rand:${rand}`;
        } else if(topByte === 0xD) { // Display! 0xDXYN
            let regX = (opCode & 0x0F00) >>> 8;
            let regY = (opCode & 0x00F0) >>> 4;
            let x = this.registers[regX].value;
            let y = this.registers[regY].value;
            let spriteHeight = opCode & 0x000F;

            this.registers[0xF].value = 0;

            for (let offset = 0; offset < spriteHeight; offset++) {
                let spriteLine = this.rom.data.getUint8(this.memoryRegister.value - MEMORY_START + offset);
                
                for(let pixelX = 0; pixelX < 8; pixelX++) {
                    let mask = 1 << pixelX;

                    if (spriteLine & mask) {
                        let screenX = (x + (8 - pixelX)) % 64;
                        let screenY = (y + offset) % 32;

                        if (this.screen[screenY][screenX] === 1) { // Collision
                            this.registers[0xF].value = 1; // TODO: hack to get to VF
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
            let register = this.registers[(opCode & 0x0F00) >> 8];

            register.value = this.delayTimer;
            register.updated = true;

            log += `Set ${register.name} to delay timer`;
        } else if ((opCode & 0xF015) === 0xF015) { // Set delay timer (FX15)
            let register = this.registers[(opCode & 0x0F00) >>> 8];

            this.delayTimer = register.value;

            log += `Set delay timer to ${register.name}`;
        } else if ((opCode & 0xF01E) === 0xF01E) { // Add X to I(0xFX1E)
            let offset = (opCode & 0x0F00) >>> 8;

            this.memoryRegister.value += offset;
            this.memoryRegister.updated = true;

            log += `Add ${offset} to I`;
        } else {
            debugger;
        }

        this.instructionCount++;

        if (this.delayTimer && this.instructionCount % DELAY_RATIO === 0 && this.delayTimer > 0) {
            this.delayTimer--;
        }

        this.log.push(log);

        return {
            screen: this.screen,
            registers: this.registers,
            log: this.log
        };
    }

    getNextOpcode() {
        return this.rom.data.getUint16(this.programCounter);
    }
}