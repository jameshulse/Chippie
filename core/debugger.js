import { decode } from './interpreter';
import { hex } from './utils';

export const parse = (rom) => {
    let data = new DataView(new Uint8Array(rom.data).buffer);
    let source = [];

    for(let i = 0; i < data.byteLength / 2; i++) {
        let instruction = data.getUint16(i);
        let params = decode(instruction);

        source.push(`${hex(params.instruction)}\t`);
    }

    return source;
};
