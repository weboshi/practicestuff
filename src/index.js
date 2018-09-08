import React from 'react';
import ReactDOM from 'react-dom';
import store from "./js/store/index";
import { Provider } from "react-redux";
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';

ReactDOM.render(
    <Provider store={store}>
    <App />
    </Provider>, document.getElementById('root'));
registerServiceWorker();
