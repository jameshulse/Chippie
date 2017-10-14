import 'jest';
import { decode, commandMap, getCommand } from '../core/interpreter';
import * as instructions from '../core/instructions';

describe('Decode', () => {
    let instruction = 0x8123;
    let params = decode(instruction);

    test('instruction copied', () => {
        expect(params.instruction).toEqual(instruction);
    })

    test('extract command byte', () => {
        expect(params.command).toEqual(0x8);
    });

    test('extract nnn', () => {
        expect(params.nnn).toEqual(0x123);
    })

    test('extract kk', () => {
        expect(params.kk).toEqual(0x23);
    });

    test('extract x', () => {
        expect(params.x).toEqual(0x1);
    });

    test('extract y', () => {
        expect(params.y).toEqual(0x2)
    });

    test('extract n', () => {
        expect(params.n).toEqual(3);
    })
});

describe('getCommand', () => {
    test('Can call known command', () => {
        let command = getCommand(0x00E0);
        let fakeState = {
            clearScreen: jest.fn()
        };

        command(fakeState);

        expect(fakeState.clearScreen).toBeCalled();
    })
});