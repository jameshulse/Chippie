import React from 'react';
import classNames from 'classnames';

export default ({ registers, className = '' }) => {
    const tableClasses = classNames(
        'table',
        className
    );

    const registerRow = (register) => {
        const registerClasses = classNames(
            'register-value',
            { 'register-value--updated': register.updated }
        );

        return (
            <tr>
                <td>{register.name}</td>
                <td className={registerClasses}>{register.value}</td>
            </tr>
        );
    }

    return (
        <table className={tableClasses}>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Value</th>
                </tr>
            </thead>
            <tbody>
                { registers.map(registerRow) }
            </tbody>
        </table>
    );
}