import React, { Suspense } from "react";
import Loader from "./components/Loader";
import AppRoutes from "./router";
import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    <Suspense fallback={<Loader isLoading={true} />}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </Suspense>
  );
}

export default App;
