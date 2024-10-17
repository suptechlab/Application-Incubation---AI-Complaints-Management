import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';
import './assets/css/style.scss'

const root = ReactDOM.createRoot(document.getElementById('root'));
const baseURL = process.env.REACT_APP_BASE_URL
root.render(
  <React.StrictMode>
    <Router basename={baseURL}>
      <App />
    </Router>
  </React.StrictMode>
);