import { useContext } from "react";
import Routers from "./routes/Routers";
import { AuthenticationContext } from "./contexts/authentication.context";
import { I18nextProvider, useTranslation } from "react-i18next"
import i18nConfig from "./language/i18"
import { getLocalStorage } from './utils/storage';

function App() {

  const { i18n } = useTranslation()

  const currentLanguage = i18n?.language ?? getLocalStorage('langKey') ?? 'en'

  const { isLoading } = useContext(AuthenticationContext);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // return <Routers />;
  return (
    <I18nextProvider i18n={i18nConfig}>
      <Routers />
    </I18nextProvider>
  )
}

export default App;
