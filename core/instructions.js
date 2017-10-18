import { binarySubtract } from './utils';

export function dispClear() {
    return (state) => {
        state.clearScreen();

        // log += 'Clear screen';
    };
};

export function popStack() {
    return (state) => {
        state.stack.pop();

        // log += `Return from subroutine to ${this.programCounter}`;
    };
};

export function jumpToAddress(nnn) {
    return (state) => {
        state.pc = nnn;

        // log += `Goto ${nnn}`;
    };
};

export function callRoutine(nnn) {
    return (state) => {
        state.stack.push(state.pc);

        state.pc = nnn;

        // log += `Call subroutine @ ${nnn}`;
    };
}

export function skipIfRegisterEqualsValue(x, kk) {
    return (state) => {
        if (state.registers[x].value === kk) {
            state.pc += 2;
            // log += `Skip next as ${this.registers[x].name} === ${kk}`;
        } else {
            // log += `No skip as ${this.registers[x].name} !== ${kk}`;
        }
    };
};

export function skipIfRegisterNotEqualValue(x, kk) {
    return (state) => {
        if (state.registers[x].value !== kk) {
            state.pc += 2;

            // log += `Skip next as ${this.registers[x].name} !== ${kk}`;
        } else {
            // log += `No skip as ${this.registers[x].name} === ${kk}`;
        }
    };
};

export function skipIfRegistersEqual(x, y) {
    return (state) => {
        if (state.registers[x].value === state.registers[y].value) {
            state.pc += 2;

            // log += `Skip next as ${this.registers[x].name} === ${this.registers[y].name}`;
        } else {
            // log += `No skip as ${this.registers[x].name} !== ${this.registers[y].name}`;
        }
    };
};

export function assignValueToRegister(x, kk) {
    return (state) => {
        state.registers[x].value = kk;

        // log += `Set ${this.registers[x].name} to ${kk}`;
    };
};

export function addNumberToRegister(x, kk) {
    return (state) => {
        state.registers[x].value += kk;

        if (state.registers[x].value > 255) {
            throw new Error('Register overflow'); // TODO: Maybe modulo
        }

        // log += `Add ${kk} to ${this.registers[x].name}`;
    };
};

export function assignRegisterToRegister(x, y) {
    return (state) => {
        state.registers[x].value = state.registers[y].value;

        // log += `Set ${this.registers[x].name} to value of ${this.registers[y].name}`;
    };
};

export function skipIfRegistersNotEqual(x, y) {
    return (state) => {
        if (state.registers[x].value !== state.registers[y].value) {
            state.pc += 2;

            // log += `Skipping as ${this.registers[x].name} === ${this.registers[y].name}`;
        } else {
            // log += `Not skipping as ${this.registers[x].name} !== ${this.registers[y].name}`;
        }
    };
};

export function assignMemoryRegisterToValue(nnn) {
    return (state) => {
        state.memoryRegister.value = nnn;

        // log += `Set I to ${nnn}`;
    }
}

export function jumpToV0PlusNNN(nnn) {
    return (state) => {
        state.pc = state.registers[0].value + nnn;

        // log += `Jump to V0 + ${nnn}: ${this.pc}`;
    };
};

export function assignRandomValue(x, kk) {
    return (state) => {
        let rand = Math.floor(Math.random() * 255);

        state.registers[x].value = rand & kk;

        // log += `Randomise ${this.registers[x].name} with ${kk} & rand:${rand}`;
    };
};

export function setVxToVxOrVy(x, y) {
    return (state) => {
        state.registers[x].value = state.registers[x].value | state.registers[y].value;

        // log += `Bitwise: ${this.registers[x].name} OR ${this.registers[y].name}`;
    };
};

export function setVxToVxAndVy(x, y) {
    return (state) => {
        state.registers[x].value &= state.registers[y].value;

        // log += `Bitwise: ${this.registers[x].name} AND ${this.registers[y].name}`;
    };
;}

export function setVxToVxXorVy(x, y) {
    return (state) => {
        state.registers[x].value ^= state.registers[y].value;

        // log += `Bitwise: ${this.registers[x].name} XOR ${this.registers[y].name}`;
    };
};

export function addVyToVxWithCarry(x, y) {
    return (state) => {
        state.registers[x].value += state.registers[y].value;

        if (state.registers[x].value > 255) {
            state.registers[x].value = state.registers[x].value % 256;
            state.registers[0xF].value = 1; // Carry flag
        }

        // log += `Add ${this.registers[y].name} to ${this.registers[x].name}`;
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

        // log += `Subtract ${this.registers[y].name} from ${this.registers[x].name}`;
    };
};

export function shiftVyRight(x, y) {
    return (state) => {
        state.registers[0xF].value = state.registers[y].value & 0x1;
        
        state.registers[y].value >>>= 1;
        state.registers[x].value = state.registers[y].value;

        // log += `Bitwise: ${this.registers[y].name} >>> 1`;
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

        // log += `Subtract ${this.registers[x].name} from ${this.registers[y].name}`;
    };
};

export function shiftVyLeft(x, y) {
    return (state) => {
        state.registers[0xF].value = (state.registers[y].value & 0x80) >>> 7;

        state.registers[y].value = (state.registers[y].value << 1) % 256;

        state.registers[x].value = state.registers[y].value;
        
        // log += `Bitwise: ${this.registers[y].name} <<< 1`;
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

        // log += `Display sprite at (${x},${y}) of height ${n} from I`;
    };
};

export function setVxToDelayTimer(x) {
    return (state) => {
        state.registers[x].value = state.delayTimer;
    };
};

export function setDelayTimer(x) {
    return (state) => {
        state.delayTimer = state.registers[x].value;
    };
};

export function setSoundTimer(x) {
    return (state) => {
        state.soundTimer = state.registers[x].value;
    };
};

export function addVxToMemoryRegister(x) {
    return (state) => {
        state.memoryRegister.value += state.registers[x].value;
    };
};

export function setMemoryRegisterToFont(x) {
    const FONT_WIDTH = 5;

    return (state) => {
        state.memoryRegister.value = state.registers[x].value * FONT_WIDTH;
    };
};

export function binaryEncode(x) {
    return (state) => {
        state.memory.setUint8(state.memoryRegister.value, Math.floor(state.registers[x].value / 100));
        state.memory.setUint8(state.memoryRegister.value + 1, Math.floor(state.registers[x].value % 100 / 10));
        state.memory.setUint8(state.memoryRegister.value + 2, Math.floor(state.registers[x].value % 100 % 10));
    };
};

export function registerDump(x) {
    return (state) => {
        for (let i = 0; i <= x; i++) {
            state.memory.setUint8(state.memoryRegister.value, state.registers[i].value);
            state.memoryRegister.value += 1;
        }
    };
};

export function registerLoad(x) {
    return (state) => {
        for (let i = 0; i <= x; i++) {
            state.registers[i].value = state.memory.getUint8(state.memoryRegister.value);
            state.memoryRegister.value += 1;
        }
    };
};

export function waitForKey(x) {
    return (state) => {
        state.waitKey = state.registers[x].value;
    };
};

export function skipIfKeyPressed(x) {
    return (state) => {
        if(false/* TODO */) {
            state.pc += 2;
        }
    };
};

export function skipIfKeyNotPressed(x) {
    return (state) => {
        if (false/* TODO */) {
            state.pc += 2;
        }
    };
};
