import React, { useEffect, useState } from "react";
import { ListGroup, Modal, Stack } from "react-bootstrap";
import { MdDownload } from "react-icons/md";
import { Link } from "react-router-dom";
import Loader from "../../../components/Loader";
import AppTooltip from "../../../components/tooltip";
import { downloadTicketsAttachment } from "../../../services/ticketmanagement.service";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { downloadFile } from "../../../utils/commonutils";

const AttachmentsModal = ({ modal, toggle, ticketData }) => {

    const [AttachmentsModalData, setAttachmentModalData] = useState(ticketData?.claimTicketDocuments ?? [])
    const [isDownloading, setDownloading] = useState(false)

    const { t } = useTranslation()

    useEffect(() => {
        // setAttachmentModalData(ticketData?.claimTicketDocuments ?? [])
        setAttachmentModalData(() => {
            if (ticketData?.instanceType === "FIRST_INSTANCE") {
              return ticketData?.claimTicketDocuments?.filter(doc => doc.instanceType === "FIRST_INSTANCE") ?? [];
            } else if (ticketData?.instanceType === "SECOND_INSTANCE") {
              return ticketData?.claimTicketDocuments?.filter(doc => doc.instanceType === "SECOND_INSTANCE") ?? [];
            } else {
              return []; // Return empty if no valid instanceType
            }
          });
    }, [ticketData?.claimTicketDocuments])

    // Modal Data
    // const AttachmentsModalData = [
    //     {
    //         title: "Document 1.docx",
    //         dowlnloadUrl: "/",
    //     },
    //     {
    //         title: "Document 2.xlsx",
    //         dowlnloadUrl: "/",
    //     },
    //     {
    //         title: "Document 3.pdf",
    //         dowlnloadUrl: "/",
    //     },
    // ];

    // HANDLE ATTACHMENT DOWNLOAD
    const handleAttachmentDownload = (attachmentData) => {

        setDownloading(true)
        toast.loading(t("DOWNLOAD_IN_PROGRESS"), { id: "downloading", isLoading: isDownloading ?? false })
        downloadTicketsAttachment(attachmentData?.externalDocumentId).then(response => {
            if (response) {
                downloadFile(response, attachmentData, attachmentData?.originalTitle)
                    .then(() => {
                        console.log(response)
                        toast.success(t("ATTACHMENT DOWNLOADED"), { id: "downloading" })
                    })
                    .catch((error) => {
                        console.log(error)
                        // Handle any error that occurred during the download
                        toast.error(error?.message ?? t("DOWNLOAD_ERROR") , { id: "downloading" });
                    }).finally(()=>{
                        setDownloading(false)
                    });
            } else {
                toast.dismiss("downloading");
                throw new Error(t("EMPTY RESPONSE"));
            }
        }).catch((error) => {
            if (error?.response?.data?.errorDescription) {
                toast.error(error?.response?.data?.errorDescription ,  { id: "downloading" });
            } else {
                toast.error(error?.message ?? t("DOWNLOAD ERROR") , { id: "downloading" });
            }
            toast.dismiss("downloading");
        }).finally(() => {
            // Ensure the loading toast is dismissed
            // toast.dismiss("downloading");
            setDownloading(false)
        });
    }

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
                            <span>{t("ATTACHMENTS")}</span>
                            {/* <Link target="_blank" to="/" className="text-nowrap text-decoration-none link-primary fs-14"><span className="me-2"><MdDownload size={20} /></span>Download All</Link> */}
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
                                <span className="me-auto py-1">{item?.originalTitle}</span>
                                <AppTooltip title="Download">
                                    <button
                                        // to={item.dowlnloadUrl}
                                        onClick={() => handleAttachmentDownload(item)}
                                        className="text-decoration-none btn link-primary"
                                        target="_blank"
                                        aria-label="Download"
                                        disabled={isDownloading ?? false}
                                    >
                                        <MdDownload size={20} />
                                    </button>
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