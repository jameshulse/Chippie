import { binarySubtract, randomInt } from './utils';
import keyMap from './keymap';

export function noop() {
    return (state) => {
        state.pc = (state.pc + 2) & 0x0FFF;
    }
}

export function dispClear() {
    return (state) => {
        state.clearScreen();
        state.pc = (state.pc + 2) & 0x0FFF;
    };
};

export function popStack() {
    return (state) => {
        state.pc = state.stack.pop();
        state.pc = (state.pc + 2) & 0x0FFF;
    };
};

export function jumpToAddress(nnn) {
    return (state) => {
        state.pc = nnn & 0x0FFF;
    };
};

export function callRoutine(nnn) {
    return (state) => {
        state.stack.push(state.pc);

        state.pc = nnn;
    };
}

export function skipIfRegisterEqualsValue(x, kk) {
    return (state) => {
        if (state.registers[x].value === kk) {
            state.pc = (state.pc + 4) & 0x0FFF;
        } else {
            state.pc = (state.pc + 2) & 0x0FFF;
        }
    };
};

export function skipIfRegisterNotEqualValue(x, kk) {
    return (state) => {
        if (state.registers[x].value !== kk) {
            state.pc = (state.pc + 4) & 0x0FFF;
        } else {
            state.pc = (state.pc + 2) & 0x0FFF;
        }
    };
};

export function skipIfRegistersEqual(x, y) {
    return (state) => {
        if (state.registers[x].value === state.registers[y].value) {
            state.pc = (state.pc + 4) & 0x0FFF;
        } else {
            state.pc = (state.pc + 2) & 0x0FFF;
        }
    };
};

export function assignValueToRegister(x, kk) {
    return (state) => {
        state.registers[x].value = kk;
        state.pc = (state.pc + 2) & 0x0FFF;
    };
};

export function addNumberToRegister(x, kk) {
    return (state) => {
        state.registers[x].value += kk;

        if (state.registers[x].value > 255) {
            state.registers[x].value %= 256;
        }

        state.pc = (state.pc + 2) & 0x0FFF;
    };
};

export function assignRegisterToRegister(x, y) {
    return (state) => {
        state.registers[x].value = state.registers[y].value;
        state.pc = (state.pc + 2) & 0x0FFF;
    };
};

export function skipIfRegistersNotEqual(x, y) {
    return (state) => {
        if (state.registers[x].value !== state.registers[y].value) {
            state.pc = (state.pc + 4) & 0x0FFF;
        } else {
            state.pc = (state.pc + 2) & 0x0FFF;
        }
    };
};

export function assignMemoryRegisterToValue(nnn) {
    return (state) => {
        state.memoryRegister.value = nnn;
        state.pc = (state.pc + 2) & 0x0FFF;
    }
}

export function jumpToV0PlusNNN(nnn) {
    return (state) => {
        state.pc = state.registers[0].value + nnn;
    };
};

export function assignRandomValue(x, kk) {
    return (state) => {
        state.registers[x].value = randomInt(0, 256) & kk;
        state.pc = (state.pc + 2) & 0x0FFF;
    };
};

export function setVxToVxOrVy(x, y) {
    return (state) => {
        state.registers[x].value = state.registers[x].value | state.registers[y].value;
        state.pc = (state.pc + 2) & 0x0FFF;
    };
};

export function setVxToVxAndVy(x, y) {
    return (state) => {
        state.registers[x].value &= state.registers[y].value;
        state.pc = (state.pc + 2) & 0x0FFF;
    };
;}

export function setVxToVxXorVy(x, y) {
    return (state) => {
        state.registers[x].value ^= state.registers[y].value;
        state.pc = (state.pc + 2) & 0x0FFF;
    };
};

export function addVyToVxWithCarry(x, y) {
    return (state) => {
        state.registers[x].value += state.registers[y].value;

        if (state.registers[x].value > 255) {
            state.registers[x].value = state.registers[x].value % 256;
            state.registers[0xF].value = 1; // Carry flag
        }

        state.pc = (state.pc + 2) & 0x0FFF;
    };
};

export function subtractVyFromVx(x, y) {
    return (state) => {
        if (state.registers[y].value > state.registers[x].value) {
            state.registers[0xF].value = 1;
            
            state.registers[x].value = binarySubtract(state.registers[x].value, state.registers[y].value);
        } else {
            state.registers[0xF].value = 0;
            state.registers[x].value = state.registers[x].value - state.registers[y].value;
        }

        state.pc = (state.pc + 2) & 0x0FFF;
    };
};

export function shiftVyRight(x, y) {
    return (state) => {
        state.registers[0xF].value = state.registers[y].value & 0x1;
        state.registers[y].value >>>= 1;
        state.registers[x].value = state.registers[y].value;

        state.pc = (state.pc + 2) & 0x0FFF;
    };
};

export function subtractVxFromVy(x, y) {
    return (state) => {
        
        if (state.registers[x].value > state.registers[y].value) {
            state.registers[x].value = binarySubtract(state.registers[y].value, state.registers[x].value);
            state.registers[0xF].value = 1;
        } else {
            state.registers[x].value = state.registers[y].value - state.registers[x].value;
            state.registers[0xF].value = 0;
        }

        state.pc = (state.pc + 2) & 0x0FFF;
    };
};

export function shiftVyLeft(x, y) {
    return (state) => {
        state.registers[0xF].value = (state.registers[y].value & 0x80) >>> 7;
        state.registers[y].value = (state.registers[y].value << 1) % 256;
        state.registers[x].value = state.registers[y].value;

        state.pc = (state.pc + 2) & 0x0FFF;
    };
};

export function drawSprite(x, y, n) {
    return (state) => {
        let spriteX = state.registers[x].value;
        let spriteY = state.registers[y].value;

        state.registers[0xF].value = 0; // Reset collision register

        for (let offsetY = 0; offsetY < n; offsetY++) {
            let spriteLine = state.memory.getUint8(state.memoryRegister.value + offsetY);

            for (let offsetX = 0; offsetX < 8; offsetX++) {
                let mask = 1 << offsetX;

                if (spriteLine & mask) {
                    let screenX = (spriteX + (8 - offsetX)) % 64;
                    let screenY = (spriteY + offsetY) % 32;

                    if (state.screen[screenY][screenX] === 1) { // Collision
                        state.registers[0xF].value = 1;
                    }

                    state.screen[screenY][screenX] ^= 1;
                }
            }
        }

        state.repaint(state.screen);

        state.pc = (state.pc + 2) & 0x0FFF;
    };
};

export function setVxToDelayTimer(x) {
    return (state) => {
        state.registers[x].value = state.delayTimer;
        state.pc = (state.pc + 2) & 0x0FFF;
    };
};

export function setDelayTimer(x) {
    return (state) => {
        state.delayTimer = state.registers[x].value;
        state.pc = (state.pc + 2) & 0x0FFF;
    };
};

export function setSoundTimer(x) {
    return (state) => {
        state.soundTimer = state.registers[x].value;
        state.pc = (state.pc + 2) & 0x0FFF;
    };
};

export function addVxToMemoryRegister(x) {
    return (state) => {
        state.memoryRegister.value += state.registers[x].value;
        state.pc = (state.pc + 2) & 0x0FFF;
    };
};

export function setMemoryRegisterToFont(x) {
    const FONT_WIDTH = 5;

    return (state) => {
        state.memoryRegister.value = state.registers[x].value * FONT_WIDTH;
        state.pc = (state.pc + 2) & 0x0FFF;
    };
};

export function binaryEncode(x) {
    return (state) => {
        state.memory.setUint8(state.memoryRegister.value, Math.floor(state.registers[x].value / 100));
        state.memory.setUint8(state.memoryRegister.value + 1, Math.floor(state.registers[x].value % 100 / 10));
        state.memory.setUint8(state.memoryRegister.value + 2, Math.floor(state.registers[x].value % 100 % 10));
        state.pc = (state.pc + 2) & 0x0FFF;
    };
};

export function registerDump(x) {
    return (state) => {
        for (let i = 0; i <= x; i++) {
            state.memory.setUint8(state.memoryRegister.value, state.registers[i].value);
            state.memoryRegister.value += 1;
        }

        state.pc = (state.pc + 2) & 0x0FFF;
    };
};

export function registerLoad(x) {
    return (state) => {
        for (let i = 0; i <= x; i++) {
            state.registers[i].value = state.memory.getUint8(state.memoryRegister.value);
            state.memoryRegister.value += 1;
        }

        state.pc = (state.pc + 2) & 0x0FFF;
    };
};

export function waitForKey(x) {
    return (state) => {
        state.halted = true;

        state.keyboard.onNextKeyPress((key) => {
            state.halted = false;
            state.registers[x].value = keyMap.filter(k => keyMap[k] === key);
            state.pc = (state.pc + 2) & 0x0FFF;
        });
    };
};

export function skipIfKeyPressed(x) {
    return (state) => {
        let key = keyMap[state.registers[x].value];

        if (state.keyboard.isKeyPressed(key)) {
            state.pc = (state.pc + 2) & 0x0FFF;
        }

        state.pc = (state.pc + 2) & 0x0FFF;
    };
};

export function skipIfKeyNotPressed(x) {
    return (state) => {
        let key = keyMap[state.registers[x].value];

        if (!state.keyboard.isKeyPressed(key)) {
            state.pc = (state.pc + 2) & 0x0FFF;
        }

        state.pc = (state.pc + 2) & 0x0FFF;
    };
};
