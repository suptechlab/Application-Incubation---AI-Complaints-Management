import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import LoginModal from "./login";
import PrivacyModal from './privacy';

/**
 * File a Claim Main Modal
 *
 * @param {{ handleShow: any; handleClose: any; }} param0
 * @param {*} param0.handleShow
 * @param {*} param0.handleClose
 * @returns {*}
 */

const FileClaimMainModal = ({ handleShow, handleClose }) => {
  const [isPrivacyFormSubmitted, setIsPrivacyFormSubmitted] = useState(false);
  const [isSignupClicked, setIsSignupClicked] = useState(false);

  // Handle Privacy Form Submit
  const handlePrivacyFormSubmit = (values, actions) => {
    console.log('handlePrivacyFormSubmit', values)
    setIsPrivacyFormSubmitted(true);
    actions.setSubmitting(false);
  };

  // Handle Signup Button Click
  const handleSignupButtonClick = () => {
    setIsSignupClicked(true);
  };


  // Handle Close Reset
  const handleCloseReset = () => {
    // Close the modal
    handleClose();

    // A timeout to reset the state after a brief delay
    setTimeout(() => {
      setIsPrivacyFormSubmitted(false);
      setIsSignupClicked(false);
    }, 500);
  }


  // Show Component
  let modalChildren;
  if (isSignupClicked) {
    modalChildren = 'Soon';
  } else if (isPrivacyFormSubmitted) {
    modalChildren = <LoginModal handleSignUpClick={handleSignupButtonClick} />;
  } else {
    modalChildren = <PrivacyModal handleClose={handleClose} handleFormSubmit={handlePrivacyFormSubmit} />;
  }

  return (
    <Modal
      show={handleShow}
      onHide={handleCloseReset}
      backdrop="static"
      keyboard={false}
      centered={true}
      scrollable={true}
      size="lg"
      className="theme-modal"
      enforceFocus={false}
    >
      {modalChildren}
    </Modal>
  );
};

export default FileClaimMainModal;
