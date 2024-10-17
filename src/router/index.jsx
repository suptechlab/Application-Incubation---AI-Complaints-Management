import React from "react";
import { PublicRoutes } from "./PublicRoutes";
import { useRoutes } from "react-router-dom";

const AppRoutes = () => {

  const element = useRoutes([...PublicRoutes])
  return <div>{element}</div>;
};

export default AppRoutes;
