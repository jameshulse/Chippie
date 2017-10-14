import React from 'react';

const SCREEN_WIDTH = 64;
const SCREEN_HEIGHT = 32;

export default class Screen extends React.Component {
    constructor(props) {
        super(props);

        this.canvas = null;
        this.ctx = null;
        this.pixelWidth = props.width / SCREEN_WIDTH;
        this.pixelHeight = props.height / SCREEN_HEIGHT;
    }

    componentDidMount() {
        this.ctx = this.canvas.getContext('2d');
    }

    clear() {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.props.width, this.props.height);
    }

    componentDidUpdate() {
        if (!this.props.pixels) {
            return;
        }

        this.clear();
        
        this.ctx.fillStyle = 'white';

        for(let i = 0; i < SCREEN_WIDTH; i++) {
            for(let j = 0; j < SCREEN_HEIGHT; j++) {
                if (this.props.pixels[j][i]) {
                    this.ctx.fillRect(
                        i * this.pixelWidth,
                        j * this.pixelHeight,
                        this.pixelWidth,
                        this.pixelHeight);
                }
            }
        }
    }

    render() {
        return (
            <canvas
                ref={(canvas) => this.canvas = canvas}
                width={this.props.width}
                height={this.props.height}>
            </canvas>
        )
    }
}