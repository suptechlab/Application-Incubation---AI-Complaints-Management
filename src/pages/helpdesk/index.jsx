import React, { useState } from 'react';
import { Offcanvas } from 'react-bootstrap';
import ChatBotForm from './chatForm.jsx/index.jsx';
import PrivacyForm from './privacyForm.jsx/index.jsx';

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
            aria-labelledby="SEPS Helpdesk Bot"
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