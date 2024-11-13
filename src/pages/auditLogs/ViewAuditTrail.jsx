import moment from "moment";
import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Stack } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from "react-router-dom";
import Loader from '../../components/Loader';
import PageHeader from '../../components/PageHeader';
import { getAuditLogsById } from '../../services/auditlogs.services';
import AuditTable from './AuditTable';

const ViewAuditTrail = () => {

    const { id } = useParams();

    const { t } = useTranslation()
    const [data, setData] = useState({});
    const [isLoading , setLoading] = useState(true)

    useEffect(() => {
        getAuditLogsById(id).then(response => {
            setData(response.data);
        }).finally(()=>{
            setLoading(false)
        });
    }, [id]);

    return (
        <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
        <Loader isLoading={isLoading}/> 
            <PageHeader
                title={t("AUDIT TRAIL REPORT-DETAIL")}
            />
            <Card className="border-0 flex-grow-1 d-flex flex-column shadow">
                <Card.Body className="d-flex flex-column">
                        <Row>
                            <Col md={3}>
                                <div className="file-details">
                                    <label className="mt-4 pt-1 fs-14 fw-bold">{t("DATE AND TIME OF ACTIVITY")} </label>
                                    <p>{data?.createdAt ? moment(data?.createdAt).format("D/M/YYYY hh:mm A") : '-'}</p>
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className="file-details">
                                    <label className="mt-4 pt-1 fs-14 fw-bold">{t("USERNAME/ID")}</label>
                                    <p>{data?.loggedUser?.firstName}</p>
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className="file-details">
                                    <label className="mt-4 pt-1 fs-14 fw-bold">{t("ACTIVITY TYPE")} </label>
                                    <p>{data?.activityType}</p>
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className="file-details">
                                    <label className="mt-4 pt-1 fs-14 fw-bold">{t("IP ADDRESS/LOCATION")}</label>
                                    <p>{data?.ipAddress}</p>
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <h5 className="mt-4">{t("AUDIT DETAILS")}</h5>
                                <AuditTable newData={data?.entityData?.newData ?? {}} oldData={data?.entityData?.oldData ?? {}} activityType={data?.activityType ?? ""} />
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