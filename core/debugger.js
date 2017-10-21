import { decode, commandMap } from './interpreter';
import { formatHex } from './utils';

export const parse = (rom) => {
    let data = new DataView(new Uint8Array(rom.data).buffer);
    let source = [];

    for(let i = 0; i < data.byteLength / 2; i++) {
        let instruction = data.getUint16(i);
        let params = decode(instruction);
        let command = commandMap(params);

        source.push(`${formatHex(i + 0x200)}:\t${formatHex(instruction)}\t${params.commandText || ''}`);
    }

    return source;
};
