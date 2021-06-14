import React from 'react';
import './styles.scss';

export const SuccessButton = (props) => {
    const { 
        success, 
        onClick,
        buttonLabel,
        successLabel
    } = props;

    return (
        <div className="e-button">
            <button className={success ? "btn success" : "btn"} onClick={() => onClick()}>
                <span className="text">
                    {buttonLabel}
                </span>
                <span className="success-text">
                    {successLabel}
                </span>
            </button>
        </div>
    );
}

export default SuccessButton;