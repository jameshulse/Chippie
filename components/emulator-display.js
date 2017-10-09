import React from 'react';
import Registers from './registers';
import Screen from './screen';
import Emulator from '../core/emulator';

export default class EmulatorDisplay extends React.Component {
    constructor(props) {
        super(props);

        this.emulator = new Emulator();
        this.runInterval = null;
        this.logContainer = null;
        this.clockDelayMs = 500;

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

    stop() {
        this.setState((prev) => ({
            ...prev,
            isRunning: false
        }), () => {
            clearInterval(this.runInterval);
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
            this.logContainer.scrollTop = this.logContainer.scrollHeight;
        });
    }

    reset() {
        this.emulator.load(this.props.rom);
    }

    render() {
        return (
            <div className="emulator">
                <div className="columns">
                    <div className="column is-third">
                        <h5 className="title is-size-5">{ this.props.rom.name }</h5>
                        
                        <div className="emulator__controls">
                            {
                                this.state.isRunning ?
                                    <button onClick={this.stop.bind(this)} className="button is-success">Pause</button>
                                  : <button onClick={this.run.bind(this)} className="button is-success">Run</button>
                            }
                            <button disabled={this.state.isRunning} onClick={this.step.bind(this)} className="button is-warning">Step</button>
                            <button disabled={this.state.isRunning} onClick={this.reset.bind(this)} className="button is-danger">Reset</button>
                            <input disabled={this.state.isRunning} className="input" type="text" onChange={(e) => this.clockDelayMs = e.target.value} defaultValue={this.clockDelayMs} />
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
                        <div className="log" ref={log => this.logContainer = log}>
                            {
                                this.state.log && this.state.log.map((line, i) => <p key={i}>{line}</p>)
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
