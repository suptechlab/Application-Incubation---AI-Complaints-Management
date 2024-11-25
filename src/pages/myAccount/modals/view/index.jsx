import React from 'react';
import { Accordion, Col, Modal, Row } from 'react-bootstrap';
import CommonViewData from "../../../../components/CommonViewData";
import { MdAttachFile } from 'react-icons/md';

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
                <Row>
                    {viewTopData?.map((item, index) => (
                        <Col key={"data_view_" + index} {...item.colProps}>
                            <CommonViewData label={item.label} value={item.value} />
                        </Col>
                    ))}
                </Row>
                <Accordion flush className='custom-accordion'>
                    <Accordion.Item eventKey="0" className='mb-4'>
                        <Accordion.Header><span className='text-info me-2'><MdAttachFile size={24} /></span> Accordion Item #1</Accordion.Header>
                        <Accordion.Body>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
                            minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                            aliquip ex ea commodo consequat. Duis aute irure dolor in
                            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
                            culpa qui officia deserunt mollit anim id est laborum.
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="1" className='mb-4'>
                        <Accordion.Header>Accordion Item #2</Accordion.Header>
                        <Accordion.Body>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
                            minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                            aliquip ex ea commodo consequat. Duis aute irure dolor in
                            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
                            culpa qui officia deserunt mollit anim id est laborum.
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
            </Modal.Body>
        </Modal>
    )
}

export default ViewClaim