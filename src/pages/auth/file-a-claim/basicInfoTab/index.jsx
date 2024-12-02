import React, { useState } from 'react';
import { Button, Col, Modal, Row, Stack } from 'react-bootstrap';
import { FiInfo } from 'react-icons/fi';
import CommonFormikComponent from '../../../../components/CommonFormikComponent';
import FormInputBox from '../../../../components/FormInput';
import AppTooltip from '../../../../components/tooltip';
import { BasicInfoFormSchema } from '../../validations';
import ReactSelect from '../../../../components/ReactSelect';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { countryCodes } from '../../../../constants/CountryCodes';
import { fetchCityList } from '../../../../redux/slice/masterSlice';

const BasicInfoTab = ({ handleFormSubmit, setIsLoading }) => {


    const dispatch = useDispatch()

    const { user } = useSelector((state) => state?.authSlice)
    const { province_list } = useSelector((state) => state?.masterSlice)
    const formattedCountryCodes = countryCodes.map(country => ({
        value: country?.value,
        label: country?.value
    }));


    const { t } = useTranslation()
    const [cityList, setCityList] = useState([])


    // Initial Values
    const initialValues = {
        identificacion: user?.identificacion ?? '',
        email: user?.email ?? '',
        name: user?.name ?? '',
        gender: user?.gender ?? '',
        countryCode: user?.countryCode ?? '',
        phoneNumber:user?.phoneNumber ?? '',
        provinceId: '',
        cityId: '',
    };
    // Handle Submit Handler
    const handleSubmit = (values, actions) => {
        handleFormSubmit(values, actions);
    };

    const getCityList = async (provinceId) => {
        setIsLoading(true)
        const response = await dispatch(fetchCityList(provinceId))
        if (fetchCityList.fulfilled.match(response)) {
            setCityList(response?.payload)
            setIsLoading(false)
        } else {
            console.error('Sub types error:', response.error.message);
            setIsLoading(false)
        }
    }

    return (
        <CommonFormikComponent
            validationSchema={BasicInfoFormSchema}
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
                                    id="identificacion"
                                    label={t("NATIONAL_ID_NUMBER")}
                                    name="identificacion"
                                    type="text"
                                    error={formikProps.errors.identificacion}
                                    onBlur={formikProps.handleBlur}
                                    onChange={formikProps.handleChange}
                                    touched={formikProps.touched.identificacion}
                                    value={formikProps.values.identificacion || ""}
                                    readOnly={true}
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
                                    readOnly={true}
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
                                    readOnly={true}
                                />
                            </Col>
                            <Col lg={6}>
                                <FormInputBox
                                    id="gender"
                                    label={t("GENDER")}
                                    name="gender"
                                    type="text"
                                    error={formikProps.errors.gender}
                                    onBlur={formikProps.handleBlur}
                                    onChange={formikProps.handleChange}
                                    touched={formikProps.touched.gender}
                                    value={formikProps.values.gender || ""}
                                    readOnly={true}
                                />
                            </Col>
                            <Col lg={6}>
                                <Row>
                                    <Col lg={4}>
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
                                            readOnly={user?.countryCode ? true : false}
                                        />
                                    </Col>
                                    <Col lg={8}>
                                        <FormInputBox
                                            wrapperClassName="mb-4"
                                            autoComplete="off"
                                            id="phoneNumber"
                                            label={t("PHONE_NUMBER")}
                                            name="phoneNumber"
                                            type="text"
                                            error={formikProps.errors.phoneNumber}
                                            onBlur={formikProps.handleBlur}
                                            onChange={formikProps.handleChange}
                                            touched={formikProps.touched.phoneNumber}
                                            value={formikProps.values.phoneNumber || ""}
                                            readOnly={user?.phoneNumber ? true : false}
                                        />
                                    </Col>
                                </Row>
                            </Col>
                            <Col lg={6}></Col>
                            <Col lg={6}>
                                <ReactSelect
                                    label={t("PROVINCE_OF_RESIDENCE")}
                                    error={formikProps?.errors?.provinceId}
                                    options={[
                                        { label: t("SELECT"), value: "" },
                                        ...province_list.map((group) => ({
                                            label: group.label,
                                            value: group.value,
                                        })),
                                    ]}
                                    value={formikProps.values.provinceId}
                                    onChange={(option) => {

                                        formikProps.setFieldValue(
                                            "provinceId",
                                            option?.target?.value ?? ""
                                        );

                                        if (option?.target?.value && option?.target?.value !== "") {
                                            // formikProps.setFieldTouched("cityId", false);
                                            if(option?.target?.value !== formikProps?.values?.provinceId){
                                                formikProps.setFieldValue("cityId", ""); // Reset cityId
                                                getCityList(option?.target?.value);
                                            }
                                        }
                                    }}
                                    name="provinceId"
                                    className={formikProps.touched.provinceId && formikProps.errors.provinceId ? "is-invalid" : ""}
                                    onBlur={formikProps.handleBlur}
                                    touched={formikProps.touched.provinceId}
                                />
                            </Col>
                            <Col lg={6}>
                                <ReactSelect
                                    label={t("CANTON_OF_RESIDENCE")}
                                    error={formikProps?.errors?.cityId }
                                    options={[
                                        { label: t("SELECT"), value: "" },
                                        ...cityList.map((group) => ({
                                            label: group.label,
                                            value: group.value,
                                        })),
                                    ]}
                                    value={formikProps.values.cityId}
                                    onChange={(option) => {
                                        formikProps.setFieldValue(
                                            "cityId",
                                            option?.target?.value ?? ""
                                        );
                                    }}
                                    name="cityId"
                                    className={formikProps?.touched?.cityId && formikProps?.errors?.cityId ? "is-invalid" : ""}
                                    onBlur={formikProps.handleBlur}
                                    touched={formikProps.touched.cityId}
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