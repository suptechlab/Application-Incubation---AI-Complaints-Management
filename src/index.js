import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import App from "./App";
import "./assets/css/style.scss";
import { persistor, store } from "./redux/store";
import { I18nextProvider } from "react-i18next";
import i18nConfig from "./lang/i18";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <I18nextProvider i18n={i18nConfig}>
        <App />
      </I18nextProvider>
      <Toaster position="top-right" />
    </PersistGate>
  </Provider>
);
