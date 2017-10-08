import React from 'react';

export default class RomSelect extends React.Component {
    constructor(props) {
        super(props);
    }

    async loadRom() {
        let file = this.control.files[0];
        let reader = new FileReader();
        let binary = null;

        reader.readAsArrayBuffer(file);
        
        reader.onload = () => {
            this.props.onSelect({
                name: file.name,
                data: new DataView(reader.result)
            });
        };
    }

    render() {
        return (
            <input
                ref={(control) => this.control = control}
                onChange={this.loadRom.bind(this)}
                type="file" />
        )
    }
}
