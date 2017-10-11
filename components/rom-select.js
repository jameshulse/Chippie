import React from 'react';
import FileSelect from './file-select';
import romList from '../roms/list.json';

export default class RomSelect extends React.Component {
    constructor(props) {
        super(props);
    }

    async loadRomFromUrl(name, url) {
        fetch(url).then(async (response) => {
            let data = await response.arrayBuffer();

            this.props.onSelect({
                name,
                data: new DataView(data)
            });
        });
    }

    async loadRomFromFile(event) {
        let file = event.target.files[0];
        let reader = new FileReader();

        reader.readAsArrayBuffer(file);

        reader.onload = () => {
            this.props.onSelect({
                name: file.name,
                data: new DataView(reader.result)
            });
        };
    }

    render() {
        let renderCategory = (category, list) => {
            return (
                <div className="column is-one-third">
                    <h5 className="title is-size-5">{ category }</h5>

                    <div className="panel">
                        { list.map((item, i) => renderItem(category, item, i)) }
                    </div>
                </div>
            )
        };

        let renderItem = (category, item, index) => {
            let url = `/roms/${category.toLowerCase()}/${item.file}`;

            return (
                <a key={index} className="panel-block" onClick={() => this.loadRomFromUrl(item.name, url)}>
                    { item.name }
                </a>
            );
        }

        return (
            <section className="section">
                <h1 className="title is-size-4">Select a Rom</h1>
                <div className="columns">
                    {renderCategory('Games', romList.games)}
                    {renderCategory('Programs', romList.programs)}
                    {renderCategory('Demos', romList.demos)}
                </div>
                <h1 className="title is-size-4">Load From File</h1>
                <FileSelect onChange={this.loadRomFromFile.bind(this)} />
            </section>
        )
    }
}
