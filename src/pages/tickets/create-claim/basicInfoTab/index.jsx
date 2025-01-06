import React, { useCallback, useEffect, useState } from 'react';
import { Button, Card, Col, Row, Stack } from 'react-bootstrap';
import toast from "react-hot-toast";
import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";
import CommonFormikComponent from "../../../../components/CommonFormikComponent";
import FormInputBox from '../../../../components/FormInput';
import ReactSelect from '../../../../components/ReactSelect';
import { countryCodes } from '../../../../constants/CountryCodes';

import Loader from '../../../../components/Loader';
import { provinceDropdownData } from '../../../../services/cityMaster.service';
import { getCitiesDropdownData, validateEmailApi, validateIdentificationApi } from '../../../../services/claimcreate.services';
import { useMasterData } from '../../../../contexts/masters.context';
import { convertToLabelValue } from '../../../../services/ticketmanagement.service';
import { BasicInfoFormSchema } from '../../../../validations/createClaim.validation';

const BasicInfoTab = ({ handleFormSubmit, setIsLoading }) => {

    const formattedCountryCodes = countryCodes.map(country => ({
        value: country?.value,
        label: country?.value
    }));


    const { t } = useTranslation()

    const { masterData } = useMasterData();

    const [cityList, setCityList] = useState([]);
    const [provinceList, setProvinceList] = useState([]);
    const [loadingInfo, setLoadingInfo] = useState(false);

    const [channnelOfEntryData, setChannelOfEntryData] = useState([])

    const [isEmailAlreadyExists, setIsEmailAlreadyExists] = useState(false)
    const [initialValues, setInitialValues] = useState({
        identificacion: '',
        email: '',
        name: '',
        gender: '',
        countryCode: '+34',
        phoneNumber: '',
        provinceId: '',
        cityId: '',
        channelOfEntry: ''
    });

    // Handle Submit Handler
    const handleSubmit = (values, actions) => {
        handleFormSubmit(values, actions);
    };

    const getCityList = useCallback(async (provinceId) => {
        setIsLoading(true);
        try {
            const response = await getCitiesDropdownData(provinceId);
            const cityFormatList = response?.data?.map((data) => {
                return {
                    label: data?.name,
                    value: data?.id
                }
            })
            setCityList([{ label: t('SELECT'), value: '' }, ...cityFormatList]);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
        }
    }, [setCityList, setIsLoading])

    const getProvinceList = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await provinceDropdownData();
            const provinceFormatList = response?.data?.map((data) => {
                return {
                    label: data?.name,
                    value: data?.id
                }
            })
            setProvinceList(provinceFormatList);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
        }
    }, [setProvinceList, setIsLoading])

    useEffect(() => {
        getProvinceList();
    }, [getProvinceList])

    // HANDLE IDENTIFICATION
    const handleIdentificationBlur = (event) => {
        const identification = event.target.value;
        if (identification && identification !== "") {
            fetchUserData(identification);
        }
    };

    // FETCH USER PERSONAL INFO BY ID
    const fetchUserData = async (identificacion) => {

        // const response = {
        //     data: {
        //         "identificacion": "1712655842",
        //         "nombreCompleto": "RUIZ PEREZ GERMANICO VINICIO",
        //         "genero": "HOMBRE",
        //         "lugarNacimiento": "PICHINCHA/QUITO/SAN BLAS",
        //         "nacionalidad": "ECUATORIANA",
        //         "existUserEmail": "bot2@yopmail.com"
        //     }
        // }

        // setInitialValues({ ...initialValues, identificacion: identificacion, name: response?.data?.nombreCompleto, gender: response?.data?.genero, email: response?.data?.existUserEmail })
        // setIsEmailAlreadyExists(true)


        //UNCOMMENT FROM HERE AFTER NATIONAL ID START WORKING
        setLoadingInfo(true)

        validateIdentificationApi(identificacion).then((response) => {
            setLoadingInfo(false)
            if (response?.data?.nombreCompleto) {
                setInitialValues({ ...initialValues, identificacion: identificacion, name: response?.data?.nombreCompleto, gender: response?.data?.genero, email: response?.data?.existUserEmail })
            } else {
                setInitialValues({ ...initialValues, identificacion: identificacion, name: '', gender: '' })
            }
            if (response?.data?.existUserEmail && response?.data?.existUserEmail !== null) {
                setIsEmailAlreadyExists(true)
            } else {
                setIsEmailAlreadyExists(false)
            }
        })
            .catch((error) => {
                if (error?.response?.data?.errorDescription) {
                    toast.error(error?.response?.data?.errorDescription);
                } else {
                    toast.error(error?.message);
                }
                setInitialValues({ ...initialValues, identificacion: identificacion, name: '' })
            }).finally(() => {
                setLoadingInfo(false)
            })
    };

    const handleEmailBlur = (event) => {
        const email = event.target.value;
        if (email && email !== "") {
            handleEmailVerification(email);
        }
    };


    // VERIFY EMAIL 
    const handleEmailVerification = (email) => {
        setLoadingInfo(true)
        validateEmailApi({ email }).then((response) => {
            setLoadingInfo(false)

            if (response?.data === true) {
                toast.success("Email verified!")
            } else {
                toast.success("Failed to verify email!")
            }

        })
            .catch((error) => {
                if (error?.response?.data?.errorDescription) {
                    toast.error(error?.response?.data?.errorDescription);
                } else {
                    toast.error(error?.message);
                }
            }).finally(() => {
                setLoadingInfo(false)
            })
    };


    useEffect(() => {
        if (masterData) {
            setChannelOfEntryData([{ label: 'Select', value: '' }, ...convertToLabelValue(masterData.channelOfEntry)]);
        }
    }, [masterData])




    return (
        <React.Fragment>
            <Loader isLoading={loadingInfo} />
            <Card className="border-0 flex-grow-1 d-flex flex-column shadow h-100">
                <Card.Body className="d-flex flex-column h-100">
                    <CommonFormikComponent
                        validationSchema={BasicInfoFormSchema}
                        initialValues={initialValues}
                        onSubmit={handleSubmit}
                        enableReinitialize={true}
                    >
                        {(formikProps) => (
                            <React.Fragment>
                                <div className="text-break d-flex flex-column small pt-0">
                                    <h6 className="mb-3 pb-1 fw-semibold">{t("BASIC_INFORMATION")}</h6>
                                    <Row className="gx-4">
                                        <Col sm={6} lg={4}>
                                            <FormInputBox
                                                autoComplete="off"
                                                id="identificacion"
                                                label={t("NATIONAL_ID_NUMBER")}
                                                name="identificacion"
                                                type="text"
                                                error={formikProps.errors.identificacion}
                                                onBlur={handleIdentificationBlur}
                                                onChange={formikProps.handleChange}
                                                touched={formikProps.touched.identificacion}
                                                value={formikProps.values.identificacion || ""}
                                            />
                                        </Col>
                                        <Col sm={6} lg={4}>
                                            <FormInputBox
                                                autoComplete="off"
                                                id="email"
                                                label={t("EMAIL")}
                                                name="email"
                                                type="email"
                                                error={formikProps.errors.email}
                                                onBlur={handleEmailBlur}
                                                onChange={formikProps.handleChange}
                                                touched={formikProps.touched.email}
                                                value={formikProps.values.email || ""}
                                                disabled={isEmailAlreadyExists}
                                            />
                                        </Col>
                                        <Col sm={6} lg={4}>
                                            <label htmlFor="countryCode" className="mb-1 fs-14">
                                                {t("PHONE")}
                                            </label>
                                            <Row className="gx-2">
                                                <Col xs="auto">
                                                    <div className="custom-min-width-75 pe-1">
                                                        <ReactSelect
                                                            error={formikProps.errors.countryCode}
                                                            options={formattedCountryCodes ?? []}
                                                            placeholder={t("SELECT")}
                                                            value={formikProps?.values?.countryCode ?? ''}
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
                                                    </div>
                                                </Col>
                                                <Col xs>
                                                    <FormInputBox
                                                        autoComplete="off"
                                                        id="phoneNumber"
                                                        name="phoneNumber"
                                                        type="number"
                                                        error={formikProps.errors.phoneNumber}
                                                        onBlur={formikProps.handleBlur}
                                                        onChange={formikProps.handleChange}
                                                        touched={formikProps.touched.phoneNumber}
                                                        value={formikProps.values.phoneNumber || ""}
                                                    />
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col sm={6} lg={4}>
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
                                        <Col sm={6} lg={4}>
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
                                        <Col sm={6} lg={4}>
                                            <ReactSelect
                                                label={t("PROVINCE_OF_RESIDENCE")}
                                                error={formikProps?.errors?.provinceId}
                                                options={provinceList}
                                                value={formikProps.values.provinceId}
                                                onChange={(option) => {
                                                    // setCityList([]);
                                                    formikProps.setFieldValue("provinceId", option?.target?.value ?? "");
                                                    if (option?.target?.value
                                                        && option?.target?.value !== "" &&
                                                        option?.target?.value !== formikProps?.values?.provinceId) {
                                                        getCityList(option?.target?.value);
                                                        formikProps.setFieldValue("cityId", "");
                                                    }
                                                    //  else {
                                                    //     formikProps.setFieldValue("cityId", "");
                                                    // }
                                                }}
                                                name="provinceId"
                                                className={formikProps.touched.provinceId && formikProps.errors.provinceId ? "is-invalid" : ""}
                                                onBlur={formikProps.handleBlur}
                                                touched={formikProps.touched.provinceId}
                                            />
                                        </Col>
                                        <Col sm={6} lg={4}>
                                            <ReactSelect
                                                label={t("CANTON_OF_RESIDENCE")}
                                                error={formikProps?.errors?.cityId}
                                                options={cityList}
                                                value={formikProps.values.cityId}
                                                onChange={(option) => {
                                                    formikProps.setFieldValue("cityId", option?.target?.value ?? "");
                                                }}
                                                name="cityId"
                                                className={formikProps?.touched?.cityId && formikProps?.errors?.cityId ? "is-invalid" : ""}
                                                onBlur={formikProps.handleBlur}
                                                touched={formikProps.touched.cityId}
                                            />
                                        </Col>
                                        <Col sm={6} lg={4}>
                                            <ReactSelect
                                                label={t("CHANNEL_OF_ENTRY")}
                                                error={formikProps?.errors?.channelOfEntry}
                                                options={channnelOfEntryData ?? []}
                                                value={formikProps.values.channelOfEntry}
                                                onChange={(option) => {
                                                    formikProps.setFieldValue("channelOfEntry", option?.target?.value ?? "");
                                                }}
                                                name="channelOfEntry"
                                                className={formikProps?.touched?.channelOfEntry && formikProps?.errors?.channelOfEntry ? "is-invalid" : ""}
                                                onBlur={formikProps.handleBlur}
                                                touched={formikProps.touched.channelOfEntry}
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
                                            {t('NEXT')}
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