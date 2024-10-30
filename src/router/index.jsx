import { useRoutes } from "react-router-dom";
import { PublicRoutes } from "./PublicRoutes";

const AppRoutes = () => {
  const element = useRoutes([...PublicRoutes])
  return element;
};

export default AppRoutes;
