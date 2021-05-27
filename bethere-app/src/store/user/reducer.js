import * as _ from 'lodash';

/* export interface UserState {
  token: string;
  info: any;
} */

const INITIAL_STATE = {
    token: "",
    devices: []
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
                ...action.payload
            }
        }
        case "UPDATE_DEVICE_SETTINGS": {
            const deviceToUpdate = _.findIndex(state.devices, (device) => device._id === action.payload);
            console.log(deviceToUpdate);
            return {
                ...state
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
