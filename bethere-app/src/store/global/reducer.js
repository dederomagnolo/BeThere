import { GlobalState } from './interfaces'; 

const INITIAL_STATE = {
    loading: false,
    error: false,
    errorMessage: '',
    notification: {
        showNotification: false,
        message: ''
    }
}

export const GlobalReducer = (
    state = INITIAL_STATE,
    action
) => {
    switch(action.type) {
        case "SET_GLOBAL_LOADING": {
            return {
                ...state,
                loading: action.payload
            }
        }
        case "SET_GLOBAL_ERROR": {
            return {
                ...state,
                error: action.payload.error,
                errorMessage: action.payload.message
            }
        }
        case "SHOW_GLOBAL_NOTIFICATION": {
            return {
                ...state,
                notification: {
                    showNotification: true,
                    message: action.message
                }
            }
        }
        case "CLEAR_GLOBAL_NOTIFICATION": {
            return {
                ...state,
                notification: {
                    showNotification: false,
                    message: ""
                }
            }
        }
        case "CLEAR_GLOBAL_STATE": {
            return INITIAL_STATE
        }
        default:
            return { ...state }
    }
}