import React from 'react';
import Emulator from './emulator-display';
import RomSelect from './rom-select';

export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            rom: null
        };
    }

    romSelected(rom) {
        this.setState((prev) => ({
            ...prev,
            rom
        }));
    }

    render() {
        return (
            <div className="container">
                <section className="section">
                    <h1 className="title">Chippie</h1>
                    {
                        this.state.rom ?
                            <Emulator rom={this.state.rom} />
                          : <div>
                                <p>No rom selected</p>
                                <RomSelect onSelect={this.romSelected.bind(this)} />
                          </div>
                    }
                </section>
            </div>
        );
    }
}
