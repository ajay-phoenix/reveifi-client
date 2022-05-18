import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { I18nextProvider } from 'react-i18next';
import i18next from './i18next';
import * as serviceWorker from './serviceWorker';
import 'bootstrap/dist/css/bootstrap.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-toastify/dist/ReactToastify.css';
import { Provider } from 'react-redux';
import { store } from './redux/store';

ReactDOM.render(
  <React.Fragment>
    <I18nextProvider i18n={i18next}>
      <Provider store={store}>
        <App />
      </Provider>
      <ToastContainer pauseOnFocusLoss={false} />
    </I18nextProvider>
  </React.Fragment>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
