import { combineReducers } from 'redux';
import { UserReducer, UserState } from './user/reducer';
import { GlobalReducer } from './global/reducer';
import { GlobalState } from './global/interfaces';

/* export interface AppState {
    user: UserState,
    global: GlobalState
} */

export const RootReducers = combineReducers({
    user: UserReducer,
    global: GlobalReducer
})