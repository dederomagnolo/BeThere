import { createStore } from 'redux';
import { RootReducers } from './reducers';
import { composeWithDevTools } from 'redux-devtools-extension';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const persistConfig = {
    key: 'root',
    storage: storage
}

const persisted = persistReducer(persistConfig, RootReducers);
const store = createStore(persisted, composeWithDevTools());
const persistor = persistStore(store);
  
export { store, persistor };