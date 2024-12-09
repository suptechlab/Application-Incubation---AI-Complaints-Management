import { Formik, Form as FormikForm } from "formik";
import React, { useEffect, useState } from "react";
import { Button, Card, Col, Form, Row, Stack, Table } from "react-bootstrap";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { MdAddCircle, MdClose, MdDelete } from "react-icons/md";
import { Link, useNavigate, useParams } from "react-router-dom";
import FormInput from "../../../components/FormInput";
import GenericModal from "../../../components/GenericModal";
import Loader from "../../../components/Loader";
import PageHeader from "../../../components/PageHeader";
import ReactSelect from "../../../components/ReactSelect";
import AppTooltip from "../../../components/tooltip";
import { assignUserIntoTeam, getOrganizationList, getTeamMemberList, handleAddUser, handleDeleteUserFromTeam, handleGetUserById, handleUpdateUser } from "../../../services/teamManagment.service";
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
    const [entityIdArr, setEntityIdArr] = useState([]);
    const [organizationArr, setOrganizationArr] = useState([]);
    const [selectedRow, setSelectedRow] = useState();
    const [deleteShow, setDeleteShow] = useState(false);
    const [deleteId, setDeleteId] = useState();
    const [showEntityOrgId, setShowEntityOrgId] = useState(true); // if FI then only show
    const [newTeamMember, setNewTeamMember] = useState([]);
    const [userData, setUserData] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null); // To hold the selected member



    //  Handle Assign Button Click
    const handleAssign = () => {
        if (!selectedMember || Object.keys(selectedMember).length === 0 || selectedMember.value == '') {
            setLoading(false);
            toast.error(t('SELECT A TEAM MEMBER BEFORE ASSIGNING'));
            return;
        }

        // Check if the member is already in the list
        const isDuplicate = newTeamMember.some(
            (member) => member.id === selectedMember.value
        );

        if (isDuplicate) {
            toast.error(t('TEAM MEMBER HAS ALREADY BEEN ASSIGNED'));
            return;
        }

        const newMember = {
            id: selectedMember.value, // ID from ReactSelect
            name: selectedMember.label, // Name from ReactSelect
        };

        if (isEdit) {
            setLoading(true);
            try {
                let payload = {
                    userIds: [selectedMember?.value]
                }
                assignUserIntoTeam(userData?.id, payload);
                setLoading(false);
            } catch (error) {
                const errorMessage = error.response?.data?.detail;
                toast.error(errorMessage);
                setLoading(false);
            }
        }

        setNewTeamMember((prev) => [...prev, newMember]);
    };

    const getTeamMemberLists = async (type) => {
        setLoading(true);
        try {
            await getTeamMemberList(type).then((response) => {
                const formattedData = response.data.map((item) => ({
                    label: item.name,
                    value: item.id
                }));
                setEntityIdArr([...formattedData]);
                setLoading(false);
            });
        } catch (error) {
            setLoading(false);
        }

    }

    const getOrganizationLists = async (type) => {
        setLoading(true);
        try {
            await getOrganizationList(type).then((response) => {
                const formattedOrgData = response.data.map((item) => ({
                    label: item.name,
                    value: item.id
                }));
                setOrganizationArr([...formattedOrgData]);
                setLoading(false);
            });
        } catch (error) {
            setLoading(false);
        }
    }

    const getUserDetails = async (userId) => {
        setLoading(true);
        try {
            const response = await handleGetUserById(userId);
            setUserData(response.data);
            setInitialValues({
                teamName: response.data?.teamName ?? "",
                description: response.data?.description ?? "",
                entityId: response.data?.entityId ?? "",
                entityType: response.data?.entityType ?? "",
            });
            setNewTeamMember(response.data?.members);
            if (response.data?.entityType === 'FI') {
                setShowEntityOrgId(true);
            } else {
                setShowEntityOrgId(false);
            }
            await getTeamMemberLists(response.data?.entityType);
            await getOrganizationLists(response.data?.entityType);
            setLoading(false);
        } catch (error) {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (isEdit && id) {
            getUserDetails(id);
        } else {
            getTeamMemberLists("FI");
            getOrganizationLists("FI");
        }
    }, [id, isEdit]);

    const onSubmit = async (values, actions) => {
        setLoading(true);

        if (newTeamMember.length === 0) {
            const errorMessage = t('PLEASE_ADD_ATLEAST_ONE_TEAM_MEMBER');
            toast.error(errorMessage);
            setLoading(false);
        } else {
            try {
                values.teamMembers = newTeamMember.map((member) => member.id);

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
        }
    };

    //Handle Delete
    const deleteAction = (rowData) => {
        setSelectedRow(rowData);
        if (isEdit) {
            setDeleteId(rowData.userId);
        } else {
            setDeleteId(rowData.id);
        }
        setDeleteShow(true);
    };

    const recordDelete = async (deleteId) => {
        if (isEdit) {
            setNewTeamMember((prev) => prev.filter((member) => member.userId !== deleteId));
            setLoading(true);
            try {
                await handleDeleteUserFromTeam(userData?.id, deleteId);
                await getTeamMemberLists(userData?.entityType);
                setLoading(false);
            } catch (error) {
                const errorMessage = error.response?.data?.errorDescription;
                toast.error(errorMessage);
                setLoading(false);
            }
        } else {
            setNewTeamMember((prev) => prev.filter((member) => member.id !== deleteId));
        }
        setDeleteShow(false);
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
                                            <h5 className="fw-semibold mb-0 me-auto">Events</h5>
                                            <Button variant="link" className="link-dark border-0 text-decoration-none p-0 fw-semibold d-inline-flex align-items-center">
                                                <MdAddCircle size={20} aria-hidden={true} className="me-2 text-primary" /> Add More
                                            </Button>
                                        </Stack>
                                        <div className="position-relative custom-padding-right-66">
                                            <Row className="gx-4">
                                                <Col sm={6} lg={4}>
                                                    <ReactSelect
                                                        label={t('EVENT_SELECTION')}
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
                                                <h5 className="fw-semibold mb-0">Conditions</h5>
                                                <p className="mb-0 text-muted">Conditions are sets of rules which check for specific scenarios.</p>
                                            </div>

                                            <Button variant="link" className="link-dark border-0 text-decoration-none p-0 fw-semibold d-inline-flex align-items-center">
                                                <MdAddCircle size={20} aria-hidden={true} className="me-2 text-primary" /> Add OR Conditons
                                            </Button>
                                        </Stack>

                                        <div className="repeater-row">
                                            <div className="position-relative custom-padding-right-66">
                                                <Row className="gx-4">
                                                    <Col sm={6} lg={4}>
                                                        <ReactSelect
                                                            // label={t('EVENT_SELECTION')}
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
                                                            // label={t('SELECT_ACTION')}
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
                                                            // label={t('SELECT_ACTION')}
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
                                                <span className="bg-body fw-semibold position-absolute px-2 small start-50 top-50 translate-middle">OR</span>
                                            </div>
                                        </div>

                                    </div>

                                    <div className="border-top my-2 mx-n3 px-3">
                                        <Stack direction="horizontal" gap={2} className="mb-3 pb-1 pt-4">
                                            <div className="me-auto">
                                                <h5 className="fw-semibold mb-0">Actions</h5>
                                                <p className="mb-0 text-muted">Actions help you automate tickets.</p>
                                            </div>

                                            <Button variant="link" className="link-dark border-0 text-decoration-none p-0 fw-semibold d-inline-flex align-items-center">
                                                <MdAddCircle size={20} aria-hidden={true} className="me-2 text-primary" /> Add More
                                            </Button>
                                        </Stack>

                                        <div className="repeater-row">
                                            <div className="position-relative custom-padding-right-66">
                                                <Row className="gx-4">
                                                    <Col sm={6} lg={4}>
                                                        <ReactSelect
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

            {/* Delete Modal */}
            <GenericModal
                show={deleteShow}
                handleClose={() => setDeleteShow(false)}
                modalHeaderTitle={t('DELETE TEAM MEMBER')}
                modalBodyContent={`${t('ARE YOU SURE, YOU WANT TO DELETE THE TEAM MEMBER')} - ${selectedRow?.name}?`}
                handleAction={() => recordDelete(deleteId)}
                buttonName={t('DELETE')}
                ActionButtonVariant="danger"
            />

        </React.Fragment>
    );
}