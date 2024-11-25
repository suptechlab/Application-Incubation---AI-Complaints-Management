import React from 'react';
import { Accordion, Col, ListGroup, Modal, Row } from 'react-bootstrap';
import { MdAttachFile, MdDownload } from 'react-icons/md';
import { Link } from 'react-router-dom';
import CommonViewData from "../../../../components/CommonViewData";
import AppTooltip from '../../../../components/tooltip';

const ViewClaim = ({ handleShow, handleClose }) => {
    // The color class based on the status
    const getStatusClass = (status) => {
        switch (status) {
            case 'Closed':
                return 'bg-success bg-opacity-25 text-success';
            case 'In Progress':
                return 'bg-orange-25 text-orange';
            case 'New':
                return 'bg-primary bg-opacity-25 text-primary';
            case 'Rejected':
                return 'bg-danger bg-opacity-25 text-danger';
            default:
                return 'bg-body bg-opacity-25 text-body';
        }
    };

    // View Top Data
    const viewTopData = [
        {
            label: "Created on",
            value: "07-10-24 | 03:33 pm",
            colProps: { sm: 6, lg: 3 }
        },
        {
            label: "Entity",
            value: "Entity - 1",
            colProps: { sm: 6, lg: 3 }
        },
        {
            label: "Claim Type",
            value: "Credit Portfolio",
            colProps: { sm: 6, lg: 3 }
        },
        {
            label: "Claim Sub Type",
            value: "Refinancing Request",
            colProps: { sm: 6, lg: 3 }
        },
        {
            label: "Resolved on",
            value: "06-25-24 | 06:10 pm",
            colProps: { sm: 6, lg: 3 }
        },
        {
            label: "Claim Status",
            value: <span className='text-success fw-semibold'>Closed and in favor</span>,
            colProps: { sm: 6, lg: 3 }
        },
    ]

    // Accordion Items
    const accordionItems = [
        {
            eventKey: "0",
            header: "Attachments",
            body: [
                {
                    title: "Document 1.docx",
                    dowlnloadUrl: "/",
                },
                {
                    title: "Document 2.xlsx",
                    dowlnloadUrl: "/",
                },
                {
                    title: "Document 3.pdf",
                    dowlnloadUrl: "/",
                },
            ]
        },
        {
            eventKey: "1",
            header: "Attachments send by Entity",
            body: [
                {
                    title: "Document 1.docx",
                    dowlnloadUrl: "/",
                },
                {
                    title: "Document 2.xlsx",
                    dowlnloadUrl: "/",
                },
            ]
        }
    ];

    // View Bottom Data
    const viewBottomData = [
        {
            label: "Precedents",
            value: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. ",
            colProps: { xs: 12 }
        },
        {
            label: "Specific Petition",
            value: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
            colProps: { xs: 12 }
        },
        {
            label: "Entity's Response",
            value: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
            colProps: { xs: 12 }
        },
    ]


    return (
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
                    Claim ID: #52541 <span
                        className={`text-nowrap bg-opacity-25 fs-14 fw-semibold px-3 py-1 rounded-pill ${getStatusClass('Closed')}`}
                    >
                        First Instance
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
                <Accordion flush className='custom-accordion'>
                    {accordionItems.map(item => (
                        <Accordion.Item eventKey={item.eventKey} className='mb-4' key={item.eventKey}>
                            <Accordion.Header>
                                <span className='text-info me-2'><MdAttachFile size={24} /></span>
                                {item.header}
                            </Accordion.Header>
                            <Accordion.Body className='py-0'>
                                <ListGroup variant="flush">
                                    {item?.body?.map((item, index) => (
                                        <ListGroup.Item
                                            key={"data_body_view_" + index}
                                            className="px-1 d-flex gap-2 justify-content-between align-items-start"
                                        >
                                            <span className="me-auto py-1">{item.title}</span>
                                            <AppTooltip title="Download" placement="left">
                                                <Link
                                                    to={item.dowlnloadUrl}
                                                    className="text-decoration-none link-primary"
                                                    target="_blank"
                                                    aria-label="Download"
                                                >
                                                    <MdDownload size={20} />
                                                </Link>
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
    )
}

export default ViewClaim