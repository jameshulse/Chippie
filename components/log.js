import React from 'react';
import classNames from 'classnames';

export default class Log extends React.Component {
    constructor(props) {
        super(props);

        this.maxLength = props.maxLength || 200;
        this.container = null;
    }

    componentDidUpdate() {
        this.scrollToHighlight();
    }

    scrollToHighlight() {
        let line = this.container.getElementsByClassName('log__line--highlight')[0];

        if (!line) {
            return;
        }

        let lineOffset = line.offsetTop - this.container.offsetTop;

        this.container.scrollTop = lineOffset;
    }

    render() {
        let { log } = this.props;
        let renderLine = (line, i) => {
            const classes = classNames([
                'log__line',
                { 'log__line--highlight': this.props.highlightIndex === i }
            ]);

            return (
                <p className={classes} key={i}>{line}</p>
            );
        }

        return (
            <div className="log" ref={c => this.container = c}>
                { log && log.slice(-this.maxLength).map(renderLine) }
            </div>
        );
    }
}