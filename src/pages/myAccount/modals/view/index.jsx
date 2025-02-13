import moment from 'moment/moment';
import React, { useEffect, useState } from 'react';
import { Accordion, Button, Col, ListGroup, Modal, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import CommonViewData from "../../../../components/CommonViewData";
import { getClaimDetails } from '../../../../redux/slice/fileClaimSlice';
import Loader from '../../../../components/Loader';
import { MdAttachFile, MdDownload } from 'react-icons/md';
import AppTooltip from '../../../../components/tooltip';
import { downloadDocument } from '../../../../redux/slice/fileClaimSlice';
import { downloadFile } from '../../../../constants/utils';
import { useNavigate, useSearchParams } from "react-router-dom"

const ViewClaim = ({ claimModalView, handleShow, handleClose, selectedRow }) => {
    const [searchParams] = useSearchParams();
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const { instance_types, masterData } = useSelector((state) => state?.masterSlice);
    const [loading, setLoading] = useState(true);
    const [claimTicketData, setClaimTicketData] = useState([]);
    const [instanceTypeTranslated, setInstanceTypeTranslated] = useState("");
    const [roleUserDocuments, setRoleUserDocuments] = useState([]);
    const [roleFiUserDocuments, setRoleFiUserDocuments] = useState([]);
    const [roleSepsUserDocuments, setRoleSepsUserDocuments] = useState([]);

    const [isDownloading, setIsDownloading] = useState(false)

    const navigate = useNavigate()

    const fetchClaimDetails = async (row) => {
        setLoading(true);
        try {
            const result = await dispatch(getClaimDetails(row?.id));
            if (getClaimDetails.fulfilled.match(result)) {
                setClaimTicketData(result?.payload?.data);
                const roleUserAttachments = result?.payload?.data?.claimTicketDocuments
                    .filter((doc) => doc.uploadedByUser.authorities.includes("ROLE_USER"))
                    .map(({ id, externalDocumentId, originalTitle }) => ({
                        id: id,
                        file_name: originalTitle,
                        externalDocumentId: externalDocumentId,
                    }));

                const roleFiUserAttachments = result?.payload?.data?.claimTicketDocuments
                    .filter((doc) => doc.uploadedByUser.authorities.includes("ROLE_FI_USER"))
                    .map(({ id, externalDocumentId, originalTitle }) => ({
                        id: id,
                        file_name: originalTitle,
                        externalDocumentId: externalDocumentId,
                    }));

                const roleSepsUserAttachments = result?.payload?.data?.claimTicketDocuments
                    .filter((doc) => doc.uploadedByUser.authorities.includes("ROLE_SEPS_USER"))
                    .map(({ id, externalDocumentId, originalTitle }) => ({
                        id: id,
                        file_name: originalTitle,
                        externalDocumentId: externalDocumentId,
                    }));
                setRoleUserDocuments(roleUserAttachments);
                setRoleFiUserDocuments(roleFiUserAttachments);
                setRoleSepsUserDocuments(roleSepsUserAttachments);
                const matchedInstanceType = instance_types.find(
                    (type) => type.value === result?.payload?.data?.instanceType
                );
                const displayLabel = matchedInstanceType ? matchedInstanceType.label : result?.payload?.data?.instanceType;
                setInstanceTypeTranslated(displayLabel)
                setLoading(false);
            } else {
                console.error('Verification error:', result.error?.message || 'Unknown error');
                setLoading(false);
            }
        } catch (error) {
            console.error('Unexpected error:', error);
            setLoading(false);
        }
    };

    const downloadAttachment = async (id, attachmentData) => {
        setIsDownloading(true);
        const result = await dispatch(downloadDocument(id));
        if (downloadDocument.fulfilled.match(result)) {
            downloadFile(result?.payload, attachmentData?.file_name).then(() => {

            }).catch((error) => {

            }).finally(() => {
                setIsDownloading(false)
            })
        } else {
            setIsDownloading(false);
        }
    }

    // useEffect(() => {
    //     if (selectedRow?.id) {
    //         fetchClaimDetails(selectedRow);
    //     } else {
    //         setClaimTicketData([])
    //     }
    // }, [selectedRow]);


    const handleModalClose = ()=>{
        const ticketId = searchParams.get("ticketId");

        if(ticketId){
            navigate('/my-account')
        }
        handleClose()
    }

    useEffect(() => {
        const ticketId = searchParams.get("ticketId");


        console.log({"HELLO": ticketId})

        if (selectedRow?.id) {
            fetchClaimDetails(selectedRow);
        } else if (ticketId) {
            handleShow(true)
            fetchClaimDetails({ id: ticketId }); // Fetch data using ticketId from URL
        } else {
            setClaimTicketData([]);
        }
    }, [selectedRow, searchParams]);

    // The color class based on the status
    const getStatusClass = (status) => {
        switch (status) {
            case 'FIRST_INSTANCE':
                return 'bg-success bg-opacity-25 text-success';
            case 'SECOND_INSTANCE':
                return 'bg-orange-25 text-orange';
            case 'COMPLAINT':
                return 'bg-danger bg-opacity-25 text-danger';
            case 'IN_PROGRESS':
                return 'bg-info-25 text-info';
            case 'NEW':
                return 'bg-primary bg-opacity-25 text-primary';
            case 'REJECTED':
                return 'bg-danger bg-opacity-25 text-danger';
            case 'ASSIGNED':
                return 'bg-orange-25 text-orange';
            default:
                return 'bg-body bg-opacity-25 text-body';
        }
    };

    // GET STATUS TEXT CLASS

    const getStatusTextClass = (status) => {
        switch (status) {
            case 'CLOSED':
                return 'text-success';
            case 'IN_PROGRESS':
                return 'text-info';
            case 'NEW':
                return 'text-primary';
            case 'REJECTED':
                return 'text-danger';
            case 'ASSIGNED':
                return 'text-orange';
            default:
                return 'text-body';
        }
    };
    // View Top Data
    const viewTopData = [
        {
            label: t('CREATED_ON'),
            value: claimTicketData?.createdAt
                ? moment(claimTicketData?.createdAt).format('DD-MM-YY | hh:mm:ss')
                : t('NOT_AVAILABLE'),
            colProps: { sm: 6, lg: 3 }
        },
        {
            label: t('ENTITY_NAME'),
            value: claimTicketData?.organization?.razonSocial ?? t('N/A'),
            colProps: { sm: 6, lg: 3 }
        },
        {
            label: t('CLAIM_TYPE'),
            value: claimTicketData?.claimType?.name ?? t('N/A'),
            colProps: { sm: 6, lg: 3 }
        },
        {
            label: t('CLAIM_SUB_TYPE'),
            value: claimTicketData?.claimSubType?.name ?? t('N/A'),
            colProps: { sm: 6, lg: 3 }
        },
        {
            label: t('RESOLVED_ON'),
            value: claimTicketData?.resolvedOn
                ? moment(claimTicketData?.resolvedOn).format('DD-MM-YY | hh:mm:ss a')
                : t('N/A'),
            colProps: { sm: 6, lg: 3 }
        },
        ...(claimTicketData?.instanceType === "SECOND_INSTANCE" ? [{
            label: t('FIRST_INSTANCE_CLAIM_ID'),
            value: (
                <span className={`fw-semibold`}>
                    #{claimTicketData?.previousTicket?.ticketId}
                </span>
            ),
            colProps: { sm: 6, lg: 3 },
        }] : []),
        ...(claimTicketData?.instanceType === "COMPLAINT" ? [{
            label: t('SECOND_INSTANCE_CLAIM_ID'),
            value: (
                <span className={`fw-semibold`}>
                    #{claimTicketData?.previousTicket?.ticketId}
                </span>
            ),
            colProps: { sm: 6, lg: 3 },
        }] : []),

        {
            label: t('CLAIM_STATUS'),
            value: (
                <span className={`${getStatusTextClass(claimTicketData?.status)} fw-semibold`}>
                    {masterData?.claimTicketStatus[claimTicketData?.status] ?? t('N/A')}
                </span>
            ),
            colProps: { sm: 6, lg: 3 }
        },

        ...(claimTicketData?.status === "CLOSED" || claimTicketData?.status === "REJECTED" ? [
            {
                label: t('CLAIM_SUB_STATUS'),
                value: (
                    <span className={`fw-semibold`}>
                        {
                            claimTicketData?.status === 'CLOSED' && masterData?.closedStatus[claimTicketData?.closedStatus]
                        }
                        {
                            claimTicketData?.status === 'REJECTED' && masterData?.rejectedStatus[claimTicketData?.rejectedStatus]
                        }
                    </span>
                ),
                colProps: { sm: 6, lg: 3 }
            }
        ] : []),
    ];

    // Accordion Items
    const accordionItems = [
        {
            eventKey: '0',
            header: t('ATTACHMENTS'),
            body: roleUserDocuments,
            condition: (roleUserDocuments && roleUserDocuments?.length > 0),
        },
        {
            eventKey: '1',
            header: t('ATTACHMENTS_SENT_BY_ENTITY'),
            body: roleFiUserDocuments,
            condition: (claimTicketData?.instanceType === 'FIRST_INSTANCE' && roleFiUserDocuments && roleFiUserDocuments?.length > 0),
        },
        {
            eventKey: '2',
            header: t('ATTACHMENTS_SENT_BY_SEPS'),
            body: roleSepsUserDocuments,
            condition: (claimTicketData?.instanceType !== 'FIRST_INSTANCE' && roleSepsUserDocuments && roleSepsUserDocuments?.length > 0),
        },
    ];

    // View Bottom Data
    const viewBottomData = [
        {
            label: t('PRECEDENTS'),
            value: claimTicketData?.instanceType !== 'SECOND_INSTANCE' ? claimTicketData?.precedents ?? t('N/A') : '',
            colProps: { xs: 12 },
            condition: claimTicketData?.instanceType !== 'SECOND_INSTANCE'
        },
        {
            label: t('SPECIFIC_PETITION'),
            value: claimTicketData?.instanceType !== 'SECOND_INSTANCE' ? claimTicketData?.specificPetition ?? t('N/A') : '',
            colProps: { xs: 12 },
            condition: claimTicketData?.instanceType !== 'SECOND_INSTANCE'
        },
        {
            label: t('COMMENTS'),
            value: claimTicketData?.secondInstanceComment ?? t('N/A'),
            colProps: { xs: 12 },
            condition: claimTicketData?.instanceType === 'SECOND_INSTANCE'
        },
        // {
        //     label: t("ENTITY_RESPONSE"),
        //     value: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
        //     colProps: { xs: 12 }
        // },
    ];

    return (
        <React.Fragment>
            <Loader isLoading={isDownloading} />
            <Modal
                show={claimModalView}
                onHide={handleModalClose}
                backdrop="static"
                keyboard={false}
                centered={true}
                scrollable={true}
                size="lg"
                className="theme-modal"
                enforceFocus={false}
            >
                {
                    loading ?


                        <>
                            <Modal.Header closeButton className="align-items-start pb-2 pt-3 pe-3">

                                <h5 className="card-title placeholder-glow pb-2 pt-3 w-50">
                                    <span className="placeholder col-7"></span>
                                </h5>

                            </Modal.Header>

                            <Modal.Body>


                                <div className="row card-title placeholder-glow pb-2 pt-3 mb-3 g-3">
                                    {
                                        [...Array(6)].map((_, index) => (
                                            <div key={index} className="col-sm-6 col-lg-3">
                                                <div className="placeholder w-100 custom-height-42"></div>
                                            </div>
                                        ))
                                    }
                                </div>
                                <div className="row card-title placeholder-glow pb-2 pt-3 mb-3 g-3">
                                    {
                                        [...Array(2)].map((_, index) => (
                                            <div key={index} className="col-12">
                                                <div className="placeholder w-100 custom-height-42"></div>
                                            </div>
                                        ))
                                    }
                                </div>
                                <div className="row card-title placeholder-glow pb-2 pt-3 mb-3 g-3">
                                    {
                                        [...Array(2)].map((_, index) => (
                                            <div key={index} className="col-12 ">
                                                <div className="placeholder w-25 "></div>
                                                <div className="placeholder w-100 custom-height-48"></div>
                                            </div>
                                        ))
                                    }


                                </div>
                            </Modal.Body>  </> :
                        <>
                            <Modal.Header closeButton className="align-items-start pb-2 pt-3 pe-3">

                                <Modal.Title as="h4" className="fw-bold d-inline-flex align-items-center flex-wrap gap-2">
                                    {t("TICKET_ID")}: #{claimTicketData?.formattedTicketId}{" "}
                                    <span
                                        className={`text-nowrap bg-opacity-25 fs-14 fw-semibold px-3 py-1 rounded-pill ${getStatusClass(
                                            claimTicketData?.instanceType
                                        )}`}
                                    >
                                        {instanceTypeTranslated}
                                    </span>

                                </Modal.Title>

                            </Modal.Header>

                            <Modal.Body className="text-break small">

                                {/* View Top Data */}
                                <Row>
                                    {viewTopData?.map((item, index) => (
                                        <Col key={"data_view_" + index} {...item.colProps}>
                                            <CommonViewData label={item.label} value={item.value} />
                                        </Col>
                                    ))}
                                </Row>
                                {/* Accordion Items */}
                                <Accordion flush className="custom-accordion">
                                    {accordionItems
                                        .filter(item => item.condition) // Only include items where condition is true
                                        .map(item => (
                                            <Accordion.Item eventKey={item.eventKey} className="mb-4" key={item.eventKey}>
                                                <Accordion.Header>
                                                    <span className="text-info me-2"><MdAttachFile size={24} /></span>
                                                    {item.header}
                                                </Accordion.Header>
                                                <Accordion.Body className="py-0">
                                                    <ListGroup variant="flush">
                                                        {item.body?.length > 0 ? (
                                                            item.body.map((doc, index) => (
                                                                <ListGroup.Item
                                                                    key={"data_body_view_" + index}
                                                                    className="px-1 d-flex gap-2 justify-content-between align-items-start"
                                                                >
                                                                    <span className="me-auto py-1">{doc.file_name}</span>
                                                                    <AppTooltip title={t("DOWNLOAD")} placement="left">
                                                                        <Button
                                                                            variant="link"
                                                                            className="text-decoration-none"
                                                                            aria-label={t("DOWNLOAD")}
                                                                            onClick={() => downloadAttachment(doc?.externalDocumentId, doc)}
                                                                        >
                                                                            <MdDownload size={20} />
                                                                        </Button>
                                                                    </AppTooltip>
                                                                </ListGroup.Item>
                                                            ))
                                                        ) : (
                                                            <ListGroup.Item className="px-1 text-muted">
                                                                {t("NO_ATTACHMENTS_AVAILABLE")}
                                                            </ListGroup.Item>
                                                        )}
                                                    </ListGroup>
                                                </Accordion.Body>
                                            </Accordion.Item>
                                        ))}
                                </Accordion>

                                {/* View Bottom Data */}
                                <Row>
                                    {viewBottomData
                                        .filter(item => item.condition)
                                        .map((item, index) => (
                                            <Col key={"data_view_bottom_" + index} {...item.colProps}>
                                                <CommonViewData label={item.label} value={item.value} />
                                            </Col>
                                        ))}
                                </Row>
                            </Modal.Body>
                        </>
                }
            </Modal>
        </React.Fragment>
    );
};

export default ViewClaim