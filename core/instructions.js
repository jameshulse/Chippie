export function dispClear() {
    return (state) => {
        state.clearScreen();

        // log += 'Clear screen';
    }
};

export function popStack() {
    return (state) => {
        state.stack.pop();

        // log += `Return from subroutine to ${this.programCounter}`;
    }
};

export function jumpToAddress(nnn) {
    return (state) => {
        state.pc = nnn;

        // log += `Goto ${nnn}`;
    }
};

export function callRoutine(nnn) {
    return (state) => {
        state.stack.push(state.pc);

        state.pc = nnn;

        // log += `Call subroutine @ ${nnn}`;
    }
}

export function skipIfRegisterEqualsValue(x, kk) {
    return (state) => {
        if (state.registers[x].value === kk) {
            state.pc += 2;
            // log += `Skip next as ${this.registers[x].name} === ${kk}`;
        } else {
            // log += `No skip as ${this.registers[x].name} !== ${kk}`;
        }
    }
}

export function skipIfRegisterNotEqualValue(x, kk) {
    return (state) => {
        if (state.registers[x].value !== kk) {
            state.pc += 2;

            // log += `Skip next as ${this.registers[x].name} !== ${kk}`;
        } else {
            // log += `No skip as ${this.registers[x].name} === ${kk}`;
        }
    }
}

export function skipIfRegistersEqual(x, y) {
    return (state) => {
        if (state.registers[x].value === state.registers[y].value) {
            state.pc += 2;

            // log += `Skip next as ${this.registers[x].name} === ${this.registers[y].name}`;
        } else {
            // log += `No skip as ${this.registers[x].name} !== ${this.registers[y].name}`;
        }
    }
}

export function assignValueToRegister(x, kk) {
    return (state) => {
        state.registers[x].value = kk;

        // log += `Set ${this.registers[x].name} to ${kk}`;
    }
}

export function addNumberToRegister(x, kk) {
    return (state) => {
        state.registers[x].value += kk;

        if (state.registers[x].value > 255) {
            throw new Error('Register overflow'); // TODO: Maybe modulo
        }

        // log += `Add ${kk} to ${this.registers[x].name}`;
    }
}