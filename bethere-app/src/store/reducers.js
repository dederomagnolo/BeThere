import { combineReducers } from 'redux';
import { UserReducer } from './user/reducer';
import { GlobalReducer } from './global/reducer';
/* import { GlobalState } from './global/interfaces';*/
import { DevicesReducer } from './devices/reducer';

/* export interface AppState {
    user: UserState,
    global: GlobalState
} */

export const RootReducers = combineReducers({
    user: UserReducer,
    global: GlobalReducer,
    devices: DevicesReducer
});