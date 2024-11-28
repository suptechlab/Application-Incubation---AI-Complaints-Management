import React from 'react'
import { Button, Modal } from 'react-bootstrap'
import SvgIcons from '../../../../components/SVGIcons'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

const SetupSuccesModal = ({ handleShow, handleClose, handleFormSubmit }) => {
    const {t} = useTranslation()
    const { user } = useSelector(state => state?.authSlice)
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
                    <div className='mb-2' aria-label='Success Launch Icon'>{SvgIcons.successIcon}</div>
                    <h2 className='fw-bold'>{t('SUCCESS_TITLE')}</h2>
                    <h5 className='custom-font-size-18 fw-semibold'>{t('ACCOUNT_SETUP_SUCCESS')}</h5>
                    <p className='lh-sm small mb-4 pt-1'>
                        {t('ACCOUNT_CREATION_MESSAGE')}
                        <Link to={`mainto:email ${user?.email}`} className='text-decoration-none'> {user?.email}</Link>.
                    </p>
                    <Button
                        type="button"
                        variant="warning"
                        className="custom-min-width-100"
                        onClick={handleFormSubmit}
                    >
                        {t('FILE_CLAIM_NOW')} <span className="ms-1">&gt;</span>
                    </Button>
                </div>
            </Modal.Body>
        </Modal>

    )
}

export default SetupSuccesModal