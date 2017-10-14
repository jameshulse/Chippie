import interpreter from '../core/interpreter';
import * as instructions from '../core/instructions';
import Register from '../core/register';

let createState = (overrides = {}) => {
    return Object.assign({
        clearScreen: jest.fn(),
        pc: 0,
        stack: [],
        registers: Array(16).fill(null).map(() => new Register()),
        memoryRegister: new Register()
    }, overrides);
};

let runCommand = (instruction, state) => {
    let command = interpreter(instruction);

    command(state);
}

test('Clear screen (0x00E0)', () => {
    let state = createState();
    
    runCommand(0x00E0, state);

    expect(state.clearScreen).toBeCalled();
});

test('Pop stack (0x00EE)', () => {
    let state = createState();

    state.stack.push(10);
    state.stack.push(20);

    runCommand(0x00EE, state);

    expect(state.stack).toEqual([10]);
});

test('Jump to address (0x1NNN)', () => {
    let state = createState();
    
    runCommand(0x1333, state);

    expect(state.pc).toBe(0x333);
});

test('Call subroutine (0x2NNN)', () => {
    let routineLocation = 0x333;
    let originalProgramCounter = 0xF;

    let state = createState({ pc: originalProgramCounter });
    
    runCommand(0x2333, state);

    expect(state.pc).toBe(routineLocation);
    expect(state.stack[0]).toBe(originalProgramCounter);
});

describe('Skip if register equals number (0x3XNN)', () => {
    test('Skips if register equals value', () => {
        let state = createState({
            pc: 0x2
        });

        state.registers[0x0].value = 0x10;

        runCommand(0x3010, state);

        expect(state.pc).toBe(0x4);
    });

    test('No skip if register doesn\'t equal value', () => {
        let state = createState({
            pc: 0x2
        });

        state.registers[0x0].value = 0x07;

        runCommand(0x3010, state);

        expect(state.pc).toBe(0x2);
    });
});

describe('Skip if register doesn\'t equal number (4XNN)', () => {
    test('Skip', () => {
        let state = createState({ pc: 0x2 });

        state.registers[0x0].value = 0x10;

        runCommand(0x4011, state);

        expect(state.pc).toBe(0x4);
    });

    test('No skip', () => {
        let state = createState({
            pc: 0x2
        });

        state.registers[0x0].value = 0x10;

        runCommand(0x4010, state);

        expect(state.pc).toBe(0x2);
    });
});

describe('Skip if register X equals register Y (5XY0)', () => {
    test('Skip', () => {
        let state = createState({ pc: 0x2 });

        state.registers[0x1].value = 0xF;
        state.registers[0x2].value = 0xF;

        runCommand(0x5120, state);

        expect(state.pc).toBe(0x4);
    });

    test('No skip', () => {
        let state = createState({ pc: 0x2 });

        state.registers[0x1].value = 0xF;
        state.registers[0x2].value = 0xE;

        runCommand(0x5120, state);

        expect(state.pc).toBe(0x2);
    })
});

test('Set register X to value NN(6XNN)', () => {
    let state = createState();

    runCommand(0x63FF, state);

    expect(state.registers[0x3].value).toBe(0xFF);
});