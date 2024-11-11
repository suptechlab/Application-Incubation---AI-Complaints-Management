import React, { useState } from 'react';
import { Offcanvas } from 'react-bootstrap';
import ChatBotForm from './chatForm';
import PrivacyForm from './privacyForm';

const HelpDeskBot = ({ handleShow, handleClose }) => {
    const [isPrivacyFormSubmitted, setIsPrivacyFormSubmitted] = useState(false);

    const handlePrivacyFormSubmit = (values, actions) => {
        setIsPrivacyFormSubmitted(true);
        actions.setSubmitting(false);
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