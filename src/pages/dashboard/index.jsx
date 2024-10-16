import React, { useEffect, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import qs from "qs";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import Loading from "../../components/Loading";
import Loader from "../../components/Loader";

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  

  return (
    <>
      {loading ? (
        <Loader isLoading={loading} />
      ) : 
       (
        <div className="d-flex flex-column h-100 pageContainer px-sm-1 w-100 pb-sm-1">
          <div className="pageHeader px-3 py-2 my-1 header-search">
            <Row className="">
              <Col md={12} lg={12}>
                <h1 className="fw-semibold h4 my-2">Dashboard</h1>
              </Col>
              <Col md={12} lg={12}>
                <Row className="align-items-start g-2 justify-content-end row">
                     <h1 className="fw-semibold h4 my-2">Coming Soon</h1>
                </Row>
              </Col>
            </Row>
           
          </div>

          
        </div>
      )}
    </>
  );
}
