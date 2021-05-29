import * as _ from 'lodash';

/* export interface UserState {
  token: string;
  info: any;
} */

const INITIAL_STATE = {}

export const DevicesReducer = (
    state = INITIAL_STATE,
    action
) => {
    switch(action.type) {
        case "SET_USER_DEVICES": {
            return {
                ...action.payload
            }
        }
        case "UPDATE_SETTINGS": {
            return {
                ...state
            }
        }
        case "persist/REHYDRATE": {

            return {
                ...state,
                ..._.get(action.payload, 'devices')
            }
        }
        case "CLEAR_DEVICES_STATE": {
            return INITIAL_STATE;
        }
        default:
            return { ...state }
    }
};
