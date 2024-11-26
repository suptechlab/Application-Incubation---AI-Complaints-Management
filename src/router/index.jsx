import { useRoutes } from "react-router-dom";
import { PublicRoutes } from "./PublicRoutes";
import { PrivateRoutes } from "./PrivateRoutes";

const AppRoutes = () => {
  const element = useRoutes([...PublicRoutes, ...PrivateRoutes])
  return element;
};

export default AppRoutes;
