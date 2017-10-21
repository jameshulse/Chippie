export default class Keyboard {
    constructor() {
        this.keys = {};
        this.keyDown = this.keyDown.bind(this);
        this.keyUp = this.keyUp.bind(this);
        this.keyCallback = null;
    }

    attach() {
        document.addEventListener('keydown', this.keyDown);
        document.addEventListener('keyup', this.keyUp);
    }

    detach() {
        document.removeEventListener('keydown', this.keyDown);
        document.removeEventListener('keyup', this.keyUp);
    }

    keyDown(e) {
        if (!e.key) {
            return;
        }

        this.keys[e.key] = true;

        if (this.keyCallback) {
            this.keyCallback(e.key);
            this.keyCallback = null;
        }
    }

    keyUp(e) {
        if (!e.key) {
            return;
        }
        
        this.keys[e.key] = false;
    }

    onNextKeyPress(callback) {
        this.keyCallback = callback;
    }

    getKeysDown() {
        return Object.getOwnPropertyNames(this.keys).filter(k => this.keys[k]);
    }
}