import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import {thunk} from 'redux-thunk';
import rootReducer from './redux/reducers';
import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';
import NotificationService from './services/NotificationService';

const store = createStore(rootReducer, applyMiddleware(thunk));
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

// Register service worker for notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    NotificationService.registerServiceWorker().catch(error => {
      console.error('Service worker registration failed:', error);
    });
  });
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
