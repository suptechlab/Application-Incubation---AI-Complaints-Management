import React, { useEffect, useState } from 'react';
import { Link, useParams } from "react-router-dom";
import { Card, Col, Row, Stack, Table } from 'react-bootstrap';
import SvgIcons from "../../components/SVGIcons";
import moment from "moment";
import { getAuditLogsById } from '../../services/auditlogs.services';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from 'react-i18next';
import AuditTable from './AuditTable';

const ViewAuditTrail = () => {

    const { id } = useParams();

    const { t } = useTranslation()
    const [data, setData] = useState({});

    useEffect(() => {
        getAuditLogsById(id).then(response => {
            setData(response.data);
        });
    }, [id]);

    return (
        <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
            <PageHeader
                title={t("AUDIT TRAIL DETAIL")}
            />
            <div className="flex-grow-1 pageContent position-relative pt-4 overflow-auto">
                <Card className="h-100 bg-white shadow-lg border-0 theme-card-cover card">

                    <div className="flex-grow-1 d-flex flex-column px-3 pb-1 pt-3 overflow-auto">
                        <div className="p-1 h-100">
                            <form className="d-flex flex-column h-100">
                                <Row>
                                    <Col md={3}>
                                        <div className="file-details">
                                            <label className="mt-4 pt-1 fs-14 fw-bold">Activity Time </label>
                                            <p>{data?.createdAt ? moment(data?.createdAt).format("D/M/YYYY hh:mm A") : '-'}</p>
                                        </div>
                                    </Col>
                                    <Col md={3}>
                                        <div className="file-details">
                                            <label className="mt-4 pt-1 fs-14 fw-bold">Username</label>
                                            <p>{data?.loggedUser?.firstName}</p>
                                        </div>
                                    </Col>
                                    <Col md={3}>
                                        <div className="file-details">
                                            <label className="mt-4 pt-1 fs-14 fw-bold">Activity </label>
                                            <p>{data?.activityType}</p>
                                        </div>
                                    </Col>
                                    <Col md={3}>
                                        <div className="file-details">
                                            <label className="mt-4 pt-1 fs-14 fw-bold">IP Address</label>
                                            <p>{data?.ipAddress}</p>
                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <h5 className="mt-4">Audit Details</h5>
                                        <AuditTable newData={data?.entityData?.newData ?? {}} oldData={data?.entityData?.oldData ?? {}}/>
                                    </Col>
                                </Row>
                                <div className="theme-from-footer mt-auto border-top px-3 pt-3">
                                    <Stack
                                        direction="horizontal"
                                        gap={3}
                                        className="justify-content-end px-1"
                                    >
                                        <Link
                                            to={"/audit-logs"}
                                            className="btn btn-outline-dark fs-14 width-85"
                                        >
                                            Back
                                        </Link>
                                    </Stack>
                                </div>
                            </form>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ViewAuditTrail;