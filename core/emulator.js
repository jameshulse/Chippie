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
        this.programCounter = 0;
        this.registers.forEach((register) => register.value = 0);
        this.loaded = true;

        this.clearScreen();
    }

    clearScreen() {
        this.screen = new Array(32).fill(null).map((array) => new Array(64).fill(0));
    }

    step() {
        if (!this.loaded) {
            throw new Error('ROM not loaded');
        }

        this.registers.forEach((register) => register.updated = false);

        // https://en.wikipedia.org/wiki/CHIP-8#Virtual_machine_description

        let opCode = this.getNextOpcode();
        let topByte = opCode >>> 12;

        if (opCode === 0x00E0) {
            this.clearScreen();
        } else if (topByte === 0x4) { // Skip next if register X != NN (0xAXNN)
            let registerNumber = 
            this.programCounter += 2;
        } else if (topByte === 0x6) { // Assign register (0x6XNN)
            let register = (opCode & 0x0F00) >>> 8;
            let value = (opCode & 0x00FF);

            this.registers[register].value = value;
            this.registers[register].updated = true;
        } else if (topByte === 0xA) { // Assign memory register (0xANNN)
            let value = opCode & 0x0FFF;

            this.memoryRegister.value = value;
            this.memoryRegister.updated = true;
        } else {
            debugger;
        }

        this.programCounter += 2;

        return {
            screen: this.screen,
            registers: this.registers
        };
    }

    getNextOpcode() {
        return this.rom.data.getUint16(this.programCounter);
    }
}