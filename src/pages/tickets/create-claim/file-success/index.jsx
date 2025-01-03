import React from 'react'
import { Modal } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import SvgIcons from '../../../../components/SVGIcons'

const FileSuccesModal = ({ handleShow, handleClose, handleFormSubmit, fileClaimData }) => {
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
                <div className='mb-2' aria-label='Success Launch Icon'>{SvgIcons.successIcon}</div>
                <h2 className='fw-bold'>Success! </h2>
                <h6 className='fw-semibold'>Claim has been filed</h6>
                <div className='custom-font-size-18 fw-semibold text-danger mb-2'>Ticket No. {fileClaimData?.newTicketId}</div>
                <p className='lh-sm small mb-4 pt-1'>Claim has been successfully filed. Details have been sent to user's email <Link to={`mainto:email ${fileClaimData.email}`} className='text-decoration-none'>{fileClaimData.email}</Link>.</p>
            </Modal.Body>
        </Modal>
    )
}

export default FileSuccesModal