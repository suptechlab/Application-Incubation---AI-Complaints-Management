import React from 'react'
import { Button, Modal } from 'react-bootstrap'
import SvgIcons from '../../../../components/SVGIcons'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const FileAlertModal = ({ handleShow, handleClose, handleFormSubmit, handleFormBack ,fileClaimData}) => {

    const navigate = useNavigate();
    const { t } = useTranslation();

    
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
        >
            <Modal.Body className="text-break text-center">
                <div className='py-sm-4 px-sm-2'>
                    <div className='mb-3' aria-label='Success Launch Icon'>{SvgIcons.alertIcon}</div>
                    <h2 className='fw-bold'>{t('ALERT!')}</h2>
                    <h6 className='fw-semibold'>{t('AUTHORITY_REJECTION')}</h6>
                    <div className='custom-font-size-18 fw-semibold text-danger mb-2'>{t('DUPLICATE_CLAIM_ID')} {fileClaimData?.duplicateTicketId}</div>
                    <p className='lh-sm small mb-3 py-1'>{t('FILE_CLAIM_SURITY')}</p>
                    <Button
                        type="button"
                        variant="warning"
                        className="px-5"
                        onClick={handleFormSubmit}
                    >
                        {t('YES_FILE_CLAIM')}
                    </Button>
                    <Button
                        type="button"
                        variant="link"
                        onClick={()=>{handleClose() ; navigate('/my-account')}}
                        className='mt-3 text-black p-0 border-0 text-decoration-none fw-medium custom-font-size-12'
                    >
                        {t('NO_FILE_MY_CLAIM')}
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    )
}

export default FileAlertModal