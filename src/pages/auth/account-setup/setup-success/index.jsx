import React from 'react'
import { Button, Modal } from 'react-bootstrap'
import SvgIcons from '../../../../components/SVGIcons'
import { Link } from 'react-router-dom'

const SetupSuccesModal = ({ handleShow, handleClose, handleFormSubmit }) => {
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
                    <h2 className='fw-bold'>Success! </h2>
                    <h5 className='custom-font-size-18 fw-semibold'>Your Account is Set Up</h5>
                    <p className='lh-sm small mb-4 pt-1'>Your account has been successfully created. Details have been sent to your email <Link to="mainto:email alex@xyz.com" className='text-decoration-none'>alex@xyz.com</Link>.</p>
                    <Button
                        type="button"
                        variant="warning"
                        className="custom-min-width-100"
                        onClick={handleFormSubmit}
                    >
                        File a Claim Now <span className="ms-1">&gt;</span>
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    )
}

export default SetupSuccesModal