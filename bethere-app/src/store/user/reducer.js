import * as _ from 'lodash';

/* export interface UserState {
  token: string;
  info: any;
} */

const INITIAL_STATE = {
    token: "",
    info: {},
}

export const UserReducer = (
    state = INITIAL_STATE,
    action
) => {
    switch(action.type) {
        case "SET_TOKEN": {
            return {
                ...state,
                token: action.payload
            }
        }
        case "SET_USER_INFO": {
            return {
                ...state,
                info: action.payload
            }
        }
        case "persist/REHYDRATE": {

            return {
                ...state,
                ..._.get(action.payload, 'user')
            }
        }
        case "CLEAR_USER_STATE": {
            return INITIAL_STATE;
        }
        default:
            return { ...state }
    }
};
