import React, { useContext, useEffect, useState } from "react";
import { Button, Col, Modal, Row } from "react-bootstrap";
import Loader from "../../components/Loader";
import { useTranslation } from "react-i18next";
import { MasterDataContext } from "../../contexts/masters.context";
import { Form, Formik } from "formik";
import ReactSelect from "../../components/ReactSelect";
import { convertToLabelValue } from "../../services/ticketmanagement.service";
import { getOrganizationList } from "../../services/teamManagment.service";
import toast from "react-hot-toast";

const FilterModal = ({ modal, toggle, filter, setFilter }) => {

  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()

  const { masterData } = useContext(MasterDataContext)

  const [instanceTypeOptions, setInstanceTypeOptions] = useState([])
  const [organizationOptions, setOrganizationOptions] = useState([])
  const [priorityOptions, setPriorityOptions] = useState([])


  useEffect(() => {

    const instanceTypes = convertToLabelValue(masterData?.instanceType ?? {})
    setInstanceTypeOptions(instanceTypes ?? [])

    const priorityOpt = convertToLabelValue(masterData?.claimTicketPriority ?? {})
    setPriorityOptions(priorityOpt)
  }, [])

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

  const handleSubmit = () => {

  }

  useEffect(() => {
    getOrganizationDropdownList()
  }, [])

  return <Modal
    show={modal}
    onHide={toggle}
    // backdrop="static"
    keyboard={false}
    centered={true}
    scrollable={true}
    size="lg"
    className="theme-modal"
    enforceFocus={false}
  >
    <Loader isLoading={loading} />
    <Modal.Header className="pb-3">
      <Modal.Title as="h4" className="fw-semibold">{t("SLA_COMPLIANCE_FILTERS")}</Modal.Title>
    </Modal.Header>
      <Formik
        initialValues={{
          instanceType: filter?.instanceType ?? "",
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
                <Col sm={12} lg={6}>
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
                <Col sm={12} lg={6}>
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
                    onChange={(option) => {
                      setFieldValue(
                        "organizationId",
                        option?.target?.value ?? ""
                      );
                    }}
                    // onChange={(option) => {
                    //   const newOrganizationId = option?.target?.value ?? "";

                    //   // Update the organizationId field
                    //   setFieldValue("organizationId", newOrganizationId);


                    // }}

                    name="organizationId"
                    className={touched.organizationId && errors.organizationId ? "is-invalid" : ""}
                    onBlur={handleBlur}
                    touched={touched.organizationId}
                  />
                </Col>
              </Row>
              <Row>
                <Col sm={12} lg={6}>
                  <ReactSelect
                    wrapperClassName="mb-0"
                    class="form-select "
                    placeholder={t("PRIORITY")}
                    id="floatingSelect"
                    options={[
                      {
                        label: t("PRIORITY"),
                        value: "",
                        class: "label-class",
                      }, ...priorityOptions
                    ]}
                    onChange={(e) => {
                      setFilter({
                        ...filter,
                        claimTicketPriority: e.target.value,
                      });
                    }}
                    value={filter?.claimTicketPriority}
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
          </Form>)}
      </Formik>
  </Modal>
};

export default FilterModal;
