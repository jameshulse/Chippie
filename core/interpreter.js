import * as instructions from './instructions';
import { formatHex, hex } from './utils';

export function commandMap(params) {
    switch (params.command) {
        case 0x0:
            switch (params.instruction) {
                case 0x0000:
                    params.commandText = 'system call (ignored)';
                    return instructions.noop(); // Ignore for now: seen in Tetris ROM
                case 0x00E0:
                    params.commandText = 'disp_clear()';
                    return instructions.dispClear();
                case 0x00EE:
                    params.commandText = 'return';
                    return instructions.popStack();
            }
        case 0x1:
            params.commandText = `goto ${formatHex(params.nnn)}`;
            return instructions.jumpToAddress(params.nnn);
        case 0x2:
            params.commandText = `call *(${formatHex(params.nnn)})()`;
            return instructions.callRoutine(params.nnn);
        case 0x3:
            params.commandText = `skip if (V${hex(params.x)} == ${formatHex(params.nnn)})`;
            return instructions.skipIfRegisterEqualsValue(params.x, params.kk);
        case 0x4:
            params.commandText = `skip if (V${hex(params.x)} != ${formatHex(params.nnn)})`;
            return instructions.skipIfRegisterNotEqualValue(params.x, params.kk);
        case 0x5:
            params.commandText = `skip if (V${hex(params.x)} == V${hex(params.y)})`;
            return instructions.skipIfRegistersEqual(params.x, params.y);
        case 0x6:
            params.commandText = `V${hex(params.x)} = ${formatHex(params.kk)}`;
            return instructions.assignValueToRegister(params.x, params.kk);
        case 0x7:
            params.commandText = `V${hex(params.x)} += ${formatHex(params.kk)}`;
            return instructions.addNumberToRegister(params.x, params.kk);
        case 0x8:
            switch (params.n) {
                case 0x0:
                    params.commandText = `V${hex(params.x)} = V${hex(params.y)}`;
                    return instructions.assignRegisterToRegister(params.x, params.y);
                case 0x1:
                    params.commandText = `V${hex(params.x)} = V${hex(params.x)}|V${hex(params.y)}`;
                    return instructions.setVxToVxOrVy(params.x, params.y);
                case 0x2:
                    params.commandText = `V${hex(params.x)} = V${hex(params.x)}&V${hex(params.y)}`;
                    return instructions.setVxToVxAndVy(params.x, params.y);
                case 0x3:
                    params.commandText = `V${hex(params.x)} = V${hex(params.x)}^V${hex(params.y)}`;
                    return instructions.setVxToVxXorVy(params.x, params.y);
                case 0x4:
                    params.commandText = `V${hex(params.x)} += V${hex(params.y)}`;
                    return instructions.addVyToVxWithCarry(params.x, params.y);
                case 0x5:
                    params.commandText = `V${hex(params.x)} -= V${hex(params.y)}`;
                    return instructions.subtractVyFromVx(params.x, params.y);
                case 0x6:
                    params.commandText = `V${hex(params.x)} = V${hex(params.y)} >>> 1`;
                    return instructions.shiftVyRight(params.x, params.y);
                case 0x7:
                    params.commandText = `V${hex(params.x)} = V${hex(params.y)} - V${hex(params.x)}`;
                    return instructions.subtractVxFromVy(params.x, params.y);
                case 0xE:
                    params.commandText = `V${hex(params.x)} = V${hex(params.y)} << 1`;
                    return instructions.shiftVyLeft(params.x, params.y);
            }
        case 0x9:
            params.commandText = `if (V${hex(params.x)} != V${hex(params.y)})`;
            return instructions.skipIfRegistersNotEqual(params.x, params.y);
        case 0xA:
            params.commandText = `I = ${params.nnn}`;
            return instructions.assignMemoryRegisterToValue(params.nnn);
        case 0xB:
            params.commandText = `PC = V0 + ${params.nnn}`;
            return instructions.jumpToV0PlusNNN(params.nnn);
        case 0xC:
            params.commandText = `V${hex(params.x)} = rand() & NN`;
            return instructions.assignRandomValue(params.x, params.kk);
        case 0xD:
            params.commandText = `draw_sprite(x = ${params.x}, y = ${params.y}, n = ${params.n})`;
            return instructions.drawSprite(params.x, params.y, params.n);
        case 0xE:
            switch (params.kk) {
                case 0x9E:
                    params.commandText = `skip if (key() == V${hex(params.x)})`;
                    return instructions.skipIfKeyPressed(params.x);
                case 0xA1:
                    params.commandText = `skip if (key() != V${hex(params.x)})`;
                    return instructions.skipIfKeyNotPressed(params.x);
            }
        case 0xF:
            switch (params.kk) {
                case 0x07:
                    params.commandText = `V${hex(params.x)} = get_delay()`;
                    return instructions.setVxToDelayTimer(params.x);
                case 0x0A:
                    params.commandText = `V${hex(params.x)} = get_key()`;
                    return instructions.waitForKey(params.x);
                case 0x15:
                    params.commandText = `delay_timer(V${hex(params.x)})`;
                    return instructions.setDelayTimer(params.x);
                case 0x18:
                    params.commandText = `sound_timer(V${hex(params.x)})`;
                    return instructions.setSoundTimer(params.x);
                case 0x1E:
                    params.commandText = `I += V${hex(params.x)}`;
                    return instructions.addVxToMemoryRegister(params.x);
                case 0x29:
                    params.commandText = `I = sprite_addr[V${hex(params.x)}]`;
                    return instructions.setMemoryRegisterToFont(params.x);
                case 0x33:
                    params.commandText = `set_BCD(V${hex(params.x)});`;
                    return instructions.binaryEncode(params.x);
                case 0x55:
                    params.commandText = `reg_dump(V${params.x.toString(16)}, &I`;
                    return instructions.registerDump(params.x);
                case 0x65:
                    params.commandText = `reg_load(Vx, &I)`;
                    return instructions.registerLoad(params.x);
            }
        default:
            params.commandText = `Unknown: ${formatHex(params.instruction)}`;
            return instructions.noop();
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