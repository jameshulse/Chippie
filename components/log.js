import React from 'react';

export default class Log extends React.Component {
    constructor(props) {
        super(props);

        this.container = null;
    }

    scrollToBottom() {
        this.container.scrollTop = this.container.scrollHeight;
    }

    render() {
        return (
            <div className="log" ref={c => this.container = c}>
                {
                    this.props.log && this.props.log.slice(-200).map((line, i) => <p key={i}>{line}</p>)
                }
            </div>
        );
    }
}