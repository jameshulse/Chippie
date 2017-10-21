import React from 'react';
import Registers from './registers';
import Screen from './screen';
import Log from './log';
import Emulator from '../core/emulator';
import Keyboard from '../core/keyboard';
import { MusicIcon, MusicOffIcon } from './icons';
import buzzer from '../core/buzzer';
import Title from './title';

export default class EmulatorDisplay extends React.Component {
    constructor(props) {
        super(props);

        this.keyboard = new Keyboard();
        
        this.emulator = new Emulator(this.playSound.bind(this), this.repaint.bind(this), this.keyboard);
        this.runInterval = null;
        this.clockDelayMs = 0;

        this.state = {
            isRunning: false,
            log: null,
            musicEnabled: false,
            registers: null,
            screen: null,
            sourceIndex: 0
        };

        if (this.props.rom) {
            let log = this.emulator.load(this.props.rom);

            this.state.log = log;
        }
    }

    playSound() {
        if (this.state.musicEnabled) {
            buzzer();
        } else {
            // TODO: Something visual
        }
    }

    repaint(screen) {
        this.setState((prev) => ({
            ...prev,
            screen
        }));
    }

    componentWillUpdate(nextProps) {
        if(nextProps.rom !== this.props.rom) {
            this.setState((prev) => ({
                ...prev,
                log
            }));
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
            this.emulator.run();
        });
    }

    stop(onStop) {
        this.setState((prev) => ({
            ...prev,
            isRunning: false
        }), () => {
            this.emulator.stop();
        });
    }

    step() {
        let emulatorState = this.emulator.cycle();

        this.setState((prev) => ({
            ...prev,
            ...emulatorState
        }));
    }

    reset() {
        let log = this.emulator.load(this.props.rom);

        this.setState((prev) => ({
            ...prev,
            log
        }));
    }

    changeRom() {
        this.props.changeRom();
    }

    toggleMusic() {
        this.setState((prev) => ({
            ...prev,
            musicEnabled: !prev.musicEnabled
        }));
    }

    render() {
        const { isRunning, musicEnabled, sourceIndex } = this.state;

        return (
            <section className="section emulator">
                <div className="columns">
                    <div className="column is-one-third">
                        <button disabled={isRunning} onClick={this.changeRom.bind(this)} className="button is-link is-pulled-right">Change ROM</button>

                        <Title size={3}>{ this.props.rom.name }</Title>
                        
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

                    <div className="column is-one-third">
                        <Title size={6}>Registers</Title>
                        <Registers className="is-pulled-left" registers={this.emulator.registers.slice(0, 8)} />
                        <Registers registers={this.emulator.registers.slice(8)} />
                    </div>

                    <div className="column is-one-third">
                        <Title size={6}>Debugger</Title>
                        <Log lines={this.state.log} highlightIndex={sourceIndex} />
                    </div>
                </div>
            </section>
        );
    }
}
