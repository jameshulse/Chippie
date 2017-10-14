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