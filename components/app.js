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
            <div>
                <nav className="navbar is-radiusless" role="navbar">
                    <div className="navbar-brand">
                        <h2 className="title navbar-item is-size-2">Chippie</h2>
                    </div>
                </nav>
                <div className="container">
                    {
                        this.state.rom ?
                            <Emulator rom={this.state.rom} />
                          : <RomSelect onSelect={this.romSelected.bind(this)} />
                    }
                </div>
            </div>
        );
    }
}
