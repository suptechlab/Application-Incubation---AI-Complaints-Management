import React, { useState, useEffect } from 'react';
import { Button, Col, Image, Modal, Row, Stack } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import profilePlaceholderImg from "../../assets/images/default-avatar.jpg";
import CommonFormikComponent from '../../components/CommonFormikComponent';
import CommonViewData from '../../components/CommonViewData';
import FormInputBox from '../../components/FormInput';
import { useDispatch, useSelector } from 'react-redux';
import { countryCodes } from '../../constants/CountryCodes';
import ReactSelect from '../../components/ReactSelect';
import { updateUserInfo } from '../../redux/slice/authSlice';

const ProfileModal = ({ handleShow, handleClose }) => {

    const { user,profilePicture } = useSelector((state) => state?.authSlice)
    const [profileImage, setProfileImage] = useState("");
    const { t } = useTranslation()

    const dispatch = useDispatch()

    // Initial Values
    const [initialValues, setInititalValues] = useState({
        countryCode: user?.countryCode || '+34',
        phoneNumber: user?.phoneNumber || "",
        profile: ''
        // phoneNumber: user?.,
    });

    const formattedCountryCodes = countryCodes.map(country => ({
        value: country?.value,
        label: country?.value
    }));

    const ALLOWEDIMAGETYPES =
        "Allowed image file extensions are .jpg, .jpeg and .png.";
    const IMAGESIZE = "Image size must not exceed 2.5 MB.";
    const IMAGESIZEINKB = 2500; // 2MB

    const handleFileChange = (e, formikProps) => {
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
            formikProps.setFieldValue('profile', file)
        }
    };


    // Handle Submit Handler
    const handleSubmit = (values, actions) => {

        actions.setSubmitting(true);
        // actions.resetForm();

        const formData = new FormData()
        formData.append('countryCode', values?.countryCode)
        formData.append('phoneNumber', values?.phoneNumber)

        if (values?.profile && values?.profile !== '') {
            formData.append('profilePicture', values?.profile)
        }

        dispatch(updateUserInfo(formData))
            .then(result => {
                if (updateUserInfo.fulfilled.match(result)) {

                    toast.success(result?.payload?.message)
                    actions.setSubmitting(false);
                    handleClose()
                } else {
                    console.error("Verification error:", result.error.message);
                    actions.setSubmitting(false);
                }
            })
            .catch(error => {
                console.error("Error during file claim submission:", error);
                actions.setSubmitting(false);
            });



    };
    useEffect(() => {
        setInititalValues({
            countryCode: user?.countryCode || '+34',
            phoneNumber: user?.phoneNumber || "",
            profile: ''
        })

        if(user?.externalDocumentId && profilePicture){
            setProfileImage(profilePicture)
        }
    }, [user]);

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
                    {t('EDIT_PROFILE')}
                </Modal.Title>
            </Modal.Header>
            <CommonFormikComponent
                initialValues={initialValues}
                onSubmit={handleSubmit}
                enableReinitialize={true}
            >
                {(formikProps) => (
                    <React.Fragment>
                        <Modal.Body className="text-break small pt-2">
                            <Row className="gx-4">
                                <Col xs={12}>
                                    <CommonViewData label="Name" value={user?.name} />
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
                                                    htmlFor="profile"
                                                    className="btn btn-secondary custom-min-width-100"
                                                >
                                                    {t('BROWSE_IMAGE')}
                                                </label>
                                                <input
                                                    id="profile"
                                                    name="profile"
                                                    accept="image/png, image/jpeg, image/jpg"
                                                    className="h-100 hiddenText opacity-0 position-absolute start-0 top-0 w-100 z-n1"
                                                    type="file"
                                                    onChange={(event) => handleFileChange(event, formikProps)}
                                                />
                                            </div>
                                        </div>
                                    </Stack>
                                </Col>
                                <Col xs={4}>

                                    <ReactSelect
                                        label={t("COUNTRY_CODE")}
                                        error={formikProps.errors.countryCode}
                                        options={formattedCountryCodes ?? []}
                                        value={formikProps.values.countryCode}
                                        onChange={(option) => {
                                            formikProps.setFieldValue(
                                                "countryCode",
                                                option?.target?.value ?? ""
                                            );
                                        }}
                                        name="countryCode"
                                        className={formikProps.touched.countryCode && formikProps.errors.countryCode ? "is-invalid" : ""}
                                        onBlur={formikProps.handleBlur}
                                        touched={formikProps.touched.countryCode}
                                    />
                                </Col>
                                <Col lg={8}>
                                    <FormInputBox
                                        wrapperClassName="mb-4"
                                        autoComplete="off"
                                        id="phoneNumber"
                                        label={t("PHONE_NUMBER") + '*'}
                                        name="phoneNumber"
                                        type="number"
                                        error={formikProps.errors.phoneNumber}
                                        onBlur={formikProps.handleBlur}
                                        onChange={formikProps.handleChange}
                                        touched={formikProps.touched.phoneNumber}
                                        value={formikProps.values.phoneNumber || ""}
                                    />
                                </Col>
                                {/* <Col xs={12}>
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
                                </Col> */}
                            </Row>
                        </Modal.Body>
                        <Modal.Footer className="border-top">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleClose}
                                className="custom-min-width-100"
                            >
                                {t("CANCEL")}
                            </Button>
                            <Button
                                type="submit"
                                variant="warning"
                                disabled={formikProps?.isSubmitting ?? false}
                                className="custom-min-width-100"
                            >
                                {t("UPDATE")}
                            </Button>
                        </Modal.Footer>
                    </React.Fragment>
                )}
            </CommonFormikComponent>
        </Modal>
    )
}

export default ProfileModal