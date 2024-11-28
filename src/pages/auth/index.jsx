import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import AccountSetupModal from "./account-setup";
import SetupSuccesModal from "./account-setup/setup-success";
import FileClaimModal from "./file-a-claim";
import LoginModal from "./login";
import PrivacyModal from './privacy';
import { dpaAcceptance } from "../../redux/slice/helpDeskSlice";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { registerUser, verifyLoginOTP } from "../../redux/slice/authSlice";

/**
 * File a Claim Main Modal
 *
 * @param {{ handleShow: any; handleClose: any; }} param0
 * @param {*} param0.handleShow
 * @param {*} param0.handleClose
 * @returns {*}
 */

const FileClaimMainModal = ({ handleShow, handleClose ,isFileClaimModalShow, setIsFileClaimModalShow}) => {


  // CHECK IF USER HAS ACCEPTED DPA OR NOT FROM REDUX STATE
  const { isAgree } = useSelector((state) => state?.helpDeskSlice);
  // const [isPrivacyFormSubmitted, setIsPrivacyFormSubmitted] = useState(isAgree);
  const [isSignupClicked, setIsSignupClicked] = useState(false);
  const [setupSuccesModalShow, setSetupSuccesModalShow] = useState(false);
 

  const dispatch = useDispatch()

  // Handle Privacy Form Submit
  const handlePrivacyFormSubmit = (values, actions) => {
    // setIsPrivacyFormSubmitted(true);
    actions.setSubmitting(false);
    dispatch(dpaAcceptance(values?.agreePrivacy)).then((data) => {
      if (data.payload.status == 200) {
        toast.success(data?.payload?.message ?? "")
      }
    }).catch((err) => {
      console.log(err);
    });
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
      // setIsPrivacyFormSubmitted(false);
      setIsSignupClicked(false);
    }, 500);
  }


  // HANDLE FINISH BUTTON
  const handleFinishButtonClick = async (values) => {
    // handleCloseReset();
    const result = await dispatch(registerUser(values));
    if (registerUser.fulfilled.match(result)) {
      handleCloseReset()
      setSetupSuccesModalShow(true)
      // toast.success(result?.message ?? "Account setup success.")
    } else {
      console.error('Registration error:', result.error.message);
    }
  }

  // HANDLE FILE A CLAIM BUTTON
  const handleSuccessButtonClick = async (values, actions) => {
    // verifyLoginOTP
    const result = await dispatch(verifyLoginOTP(values));
    if (verifyLoginOTP.fulfilled.match(result)) {
      setSetupSuccesModalShow(false)
      actions.setSubmitting(false)
    } else {
      console.error('VERIFY OTP ERROR:', result.error.message);
      actions.setSubmitting(false)
    }
  }

  // Show Component
  let modalChildren;
  if (isSignupClicked) {
    modalChildren = <AccountSetupModal handleClose={handleClose} handleFormSubmit={handleFinishButtonClick} />;
  } else if (isAgree) {
    modalChildren = <LoginModal handleSignUpClick={handleSignupButtonClick} handleLoginSucccesSubmit={handleSuccessButtonClick} />;
  } else {
    modalChildren = <PrivacyModal handleClose={handleClose} handleFormSubmit={handlePrivacyFormSubmit} />;
  }


  const handleFileClaimNow = ()=>{
    handleCloseReset()
    setIsFileClaimModalShow(true)
  }

  return (
    <React.Fragment>
     <Modal
        show={handleShow}
        onHide={handleCloseReset}
        backdrop="static"
        keyboard={false}
        centered={true}
        scrollable={true}
        size="lg"
        className="theme-modal scrollable-disabled-below-600"
        enforceFocus={false}
      >
        {modalChildren}
      </Modal> 
      {/* File a Claim Setup Success Modal */}
      <SetupSuccesModal
        handleShow={setupSuccesModalShow}
        handleClose={() => setSetupSuccesModalShow(false)}
        handleFormSubmit={handleFileClaimNow}
      />

      {/* File a Claim Modals */}
      <FileClaimModal
        handleShow={isFileClaimModalShow}
        handleClose={() => setIsFileClaimModalShow(false)}
      // handleFormSubmit={handleFileClaimButtonClick}
      />
    </React.Fragment>
  );
};

export default FileClaimMainModal;
