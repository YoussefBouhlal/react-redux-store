import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import store from './redux/store';
import { setupListeners } from '@reduxjs/toolkit/query';

const container = document.getElementById('root');
if (!container) throw new Error('Missing application root');
setupListeners(store.dispatch);
const root = ReactDOM.createRoot(container);
root.render(
    <React.StrictMode>
        <Provider store={store}>
            <App />
        </Provider>
    </React.StrictMode>,
);
