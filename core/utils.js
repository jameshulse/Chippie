export function padLeft(str, len, char = ' ') {
    if (str.length >= len) {
        return str;
    }

    return new Array(len - str.length + 1).join(char) + str;
}

export function hex(number) {
    return `0x${padLeft(number.toString(16).toUpperCase(), 4, '0')}`;
}