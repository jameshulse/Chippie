export function dispClear() {
    return (state) => {
        state.clearScreen();
    }
};

export function popStack() {
    return (state) => {
        state.stack.pop();
    }
};

export function jumpToAddress(nnn) {
    return (state) => {
        state.pc = nnn;
    }
};