import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Row, Stack } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import CommonFormikComponent from "../../../../components/CommonFormikComponent";
import FormInputBox from '../../../../components/FormInput';
import ReactSelect from '../../../../components/ReactSelect';
import { OtherInfoFormSchema } from '../../../../validations/createClaim.validation';
import { useMasterData } from '../../../../contexts/masters.context';
import { convertToLabelValue } from '../../../../services/ticketmanagement.service';

const OtherInfoTab = ({ backButtonClickHandler, handleFormSubmit }) => {


    // const [selectedRuc, setSelectedRuc] = useState('');
    const { masterData } = useMasterData();
    const [pcGroupList, setPcGroupList] = useState([]);
    const [customerTypeList, setCustomerTypeList] = useState([]);
    const [entityList, setEntityList] = useState([]);

    const { t } = useTranslation()

    // Initial Values
    const initialValues = {
        priorityCareGroup: '',
        customerType: '',
        organizationId: '',
        entitysTaxID: '',
    };

    useEffect(() => {
        if (masterData) {
            setPcGroupList(convertToLabelValue(masterData.priorityCareGroup || {}));
            setCustomerTypeList(convertToLabelValue(masterData.customerType || {}));
        }
    }, [masterData])

    // Handle Submit Handler
    const handleSubmit = (values, actions) => {
        handleFormSubmit(values, actions);
    };
    return (
        <Card className="border-0 flex-grow-1 d-flex flex-column shadow h-100">
            <Card.Body className="d-flex flex-column h-100">
                <CommonFormikComponent
                    validationSchema={OtherInfoFormSchema}
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                >
                    {(formikProps) => (
                        <React.Fragment>
                            <div className="text-break d-flex flex-column small pt-0">
                                <h6 className="mb-3 pb-1 fw-semibold">{t("OTHER_INFORMATION")}</h6>
                                <Row className="gx-4">
                                    <Col sm={6} lg={4}>
                                        <ReactSelect
                                            label={t("PRIORITY_CARE_GROUP")}
                                            error={formikProps.errors.priorityCareGroup}
                                            options={pcGroupList}
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
                                    <Col sm={6} lg={4}>
                                        <ReactSelect
                                            label={t("CUSTOMER_TYPE")}
                                            error={formikProps.errors.customerType}
                                            options={customerTypeList}
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
                                    <Col sm={6} lg={4}>
                                        <ReactSelect
                                            label={t("ENTITY_NAME")}
                                            error={formikProps.errors.organizationId}
                                            options={entityList}
                                            value={formikProps.values.organizationId}
                                            onChange={(option) => {
                                                // const selectedUnit = organizational_units.find(
                                                //     (unit) => unit.value === option?.target?.value
                                                // )
                                                // setSelectedRuc(selectedUnit?.ruc)
                                                // formikProps.setFieldValue(
                                                //     "organizationId",
                                                //     option?.target?.value ?? ""
                                                // );
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
                                    <Col sm={6} lg={4}>
                                        <FormInputBox
                                            id="entitysTaxID"
                                            label={t("ENTITYS_TAX_ID")}
                                            name="entitysTaxID"
                                            type="text"
                                            error={formikProps.errors.entitysTaxID}
                                            onBlur={formikProps.handleBlur}
                                            onChange={formikProps.handleChange}
                                            touched={formikProps.touched.entitysTaxID}
                                            value={""}
                                            readOnly={true}
                                        />
                                    </Col>
                                </Row>
                            </div>
                            <div className="theme-from-footer mt-auto border-top px-3 mx-n3 pt-3">
                                <Stack
                                    direction="horizontal"
                                    gap={3}
                                    className="justify-content-end flex-wrap"
                                >

                                    <Button
                                        type="button"
                                        variant="outline-dark"
                                        onClick={backButtonClickHandler}
                                        className="custom-min-width-85"
                                    >
                                        {t('BACK')}
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="warning"
                                        className="custom-min-width-85"
                                    >
                                        {t('NEXT')}
                                    </Button>
                                </Stack>
                            </div>
                        </React.Fragment>

                    )}
                </CommonFormikComponent>
            </Card.Body>
        </Card >
    )
}

export default OtherInfoTab