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

const ViewClaim = ({ handleShow, handleClose, selectedRow }) => {

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [claimTicketData, setClaimTicketData] = useState([]);
    const [instanceTypeTranslated, setInstanceTypeTranslated] = useState("");
    const { instance_types } = useSelector((state) => state?.masterSlice);
    const [attachmentsData, setAttachmentsData] = useState([]);


    const fetchClaimDetails = async (row) => {
        setLoading(true);
        try {
            const result = await dispatch(getClaimDetails(row?.id));
            if (getClaimDetails.fulfilled.match(result)) {
                setClaimTicketData(result?.payload?.data);
                const attachmentsDataList = result?.payload?.data?.claimTicketDocuments?.map((documents) => {
                    return {
                        id: documents?.id,
                        file_name: documents?.originalTitle
                    }
                });
                setAttachmentsData(attachmentsDataList);
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

    const downloadAttachment = async (id) => {
        setLoading(true);
        const result = await dispatch(downloadDocument(id));
        if (downloadDocument.fulfilled.match(result)) {
            console.log('result', result)
            setLoading(false);
        } else {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (selectedRow?.id) {
            fetchClaimDetails(selectedRow);
        }
    }, [selectedRow]);

    // The color class based on the status
    const getStatusClass = (status) => {
        switch (status) {
            case 'FIRST_INSTANCE':
                return 'bg-success bg-opacity-25 text-success';
            case 'SECOND_INSTANCE':
                return 'bg-orange-25 text-orange';
            case 'COMPLAINT':
                return 'bg-danger bg-opacity-25 text-danger';
            default:
                return 'bg-body bg-opacity-25 text-body';
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
        {
            label: t('CLAIM_STATUS'),
            value: (
                <span className="text-success fw-semibold">
                    {claimTicketData?.status ?? t('N/A')}
                </span>
            ),
            colProps: { sm: 6, lg: 3 }
        }
    ];

    // Accordion Items
    const accordionItems = [
        {
            eventKey: '0',
            header: t('ATTACHMENTS'),
            body: [
                { title: 'Document 1.docx', dowlnloadUrl: '/' },
                { title: 'Document 2.xlsx', dowlnloadUrl: '/' },
                { title: 'Document 3.pdf', dowlnloadUrl: '/' }
            ]
        },
        // {
        //     eventKey: '1',
        //     header: t('ATTACHMENTS_SENT_BY_ENTITY'),
        //     body: [
        //         { title: 'Document 1.docx', dowlnloadUrl: '/' },
        //         { title: 'Document 2.xlsx', dowlnloadUrl: '/' }
        //     ]
        // }
    ];

    // View Bottom Data
    const viewBottomData = [
        {
            label: t('PRECEDENTS'),
            value: claimTicketData?.precedents ?? t('N/A'),
            colProps: { xs: 12 }
        },
        {
            label: t('SPECIFIC_PETITION'),
            value: claimTicketData?.specificPetition ?? t('N/A'),
            colProps: { xs: 12 }
        },
        // {
        //     label: t("ENTITY_RESPONSE"),
        //     value: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
        //     colProps: { xs: 12 }
        // },
    ];

    return (
        <React.Fragment>
            <Loader isLoading={loading} />
            <Modal
                show={handleShow}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
                centered={true}
                scrollable={true}
                size="lg"
                className="theme-modal"
                enforceFocus={false}
            >
                <Modal.Header closeButton className="align-items-start pb-2 pt-3 pe-3">
                    <Modal.Title as="h4" className="fw-bold d-inline-flex align-items-center flex-wrap gap-2">
                        {t("CLAIM")} ID: #{claimTicketData?.ticketId}{" "}
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
                    {/* WILL DO IT LATER */}
                    <Accordion flush className='custom-accordion'>
                        {accordionItems.map(item => (
                            <Accordion.Item eventKey={item.eventKey} className='mb-4' key={item.eventKey}>
                                <Accordion.Header>
                                    <span className='text-info me-2'><MdAttachFile size={24} /></span>
                                    {item.header}
                                </Accordion.Header>
                                <Accordion.Body className='py-0'>
                                    <ListGroup variant="flush">
                                        {attachmentsData?.map((item, index) => (
                                            <ListGroup.Item
                                                key={"data_body_view_" + index}
                                                className="px-1 d-flex gap-2 justify-content-between align-items-start"
                                            >
                                                <span className="me-auto py-1">{item.file_name}</span>
                                                <AppTooltip title={t("DOWNLOAD")} placement="left">
                                                    <Button
                                                        className="text-decoration-none"
                                                        aria-label={t("DOWNLOAD")}
                                                        onClick = {() => downloadAttachment(item.id)}
                                                    >
                                                        <MdDownload size={20} />
                                                    </Button>
                                                </AppTooltip>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                </Accordion.Body>
                            </Accordion.Item>
                        ))}
                    </Accordion>

                    {/* View Bottom Data */}
                    <Row>
                        {viewBottomData?.map((item, index) => (
                            <Col key={"data_view_bottom_" + index} {...item.colProps}>
                                <CommonViewData label={item.label} value={item.value} />
                            </Col>
                        ))}
                    </Row>
                </Modal.Body>
            </Modal>
        </React.Fragment>
    );
};

export default ViewClaim