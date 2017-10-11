export default class Register {
    constructor(name) {
        this.name = name;
        this._value = 0;
        this.updated = false;
    }

    get value() {
        return this._value;
    }

    set value(value) {
        let prevValue = this._value;

        this._value = value;
        this.updated = value !== prevValue;
    }
}