import React from 'react'
import { Button, Modal } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import SvgIcons from '../../../../components/SVGIcons'

const FileAlertModal = ({ handleShow, handleClose, handleFormSubmit, handleFormBack, fileClaimData }) => {

    const navigate = useNavigate()


    return (
        <Modal
            show={handleShow}
            onHide={handleClose}
            backdrop="static"
            keyboard={false}
            centered={true}
            scrollable={true}
            className="theme-modal"
            enforceFocus={false}
            size="sm"
        >
            <Modal.Header className='pb-0' closeButton></Modal.Header>
            <Modal.Body className="text-break text-center pt-3">
                <div className='mb-3' aria-label='Success Launch Icon'>{SvgIcons.alertIcon}</div>
                <h2 className='fw-bold'>Alert!</h2>
                <h6 className='fw-semibold'>It looks like a duplicate entry and will be rejected by the authority.</h6>
                <div className='custom-font-size-18 fw-semibold text-danger mb-2'>Duplicate Claim ID. {fileClaimData?.duplicateTicketId}</div>
                <p className='lh-sm small mb-3 py-1'>Are you sure you want to file this claim?</p>
                <Button
                    type="button"
                    variant="warning"
                    className="px-5"
                    onClick={handleFormSubmit}
                >
                    Yes, File my Claim
                </Button>
                <div>
                <Button
                    type="button"
                    variant="link"
                    onClick={() => { handleClose(); navigate('/tickets?search=${fileClaimData?.duplicateTicketId}') }}
                    className='mt-3 text-black p-0 border-0 text-decoration-none fw-medium custom-font-size-12'
                >
                    No, let me verify existing Claim
                </Button>
                </div>
            </Modal.Body>
        </Modal>
    )
}

export default FileAlertModal