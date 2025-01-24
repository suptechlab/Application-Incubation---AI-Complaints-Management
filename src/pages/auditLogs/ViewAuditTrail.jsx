import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, Col, Row, Stack } from "react-bootstrap";
import moment from "moment";
import { getAuditLogsById } from "../../services/reports.services";
import PageHeader from "../../components/PageHeader";
import { useTranslation } from "react-i18next";
import AuditTable from "./AuditTable";
import Loader from "../../components/Loader";
import CommonViewData from "../../components/CommonViewData";

const ViewAuditTrail = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [data, setData] = useState({});
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    getAuditLogsById(id)
      .then((response) => {
        setData(response.data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  // View Top Data
  const viewTopData = [
    {
      label: t("DATE AND TIME OF ACTIVITY"),
      value: data?.createdAt
        ? moment(data?.createdAt).format("D/M/YYYY hh:mm A")
        : "-",
    },
    {
      label: t("USERNAME/ID"),
      value: data?.loggedUser?.firstName,
    },
    {
      label: t("ACTIVITY TYPE"),
      value: data?.activityType,
    },
    {
      label: t("IP ADDRESS/LOCATION"),
      value: data?.ipAddress,
    },
  ];

  return (
    <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
      <Loader isLoading={isLoading} />
      <PageHeader title={t("AUDIT TRAIL REPORT-DETAIL")} />
      <Card className="border-0 flex-grow-1 d-flex flex-column shadow">
        <Card.Body className="d-flex flex-column">
          <Row>
            {viewTopData?.map((item, index) => (
              <Col sm={6} lg={3} key={"data_view_" + index}>
                <CommonViewData label={item.label} value={item.value} />
              </Col>
            ))}
            <Col xs={12} className="pt-1">
              <h6 className="fw-semibold">{t("AUDIT DETAILS")}</h6>
              <AuditTable
                newData={data?.entityData?.newData ?? {}}
                oldData={data?.entityData?.oldData ?? {}}
                activityType= {data?.activityType}
              />
            </Col>
          </Row>
          <div className="theme-from-footer mt-auto border-top px-3 mx-n3 pt-3">
            <Stack
              direction="horizontal"
              gap={3}
              className="justify-content-end flex-wrap"
            >
              <Link
                to={"/reports/audit-trail"}
                className="btn btn-outline-dark custom-min-width-85"
              >
                {t("BACK")}
              </Link>
            </Stack>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ViewAuditTrail;
