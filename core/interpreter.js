import * as instructions from './instructions';

export function commandMap(params) {
    switch (params.command) {
        case 0x0:
            switch (params.instruction) {
                case 0x00E0:
                    return instructions.dispClear();
                case 0x00EE:
                    return instructions.popStack();
            }
        case 0x1:
            return instructions.jumpToAddress(params.nnn)
        case 0x2:
            return instructions.callRoutine(params.nnn)
        case 0x3:
            break;
        case 0x4:
            break;
        case 0x5:
            break;
        case 0x6:
            break;
        case 0x7:
            break;
        case 0x8:
            break;
        case 0x9:
            break;
        case 0xA:
            break;
        case 0xB:
            break;
        case 0xC:
            break;
        case 0xD:
            break;
        case 0xE:
            break;
        case 0xF:
            break;
        default:
            return null;
    }
}

export function decode(instruction) {
    return {
        command: instruction >>> 12,
        instruction,
        nnn: instruction & 0x0FFF,
        kk: instruction & 0x0FF,
        n: instruction & 0x00F,
        x: (instruction & 0x0F00) >>> 8,
        y: (instruction & 0x00F0) >>> 4
    };
}

export function getCommand(instruction) {
    let params = decode(instruction);
    let command = commandMap(params);

    if (!command) {
        console.log('Unknown instruction', params);
        
        return null;
    }

    return command;
}

export default getCommand;