import { hex } from './utils';

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
        this.log = [];
        this.stack = [];
        this.programCounter = 0;
        this.registers.forEach((register) => register.value = 0);
        this.loaded = true;

        this.clearScreen();
    }

    clearScreen() {
        this.screen = new Array(32).fill(null).map((array) => new Array(64).fill(0));
    }

    logLine(text) {
        this.log.push(text);
    }

    step() {
        if (!this.loaded) {
            throw new Error('ROM not loaded');
        }

        this.registers.forEach((register) => register.updated = false);

        // https://en.wikipedia.org/wiki/CHIP-8#Virtual_machine_description

        let opCode = this.getNextOpcode();
        let topByte = opCode >>> 12;
        let log = `${hex(opCode)}\t`;

        if (opCode === 0x00E0) {
            this.clearScreen();

            log += 'Clear screen';
        } else if (topByte === 0x4) { // Skip next if register X != NN (0xAXNN)
            let register = (opCode & 0x0F00) >>> 8;
            let value = opCode & 0x00FF;

            if (this.registers[register].value !== value) {
                this.programCounter += 2;

                log += `skip next as V${register} !== ${value}`;
            } else {
                log += `no skip as V${register} === ${value}`;
            }
        } else if (topByte === 0x6) { // Assign register (0x6XNN)
            let register = (opCode & 0x0F00) >>> 8;
            let value = (opCode & 0x00FF);

            this.registers[register].value = value;
            this.registers[register].updated = true;

            log += `set V${register} to ${value}`;
        } else if (topByte === 0xA) { // Assign memory register (0xANNN)
            let value = opCode & 0x0FFF;

            this.memoryRegister.value = value;
            this.memoryRegister.updated = true;

            log += `set I to ${value}`;
        } else if(topByte === 0xD) { // Display! 0xDXYN
            let regX = (opCode & 0x0F00) >>> 8;
            let regY = (opCode & 0x00F0) >>> 4;
            let x = this.registers[regX].value;
            let y = this.registers[regY].value;
            let spriteHeight = opCode & 0x000F;

            for (let offset = 0; offset < spriteHeight; offset++) {
                let spriteLine = this.rom.data.getUint8(this.memoryRegister.value - 0x200 + offset);
                
                for(let shift = 7; shift >= 0; shift--) {
                    let pixel = spriteLine >>> shift;

                    this.screen[y + offset][x + 7 - shift] = pixel;

                    // TODO: Check if screen value changed
                }
            }

            log += `Display sprite at (${x},${y}) of height ${spriteHeight} from I`;
        } else if(topByte === 0xE) { // Handle keyboard input
            // TODO
        } else if (topByte & 0xF007 === 0xF007) { // Get value from delay timer (0xFX07)
            let register = (opCode & 0x0F00) >> 8;

            // TODO
        } else {
            debugger;
        }

        this.logLine(log);
        this.programCounter += 2;

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