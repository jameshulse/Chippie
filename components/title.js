import React from 'react';
import classNames from 'classnames';

export default ({ size = 1, children, className }) => {
    const classes = classNames([
        className,
        'title',
        `is-size-${size}`
    ]);

    return React.createElement(`h${size}`, { className: classes }, children);
};