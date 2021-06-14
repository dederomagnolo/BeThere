import React from 'react';
import { Provider } from 'react-redux';
import { TranslatorProvider } from 'react-translate';
import { PersistGate } from 'redux-persist/integration/react';
import './App.css';
import {store, persistor} from './store/index';
import Layout from './components/layout';
import GlobalStyles from './components/globalStyles';
import selectTranslate from './utils/translations';

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <TranslatorProvider translations={selectTranslate()}>
          <Layout />
          <GlobalStyles />
        </TranslatorProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;

