import { useContext, useEffect } from "react";
import Routers from "./routes/Routers";
import { AuthenticationContext } from "./contexts/authentication.context";
import { I18nextProvider } from "react-i18next";
import i18nConfig from "./language/i18";
import Loader from "./components/Loader";
import { handleGetAccountDetail } from "./services/authentication.service";
import toast from "react-hot-toast";

function App() {
  // const { i18n } = useTranslation()
  // const currentLanguage = i18n?.language ?? getLocalStorage('langKey') ?? 'en'
  const { isLoading } = useContext(AuthenticationContext);

  // useEffect(() => {
  //   const accessToken = localStorage.getItem("access_token");

  //   if (accessToken) {
  //     handleGetAccountDetail()
  //       .then((response) => {
  //         const { data } = response;
  //         setUserData(data);
  //       })
  //       .catch((error) => {
  //         console.log(error)
  //         console.error("Error fetching account details:", error);

  //         if (error?.response?.status === '401') {
  //           toast.error("Session expired. Please log in again.");
  //           logout();
  //         }

  //       });
  //   }
  // }, []);

  if (isLoading) {
    return <Loader isLoading={isLoading} />;
  }


  // return <Routers />;
  return (
    <I18nextProvider i18n={i18nConfig}>
      <Routers />
    </I18nextProvider>
  );
}

export default App;
