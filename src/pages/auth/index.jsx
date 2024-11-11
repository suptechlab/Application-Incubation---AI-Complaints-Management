import React from "react";
import { Modal } from "react-bootstrap";
import PrivacyModal from './privacy/index.jsx';

/**
 * Confirm Privacy Modal
 *
 * @param {{ handleShow: any; handleClose: any; }} param0
 * @param {*} param0.handleShow
 * @param {*} param0.handleClose
 * @returns {*}
 */

const FileClaimMainModal = ({ handleShow, handleClose }) => {

  return (
    <Modal
      show={handleShow}
      onHide={handleClose}
      backdrop="static"
      keyboard={false}
      centered={true}
      scrollable={true}
      size="lg"
      className="theme-modal"
      enforceFocus={false}
    >
      <PrivacyModal />
    </Modal>
  );
};

export default FileClaimMainModal;
