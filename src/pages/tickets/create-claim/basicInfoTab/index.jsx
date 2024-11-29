import React, { useState } from 'react';
import { Button, Card, Col, Row, Stack } from 'react-bootstrap';
import toast from "react-hot-toast";
import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";
import CommonFormikComponent from "../../../../components/CommonFormikComponent";
import FormInputBox from '../../../../components/FormInput';
import ReactSelect from '../../../../components/ReactSelect';
import { countryCodes } from '../../../../constants/CountryCodes';
import { getPersonalInfo } from "../../../../services/fiusers.services";
import { BasicInfoFormSchema } from '../../../../validations/createClaim.validation';
import Loader from '../../../../components/Loader';

const BasicInfoTab = ({ handleFormSubmit, setIsLoading }) => {

    const formattedCountryCodes = countryCodes.map(country => ({
        value: country?.value,
        label: country?.value
    }));


    const { t } = useTranslation()
    const [cityList, setCityList] = useState([]);
    const [user, setUser] = useState([]);
    const [loadingInfo, setLoadingInfo] = useState(false);
    const [initialValues, setInitialValues] = useState({
        identification: '',
        email: '',
        name: '',
        gender: '',
        countryCode: '',
        phoneNumber: '',
        provinceId: '',
        cityId: '',
    });

    // Handle Submit Handler
    const handleSubmit = (values, actions) => {
        handleFormSubmit(values, actions);
    };

    const getCityList = async (provinceId) => {
        setIsLoading(true)
        // const response = await dispatch(fetchCityList(provinceId))
        // if (fetchCityList.fulfilled.match(response)) {
        //     setCityList(response?.payload)
        //     setIsLoading(false)
        // } else {
        //     console.error('Sub types error:', response.error.message);
        //     setIsLoading(false)
        // }
    }

    // HANDLE IDENTIFICATION
    const handleIdentificationBlur = (event) => {
        const identification = event.target.value;
        if (identification && identification !== "") {
            fetchUserData(identification) // Call the API function
        }
    };

    // FETCH USER PERSONAL INFO BY ID
    const fetchUserData = async (identification) => {
        setLoadingInfo(true)
        getPersonalInfo(identification).then((response) => {
            setLoadingInfo(false)
            if (response?.data?.nombreCompleto) {
                setInitialValues({ ...initialValues, identification: identification, name: response?.data?.nombreCompleto, gender: response?.data?.genero })
            } else {
                setInitialValues({ ...initialValues, identification: identification, name: '' })
            }

        })
            .catch((error) => {
                if (error?.response?.data?.errorDescription) {
                    toast.error(error?.response?.data?.errorDescription);
                } else {
                    toast.error(error?.message);
                }
                setInitialValues({ ...initialValues, identification: identification, name: '' })
            }).finally(() => {
                setLoadingInfo(false)
            })
    };

    return (
        <React.Fragment>
            <Loader isLoading={loadingInfo} />
            <Card className="border-0 flex-grow-1 d-flex flex-column shadow">
                <Card.Body className="d-flex flex-column">
                    <CommonFormikComponent
                        validationSchema={BasicInfoFormSchema}
                        initialValues={initialValues}
                        onSubmit={handleSubmit}
                    >
                        {(formikProps) => (
                            <React.Fragment>
                                <div className="text-break d-flex flex-column small pt-0">
                                    <Stack
                                        direction="horizontal"
                                        gap={2}
                                        className="mb-3 flex-wrap"
                                    >
                                        <h5 className="custom-font-size-18 mb-0 fw-bold">{t("BASIC_INFORMATION")}</h5>
                                    </Stack>
                                    <Row className="gx-4">
                                        <Col lg={6}>
                                            <FormInputBox
                                                autoComplete="off"
                                                id="identification"
                                                label={t("NATIONAL_ID_NUMBER")}
                                                name="identification"
                                                type="text"
                                                error={formikProps.errors.identification}
                                                onBlur={handleIdentificationBlur}
                                                onChange={formikProps.handleChange}
                                                touched={formikProps.touched.identification}
                                                value={formikProps.values.identification || ""}
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
                                            />
                                        </Col>
                                        <Col lg={6}>
                                            <Row>
                                                <Col lg={4}>
                                                    <ReactSelect
                                                        label={t("COUNTRY_CODE")}
                                                        error={formikProps.errors.countryCode}
                                                        options={formattedCountryCodes ?? []}
                                                        placeholder={t("SELECT")}
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
                                                        type="number"
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
                                                    // { label: t("SELECT"), value: "" },
                                                    // ...province_list.map((group) => ({
                                                    //     label: group.label,
                                                    //     value: group.value,
                                                    // })),
                                                ]}
                                                value={formikProps.values.provinceId}
                                                onChange={(option) => {

                                                    formikProps.setFieldValue(
                                                        "provinceId",
                                                        option?.target?.value ?? ""
                                                    );

                                                    if (option?.target?.value && option?.target?.value !== "") {
                                                        // formikProps.setFieldTouched("cityId", false);

                                                        if (formikProps?.values?.city && formikProps?.values?.city !== "") {
                                                            formikProps.setFieldValue("cityId", ""); // Reset cityId
                                                        }
                                                        getCityList(option?.target?.value);
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
                                                error={formikProps?.errors?.cityId}
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
                                </div>
                                <div className="theme-from-footer mt-auto border-top px-3 mx-n3 pt-3">
                                    <Stack
                                        direction="horizontal"
                                        gap={3}
                                        className="justify-content-end flex-wrap"
                                    >
                                        <Link
                                            to={"/tickets"}
                                            className="btn btn-outline-dark custom-min-width-85"
                                        >
                                            {t('CANCEL')}
                                        </Link>
                                        <Button
                                            type="submit"
                                            variant="warning"
                                            className="custom-min-width-85"
                                        >
                                            {t('NEXT')}<span className="ms-1">&gt;</span>
                                        </Button>
                                    </Stack>
                                </div>
                            </React.Fragment>

                        )}
                    </CommonFormikComponent>
                </Card.Body>
            </Card>
        </React.Fragment>
    )
}

export default BasicInfoTab