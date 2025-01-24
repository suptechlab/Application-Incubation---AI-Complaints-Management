import { useContext } from "react";
import { I18nextProvider } from "react-i18next";
import Loader from "./components/Loader";
import { AuthenticationContext } from "./contexts/authentication.context";
import i18nConfig from "./language/i18";
import Routers from "./routes/Routers";

function App() {
  const { isLoading } = useContext(AuthenticationContext);
  
  if (isLoading) {
    return <Loader isLoading={isLoading} />;
  }

  return (
    <I18nextProvider i18n={i18nConfig}>
      <Routers />
    </I18nextProvider>
  );
}

export default App;
