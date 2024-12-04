import { Formik, Form as FormikForm } from "formik";
import qs from "qs";
import React, { useEffect, useState } from "react";
import { Button, Card, Col, Form, Row, Stack, Table } from "react-bootstrap";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { MdDelete } from "react-icons/md";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import FormInput from "../../../components/FormInput";
import GenericModal from "../../../components/GenericModal";
import Loader from "../../../components/Loader";
import PageHeader from "../../../components/PageHeader";
import ReactSelect from "../../../components/ReactSelect";
import AppTooltip from "../../../components/tooltip";
import { assignUserIntoTeam, handleDeleteUserFromTeam, getOrganizationList, getTeamMemberList, handleAddUser, handleGetUserById, handleUpdateUser } from "../../../services/teamManagment.service";
import { validationSchema } from "../../../validations/teamManagement.validation";

export default function TeamManagementEdit() {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;
    const [userData, setUserData] = useState([]);
    const { t } = useTranslation();
    const [initialValues, setInitialValues] = useState({
        teamName: "",
        description: "",
        entityId: "",
        entityType: "",
    });
    const [entityIdArr, setEntityIdArr] = useState([
        { label: "Select", value: "" },
    ])
    const [organizationArr, setOrganizationArr] = useState([
        { label: "Select", value: "" },
    ])

    const [selectedRow, setSelectedRow] = useState();
    const [deleteShow, setDeleteShow] = useState(false);
    const [deleteId, setDeleteId] = useState();
    const [userType, setUserType] = useState('FI');
    const [showEntityOrgId, setShowEntityOrgId] = useState(true);
    const [newTeamMember, setNewTeamMember] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [selectedMemberName, setSelectedMemberName] = useState(null);
    const [membersArr, setMembersArr] = useState([]);


    //  Handle Assign Button Click
    const handleAssign = () => {
        setLoading(true);
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

        setNewTeamMember((prev) => [...prev, newMember]); // Add to the list
        //setSelectedMember(null); // Clear selection    
        setMembersArr((prevNumbers) => [...prevNumbers, selectedMember.value]);
        let assignMemberArr = [];
        assignMemberArr.push(selectedMember.value)

        const data = {
            userIds: assignMemberArr
        }
        // calling api to assign member into team
        assignUserIntoTeam(userData.id, data).then((response) => {
            
        })
            .catch((error) => {

            })
            .finally(() => {
                setDeleteShow(false);
                setLoading(false);
            });
        setLoading(false);


    };

    useEffect(() => {
        if (isEdit) {
            setLoading(true);
            handleGetUserById(id).then((response) => {
                setInitialValues({
                    teamName: response.data?.teamName ? response.data?.teamName : "",
                    description: response.data?.description ? response.data?.description : "",
                    entityId: response.data?.entityId ?? "",
                    entityType: response.data?.entityType ?? "",
                });
                setNewTeamMember(response.data?.members)
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, [id, isEdit]);


    // Get Assign members list
    useEffect(() => {
        getTeamMemberList(userType).then((response) => {
            const formattedData = response.data.map((item) => ({
                label: item.name,
                value: item.id
            }));
            setEntityIdArr([{ label: "Select", value: "" }, ...formattedData]);
            setLoading(false);
        });

        getOrganizationList(userType).then((response) => {
            const formattedOrgData = response.data.map((item) => ({
                label: item.name,
                value: item.id
            }));
            setOrganizationArr([{ label: "Select", value: "" }, ...formattedOrgData]);
            setLoading(false);
        });

        // setOrganizationArr
    }, [userType]);

    const onSubmit = async (values, actions) => {
        setLoading(true);
        const teamMembersIdArr = newTeamMember.map(member => member.id);
        values.teamMembers = teamMembersIdArr // add into teamMembers
        try {
            if (isEdit) {
                // values.entityId.toString();
                await handleUpdateUser(id, { ...values }).then((response) => {
                    toast.success(response.data.message)
                    actions.resetForm()
                    navigate('/team-management')
                }).catch((error) => {
                    setLoading(false);
                    toast.error(error.response.data.detail);

                }).finally(() => {
                    actions.setSubmitting(false)
                })
            }
            else {

                await handleAddUser({ ...values }).then((response) => {
                    toast.success(response.data.message)
                    actions.resetForm()
                    navigate('/team-management')
                }).catch((error) => {
                    setLoading(false);
                    toast.error(error.response.data.detail);

                }).finally(() => {
                    actions.setSubmitting(false)
                })
            }
        } catch (error) {
            setLoading(false);
            toast.error(t('SOMETHING WENT WRONG'));
        }
    };

    //Handle Delete
    const deleteAction = (rowData) => {
        setSelectedRow(rowData);
        setDeleteId(rowData.id);
        setDeleteShow(true);
    };

    // Delete API calling 
    const recordDelete = (deleteId) => {
        setLoading(true);
        setNewTeamMember((prev) => prev.filter((member) => member.id !== deleteId));
        handleDeleteUserFromTeam(userData.id, deleteId).then((response) => {
            
        })
            .catch((error) => {

            })
            .finally(() => {
                // Reset loading state regardless of success or failure
                setDeleteShow(false);
                setLoading(false);
            });
        setDeleteShow(false);
        setLoading(false);

    };

    return (
        <React.Fragment>
            <Loader isLoading={loading} />
            <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
                <PageHeader title={'Edit Team'} />
                <Card className="border-0 flex-grow-1 d-flex flex-column shadow">
                    <Card.Body className="d-flex flex-column">
                        <Formik
                            initialValues={initialValues}
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
                                        <Col xs={12} className="mb-3">
                                            <div className='status-radio'>
                                                <div className='mb-1 fs-14'>{t('USER TYPE')}</div>
                                                <Stack direction="horizontal" gap={3} className="flex-wrap">
                                                    <Form.Check
                                                        className="me-3 me-lg-4"
                                                        id="entityType"
                                                        name="entityType"
                                                        value="SEPS"
                                                        checked={values.entityType == 'SEPS'}
                                                        onBlur={handleBlur}
                                                        onChange={() => {
                                                            setFieldValue("entityType", "SEPS");
                                                            setShowEntityOrgId(false);
                                                        }}
                                                        type="radio"
                                                        label={t('SEPS USER')}
                                                    />
                                                    <Form.Check
                                                        className="me-3 me-lg-4"
                                                        id="entityTypeFi"
                                                        name="entityType"
                                                        value="FI"
                                                        checked={values.entityType == 'FI'}
                                                        onBlur={handleBlur}
                                                        onChange={() => {
                                                            setFieldValue("entityType", "FI");
                                                            setShowEntityOrgId(true);
                                                        }}
                                                        type="radio"
                                                        label={t('FI USER')}
                                                    />
                                                </Stack>
                                            </div>
                                        </Col>
                                        {
                                            showEntityOrgId ?
                                                <Col sm={6} lg={4}>
                                                    <ReactSelect
                                                        label={t('ENTITY NAME')}
                                                        error={errors.entityId}
                                                        options={organizationArr}
                                                        value={values.entityId}
                                                        onChange={(option) => {
                                                            setFieldValue(
                                                                "entityId",
                                                                option?.target?.value.toString() ?? ""
                                                            );
                                                        }}
                                                        name="entityId"
                                                        className={
                                                            touched.entityId && errors.entityId
                                                                ? "is-invalid"
                                                                : ""
                                                        }
                                                        onBlur={handleBlur}
                                                        touched={touched.entityId}

                                                    />
                                                </Col>
                                                : ''
                                        }
                                        <Col sm={6} lg={4}>
                                            <FormInput
                                                id="teamName"
                                                label={t('TEAM NAME')}
                                                name="teamName"
                                                type="text"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                error={errors.teamName}
                                                touched={touched.teamName}
                                                value={values.teamName}
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
                                                value={values.description}
                                            />
                                        </Col>

                                        <Col xs={12}>
                                            <h5 className="fw-semibold mb-1 border-bottom mb-3 py-2">{t('ASSIGN TEAM MEMBERS')}</h5>
                                            <Row>
                                                <Col lg={8}>
                                                    <Row className="gx-3">
                                                        <Col xs>
                                                            <ReactSelect
                                                                getOptionLabel={(option) => option.value}
                                                                getOptionValue={(option) => option.label}

                                                                label="Member Name"
                                                                error={errors.teamMemberId}
                                                                options={entityIdArr}
                                                                value={values.teamMemberId}
                                                                onChange={(option) => {
                                                                    console.log('onChange option', option)
                                                                    setSelectedMemberName(option.target.label);
                                                                    // setFieldValue(
                                                                    //     "entityId",
                                                                    //     option?.target?.value ?? ""
                                                                    // );
                                                                    setSelectedMember(option.target); // Store the selected member
                                                                }}
                                                                // name="teamMemberId"
                                                                className={
                                                                    touched.orgId && errors.teamMemberId
                                                                        ? "is-invalid"
                                                                        : ""
                                                                }
                                                                onBlur={handleBlur}
                                                                touched={touched.teamMemberId}
                                                            />
                                                        </Col>
                                                        <Col xs="auto" className="mb-3 pb-1 pt-4">
                                                            <Button
                                                                type="button"
                                                                variant="outline-dark"
                                                                className="custom-min-width-85 mt-1 custom-height-42"
                                                                onClick={handleAssign} // Assign data on click
                                                            >
                                                                {t('ASSIGN')}
                                                            </Button>
                                                        </Col>

                                                        {newTeamMember?.length > 0 &&
                                                            <Col xs={12} className="mb-3 pb-1">
                                                                <div className="d-flex flex-column h-100 small table-cover-main">
                                                                    <Table striped bordered hover responsive className="mb-0">
                                                                        <thead className="fs-15">
                                                                            <tr>
                                                                                <th scope="col" className="text-nowrap">
                                                                                    Team Members
                                                                                </th>
                                                                                <th scope="col" className="custom-width-85 text-nowrap text-center">{t('ACTIONS')}</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {newTeamMember.map((member) => (
                                                                                <tr key={member.id}>
                                                                                    <td className="text-nowrap">{member.name}</td>
                                                                                    <td className="custom-width-85 text-nowrap text-center">
                                                                                        <AppTooltip title="Delete" placement="top">
                                                                                            <Button
                                                                                                className={`custom-width-26 custom-height-26 d-inline-flex align-items-center justify-content-center p-1 lh-1 fs-5 theme-delete-btn link-dark`}
                                                                                                variant="link"
                                                                                                onClick={() => deleteAction(member)}
                                                                                                aria-label="Delete"
                                                                                            >
                                                                                                <MdDelete size={18} />
                                                                                            </Button>
                                                                                        </AppTooltip>
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </Table>
                                                                </div>
                                                            </Col>
                                                        }
                                                    </Row>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>

                                    <div className="theme-from-footer mt-auto border-top px-3 mx-n3 pt-3">
                                        <Stack
                                            direction="horizontal"
                                            gap={3}
                                            className="justify-content-end flex-wrap"
                                        >
                                            <Link
                                                to={"/team-management"}
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
                modalBodyContent={`${t('ARE YOU SURE, YOU WANT TO DELETE THE TEAM MEMBER')} - ${deleteId} - ${selectedRow?.name}?`}
                handleAction={() => recordDelete(deleteId || selectedRow?.userId)}
                buttonName={t('DELETE')}
                ActionButtonVariant={t('CANCEL')}
            />

        </React.Fragment>
    );
}