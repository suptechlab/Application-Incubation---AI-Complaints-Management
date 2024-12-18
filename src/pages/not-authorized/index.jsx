import React from "react";
import unauthorized from "../../assets/images/unauthorized.png"
import { Card } from "react-bootstrap";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
const NotAuthorized = () => {

  const navigate = useNavigate()
  return <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto ">
    <Card className="border-0 flex-grow-1 d-flex flex-column shadow justify-content-center">
      <Card.Body>
        <div className="h-100 d-flex flex-column justify-content-center">
        <div className="text-center">
            <img src={unauthorized} alt="not authorized" height={"200"} />
            <p className="fs-40 mt-2  texgt-dark fw-semibold">
              403
            </p>
            <p className="fs-20 text-secondary">Sorry, you are not authorized to access this page.</p>
            <div>
              <button className="btn btn-primary fs-16"><IoArrowBack className="ms-2" onClick={() => navigate(-1)} /> Go Back</button>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  </div>;
};

export default NotAuthorized;
