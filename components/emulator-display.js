import React from 'react';
import Registers from './registers';
import Screen from './screen';
import Emulator from '../core/emulator';

export default class EmulatorDisplay extends React.Component {
    constructor(props) {
        super(props);

        this.emulator = new Emulator();
        this.runInterval = null;

        if (this.props.rom) {
            this.emulator.load(this.props.rom);
        }

        this.state = {
            isRunning: false,
            screen: null,
            registers: null
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
            }, 500);
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
            screen: emulatorState.screen
        }));
    }
    
    render() {
        return (
            <div className="emulator">
                <div className="columns">
                    <div className="column is-half">
                        <h5 className="title is-size-5">{ this.props.rom.name }</h5>
                        
                        <div className="emulator__controls">
                            {
                                this.state.isRunning ?
                                    <button onClick={this.stop.bind(this)} className="button is-danger">Stop</button>
                                  : <button onClick={this.run.bind(this)} className="button is-success">Run</button>
                            }
                            <button disabled={this.state.isRunning} onClick={this.step.bind(this)} className="button is-warning">Step</button>
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
                </div>
            </div>
        );
    }
}
