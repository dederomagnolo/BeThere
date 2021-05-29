import React, {useState, useEffect} from 'react';
import './styles.scss';

export const SuccessButton = (props) => {
    const { success, onClick } = props;

    return (
        <div className="e-button">
            <button className={success ? "btn success" : "btn"} onClick={() => onClick()}>
                <span className="text">
                    Save changes
                </span>
                <span className="success-text">
                    Success!
                </span>
            </button>
        </div>
    );
}

export default SuccessButton;