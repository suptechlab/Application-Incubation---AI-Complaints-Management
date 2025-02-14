import { Form, Formik } from "formik";
import React, { useContext, useEffect, useState } from "react";
import { Button, Col, Modal, Row } from "react-bootstrap";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import Loader from "../../components/Loader";
import ReactSelect from "../../components/ReactSelect";
import { MasterDataContext } from "../../contexts/masters.context";
import { cityDropdownData, provinceDropdownData } from "../../services/cityMaster.service";
import { claimSubTypeDropdownList, claimTypesDropdownList } from "../../services/claimSubType.service";
import { getOrganizationList } from "../../services/teamManagment.service";
import { convertToLabelValue } from "../../services/ticketmanagement.service";
import { getAgentList } from "../../services/ticketWorkflow.service";
import { AuthenticationContext } from "../../contexts/authentication.context";

const FilterModal = ({ modal, toggle, filter, setFilter }) => {

  const { t } = useTranslation();

  const { currentUser } = useContext(AuthenticationContext)

  // const [fileName, setFileName] = useState("");

  const { masterData } = useContext(MasterDataContext)

  const [closeSubStatus, setCloseSubStatus] = useState([])

  const [instanceTypeOptions, setInstanceTypeOptions] = useState([])

  const [rejectSubStatus, setRejectSubStatus] = useState([])

  const [priorityCareOptions, setPriorityCareOptions] = useState([])

  const [customerTypeOptions, setCustomerTypeOptions] = useState([])

  const [claimTypeOptions, setClaimTypeOptions] = useState([])

  const [organizationOptions, setOrganizationOptions] = useState([])

  const [claimSubTypeOptions, setClaimSubTypeOptions] = useState([])

  const [fiAgentOptions, setFiAgentOptions] = useState([])

  const [sepsAgentOptions, setSepsAgentOptions] = useState([])

  const [cityOptions, setCityOptions] = useState([])

  const [provinceOptions, setProvinceOptions] = useState([])

  const [channelOfEntryOptions, setChannelOfEntryOptions] = useState([])

  const [sourceOptions] = useState([
    { value: 'WEB', label: "Web" },
    { value: 'AGENT', label: 'Agent' },
    { value: 'CHATBOT', label: 'Chatbot' }
  ])


  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (masterData?.closedStatus) {
      const closeStatus = convertToLabelValue(masterData?.closedStatus ?? {})
      setCloseSubStatus(closeStatus ?? [])
    }

    const rejectStatus = convertToLabelValue(masterData?.rejectedStatus ?? {})
    setRejectSubStatus(rejectStatus ?? [])

    const instanceTypes = convertToLabelValue(masterData?.instanceType ?? {})
    setInstanceTypeOptions(instanceTypes ?? [])

    const customerTypes = convertToLabelValue(masterData?.customerType ?? {})
    setCustomerTypeOptions(customerTypes ?? [])

    const priorityCare = convertToLabelValue(masterData?.priorityCareGroup ?? {})
    setPriorityCareOptions(priorityCare ?? [])

    const channelOfEntry = convertToLabelValue(masterData?.channelOfEntry ?? {})
    setChannelOfEntryOptions(channelOfEntry ?? [])

  }, [masterData])


  // GET CLAIM TYPE DROPDOWN LIST
  const getClaimTypeDropdownList = () => {
    setLoading(true)
    claimTypesDropdownList().then(response => {
      if (response?.data && response?.data?.length > 0) {
        const dropdownData = response?.data.map(item => ({
          value: item.id,
          label: item.name
        }));
        setClaimTypeOptions(dropdownData)
      }
    }).catch((error) => {
      if (error?.response?.data?.errorDescription) {
        toast.error(error?.response?.data?.errorDescription);
      } else {
        toast.error(error?.message ?? "FAILED TO FETCH CLAIM TYPE DATA");
      }
    }).finally(() => {
      setLoading(false)
    })
  }
  // GET CLAIM SUB TYPE DROPDOWN LIST
  const getClaimSubTypeDropdownList = (id) => {
    setLoading(true)
    claimSubTypeDropdownList(id).then(response => {
      if (response?.data && response?.data?.length > 0) {
        const dropdownData = response?.data.map(item => ({
          value: item.id,
          label: item.name
        }));
        setClaimSubTypeOptions(dropdownData)
      }
    }).catch((error) => {
      if (error?.response?.data?.errorDescription) {
        toast.error(error?.response?.data?.errorDescription);
      } else {
        toast.error(error?.message ?? "FAILED TO FETCH CLAIM TYPE DATA");
      }
    }).finally(() => {
      setLoading(false)
    })
  }
  // GET ORGANIZATION DROPDOWN LIST
  const getOrganizationDropdownList = () => {
    setLoading(true)
    getOrganizationList().then(response => {
      if (response?.data && response?.data?.length > 0) {
        const dropdownData = response?.data.map(item => ({
          value: item.id,
          label: item.name
        }));
        setOrganizationOptions(dropdownData)
      }
    }).catch((error) => {
      if (error?.response?.data?.errorDescription) {
        toast.error(error?.response?.data?.errorDescription);
      } else {
        toast.error(error?.message ?? "FAILED TO FETCH CLAIM TYPE DATA");
      }
    }).finally(() => {
      setLoading(false)
    })
  }

  // GET PRIORITY DROPDOWN LIST
  const getProvinceDropdownList = () => {
    setLoading(true)
    provinceDropdownData().then(response => {
      if (response?.data && response?.data?.length > 0) {
        const dropdownData = response?.data.map(item => ({
          value: item.id,
          label: item.name
        }));
        setProvinceOptions(dropdownData)
      }
    }).catch((error) => {
      if (error?.response?.data?.errorDescription) {
        toast.error(error?.response?.data?.errorDescription);
      } else {
        toast.error(error?.message ?? "FAILED TO FETCH CLAIM TYPE DATA");
      }
    }).finally(() => {
      setLoading(false)
    })
  }


  // GET PRIORITY DROPDOWN LIST
  const getCityDropdownList = (provinceId) => {
    setLoading(true)
    cityDropdownData(provinceId).then(response => {
      if (response?.data && response?.data?.length > 0) {
        const dropdownData = response?.data.map(item => ({
          value: item.id,
          label: item.name
        }));
        setCityOptions(dropdownData)
      }
    }).catch((error) => {
      if (error?.response?.data?.errorDescription) {
        toast.error(error?.response?.data?.errorDescription);
      } else {
        toast.error(error?.message ?? "FAILED TO FETCH CLAIM TYPE DATA");
      }
    }).finally(() => {
      setLoading(false)
    })
  }

  // GET AGENT DROPDOWN LISTING
  const getAgentDropdownListing = (orgId) => {

    if (orgId) {
      getAgentList(orgId).then(response => {
        if (response?.data && response?.data?.length > 0) {
          const dropdownData = response?.data.map(item => ({
            value: item.id,
            label: item.name
          }));
          setFiAgentOptions(dropdownData)
        } else {
          setFiAgentOptions([])
        }
      }).catch((error) => {
        if (error?.response?.data?.errorDescription) {
          toast.error(error?.response?.data?.errorDescription);
        } else {
          toast.error(error?.message ?? "FAILED TO FETCH CLAIM TYPE DATA");
        }
      })
    } else {
      getAgentList().then(response => {
        if (response?.data && response?.data?.length > 0) {
          const dropdownData = response?.data.map(item => ({
            value: item.id,
            label: item.name
          }));
          setSepsAgentOptions(dropdownData)
        } else {
          setSepsAgentOptions([])
        }
      }).catch((error) => {
        if (error?.response?.data?.errorDescription) {
          toast.error(error?.response?.data?.errorDescription);
        } else {
          toast.error(error?.message ?? "FAILED TO FETCH CLAIM TYPE DATA");
        }
      })
    }
  }

  useEffect(() => {
    getClaimTypeDropdownList()
    getOrganizationDropdownList()
    getProvinceDropdownList()
    getAgentDropdownListing()
  }, [])



  const handleSubmit = async (values, actions) => {

    // Remove null or empty string values from the filter
    const cleanedValues = Object.fromEntries(
      Object.entries(values).filter(
        ([_, value]) => value !== null && value !== ''
      )
    );
    toggle()
    // Update the filter state with previous filter data
    setFilter((prevFilterData) => ({
      ...prevFilterData,
      ...cleanedValues,
    }));

    // Optionally reset form actions (like setting isSubmitting to false)
    actions.setSubmitting(false);

  };

  return (
    <Modal
      show={modal}
      onHide={toggle}
      backdrop="static"
      keyboard={false}
      centered={true}
      scrollable={true}
      size="xl"
      className="theme-modal"
      enforceFocus={false}
    >
      <Loader isLoading={loading} />
      <Modal.Header className="pb-3">
        <Modal.Title as="h4" className="fw-semibold">{t("CLAIM_OVERVIEW_FILTERS")}</Modal.Title>
      </Modal.Header>
      <Formik
        initialValues={{
          instanceType: filter?.instanceType ?? "",
          organizationId: filter?.organizationId ?? "",
          fiAgentId: filter?.fiAgentId ?? "",
          sepsAgentId: filter?.sepsAgentId ?? "",
          claimTypeId: filter?.claimTypeId ?? "",
          claimSubTypeId: filter?.claimSubTypeId ?? "",
          closedStatus: filter?.closedStatus ?? "",
          rejectedStatus: filter?.rejectedStatus ?? "",
          provinceId: filter?.provinceId ?? "",
          cityId: filter?.cityId ?? "",
          customerType: filter?.customerType ?? "",
          priorityCareGroup: filter?.priorityCareGroup ?? "",
          source: filter?.source ?? "",
          channelOfEntry: filter?.channelOfEntry ?? ""
        }}
        enableReinitialize={true}
        onSubmit={handleSubmit}
      >
        {({
          isSubmitting,
          handleChange,
          handleBlur,
          values,
          setFieldValue,
          setFieldError,
          touched,
          isValid,
          errors,
        }) => (
          <Form>
            <Modal.Body className="text-break py-0">
              <Row>
                {
                  currentUser !== "FI_USER" &&
                  <Col sm={6} lg={4}>
                    <ReactSelect
                      label={t("INSTANCE_TYPE")}
                      error={errors.instanceType}
                      options={[
                        { label: t("SELECT"), value: "" },
                        ...instanceTypeOptions.map((group) => ({
                          label: group.label,
                          value: group.value,
                        })),
                      ]}
                      value={values.instanceType}
                      onChange={(option) => {
                        setFieldValue(
                          "instanceType",
                          option?.target?.value ?? ""
                        );
                      }}
                      name="instanceType"
                      className={touched.instanceType && errors.instanceType ? "is-invalid" : ""}
                      onBlur={handleBlur}
                      touched={touched.instanceType}
                    />
                  </Col>
                }

                <Col sm={6} lg={4}>
                  <ReactSelect
                    label={t("ORGANIZATION")}
                    error={errors.organizationId}
                    options={[
                      { label: t("SELECT"), value: "" },
                      ...organizationOptions.map((group) => ({
                        label: group.label,
                        value: group.value,
                      })),
                    ]}
                    value={values.organizationId}
                    // onChange={(option) => {
                    //   setFieldValue(
                    //     "organizationId",
                    //     option?.target?.value ?? ""
                    //   );


                    // }}
                    onChange={(option) => {
                      const newOrganizationId = option?.target?.value ?? "";

                      // Update the organizationId field
                      setFieldValue("organizationId", newOrganizationId);

                      // If organizationId is not empty, fetch agent dropdown listing
                      if (newOrganizationId) {
                        getAgentDropdownListing(option.target.value);
                      }

                      // Reset fiAgentId to an empty string if organizationId is empty
                      if (newOrganizationId === "") {
                        setFieldValue("fiAgentId", "");
                      }
                    }}

                    name="organizationId"
                    className={touched.organizationId && errors.organizationId ? "is-invalid" : ""}
                    onBlur={handleBlur}
                    touched={touched.organizationId}
                  />
                </Col>
                <Col sm={6} lg={4}>
                  <ReactSelect
                    label={t("CLAIM TYPE")}
                    error={errors.claimTypeId}
                    options={[
                      { label: t("SELECT"), value: '' },
                      ...claimTypeOptions.map((group) => ({
                        label: group.label,
                        value: group.value,
                      })),
                    ]}
                    value={values.claimTypeId}
                    onChange={(option) => {
                      const newClaimTypeId = option?.target?.value ?? "";

                      // Update the claimTypeId field
                      setFieldValue("claimTypeId", newClaimTypeId);

                      // If claimTypeId is not empty and has changed, fetch claim subtypes
                      if (newClaimTypeId && newClaimTypeId !== values?.claimTypeId) {
                        getClaimSubTypeDropdownList(newClaimTypeId);
                      }

                      // If claimTypeId is empty, reset claimSubTypeId to an empty string
                      if (newClaimTypeId === "") {
                        setFieldValue("claimSubTypeId", "");
                      }
                    }}
                    name="claimTypeId"
                    className={touched.claimTypeId && errors.claimTypeId ? "is-invalid" : ""}
                    onBlur={handleBlur}
                    touched={touched.claimTypeId}
                  />
                </Col>
                <Col sm={6} lg={4}>
                  <ReactSelect
                    label={t("CLAIM SUB TYPE")}
                    error={errors.claimSubTypeId}
                    options={[
                      { label: t("SELECT"), value: "" },
                      ...claimSubTypeOptions.map((group) => ({
                        label: group.label,
                        value: group.value,
                      })),
                    ]}
                    value={values.claimSubTypeId}
                    onChange={(option) => {
                      setFieldValue(
                        "claimSubTypeId",
                        option?.target?.value ?? ""
                      );
                    }}

                    disabled={values?.claimTypeId === ''}
                    name="claimSubTypeId"
                    className={touched.claimSubTypeId && errors.claimSubTypeId ? "is-invalid" : ""}
                    onBlur={handleBlur}
                    touched={touched.claimSubTypeId}
                  />
                </Col>
                <Col sm={6} lg={4}>
                  <ReactSelect
                    label={t("FI_AGENT")}
                    error={errors.fiAgentId}
                    options={[
                      { label: t("SELECT"), value: '' },
                      ...fiAgentOptions.map((group) => ({
                        label: group.label,
                        value: group.value,
                      })),
                    ]}
                    value={values.fiAgentId}
                    onChange={(option) => {
                      setFieldValue(
                        "fiAgentId",
                        option?.target?.value ?? ""
                      );
                    }}
                    disabled={values?.organizationId === ''}
                    name="fiAgentId"
                    className={touched.fiAgentId && errors.fiAgentId ? "is-invalid" : ""}
                    onBlur={handleBlur}
                    touched={touched.fiAgentId}
                  />
                </Col>

                <Col sm={6} lg={4}>
                  <ReactSelect
                    label={t("SEPS_AGENT")}
                    error={errors.sepsAgentId}
                    options={[
                      { label: t("SELECT"), value: "" },
                      ...sepsAgentOptions.map((group) => ({
                        label: group.label,
                        value: group.value,
                      })),
                    ]}
                    value={values.sepsAgentId}
                    onChange={(option) => {
                      setFieldValue(
                        "sepsAgentId",
                        option?.target?.value ?? ""
                      );
                    }}
                    name="sepsAgentId"
                    className={touched.sepsAgentId && errors.sepsAgentId ? "is-invalid" : ""}
                    onBlur={handleBlur}
                    touched={touched.sepsAgentId}
                  />
                </Col>
                <Col sm={6} lg={4}>
                  <ReactSelect
                    label={t("PROVINCE")}
                    error={errors.provinceId}
                    options={[
                      { label: t("SELECT"), value: '' },
                      ...provinceOptions.map((group) => ({
                        label: group.label,
                        value: group.value,
                      })),
                    ]}
                    value={values.provinceId}
                    onChange={(option) => {
                      const newProvinceId = option?.target?.value ?? "";

                      // Update the provinceId field
                      setFieldValue("provinceId", newProvinceId);

                      // If provinceId is not empty and has changed, fetch city dropdown list
                      if (newProvinceId && newProvinceId !== values?.provinceId) {
                        getCityDropdownList(newProvinceId);

                        // Reset cityId to an empty string
                        setFieldValue("cityId", "");
                      }
                    }}

                    name="provinceId"
                    className={touched.provinceId && errors.provinceId ? "is-invalid" : ""}
                    onBlur={handleBlur}
                    touched={touched.provinceId}
                  />
                </Col>
                <Col sm={6} lg={4}>
                  <ReactSelect
                    label={t("CITY")}
                    error={errors.cityId}
                    options={[
                      { label: t("SELECT"), value: "" },
                      ...cityOptions.map((group) => ({
                        label: group.label,
                        value: group.value,
                      })),
                    ]}
                    value={values.cityId}
                    onChange={(option) => {
                      setFieldValue(
                        "cityId",
                        option?.target?.value ?? ""
                      );
                    }}
                    disabled={values?.provinceId === ''}
                    name="cityId"
                    className={touched.cityId && errors.cityId ? "is-invalid" : ""}
                    onBlur={handleBlur}
                    touched={touched.cityId}
                  />
                </Col>
                <Col sm={6} lg={4}>
                  <ReactSelect
                    label={t("PRIORITY_CARE_GROUP")}
                    error={errors.priorityCareGroup}
                    options={[
                      { label: t("SELECT"), value: "" },
                      ...priorityCareOptions.map((group) => ({
                        label: group.label,
                        value: group.value,
                      })),
                    ]}
                    value={values.priorityCareGroup}
                    onChange={(option) => {
                      setFieldValue(
                        "priorityCareGroup",
                        option?.target?.value ?? ""
                      );
                    }}
                    name="priorityCareGroup"
                    className={touched.priorityCareGroup && errors.priorityCareGroup ? "is-invalid" : ""}
                    onBlur={handleBlur}
                    touched={touched.priorityCareGroup}
                  />
                </Col>
                <Col sm={6} lg={4}>
                  <ReactSelect
                    label={t("CUSTOMER_TYPE")}
                    error={errors.customerType}
                    options={[
                      { label: t("SELECT"), value: "" },
                      ...customerTypeOptions.map((group) => ({
                        label: group.label,
                        value: group.value,
                      })),
                    ]}
                    value={values.customerType}
                    onChange={(option) => {
                      setFieldValue(
                        "customerType",
                        option?.target?.value ?? ""
                      );
                    }}
                    name="customerType"
                    className={touched.customerType && errors.customerType ? "is-invalid" : ""}
                    onBlur={handleBlur}
                    touched={touched.customerType}
                  />
                </Col>
                <Col sm={6} lg={4}>
                  <ReactSelect
                    label={t("CLOSE_SUB_STATUS")}
                    error={errors.closedStatus}
                    options={[
                      { label: t("SELECT"), value: "" },
                      ...closeSubStatus.map((group) => ({
                        label: group.label,
                        value: group.value,
                      })),
                    ]}
                    value={values.closedStatus}
                    onChange={(option) => {
                      setFieldValue(
                        "closedStatus",
                        option?.target?.value ?? ""
                      );
                    }}
                    name="closedStatus"
                    className={touched.closedStatus && errors.closedStatus ? "is-invalid" : ""}
                    onBlur={handleBlur}
                    touched={touched.closedStatus}
                  />
                </Col>
                <Col sm={6} lg={4}>
                  <ReactSelect
                    label={t("REJECT_SUB_STATUS")}
                    error={errors.rejectedStatus}
                    options={[
                      { label: t("SELECT"), value: "" },
                      ...rejectSubStatus.map((group) => ({
                        label: group.label,
                        value: group.value,
                      })),
                    ]}
                    value={values.rejectedStatus}
                    onChange={(option) => {
                      setFieldValue(
                        "rejectedStatus",
                        option?.target?.value ?? ""
                      );
                    }}
                    name="rejectedStatus"
                    className={touched.rejectedStatus && errors.rejectedStatus ? "is-invalid" : ""}
                    onBlur={handleBlur}
                    touched={touched.rejectedStatus}
                  />
                </Col>
                <Col sm={6} lg={4}>
                  <ReactSelect
                    label={t("SOURCE")}
                    error={errors.source}
                    options={[
                      { label: t("SELECT"), value: "" },
                      ...sourceOptions.map((group) => ({
                        label: group.label,
                        value: group.value,
                      })),
                    ]}
                    value={values.source}
                    onChange={(option) => {
                      setFieldValue(
                        "source",
                        option?.target?.value ?? ""
                      );
                    }}
                    name="source"
                    className={touched.source && errors.source ? "is-invalid" : ""}
                    onBlur={handleBlur}
                    touched={touched.source}
                  />
                </Col>
                <Col sm={6} lg={4}>
                  <ReactSelect
                    label={t("CHANNEL_OF_ENTRY")}
                    error={errors.channelOfEntry}
                    options={[
                      { label: t("SELECT"), value: "" },
                      ...channelOfEntryOptions.map((group) => ({
                        label: group.label,
                        value: group.value,
                      })),
                    ]}
                    value={values.channelOfEntry}
                    onChange={(option) => {
                      setFieldValue(
                        "channelOfEntry",
                        option?.target?.value ?? ""
                      );
                    }}
                    name="channelOfEntry"
                    className={touched.channelOfEntry && errors.channelOfEntry ? "is-invalid" : ""}
                    onBlur={handleBlur}
                    touched={touched.channelOfEntry}
                  />
                </Col>
              </Row>


            </Modal.Body>
            <Modal.Footer className="pt-0">
              <Button
                type="button"
                variant="outline-dark"
                onClick={toggle}
                className="custom-min-width-85"
              >
                {t("CANCEL")}
              </Button>
              <Button
                type="submit"
                variant="warning"
                className="custom-min-width-85"
                disabled={loading ?? false}
              >
                {t("APPLY")}
              </Button>
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default FilterModal;