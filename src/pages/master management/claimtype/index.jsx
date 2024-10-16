import React, { useState } from "react";
import PageHeader from "../../../components/PageHeader";
import { Card } from "reactstrap";

const ClaimType = () => {

  const [modal, setModal] = useState(false);

  const toggle = () => setModal(!modal);


  return <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
    <PageHeader title={"Claim Type"} toggle={toggle}/>
    <div className="flex-grow-1 pageContent position-relative pt-4 overflow-auto">
      <Card className="h-100 bg-white shadow-lg border-0 theme-card-cover">
      </Card>
    </div>
  </div>

};

export default ClaimType;
