import React from "react";
import Loader from "./components/Loader";
import AppRoutes from "./router";

function App() {
  return (
    <React.Suspense fallback={<Loader isLoading={true} />}>
      <AppRoutes />
    </React.Suspense>
  );
}

export default App;
