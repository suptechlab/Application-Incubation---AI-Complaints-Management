import { Button, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";

/**
 * Common Generic Modal Reusable Component
 *
 * @param {{ show: any; handleClose: any; handleAction: any; modalBodyContent: any; modalHeaderTitle: any; buttonName: any; ActionButtonVariant: any; }} param0
 * @param {*} param0.show
 * @param {*} param0.handleClose
 * @param {*} param0.handleAction
 * @param {*} param0.modalBodyContent
 * @param {*} param0.modalHeaderTitle
 * @param {*} param0.buttonName
 * @param {*} param0.ActionButtonVariant
 * @returns {*}
 */

const GenericModal = ({
  show,
  handleClose,
  handleAction,
  modalBodyContent,
  modalHeaderTitle,
  buttonName,
  ActionButtonVariant,
}) => {
  const { t } = useTranslation();
  const createMarkup = () => {
    return { __html: modalBodyContent || "" };
  };
  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      keyboard={false}
      centered={true}
      scrollable={true}
      size="sm"
      className="theme-modal"
      enforceFocus={false}
    >
      <Modal.Header className="pb-3" closeButton>
        <Modal.Title as="h4" className="fw-semibold">
          {modalHeaderTitle || ""}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-break py-0">
        <div dangerouslySetInnerHTML={createMarkup()} />
      </Modal.Body>

      <Modal.Footer>
        <Button
          type="button"
          variant="outline-dark"
          onClick={handleClose}
          className="custom-min-width-85"
        >
          {t("CANCEL")}
        </Button>
        <Button
          type="submit"
          variant={ActionButtonVariant || "warning"}
          className="custom-min-width-85"
          onClick={handleAction}
        >
          {buttonName || t("SUBMIT")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GenericModal;
