import React from 'react'
import { Modal } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import SvgIcons from '../../../../components/SVGIcons'
import { useTranslation } from 'react-i18next'

const FileSuccesModal = ({ handleShow, handleClose, handleFormSubmit, fileClaimData }) => {

    const {t} = useTranslation()
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
                <div className='mb-2' aria-label={t('SUCCESS_LAUNCH_ICON')}>{SvgIcons.successIcon}</div>
                <h2 className='fw-bold'>{t('SUCCESS')}</h2>
                <h6 className='fw-semibold'>{t('CLAIM_HAS_BEEN_FILED')}</h6>
                <div className='custom-font-size-18 fw-semibold text-danger mb-2'> {t('TICKET_NO')} {fileClaimData?.newTicketId}</div>
                <p className='lh-sm small mb-4 pt-1'> {t('CLAIM_SUCCESS_EMAIL')} <Link to={`mainto:email ${fileClaimData.email}`} className='text-decoration-none'>{fileClaimData.email}</Link>.</p>
            </Modal.Body>
        </Modal>
    )
}

export default FileSuccesModal