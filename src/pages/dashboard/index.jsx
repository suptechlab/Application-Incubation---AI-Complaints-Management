import React, { useState } from "react";
import { Stack } from "react-bootstrap";
import CommonDatePicker from "../../components/commonDatePicker";
import Loader from "../../components/Loader";
import TotalClaimsSection from "./sections/total-claims";
import CaimsAndComplaints from "./sections/caims-and-complaints";
import NotAuthorized from "../not-authorized";

export default function Dashboard() {
  const [startDate, setStartDate] = useState();
  let loading = false;

  return (
    <React.Fragment>
      <Loader isLoading={loading} />
      <NotAuthorized/>
      {/* <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
       
        <div className="pb-3">
          <Stack
            direction="horizontal"
            gap={2}
            className="flex-wrap custom-min-height-38"
          >
            <h1 className="fw-semibold fs-4 mb-0 me-auto">
              Dashboard
            </h1>

            <div className="custom-width-120 flex-grow-1 flex-md-grow-0">
              <CommonDatePicker
                wrapperClassName="mb-0"
                placeholder="Select"
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="yyyy"
                showYearPicker={true}
                size="sm"
              />
            </div>
          </Stack>
        </div>

        <TotalClaimsSection />
        <CaimsAndComplaints />
      </div> */}
    </React.Fragment>
  );
}
