import { Formik, Form as FormikForm } from "formik";
import React, { useContext, useEffect, useState } from "react";
import { Button, Card, Col, Row, Stack } from "react-bootstrap";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { MdAddCircle, MdClose } from "react-icons/md";
import { Link, useNavigate, useParams } from "react-router-dom";
import FormInput from "../../../components/FormInput";
import Loader from "../../../components/Loader";
import PageHeader from "../../../components/PageHeader";
import ReactSelect from "../../../components/ReactSelect";
import { MasterDataContext } from "../../../contexts/masters.context";
import { handleAddUser, handleUpdateUser } from "../../../services/teamManagment.service";
import { validationSchema } from "../../../validations/teamManagement.validation";

export default function TicketWorkFlowAddEdit() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;
    const { t } = useTranslation();
    const [initialValues, setInitialValues] = useState({
        teamName: "",
        description: "",
        entityId: "",
        entityType: "FI"
    });
    const [organizationArr, setOrganizationArr] = useState([]);
    const { masterData } = useContext(MasterDataContext);


    useEffect(() => {
        console.log('masterData', masterData)
    }, [masterData]);

    const onSubmit = async (values, actions) => {
        setLoading(true);

        try {
            const action = isEdit
                ? handleUpdateUser(id, { ...values })
                : handleAddUser({ ...values });

            const response = await action;
            toast.success(response.data.message);
            navigate('/team-management');
        } catch (error) {
            const errorMessage = error.response?.data?.errorDescription;
            toast.error(errorMessage);
        } finally {
            setLoading(false);
            actions.setSubmitting(false);
        }
    };


    return (
        <React.Fragment>
            <Loader isLoading={loading} />
            <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
                <PageHeader title={`${isEdit ? t('EDIT_TICKET_WORKFLOW') : t('CREATE_NEW_TICKET_WORKFLOW')}  `} />
                <Card className="border-0 flex-grow-1 d-flex flex-column shadow">
                    <Card.Body className="d-flex flex-column">
                        <Formik
                            initialValues={initialValues}
                            enableReinitialize={true}
                            validationSchema={validationSchema}
                            onSubmit={onSubmit}
                        >
                            {({
                                errors,
                                handleBlur,
                                handleChange,
                                handleSubmit,
                                touched,
                                values,
                                setFieldValue,
                            }) => (
                                <FormikForm
                                    onSubmit={handleSubmit}
                                    className="d-flex flex-column h-100"
                                >
                                    <Row>
                                        <Col sm={6} lg={4}>
                                            <FormInput
                                                id="workflowName"
                                                label={t('WORKFLOW_NAME') + '*'}
                                                name="workflowName"
                                                type="text"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                error={errors.workflowName}
                                                touched={touched.workflowName}
                                                value={values.workflowName || ""}
                                            />
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col lg={8}>
                                            <FormInput
                                                id="description"
                                                label={t('DESCRIPTION')}
                                                name="description"
                                                type="text"
                                                as="textarea"
                                                rows="5"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                error={errors.description}
                                                touched={touched.description}
                                                value={values.description || ""}
                                            />
                                        </Col>
                                    </Row>

                                    <div className="border-top mt-2 mx-n3 px-3">
                                        <Stack direction="horizontal" gap={2} className="mb-3 pb-1 pt-4">
                                            <h5 className="fw-semibold mb-0 me-auto">{t('EVENTS')}</h5>
                                            <Button variant="link" className="link-dark border-0 text-decoration-none p-0 fw-semibold d-inline-flex align-items-center">
                                                <MdAddCircle size={20} aria-hidden={true} className="me-2 text-primary" /> {t('ADD_MORE')}
                                            </Button>
                                        </Stack>
                                        <div className="position-relative custom-padding-right-66">
                                            <Row className="gx-4">
                                                <Col sm={6} lg={4}>
                                                    <ReactSelect
                                                        label={t('EVENT_SELECTION')}
                                                        placeholder={t('SELECT')}
                                                        wrapperClassName={'mb-3'}
                                                        error={errors.entityId}
                                                        options={organizationArr}
                                                        value={values.entityId || ""}
                                                        onChange={(option) => {
                                                            setFieldValue(
                                                                "entityId",
                                                                option?.target?.value.toString() ?? ""
                                                            );
                                                        }}
                                                        name="entityId"
                                                        onBlur={handleBlur}
                                                        touched={touched.entityId}
                                                    />
                                                </Col>
                                                <Col sm={6} lg={4}>
                                                    <ReactSelect
                                                        label={t('SELECT_ACTION')}
                                                        placeholder={t('SELECT')}
                                                        wrapperClassName={'mb-3'}
                                                        error={errors.entityId}
                                                        options={organizationArr}
                                                        value={values.entityId || ""}
                                                        onChange={(option) => {
                                                            setFieldValue(
                                                                "entityId",
                                                                option?.target?.value.toString() ?? ""
                                                            );
                                                        }}
                                                        name="entityId"
                                                        onBlur={handleBlur}
                                                        touched={touched.entityId}
                                                    />
                                                </Col>
                                                <Col xs='auto' className="pt-1 custom-margin-right--66 pe-0">
                                                    <Button variant="link" aria-label="Remove" className="p-1 rounded custom-width-42 custom-height-42 d-flex align-items-center justify-content-center link-danger bg-danger-subtle mt-4">
                                                        <MdClose size={24} />
                                                    </Button>
                                                </Col>

                                            </Row>
                                        </div>

                                    </div>

                                    <div className="border-top mt-2 mx-n3 px-3">
                                        <Stack direction="horizontal" gap={2} className="mb-3 pb-1 pt-4">
                                            <div className="me-auto">
                                                <h5 className="fw-semibold mb-0">{t('CONDITIONS')}</h5>
                                                <p className="mb-0 text-muted">{t('CONDITION_MESSAGE')}</p>
                                            </div>

                                            <Button variant="link" className="link-dark border-0 text-decoration-none p-0 fw-semibold d-inline-flex align-items-center">
                                                <MdAddCircle size={20} aria-hidden={true} className="me-2 text-primary" /> {t('ADD_OR_CONDITION')}
                                            </Button>
                                        </Stack>

                                        <div className="repeater-row">
                                            <div className="position-relative custom-padding-right-66">
                                                <Row className="gx-4">
                                                    <Col sm={6} lg={4}>
                                                        <ReactSelect
                                                            placeholder={t('SELECT')}
                                                            wrapperClassName={'mb-0'}
                                                            error={errors.entityId}
                                                            options={organizationArr}
                                                            value={values.entityId || ""}
                                                            onChange={(option) => {
                                                                setFieldValue(
                                                                    "entityId",
                                                                    option?.target?.value.toString() ?? ""
                                                                );
                                                            }}
                                                            name="entityId"
                                                            onBlur={handleBlur}
                                                            touched={touched.entityId}
                                                        />
                                                    </Col>
                                                    <Col sm={6} lg={4}>
                                                        <ReactSelect
                                                            placeholder={t('SELECT')}
                                                            wrapperClassName={'mb-0'}
                                                            error={errors.entityId}
                                                            options={organizationArr}
                                                            value={values.entityId || ""}
                                                            onChange={(option) => {
                                                                setFieldValue(
                                                                    "entityId",
                                                                    option?.target?.value.toString() ?? ""
                                                                );
                                                            }}
                                                            name="entityId"
                                                            onBlur={handleBlur}
                                                            touched={touched.entityId}
                                                        />
                                                    </Col>

                                                    <Col sm={6} lg={4}>
                                                        <ReactSelect
                                                            placeholder={t('SELECT')}
                                                            wrapperClassName={'mb-0'}
                                                            error={errors.entityId}
                                                            options={organizationArr}
                                                            value={values.entityId || ""}
                                                            onChange={(option) => {
                                                                setFieldValue(
                                                                    "entityId",
                                                                    option?.target?.value.toString() ?? ""
                                                                );
                                                            }}
                                                            name="entityId"
                                                            onBlur={handleBlur}
                                                            touched={touched.entityId}
                                                        />
                                                    </Col>

                                                    <Col xs='auto' className="custom-margin-right--66 pe-0">
                                                        <Button variant="link" aria-label="Remove" className="p-1 rounded custom-width-42 custom-height-42 d-flex align-items-center justify-content-center link-danger bg-danger-subtle">
                                                            <MdClose size={24} />
                                                        </Button>
                                                    </Col>

                                                </Row>
                                            </div>
                                            <div className="border-top my-4 position-relative">
                                                <span className="bg-body fw-semibold position-absolute px-2 small start-50 top-50 translate-middle">{t('OR')}</span>
                                            </div>
                                        </div>

                                    </div>

                                    <div className="border-top my-2 mx-n3 px-3">
                                        <Stack direction="horizontal" gap={2} className="mb-3 pb-1 pt-4">
                                            <div className="me-auto">
                                                <h5 className="fw-semibold mb-0">{t('ACTIONS')}</h5>
                                                <p className="mb-0 text-muted">{t('ACTION_MSG')}</p>
                                            </div>

                                            <Button variant="link" className="link-dark border-0 text-decoration-none p-0 fw-semibold d-inline-flex align-items-center">
                                                <MdAddCircle size={20} aria-hidden={true} className="me-2 text-primary" /> {t('ADD_MORE')}
                                            </Button>
                                        </Stack>

                                        <div className="repeater-row">
                                            <div className="position-relative custom-padding-right-66">
                                                <Row className="gx-4">
                                                    <Col sm={6} lg={4}>
                                                        <ReactSelect
                                                            wrapperClassName={'mb-3'}
                                                            placeholder={t('SELECT')}
                                                            error={errors.entityId}
                                                            options={organizationArr}
                                                            value={values.entityId || ""}
                                                            onChange={(option) => {
                                                                setFieldValue(
                                                                    "entityId",
                                                                    option?.target?.value.toString() ?? ""
                                                                );
                                                            }}
                                                            name="entityId"
                                                            onBlur={handleBlur}
                                                            touched={touched.entityId}
                                                        />
                                                    </Col>
                                                    <Col sm={6} lg={4}>
                                                        <ReactSelect
                                                            wrapperClassName={'mb-3'}
                                                            placeholder={t('SELECT')}
                                                            error={errors.entityId}
                                                            options={organizationArr}
                                                            value={values.entityId || ""}
                                                            onChange={(option) => {
                                                                setFieldValue(
                                                                    "entityId",
                                                                    option?.target?.value.toString() ?? ""
                                                                );
                                                            }}
                                                            name="entityId"
                                                            onBlur={handleBlur}
                                                            touched={touched.entityId}
                                                        />
                                                    </Col>

                                                    <Col sm={6} lg={4}>
                                                        <ReactSelect
                                                            wrapperClassName={'mb-3'}
                                                            placeholder={t('SELECT')}
                                                            error={errors.entityId}
                                                            options={organizationArr}
                                                            value={values.entityId || ""}
                                                            onChange={(option) => {
                                                                setFieldValue(
                                                                    "entityId",
                                                                    option?.target?.value.toString() ?? ""
                                                                );
                                                            }}
                                                            name="entityId"
                                                            onBlur={handleBlur}
                                                            touched={touched.entityId}
                                                        />
                                                    </Col>

                                                    <Col xs='auto' className="custom-margin-right--66 pe-0">
                                                        <Button variant="link" aria-label="Remove" className="p-1 rounded custom-width-42 custom-height-42 d-flex align-items-center justify-content-center link-danger bg-danger-subtle">
                                                            <MdClose size={24} />
                                                        </Button>
                                                    </Col>

                                                </Row>
                                            </div>
                                        </div>

                                    </div>

                                    <div className="theme-from-footer mt-auto border-top px-3 mx-n3 pt-3">
                                        <Stack
                                            direction="horizontal"
                                            gap={3}
                                            className="justify-content-end flex-wrap"
                                        >
                                            <Link
                                                to={"/tickets-workflow"}
                                                className="btn btn-outline-dark custom-min-width-85"
                                            >
                                                {t('CANCEL')}
                                            </Link>
                                            <Button
                                                type="submit"
                                                variant="warning"
                                                className="custom-min-width-85"
                                            >
                                                {isEdit ? t('UPDATE') : t('SUBMIT')}
                                            </Button>
                                        </Stack>
                                    </div>
                                </FormikForm>
                            )}
                        </Formik>
                    </Card.Body>
                </Card>
            </div>

        </React.Fragment>
    );
}