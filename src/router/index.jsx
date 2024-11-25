import { useRoutes } from "react-router-dom";
import { PublicRoutes } from "./PublicRoutes";
import { useSelector } from "react-redux";
import { ProtectedRoutes } from "./ProtectedRoutes";

const AppRoutes = () => {


  const {token} = useSelector((state)=> state?.authSlice)

  const mainRoutes = token != null && token!=='' ? ProtectedRoutes : []

  const element = useRoutes([...PublicRoutes , ...mainRoutes])
  return element;
};

export default AppRoutes;
