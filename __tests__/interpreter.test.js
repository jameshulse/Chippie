import 'jest';
import { decode, commandMap } from '../core/interpreter';
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

describe('Command mapper', () => {
    const mapTest = (input, expected) => {
        return () => {
            let params = decode(input);
            let command = commandMap(params);
    
            expect(command).toEqual(expected);
        };
    };

    test('0x00E0 => dispClear', mapTest(0x00E0, instructions.dispClear));
    test('0x00EE => popStack', mapTest(0x00EE, instructions.popStack));
});
