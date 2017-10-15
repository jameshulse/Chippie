import interpreter from '../core/interpreter';
import * as instructions from '../core/instructions';
import Register from '../core/register';

let createState = (overrides = {}) => {
    return Object.assign({
        clearScreen: jest.fn(),
        pc: 0,
        stack: [],
        registers: Array(16).fill(null).map(() => new Register()),
        memoryRegister: new Register(),
        delayTimer: 0,
        soundTimer: 0,
        memory: new DataView(new Uint8Array(100).buffer)
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

describe('Skip if VX equals number (0x3XNN)', () => {
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

describe('Skip if VX doesn\'t equal number (4XNN)', () => {
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

describe('Skip if VX equals VY (5XY0)', () => {
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

test('Set VX to value (6XNN)', () => {
    let state = createState();

    runCommand(0x63FF, state);

    expect(state.registers[0x3].value).toBe(0xFF);
});

test('Add value to VX (7XNN)', () => {
    let state = createState();

    runCommand(0x7CDD, state);

    expect(state.registers[0xC].value).toBe(0xDD);
});

test('Assign VY to VX (8XY0)', () => {
    let state = createState();

    state.registers[0x2].value = 0x5;

    runCommand(0x8120, state);

    expect(state.registers[0x1].value).toBe(0x5);
})

test('Set VX to VX OR VY (8XY1)', () => {
    let state = createState();

    state.registers[0x1].value = 0x11;
    state.registers[0x2].value = 0x22;

    runCommand(0x8121, state);

    expect(state.registers[0x1].value).toBe(0x11 | 0x22);
});

test('Set VX to VX AND VY (8XY2)', () => {
    let state = createState();

    state.registers[0x1].value = 0x11;
    state.registers[0x2].value = 0x22;

    runCommand(0x8122, state);

    expect(state.registers[0x1].value).toBe(0x11 & 0x22);
});

test('Set VX to VX XOR VY (8XY3)', () => {
    let state = createState();

    state.registers[0x1].value = 0x11;
    state.registers[0x2].value = 0x22;

    runCommand(0x8123, state);

    expect(state.registers[0x1].value).toBe(0x11 ^ 0x22);
});

describe('Set VX to VX + VY with carry (8XY4)', () => {
    test('With carry', () => {
        let state = createState();
    
        state.registers[0x1].value = 200;
        state.registers[0x2].value = 200;
    
        runCommand(0x8124, state);
    
        expect(state.registers[0xF].value).toBe(1);
        expect(state.registers[0x1].value).toBe(400 % 256);
    });

    test('No carry', () => {
        let state = createState();

        state.registers[0x1].value = 20;
        state.registers[0x2].value = 20;

        runCommand(0x8124, state);

        expect(state.registers[0xF].value).toBe(0);
        expect(state.registers[0x1].value).toBe(40);
    });
});

describe('Subtract VY from VX (8XY5', () => {
    test('With carry', () => {
        let state = createState();

        state.registers[0x1].value = 56;
        state.registers[0x2].value = 66;

        runCommand(0x8125, state);

        expect(state.registers[0xF].value).toBe(1);
        expect(state.registers[0x1].value).toBe(246);
    });

    test('No carry', () => {
        let state = createState();

        state.registers[0x1].value = 66;
        state.registers[0x2].value = 56;

        runCommand(0x8125, state);

        expect(state.registers[0xF].value).toBe(0);
        expect(state.registers[0x1].value).toBe(10);
    });
});

describe('Set VX to VY shifted right by 1', () => {
    test('Shift with 1 in least significant position', () => {
        let state = createState();

        state.registers[0x2].value = 3;

        runCommand(0x8126, state);

        expect(state.registers[0x1].value).toBe(1);
        expect(state.registers[0x2].value).toBe(1);
        expect(state.registers[0xF].value).toBe(1);
    });

    test('Shift with 0 in least significant position', () => {
        let state = createState();

        state.registers[0x2].value = 16;
        
        runCommand(0x8126, state);

        expect(state.registers[0x1].value).toBe(8);
        expect(state.registers[0x2].value).toBe(8);
        expect(state.registers[0xF].value).toBe(0);
    });
});

describe('Set VX to VY - VX and set carry if there is a borrow (8XY7)', () => {
    test('With carry', () => {
        let state = createState();

        state.registers[0x1].value = 66;
        state.registers[0x2].value = 56;

        runCommand(0x8127, state);

        expect(state.registers[0x1].value).toBe(246);
        expect(state.registers[0xF].value).toBe(1);
    });

    test('No carry', () => {
        let state = createState();

        state.registers[0x1].value = 56;
        state.registers[0x2].value = 66;

        runCommand(0x8127, state);

        expect(state.registers[0x1].value).toBe(10);
        expect(state.registers[0xF].value).toBe(0);
    });
});

describe('Shift VY left by 1 and copy to VX (8XYE)', () => {
    test('Most significant bit is 1', () => {
        let state = createState();

        state.registers[0x2].value = 129;

        runCommand(0x812E, state);

        expect(state.registers[0x1].value).toBe(2);
        expect(state.registers[0x2].value).toBe(2);
        expect(state.registers[0xF].value).toBe(1);
    });

    test('Most significant bit is 0', () => {
        let state = createState();

        state.registers[0x2].value = 96;

        runCommand(0x812E, state);

        expect(state.registers[0x1].value).toBe(192);
        expect(state.registers[0x2].value).toBe(192);
        expect(state.registers[0xF].value).toBe(0);
    });
});

describe('Skip if VX != VY (9XY0)', () => {
    test('Skip', () => {
        let state = createState({ pc: 0x2 });

        state.registers[0x2].value = 0xA;
        state.registers[0x3].value = 0xB;

        runCommand(0x9230, state);

        expect(state.pc).toBe(0x4);
    });

    test('No skip', () => {
        let state = createState({ pc: 0x2 });

        state.registers[0x2].value = 0xA;
        state.registers[0x3].value = 0xA;

        runCommand(0x9230, state);

        expect(state.pc).toBe(0x2);
    });
});

test('Assign memory register to value (ANNN)', () => {
    let state = createState();

    runCommand(0xA222, state);

    expect(state.memoryRegister.value).toBe(0x222);
});

test('Jump to V0 + nnn (BNNN)', () => {
    let state = createState();

    state.registers[0x0].value = 0x4;

    runCommand(0xB008, state);

    expect(state.pc).toBe(0x4 + 0x8);
})

const mockMath = Object.create(global.Math);

mockMath.random = () => 0.5;

global.Math = mockMath;

test('Assign VX to random number % kk (CXNN)', () => {
    let state = createState();

    runCommand(0xC104, state);

    let value = Math.floor((0.5 * 255)) & 0x4;

    expect(state.registers[0x1].value).toBe(value);
});

test('Set VX to delay timer (FX07)', () => {
    let state = createState({ delayTimer: 12 });

    runCommand(0xF107, state);

    expect(state.registers[0x1].value).toBe(12);
});

test('Set delay timer to VX (FX15)', () => {
    let state = createState({ delayTimer: 20 });

    state.registers[0x1].value = 10;

    runCommand(0xF115, state);

    expect(state.delayTimer).toBe(10);
});

test('Set sound timer to VX (FX18)', () => {
    let state = createState({ soundTimer: 20 });

    state.registers[0x1].value = 10;

    runCommand(0xF118, state);

    expect(state.soundTimer).toBe(10);
});

test('Add VX to memory register', () => {
    let state = createState();

    state.memoryRegister.value = 200;
    state.registers[0x1].value = 10;

    runCommand(0xF11E, state);

    expect(state.memoryRegister.value).toBe(210);
});

test('Binary coded decimal (FX33)', () => {
    let state = createState();

    state.memoryRegister.value = 10
    state.registers[0x1].value = 234;

    runCommand(0xF133, state);

    expect(state.memory.getUint8(10)).toBe(2);
    expect(state.memory.getUint8(11)).toBe(3);
    expect(state.memory.getUint8(12)).toBe(4);
});

test('Register dump', () => {
    let state = createState();

    state.memoryRegister.value = 50;

    state.registers[0x0].value = 10;
    state.registers[0x1].value = 20;
    state.registers[0x2].value = 30;

    runCommand(0xF255, state);

    expect(state.memory.getUint8(50)).toBe(10);
    expect(state.memory.getUint8(51)).toBe(20);
    expect(state.memory.getUint8(52)).toBe(30);

    expect(state.memoryRegister.value).toBe(53);
});

test('Register load', () => {
    let state = createState();

    state.memoryRegister.value = 50;

    state.memory.setUint8(50, 10);
    state.memory.setUint8(51, 20);
    state.memory.setUint8(52, 30);

    runCommand(0xF265, state);

    expect(state.registers[0x0].value).toBe(10);
    expect(state.registers[0x1].value).toBe(20);
    expect(state.registers[0x2].value).toBe(30);

    expect(state.memoryRegister.value).toBe(53);
});