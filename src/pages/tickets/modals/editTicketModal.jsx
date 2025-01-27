import { Form, Formik } from "formik";
import React, { useContext, useEffect, useState } from "react";
import { Button, Col, Modal } from "react-bootstrap";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../../components/ReactSelect";
import { MasterDataContext } from "../../../contexts/masters.context";
import { claimSubTypeDropdownList, claimTypesDropdownList } from "../../../services/claimSubType.service";
import { convertToLabelValue, editTicketDataApi, ticketRejectStatus } from "../../../services/ticketmanagement.service";
import { ticketEditValidation } from "../../../validations/ticketsManagement.validation";
const EditTicketModal = ({ modal, toggle, dataQuery, rowData }) => {
  const { t } = useTranslation();

  const { masterData } = useContext(MasterDataContext)

  const [loading, setLoading] = useState(false)
  const [priorityCareOptions, setPriorityCareOptions] = useState([])
  const [customerTypeOptions, setCustomerTypeOptions] = useState([])

  const [claimTypeOptions, setClaimTypeOptions] = useState([])
  const [claimSubTypeOptions, setClaimSubTypeOptions] = useState([])

  useEffect(() => {
    const priorityCare = convertToLabelValue(masterData?.priorityCareGroup ?? {})
    setPriorityCareOptions(priorityCare ?? [])

    const customerTypes = convertToLabelValue(masterData?.customerType ?? {})
    setCustomerTypeOptions(customerTypes ?? [])
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

  useEffect(() => {
    getClaimTypeDropdownList()
  }, [])

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

  const handleSubmit = async (values, actions) => {
    // actions.setSubmitting(true);
    setLoading(true)
    const formData = {
      customerType: values?.customerType,
      priorityCareGroup: values?.priorityCareGroup,
      claimTypeId: values?.claimTypeId,
      claimSubTypeId: values?.claimSubTypeId
    };

    editTicketDataApi(rowData?.id, formData)
      .then((response) => {
        dataQuery.refetch()
        toast.success(response?.data?.message);
        toggle()
      })
      .catch((error) => {
        if (error?.response?.data?.errorDescription) {
          toast.error(error?.response?.data?.errorDescription);
        } else {
          toast.error(error?.message);
        }
      })
      .finally(() => {
        setLoading(false)
        actions.setSubmitting(false);
      });
  };

  useEffect(() => {
    if(rowData?.claimSubTypeId){
      getClaimSubTypeDropdownList(rowData?.claimTypeId)
    }else{
      setClaimSubTypeOptions([])
    }
  }, [rowData?.claimTypeId])

  return (
    <Modal
      show={modal}
      onHide={toggle}
      backdrop="static"
      keyboard={false}
      centered={true}
      scrollable={true}
      size="sm"
      className="theme-modal"
      enforceFocus={false}
    >
      <Modal.Header className="pb-3">
        <Modal.Title as="h4" className="fw-semibold">{t("TICKET_REJECT_STATUS")}</Modal.Title>
      </Modal.Header>
      <Formik
        initialValues={{
          customerType: rowData?.customerType ?? "",
          priorityCareGroup: rowData?.priorityCareGroup ?? "",
          claimTypeId: rowData?.claimTypeId ?? "",
          claimSubTypeId: rowData?.claimSubTypeId ?? "",
        }}
        validationSchema={ticketEditValidation}
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
              <Col sm={12}>
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
              <Col sm={12}>
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

              <Col sm={12}>
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
              <Col sm={12}>
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
                {t("SUBMIT")}
              </Button>
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default EditTicketModal;