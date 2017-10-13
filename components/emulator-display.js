import React from 'react';
import Registers from './registers';
import Screen from './screen';
import Log from './log';
import Emulator from '../core/emulator';
import Keyboard from '../core/keyboard';
import { MusicIcon, MusicOffIcon } from './icons';
import buzzer from '../core/buzzer';

export default class EmulatorDisplay extends React.Component {
    constructor(props) {
        super(props);

        this.emulator = new Emulator(this.playSound.bind(this));
        this.keyboard = new Keyboard();
        this.runInterval = null;
        this.clockDelayMs = 50;

        if (this.props.rom) {
            this.emulator.load(this.props.rom);
        }

        this.state = {
            isRunning: false,
            screen: null,
            registers: null,
            log: null,
            musicEnabled: true
        }
    }

    playSound() {
        if (this.state.musicEnabled) {
            buzzer();
        } else {
            // TODO: Something visual
        }
    }

    componentWillUpdate(nextProps) {
        if(nextProps.rom !== this.props.rom) {
            this.emulator.load(nextProps.rom);
        }
    }

    componentDidMount() {
        this.keyboard.attach();
    }

    componentWillUnmount() {
        this.keyboard.detach();
    }

    run() {
        this.setState((prev) => ({
            ...prev,
            isRunning: true
        }), () => {
            this.runInterval = setInterval(() => {
                this.step();
            }, this.clockDelayMs);
        });
    }

    stop(onStop) {
        this.setState((prev) => ({
            ...prev,
            isRunning: false
        }), () => {
            clearInterval(this.runInterval);

            if (onStop) {
                onStop();
            }
        });
    }

    step() {
        let emulatorState = this.emulator.step(this.keyboard.getKeysDown());

        this.setState((prev) => ({
            ...prev,
            ...emulatorState
        }));
    }

    reset() {
        this.emulator.load(this.props.rom);
    }

    changeRom() {
        this.stop(() => {
            this.props.changeRom();
        });
    }

    toggleMusic() {
        this.setState((prev) => ({
            ...prev,
            musicEnabled: !prev.musicEnabled
        }));
    }

    render() {
        const { isRunning, musicEnabled } = this.state;

        return (
            <section className="section emulator">
                <div className="columns">
                    <div className="column is-third">
                        <button onClick={this.changeRom.bind(this)} className="button is-link is-pulled-right">Change ROM</button>

                        <h3 className="title is-size-3">{ this.props.rom.name }</h3>
                        
                        <div className="emulator__controls">
                            {
                                isRunning ?
                                    <button onClick={() => this.stop()} className="button is-success">Pause</button>
                                  : <button onClick={() => this.run()} className="button is-success">Run</button>
                            }
                            <button disabled={isRunning} onClick={() => this.step()} className="button is-warning">Step</button>
                            <button disabled={isRunning} onClick={() => this.reset()} className="button is-danger">Reset</button>
                            <input disabled={isRunning} className="input" title="Step delay" type="number" onChange={(e) => this.clockDelayMs = e.target.value} defaultValue={this.clockDelayMs} />
                            <a className="button" onClick={() => this.toggleMusic()}>
                                <span className="icon">
                                    { musicEnabled ? <MusicIcon /> : <MusicOffIcon /> }
                                </span>
                            </a>
                        </div>

                        <div className="emulator__display">
                            <Screen width={320} height={160} pixels={this.state.screen} />
                        </div>
                    </div>

                    <div className="column is-third">
                        <h6 className="title is-size-6">Registers</h6>
                        <Registers className="is-pulled-left" registers={this.emulator.registers.slice(0, 8)} />
                        <Registers registers={this.emulator.registers.slice(8)} />
                    </div>

                    <div className="column is-third">
                        <h6 className="title is-size-6">Log</h6>
                        <Log log={this.state.log} />
                    </div>
                </div>
            </section>
        );
    }
}
