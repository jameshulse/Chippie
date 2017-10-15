export function padLeft(str, len, char = ' ') {
    str = str + '';

    if (str.length >= len) {
        return str;
    }

    return new Array(len - str.length + 1).join(char) + str;
}

export function hex(number, len = 4) {
    return `0x${padLeft(number.toString(16).toUpperCase(), len, '0')}`;
}

// Returns: left - right
export function binarySubtract(left, right) {
    return left + (((~right) << 24) >>> 24) + 1;
}