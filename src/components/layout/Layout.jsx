import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";

const Layout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <div className="d-flex flex-column flex-grow-1 overflow-auto">
        <Outlet />
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
