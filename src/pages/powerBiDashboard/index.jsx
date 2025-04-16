import React, { useContext } from "react";
import { Stack } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { AuthenticationContext } from "../../contexts/authentication.context";

const PowerBiDashboard = () => {
  const { t } = useTranslation()


  const { currentUser ,userData} = useContext(AuthenticationContext);

  const powerBiLink = "https://app.powerbi.com/reportEmbed?reportId=52b8eb4e-5d0a-4261-bd8d-dcc8515b7bab&autoAuth=true&ctid=c05e11e5-706c-4cef-ba5e-18eedbf10037"



  return <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
    <div className="pb-3">
      <Stack
        direction="horizontal"
        gap={2}
        className="flex-wrap custom-min-height-38"
      >
        <h1 className="fw-semibold fs-4 mb-0 me-auto">
          {t("POWER_BI_DASHBOARD")}
        </h1>
      </Stack>
    </div>

    {/* https://app.powerbi.com/reportEmbed?reportId=b83fa707-b117-4372-b076-67efca7fbd58&autoAuth=true&ctid=4f84ae42-57aa-48c2-b366-4dc5dfce353c */}

    {
      currentUser !== 'FI_USER' ? 
      <iframe
      title="PowerBiDashboard"
      id="reportFrame"
      src={powerBiLink} height="600pt" width="100%"
      style={{ width: '100%', height: '100%', border: 'none', border: "1px solid #ccc" }}
    /> :  <iframe
      title="PowerBiDashboard"
      id="reportFrame"
      src= {`${powerBiLink}&filter=Claims/entity eq '${userData?.organization?.razonSocial}'`}
      style={{ width: '100%', height: '100%', border: 'none', border: "1px solid #ccc" }}
    />
    }
   
  </div>
};

export default PowerBiDashboard;
