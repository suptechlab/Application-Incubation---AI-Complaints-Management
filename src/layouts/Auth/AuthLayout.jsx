import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Col, Row } from "react-bootstrap";

export default function AuthLayout({ children }) {
  const [isActiveSidebar, setIsActiveSidebar] = useState(false);

  const toggleSidebarButton = () => {
    setIsActiveSidebar((current) => !current);
  };

  return (
    <main className="mainContentBox vh-100">
      <div className="d-flex flex-column h-100 w-100">
        <Header
          isActiveSidebar={isActiveSidebar}
          toggleSidebarButton={toggleSidebarButton}
        />
        <div className="flex-grow-1 overflow-hidden w-100">
          <Row className="gx-0 h-100">
            <Col xs="auto" className="h-100 sidebarMenu">
              <Sidebar
                isActiveSidebar={isActiveSidebar}
                toggleSidebarButton={toggleSidebarButton}
              />
            </Col>
            <Col xs className="d-flex flex-column mw-1 h-100 bg-body-tertiary">
              {isActiveSidebar ? (
                <div
                  aria-hidden={true}
                  onClick={() => toggleSidebarButton}
                  className="backdrop bg-black bg-opacity-25 bottom-0 position-fixed start-0 w-100"
                ></div>
              ) : null}
              {children}
            </Col>
          </Row>
        </div>
      </div>
    </main>
  );
}
