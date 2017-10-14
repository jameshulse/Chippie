import interpreter from '../core/interpreter';
import * as instructions from '../core/instructions';

let createState = (overrides = {}) => {
    return Object.assign({
        clearScreen: jest.fn(),
        pc: 0,
        stack: []
    }, overrides);
};

test('Clear screen (0x00E0)', () => {
    let state = createState();
    let command = interpreter(0x00E0);

    command(state);

    expect(state.clearScreen).toBeCalled();
});

test('Pop stack (0x00EE)', () => {
    let state = createState();
    let command = interpreter(0x00EE);

    state.stack.push(10);
    state.stack.push(20);

    command(state);

    expect(state.stack).toEqual([10]);
});

test('Jump to address (0x1NNN)', () => {
    let state = createState();
    let command = interpreter(0x1333);

    command(state);

    expect(state.pc).toBe(0x333);
});

test('Call subroutine (0x2NNN)', () => {
    let routineLocation = 0x333;
    let originalProgramCounter = 0xF;

    let state = createState({ pc: originalProgramCounter });
    let command = interpreter(0x2333);

    command(state);

    expect(state.pc).toBe(routineLocation);
    expect(state.stack[0]).toBe(originalProgramCounter);
});