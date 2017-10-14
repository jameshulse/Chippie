import * as instructions from '../core/instructions';

let createState = () => {
    return {
        pc: 0,
        clearScreen: jest.fn(),
        stack: []
    }
};

test('Clear screen', () => {
    let state = createState();
    let command = instructions.dispClear();

    command(state);

    expect(state.clearScreen).toBeCalled();
});

test('Pop stack', () => {
    let state = createState();
    let command = instructions.popStack();

    state.stack.push(10);
    state.stack.push(20);

    command(state);

    expect(state.stack).toEqual([10]);
})