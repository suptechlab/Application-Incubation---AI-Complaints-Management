import React, { useState } from 'react';
import { Button, Col, Image, Modal, Row, Stack } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import profilePlaceholderImg from "../../assets/images/default-avatar.jpg";
import CommonFormikComponent from '../../components/CommonFormikComponent';
import CommonViewData from '../../components/CommonViewData';
import FormInputBox from '../../components/FormInput';

const ProfileModal = ({ handleShow, handleClose }) => {
    const [profileImage, setProfileImage] = useState("");
    const { t } = useTranslation()

    // Initial Values
    const initialValues = {
        instanceTicket: '',
        phoneNumber: '+593 12 345 6789',
    };


    const ALLOWEDIMAGETYPES =
        "Allowed image file extensions are .jpg, .jpeg and .png.";
    const IMAGESIZE = "Image size must not exceed 2.5 MB.";
    const IMAGESIZEINKB = 2500;

    const handleFileChange = (e) => {
        const fileLen = e.target.files.length;
        const file = e.target.files[0];
        if (!file) {
            console.log("##### handleFileChange #####", file);
            return;
        }
        const sizeofFile = file.size / 1024;
        if (sizeofFile > IMAGESIZEINKB) {
            toast.error(IMAGESIZE);
            return;
        }
        if (
            file.type !== "image/png" &&
            file.type !== "image/jpeg" &&
            file.type !== "image/jpg"
        ) {
            toast.error(ALLOWEDIMAGETYPES);
            return;
        }

        if (fileLen > 0) {
            const fileObject = URL.createObjectURL(file);
            setProfileImage(fileObject);
        }
    };


    // Handle Submit Handler
    const handleSubmit = (values, actions) => {
        actions.setSubmitting(false);
        actions.resetForm();
    };

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
            <Modal.Header closeButton className="pb-2">
                <Modal.Title as="h4" className="fw-bold">
                    Edit Profile
                </Modal.Title>
            </Modal.Header>
            <CommonFormikComponent
                initialValues={initialValues}
                onSubmit={handleSubmit}
            >
                {(formikProps) => (
                    <React.Fragment>
                        <Modal.Body className="text-break small pt-2">
                            <Row className="gx-4">
                                <Col xs={12}>
                                    <CommonViewData label="Name" value="John Doe" />
                                </Col>
                                <Col xs={12}>
                                    <Stack
                                        direction="horizontal"
                                        gap={3}
                                        className="mb-3 pb-1"
                                    >
                                        <Image
                                            className="object-fit-cover border"
                                            src={profileImage || profilePlaceholderImg}
                                            alt="User Profile"
                                            width={80}
                                            height={80}
                                            roundedCircle
                                        />
                                        <div className="theme-upload-cover">
                                            <div className="d-block overflow-hidden position-relative z-1">
                                                <label
                                                    htmlFor="files"
                                                    className="btn btn-secondary custom-min-width-100"
                                                >
                                                    {t('Upload')}
                                                </label>
                                                <input
                                                    id="files"
                                                    accept="image/png, image/jpeg, image/jpg"
                                                    className="h-100 hiddenText opacity-0 position-absolute start-0 top-0 w-100 z-n1"
                                                    type="file"
                                                    onChange={handleFileChange}
                                                />
                                            </div>
                                        </div>
                                    </Stack>
                                </Col>
                                <Col xs={12}>
                                    <FormInputBox
                                        id="phoneNumber"
                                        label={t("Phone Number")}
                                        name="phoneNumber"
                                        type="text"
                                        error={formikProps.errors.phoneNumber}
                                        onBlur={formikProps.handleBlur}
                                        onChange={formikProps.handleChange}
                                        touched={formikProps.touched.phoneNumber}
                                        value={formikProps.values.phoneNumber || ""}
                                    />
                                </Col>
                            </Row>
                        </Modal.Body>
                        <Modal.Footer className="border-top">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleClose}
                                className="custom-min-width-100"
                            >
                                {t("Cancel")}
                            </Button>
                            <Button
                                type="submit"
                                variant="warning"
                                className="custom-min-width-100"
                            >
                                {t("Update")}
                            </Button>
                        </Modal.Footer>
                    </React.Fragment>
                )}
            </CommonFormikComponent>
        </Modal>
    )
}

export default ProfileModal