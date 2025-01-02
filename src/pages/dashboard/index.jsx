import React, { useState } from "react";
import { Card, Image, Stack } from "react-bootstrap";
import CommonDatePicker from "../../components/commonDatePicker";
import Loader from "../../components/Loader";
import TotalClaimsSection from "./sections/total-claims";
import CaimsAndComplaints from "./sections/caims-and-complaints";

export default function Dashboard() {
  const [startDate, setStartDate] = useState();
  const [loading , setLoading ] = useState(false)
  return (
    <React.Fragment>
      <Loader isLoading={loading} />
      <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
        <div className="pb-3">
          <Stack
            direction="horizontal"
            gap={2}
            className="flex-wrap custom-min-height-38"
          >
            <h1 className="fw-semibold fs-4 mb-0 me-auto">
              Dashboard
            </h1>

          </Stack>
        </div>
       
        <TotalClaimsSection />
        <CaimsAndComplaints />
      </div>
    </React.Fragment>
  );
}
