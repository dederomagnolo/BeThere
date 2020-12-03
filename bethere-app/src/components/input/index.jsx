import React, {useState} from 'react';
import { CustomInput, Container, ErrorLabel } from './styles';
import { ERROR_MESSAGES } from '../../utils/constants';
import { isEmailValid, isPasswordValid, allowOnlyNumbers } from '../../utils/validations';

export const Input = ({ onChange, type, containerStyle, ...props}) => {
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    let maxLengthByType;

    switch(type) {
        case "phone":
            maxLengthByType = 11; // with ddd (2)
            break;
        case "password":
            maxLengthByType = 10;
            break;
        default:
            maxLengthByType = 25;
            break;
    }

    const validateField = (e) => {
        switch(type) {
            case "password":
                setErrorMessage(ERROR_MESSAGES.password);
                setError(!isPasswordValid(e));
                break;
            case "email":
                setErrorMessage(ERROR_MESSAGES.email);
                setError(!isEmailValid(e));
                break;
            default:
                break;
        }
    }

    return(
        <Container className="inputContainer" style={containerStyle}>
            <CustomInput 
                onChange={(e) => {
                    if(type === "phone") {
                        const num = allowOnlyNumbers(e.target.value);
                        onChange(num);
                    } else {
                        onChange(e);
                    }
                    e.target.value !== "" ? validateField(e.target.value) : setError(false);
                }}
                type={type}
                maxLength={maxLengthByType}
                {...props}
            />
            {error && <ErrorLabel>{errorMessage}</ErrorLabel>}
        </Container>
    );
}