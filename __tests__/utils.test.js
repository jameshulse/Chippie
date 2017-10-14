import 'jest';
import * as utils from '../core/utils';

describe('Pad left', () => {
    test('Default pad with spaces', () => {
        expect(utils.padLeft('test', 8)).toEqual('    test');
    });

    test('Pad number', () => {
        expect(utils.padLeft(15, 4, '0')).toEqual('0015');
    });
});

describe('Hex', () => {
    test('Pads to length', () => {
        expect(utils.hex(15, 4)).toEqual('0x000F');
    });

    test('Doesn\'t pad when equal to length', () => {
        expect(utils.hex(43981, 4)).toEqual('0xABCD');
    });
});