import React from 'react';

export default ({ onChange }) => {
    return (
        <div className="file">
            <label className="file-label">
                <input onChange={onChange} className="file-input" type="file" />
                <span className="file-cta">
                    <span className="file-label">
                        Choose a file…
                    </span>
                </span>
            </label>
        </div>
    );
}