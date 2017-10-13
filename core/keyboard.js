export default class Keyboard {
    constructor() {
        this.keys = {};
        this.keyDown = this.keyDown.bind(this);
        this.keyUp = this.keyUp.bind(this);
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
    }

    keyUp(e) {
        if (!e.key) {
            return;
        }
        
        this.keys[e.key] = false;
    }

    getKeysDown() {
        return Object.getOwnPropertyNames(this.keys).filter(k => this.keys[k]);
    }
}