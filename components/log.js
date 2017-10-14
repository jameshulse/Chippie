import React from 'react';

export default class Log extends React.Component {
    constructor(props) {
        super(props);

        this.maxLength = props.maxLength || 200;
        this.container = null;
    }

    componentDidUpdate() {
        this.scrollToBottom();
    }

    scrollToBottom() {
        this.container.scrollTop = this.container.scrollHeight;
    }

    render() {
        let { log } = this.props;
        let renderLine = (line, i) => <p key={i}>{line}</p>;

        return (
            <div className="log" ref={c => this.container = c}>
                { log && log.slice(-this.maxLength).map(renderLine) }
            </div>
        );
    }
}