import * as instructions from './instructions';

export function commandMap(params) {
    switch (params.command) {
        case 0x0:
            switch (params.instruction) {
                case 0x0000:
                    return; // Ignore for now: seen in Tetris ROM
                case 0x00E0:
                    return instructions.dispClear();
                case 0x00EE:
                    return instructions.popStack();
            }
        case 0x1:
            return instructions.jumpToAddress(params.nnn);
        case 0x2:
            return instructions.callRoutine(params.nnn);
        case 0x3:
            return instructions.skipIfRegisterEqualsValue(params.x, params.kk);
        case 0x4:
            return instructions.skipIfRegisterNotEqualValue(params.x, params.kk);
        case 0x5:
            return instructions.skipIfRegistersEqual(params.x, params.y);
        case 0x6:
            return instructions.assignValueToRegister(params.x, params.kk);
        case 0x7:
            return instructions.addNumberToRegister(params.x, params.kk);
        case 0x8:
            switch (params.n) {
                case 0x0:
                    return instructions.assignRegisterToRegister(params.x, params.y);
                case 0x1:
                    return instructions.setVxToVxOrVy(params.x, params.y);
                case 0x2:
                    return instructions.setVxToVxAndVy(params.x, params.y);
                case 0x3:
                    return instructions.setVxToVxXorVy(params.x, params.y);
                case 0x4:
                    return instructions.addVyToVxWithCarry(params.x, params.y);
                case 0x5:
                    return instructions.subtractVyFromVx(params.x, params.y);
                case 0x6:
                    return instructions.shiftVyRight(params.x, params.y);
                case 0x7:
                    return instructions.subtractVxFromVy(params.x, params.y);
                case 0xE:
                    return instructions.shiftVyLeft(params.x, params.y);
            }
        case 0x9:
            return instructions.skipIfRegistersNotEqual(params.x, params.y);
        case 0xA:
            return instructions.assignMemoryRegisterToValue(params.nnn);
        case 0xB:
            return instructions.jumpToV0PlusNNN(params.nnn);
        case 0xC:
            return instructions.assignRandomValue(params.x, params.kk);
        case 0xD:
            return instructions.drawSprite(params.x, params.y, params.n);
        case 0xE:
            switch (params.kk) {
                case 0x9E:
                    return instructions.skipIfKeyPressed(params.x);
                case 0xA1:
                    return instructions.skipIfKeyNotPressed(params.x);
            }
        case 0xF:
            switch (params.kk) {
                case 0x07:
                    return instructions.setVxToDelayTimer(params.x);
                case 0x0A:
                    return instructions.waitForKey(params.x);
                case 0x15:
                    return instructions.setDelayTimer(params.x);
                case 0x18:
                    return instructions.setSoundTimer(params.x);
                case 0x1E:
                    return instructions.addVxToMemoryRegister(params.x);
                case 0x29:
                    return instructions.setMemoryRegisterToFont(params.x);
                case 0x33:
                    return instructions.binaryEncode(params.x);
                case 0x55:
                    return instructions.registerDump(params.x);
                case 0x65:
                    return instructions.registerLoad(params.x);
            }
        default:
            throw new Error('Unknown instruction', params);
    }
}

export function decode(instruction) {
    return {
        command: instruction >>> 12,
        instruction,
        nnn: instruction & 0x0FFF,
        kk: instruction & 0x00FF,
        n: instruction & 0x000F,
        x: (instruction & 0x0F00) >>> 8,
        y: (instruction & 0x00F0) >>> 4
    };
}

export function getCommand(instruction) {
    let params = decode(instruction);
    let command = commandMap(params);

    return command;
}

export default getCommand;