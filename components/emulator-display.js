import React from 'react';
import Registers from './registers';
import Screen from './screen';
import Log from './log';
import Emulator from '../core/emulator';

export default class EmulatorDisplay extends React.Component {
    constructor(props) {
        super(props);

        this.emulator = new Emulator();
        this.runInterval = null;
        this.logContainer = null;
        this.clockDelayMs = 50;

        if (this.props.rom) {
            this.emulator.load(this.props.rom);
        }

        this.state = {
            isRunning: false,
            screen: null,
            registers: null,
            log: null
        }
    }

    componentWillUpdate(nextProps) {
        if(nextProps.rom !== this.props.rom) {
            this.emulator.load(nextProps.rom);
        }
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
        let emulatorState = this.emulator.step();

        this.setState((prev) => ({
            ...prev,
            registers: emulatorState.registers,
            screen: emulatorState.screen,
            log: emulatorState.log
        }), () => {
            this.logContainer.scrollToBottom();
        });
    }

    reset() {
        this.emulator.load(this.props.rom);
    }

    changeRom() {
        this.stop(() => {
            this.props.changeRom();
        });
    }

    render() {
        return (
            <section className="section emulator">
                <div className="columns">
                    <div className="column is-third">
                        <button onClick={this.changeRom.bind(this)} className="button is-link is-pulled-right">Change ROM</button>

                        <h3 className="title is-size-3">{ this.props.rom.name }</h3>
                        
                        <div className="emulator__controls">
                            {
                                this.state.isRunning ?
                                    <button onClick={() => this.stop()} className="button is-success">Pause</button>
                                  : <button onClick={() => this.run()} className="button is-success">Run</button>
                            }
                            <button disabled={this.state.isRunning} onClick={() => this.step()} className="button is-warning">Step</button>
                            <button disabled={this.state.isRunning} onClick={() => this.reset()} className="button is-danger">Reset</button>
                            <input disabled={this.state.isRunning} className="input" type="number" onChange={(e) => this.clockDelayMs = e.target.value} defaultValue={this.clockDelayMs} />
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
                        <Log ref={(c) => this.logContainer = c} log={this.state.log} />
                    </div>
                </div>
            </section>
        );
    }
}
