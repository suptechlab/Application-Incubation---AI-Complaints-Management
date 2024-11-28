import React from "react";
import { ListGroup, Modal, Stack } from "react-bootstrap";
import { MdDownload } from "react-icons/md";
import { Link } from "react-router-dom";
import Loader from "../../../components/Loader";
import AppTooltip from "../../../components/tooltip";

const AttachmentsModal = ({ modal, toggle }) => {

    // Modal Data
    const AttachmentsModalData = [
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
    ];

    return (
        <React.Fragment>
            <Loader isLoading={false} />
            <Modal
                show={modal}
                onHide={toggle}
                backdrop="static"
                keyboard={false}
                centered={true}
                scrollable={true}
                size="sm"
                className="theme-modal"
                enforceFocus={false}
            >
                <Modal.Header className="pb-3" closeButton>
                    <Modal.Title className="fw-semibold mw-1 flex-fill">
                        <Stack direction="horizontal" gap={2} className="justify-content-between pe-lg-2">
                            <span>Attachments</span>
                            <Link target="_blank" to="/" className="text-nowrap text-decoration-none link-primary fs-14"><span className="me-2"><MdDownload size={20} /></span>Download All</Link>
                        </Stack>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-break pt-0 pb-3">
                    <ListGroup variant="flush">
                        {AttachmentsModalData?.map((item, index) => (
                            <ListGroup.Item
                                key={"data_view_" + index}
                                className="small px-0 d-flex gap-2 justify-content-between align-items-start"
                            >
                                <span className="me-auto py-1">{item.title}</span>
                                <AppTooltip title="Download">
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
                </Modal.Body>
            </Modal>
        </React.Fragment>
    );
};

export default AttachmentsModal;