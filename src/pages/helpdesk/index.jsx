import React, { useState } from 'react';
import { Offcanvas } from 'react-bootstrap';
import ChatBotForm from './chatForm';
import PrivacyForm from './privacyForm';
import { useDispatch, useSelector } from 'react-redux';
import { dpaAcceptance } from '../../redux/slice/helpDeskSlice';
import toast from 'react-hot-toast';

const HelpDeskBot = ({ handleShow, handleClose }) => {

    const dispatch = useDispatch()
    const { isAgree } = useSelector((state) => state?.helpDeskSlice);

    const [isPrivacyFormSubmitted, setIsPrivacyFormSubmitted] = useState(isAgree);


    // HANDLE PRIVACY FORM SUBMIT
    const handlePrivacyFormSubmit = (values, actions) => {
        setIsPrivacyFormSubmitted(true);
        actions.setSubmitting(false);
        dispatch(dpaAcceptance(values?.agreePrivacy)).then((data) => {
            if (data.payload.status == 200) {
                toast.success(data?.payload?.message ?? "")
            }
        }).catch((err) => {
            console.log(err);
        });
    };

    return (
        <Offcanvas
            show={handleShow}
            onHide={handleClose}
            scroll={true}
            backdrop={false}
            placement="bottom"
            aria-label="SEPS Helpdesk Bot"
        >
            {isPrivacyFormSubmitted ? (
                <ChatBotForm handleClose={handleClose} />
            ) : (
                <PrivacyForm handleClose={handleClose} onSubmit={handlePrivacyFormSubmit} />
            )}
        </Offcanvas>
    )
}

export default HelpDeskBot