import 'jest';
import Register from '../core/register';

test('Reset sets value to zero', () => {
    let register = new Register('V0');

    register.value = 10;

    register.reset();

    expect(register.value).toBe(0);
});

test('Name set correctly', () => {
    const name = 'V1';
    let register = new Register(name);

    expect(register.name).toBe(name);
});

test('Updated is set when value changes', () => {
    let register = new Register('V0');

    register.value = 10;
    register.updated = false;
    register.value = 20;

    expect(register.updated).toBe(true);
});

test('Updated not set when value the same', () => {
    let register = new Register('V0');

    register.value = 10;
    register.updated = false;
    register.value = 10;

    expect(register.updated).toBe(false);
});