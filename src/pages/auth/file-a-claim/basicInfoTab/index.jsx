import React from 'react';
import { Button, Col, Modal, Row, Stack } from 'react-bootstrap';
import { FiInfo } from 'react-icons/fi';
import CommonFormikComponent from '../../../../components/CommonFormikComponent';
import FormInputBox from '../../../../components/FormInput';
import AppTooltip from '../../../../components/tooltip';
import { BasicInfoFormSchema } from '../../validations';
import ReactSelect from '../../../../components/ReactSelect';
import { useTranslation } from 'react-i18next';

const BasicInfoTab = ({ handleFormSubmit }) => {


    const {t} = useTranslation()

    // Initial Values
    const initialValues = {
        nationalID: '',
        email: '',
        name: '',
        gender: '',
        cellphone: '',
        provinceOfResidence: '',
        cantonOfResidence: '',
    };

    // Handle Submit Handler
    const handleSubmit = (values, actions) => {
        handleFormSubmit(values, actions);
    };
    return (
        <CommonFormikComponent
            // validationSchema={BasicInfoFormSchema}
            initialValues={initialValues}
            onSubmit={handleSubmit}
        >
            {(formikProps) => (
                <React.Fragment>
                    <Modal.Body className="text-break d-flex flex-column small pt-0">
                        <Stack
                            direction="horizontal"
                            gap={2}
                            className="mb-3 flex-wrap"
                        >
                            <h5 className="custom-font-size-18 mb-0 fw-bold">{t("BASIC_INFORMATION")}</h5>
                            <AppTooltip
                                title={t("BASIC_INFORMATION")}
                            >
                                <Button
                                    type="button"
                                    variant="link"
                                    className="p-0 border-0 link-dark"
                                >
                                    <FiInfo size={22} />
                                </Button>
                            </AppTooltip>
                        </Stack>
                        <Row className="gx-4">
                            <Col lg={6}>
                                <FormInputBox
                                    autoComplete="off"
                                    id="nationalID"
                                    label={t("NATIONAL_ID_NUMBER")}
                                    name="nationalID"
                                    type="text"
                                    error={formikProps.errors.nationalID}
                                    onBlur={formikProps.handleBlur}
                                    onChange={formikProps.handleChange}
                                    touched={formikProps.touched.nationalID}
                                    value={formikProps.values.nationalID || ""}
                                />
                            </Col>
                            <Col lg={6}>
                                <FormInputBox
                                    autoComplete="off"
                                    id="email"
                                    label={t("EMAIL")}
                                    name="email"
                                    type="email"
                                    error={formikProps.errors.email}
                                    onBlur={formikProps.handleBlur}
                                    onChange={formikProps.handleChange}
                                    touched={formikProps.touched.email}
                                    value={formikProps.values.email || ""}
                                />
                            </Col>
                            <Col lg={6}>
                                <FormInputBox
                                    id="name"
                                    label={t("NAME")}
                                    name="name"
                                    type="text"
                                    error={formikProps.errors.name}
                                    onBlur={formikProps.handleBlur}
                                    onChange={formikProps.handleChange}
                                    touched={formikProps.touched.name}
                                    value={formikProps.values.name || ""}
                                />
                            </Col>
                            <Col lg={6}>
                                <ReactSelect
                                    label={t("GENDER")}
                                    error={formikProps.errors.gender}
                                    options={[
                                        { label: t("SELECT"), value: "" },
                                        { label: t("MALE"), value: "MALE" },
                                        { label: t("FEMALE"), value: "FEMALE" }
                                    ]}
                                    value={formikProps.values.gender}
                                    onChange={(option) => {
                                        formikProps.setFieldValue(
                                            "gender",
                                            option?.target?.value ?? ""
                                        );
                                    }}
                                    name="gender"
                                    className={formikProps.touched.gender && formikProps.errors.gender ? "is-invalid" : ""}
                                    onBlur={formikProps.handleBlur}
                                    touched={formikProps.touched.gender}
                                />
                            </Col>
                            <Col lg={6}>
                                <FormInputBox
                                    id="cellphone"
                                    label={t("CELLPHONE")}
                                    name="cellphone"
                                    type="text"
                                    error={formikProps.errors.cellphone}
                                    onBlur={formikProps.handleBlur}
                                    onChange={formikProps.handleChange}
                                    touched={formikProps.touched.cellphone}
                                    value={formikProps.values.cellphone || ""}
                                />
                            </Col>
                            <Col lg={6}>
                                <ReactSelect
                                    label={t("PROVINCE_OF_RESIDENCE")}
                                    error={formikProps.errors.provinceOfResidence}
                                    options={[
                                        { label: t("SELECT"), value: "" },
                                        { label: t("RESIDENCE_1"), value: "residence1" }
                                    ]}
                                    value={formikProps.values.provinceOfResidence}
                                    onChange={(option) => {
                                        formikProps.setFieldValue(
                                            "provinceOfResidence",
                                            option?.target?.value ?? ""
                                        );
                                    }}
                                    name="provinceOfResidence"
                                    className={formikProps.touched.provinceOfResidence && formikProps.errors.provinceOfResidence ? "is-invalid" : ""}
                                    onBlur={formikProps.handleBlur}
                                    touched={formikProps.touched.provinceOfResidence}
                                />
                            </Col>
                            <Col lg={6}>
                                <ReactSelect
                                    label={t("CANTON_OF_RESIDENCE")}
                                    error={formikProps.errors.cantonOfResidence}
                                    options={[
                                        { label: t("SELECT"), value: "" },
                                        { label: t("RESIDENCE_2"), value: "residence2" }
                                    ]}
                                    value={formikProps.values.cantonOfResidence}
                                    onChange={(option) => {
                                        formikProps.setFieldValue(
                                            "cantonOfResidence",
                                            option?.target?.value ?? ""
                                        );
                                    }}
                                    name="cantonOfResidence"
                                    className={formikProps.touched.cantonOfResidence && formikProps.errors.cantonOfResidence ? "is-invalid" : ""}
                                    onBlur={formikProps.handleBlur}
                                    touched={formikProps.touched.cantonOfResidence}
                                />
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer className="border-top">
                        <Button
                            type="submit"
                            variant="warning"
                            className="custom-min-width-100"
                        >
                            {t("NEXT")}<span className="ms-1">&gt;</span>
                        </Button>
                    </Modal.Footer>
                </React.Fragment>

            )}
        </CommonFormikComponent>
    )
}

export default BasicInfoTab