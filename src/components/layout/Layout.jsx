import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";

const Layout = ({layout}) => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header layout={layout} />
      <div className="d-flex flex-column flex-grow-1 overflow-auto">
        <Outlet />
        <Footer layout={layout} />
      </div>
    </div>
  );
};

export default Layout;
