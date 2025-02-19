import React, { useState } from 'react';
import { Button, Col, Modal, Row, Stack } from 'react-bootstrap';
import CommonFormikComponent from '../../../../components/CommonFormikComponent';
import FormInputBox from '../../../../components/FormInput';
import ReactSelect from '../../../../components/ReactSelect';
import { OtherInfoFormSchema } from '../../validations';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

const OtherInfoTab = ({ backButtonClickHandler, handleFormSubmit }) => {

    const { customer_types, priority_care_group, organizational_units } = useSelector((state) => state?.masterSlice)

    const [selectedRuc , setSelectedRuc] = useState('')

    const { t } = useTranslation()

    // Initial Values
    const initialValues = {
        priorityCareGroup: 'NONE',
        customerType: '',
        organizationId: '',
        entitysTaxID: '',
    };

    // Handle Submit Handler
    const handleSubmit = (values, actions) => {
        handleFormSubmit(values, actions);
    };
    return (
        <CommonFormikComponent
            validationSchema={OtherInfoFormSchema}
            initialValues={initialValues}
            onSubmit={handleSubmit}
        >
            {(formikProps) => (
                <React.Fragment>
                    <Modal.Body className="text-break d-flex flex-column small pt-0">
                        <Stack direction="horizontal" gap={2} className="mb-2 pb-1 flex-wrap">
                            <h5 className="custom-font-size-18 mb-0 fw-bold">
                                {t("OTHER_INFORMATION")}
                            </h5>
                        </Stack>
                        <Row className="gx-4">
                            <Col lg={6}>
                                <ReactSelect
                                    label={t("PRIORITY_CARE_GROUP")+"*"}
                                    error={formikProps.errors.priorityCareGroup }
                                    options={[
                                        { label: t("SELECT"), value: "" },
                                        ...priority_care_group.map((group) => ({
                                            label: group.label, // Ensure group has a `label` property
                                            value: group.value, // Ensure group has a `value` property
                                        })),
                                    ]}
                                    value={formikProps.values.priorityCareGroup}
                                    onChange={(option) => {
                                        formikProps.setFieldValue(
                                            "priorityCareGroup",
                                            option?.target?.value ?? ""
                                        );
                                    }}
                                    name="priorityCareGroup"
                                    className={
                                        formikProps.touched.priorityCareGroup &&
                                            formikProps.errors.priorityCareGroup
                                            ? "is-invalid"
                                            : ""
                                    }
                                    onBlur={formikProps.handleBlur}
                                    touched={formikProps.touched.priorityCareGroup}
                                />
                            </Col>
                            <Col lg={6}>
                                <ReactSelect
                                    label={t("CUSTOMER_TYPE") + '*'}
                                    error={formikProps.errors.customerType}
                                    options={[
                                        { label: t("SELECT"), value: "" },
                                        ...customer_types.map((group) => ({
                                            label: group.label, // Ensure group has a `label` property
                                            value: group.value, // Ensure group has a `value` property
                                        })),
                                    ]}
                                    value={formikProps.values.customerType}
                                    onChange={(option) => {
                                        formikProps.setFieldValue(
                                            "customerType",
                                            option?.target?.value ?? ""
                                        );
                                    }}
                                    name="customerType"
                                    className={
                                        formikProps.touched.customerType &&
                                            formikProps.errors.customerType
                                            ? "is-invalid"
                                            : ""
                                    }
                                    onBlur={formikProps.handleBlur}
                                    touched={formikProps.touched.customerType}
                                />
                            </Col>
                            <Col lg={6}>
                                <ReactSelect
                                    label={t("ENTITY_NAME") + '*'}
                                    error={formikProps.errors.organizationId }
                                    options={[
                                        { label: t("SELECT"), value: "" },
                                        ...organizational_units.map((group) => ({
                                            label: group.label, // Ensure group has a `label` property
                                            value: group.value, // Ensure group has a `value` property
                                        })),
                                    ]}
                                    value={formikProps.values.organizationId}
                                    onChange={(option) => {
                                        const selectedUnit = organizational_units.find(
                                            (unit) => unit.value === option?.target?.value
                                        )
                                        setSelectedRuc(selectedUnit?.ruc)
                                        formikProps.setFieldValue(
                                            "organizationId",
                                            option?.target?.value ?? ""
                                        );
                                    }}
                                    name="organizationId"
                                    className={
                                        formikProps.touched.organizationId &&
                                            formikProps.errors.organizationId
                                            ? "is-invalid"
                                            : ""
                                    }
                                    onBlur={formikProps.handleBlur}
                                    touched={formikProps.touched.organizationId}
                                />
                            </Col>
                            <Col lg={6}>
                                <FormInputBox
                                    id="entitysTaxID"
                                    label={t("ENTITYS_TAX_ID") + '*'}
                                    name="entitysTaxID"
                                    type="text"
                                    error={formikProps.errors.entitysTaxID}
                                    onBlur={formikProps.handleBlur}
                                    onChange={formikProps.handleChange}
                                    touched={formikProps.touched.entitysTaxID}
                                    value={selectedRuc || ""}
                                    readOnly={true}
                                />
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer className="border-top">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={backButtonClickHandler}
                            className="custom-min-width-100 me-auto"
                        >
                            <span className="me-1">&lt;</span>{t("BACK")}
                        </Button>
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

export default OtherInfoTab