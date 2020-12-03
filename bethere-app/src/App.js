import React from 'react';
import { Provider } from 'react-redux';
import {store, persistor} from './store/index';
import './App.css';
import Layout from './components/layout';
import GlobalStyles from './components/globalStyles';
import { PersistGate } from 'redux-persist/integration/react';

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Layout />
        <GlobalStyles />
      </PersistGate>
    </Provider>
  );
}

export default App;

