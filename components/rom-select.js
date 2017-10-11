import React from 'react';
import romList from '../roms/list.json';

export default class RomSelect extends React.Component {
    constructor(props) {
        super(props);
    }

    async loadRom(name, url) {
        fetch(url).then(async (response) => {
            let data = await response.arrayBuffer();

            this.props.onSelect({
                name,
                data: new DataView(data)
            });
        });
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
                <a key={index} className="panel-block" onClick={() => this.loadRom(item.name, url)}>
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
            </section>
        )
    }
}
