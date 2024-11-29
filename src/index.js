import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router } from "react-router-dom";
import App from './App';
import AuthenticationProvider from './contexts/authentication.context';
import reportWebVitals from './reportWebVitals';
import 'sweetalert2/src/sweetalert2.scss'
import './index.scss';
import './assets/css/style.scss';
import { MasterDataProvider } from './contexts/masters.context';
const queryClient = new QueryClient();
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router basename={process.env.REACT_APP_BASE_NAME}>
        <AuthenticationProvider>
          <MasterDataProvider>
            <App />
            <Toaster position='top-right' />
          </MasterDataProvider>
        </AuthenticationProvider>
      </Router>
    </QueryClientProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
