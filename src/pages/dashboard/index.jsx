import React, { useState } from "react";
import { Stack } from "react-bootstrap";
import Loader from "../../components/Loader";
import TotalClaimsSection from "./sections/total-claims";
import ClaimsAndComplaints from "./sections/claims-and-complaints";
import { useTranslation } from "react-i18next";

export default function Dashboard() {
  const [loading, setLoading] = useState(false)

  const { t } = useTranslation()
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
              {t("DASHBOARD")}
            </h1>
          </Stack>
        </div>
        <TotalClaimsSection setLoading={setLoading} />
        <ClaimsAndComplaints setLoading={setLoading} />
      </div>
    </React.Fragment>
  );
}
