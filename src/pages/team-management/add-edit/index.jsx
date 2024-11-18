import { useQuery } from "@tanstack/react-query";
import { Formik, Form as FormikForm } from "formik";
import qs from "qs";
import React, { useEffect, useState } from "react";
import { Button, Card, Col, Row, Stack } from "react-bootstrap";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { MdDelete } from "react-icons/md";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import CommonDataTable from "../../../components/CommonDataTable";
import DataGridActions from "../../../components/DataGridActions";
import FormInput from "../../../components/FormInput";
import GenericModal from "../../../components/GenericModal";
import Loader from "../../../components/Loader";
import PageHeader from "../../../components/PageHeader";
import ReactSelect from "../../../components/ReactSelect";
import { handleAddUser, handleDeleteUser, handleGetUserById, handleGetUsers, handleUpdateUser } from "../../../services/user.service";
import { validationSchema } from "../../../validations/teamManagement.validation";

export default function TeamManagementAddEdit() {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;
    const [userData, setUserData] = useState([]);
    const { t } = useTranslation();
    const [initialValues, setInitialValues] = useState({
        entityName: "",
        teamName: "",
        description: "",
        memberName: "",
    });

    const location = useLocation();
    const params = qs.parse(location.search, { ignoreQueryPrefix: true });
    const [pagination, setPagination] = React.useState({
        pageIndex: params.page ? parseInt(params.page) - 1 : 0,
        pageSize: params.limit ? parseInt(params.limit) : 10,
    });

    const [sorting, setSorting] = React.useState([]);

    const [filter, setFilter] = React.useState({
        search: "",
        subscription: "",
        status: "",
    });
    const [selectedRow, setSelectedRow] = useState();
    const [deleteShow, setDeleteShow] = useState(false);
    const [deleteId, setDeleteId] = useState();

    useEffect(() => {
        if (isEdit) {
            setLoading(true);
            handleGetUserById(id).then((response) => {
                setUserData(response.data);
                setInitialValues({
                    name: response.data?.name ? response.data?.name : "",
                    email: response.data?.email ? response.data?.email : "",
                    roleId: response.data?.roleId ?? "",
                });
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, [id, isEdit]);

    const onSubmit = async (values, actions) => {
        setLoading(true);

        try {
            if (isEdit) {
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

    const dataQuery = useQuery({
        queryKey: ["data", pagination, sorting, filter],
        queryFn: () => {
            const filterObj = qs.parse(qs.stringify(filter, { skipNulls: true }));
            Object.keys(filterObj).forEach(
                (key) => filterObj[key] === "" && delete filterObj[key]
            );

            if (sorting.length === 0) {
                return handleGetUsers({
                    page: pagination.pageIndex,
                    size: pagination.pageSize,
                    ...filterObj,
                });
            } else {
                return handleGetUsers({
                    page: pagination.pageIndex,
                    size: pagination.pageSize,
                    sort: sorting
                        .map((sort) => `${sort.id},${sort.desc ? "desc" : "asc"}`)
                        .join(","),
                    ...filterObj,
                });
            }
        },
    });

    //handle last page deletion item
    useEffect(() => {
        if (dataQuery.data?.data?.totalPages < pagination.pageIndex + 1) {
            setPagination({
                pageIndex: dataQuery.data?.data?.totalPages - 1,
                pageSize: 10,
            });
        }
    }, [dataQuery.data?.data?.totalPages]);

    //Handle Delete
    const deleteAction = (rowData) => {
        setSelectedRow(rowData);
        setDeleteId(rowData.id);
        setDeleteShow(true);
    };

    const recordDelete = async (deleteId) => {
        setLoading(true);
        try {
            await handleDeleteUser(deleteId);
            toast.success("Your data has been deleted successfully");
            dataQuery.refetch();
            setDeleteShow(false);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const columns = React.useMemo(
        () => [
            {
                accessorFn: (row) => row.name,
                id: "name",
                header: () => t('Team Members'),
                enableSorting: false,
            },
            {
                accessorFn: (row) => row.role,
                id: "role",
                header: () => t('Role'),
                enableSorting: false,
            },
            {
                id: "actions",
                isAction: true,
                cell: (rowData) => (
                    <DataGridActions
                        controlId="team-management"
                        rowData={rowData}
                        customButtons={[
                            {
                                name: "delete",
                                enabled: true,
                                type: "button",
                                title: "Delete",
                                icon: <MdDelete size={18} />,
                                handler: () => deleteAction(rowData.row.original),
                            },
                        ]}
                    />
                ),
                header: () => <div className="text-center">{t('ACTIONS')}</div>,
                enableSorting: false,
                size: "80",
            },
        ],
        []
    );

    return (
        <React.Fragment>
            <Loader isLoading={loading} />
            <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
                <PageHeader title={`${isEdit ? t('Edit Team') : t('Create New Team')}  `} />
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
                                        <Col sm={6} lg={4}>
                                            <ReactSelect
                                                label="Entity Name"
                                                error={errors.entityName}
                                                options={[{ label: "Select", value: "" }, { label: "Option 1", value: "option-1" }]}
                                                value={values.entityName}
                                                onChange={(option) => {
                                                    setFieldValue(
                                                        "entityName",
                                                        option?.target?.value ?? ""
                                                    );
                                                }}
                                                name="entityName"
                                                className={
                                                    touched.entityName && errors.entityName
                                                        ? "is-invalid"
                                                        : ""
                                                }
                                                onBlur={handleBlur}
                                                touched={touched.entityName}
                                            />
                                        </Col>
                                        <Col sm={6} lg={4}>
                                            <FormInput
                                                id="teamName"
                                                label="Team Name"
                                                name="teamName"
                                                type="text"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                error={errors.teamName}
                                                touched={touched.teamName}
                                                value={values.teamName || ""}
                                            />
                                        </Col>
                                        <Col lg={8}>
                                            <FormInput
                                                id="description"
                                                label="Team Description"
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
                                        <Col xs={12}>
                                            <h5 className="fw-semibold mb-1 border-bottom mb-3 py-2">Assign Team Members</h5>
                                            <Row>
                                                <Col lg={8}>
                                                    <Row className="gx-3">
                                                        <Col xs>
                                                            <ReactSelect
                                                                label="Member Name"
                                                                error={errors.memberName}
                                                                options={[{ label: "Select", value: "" }, { label: "Option 1", value: "option-1" }]}
                                                                value={values.memberName}
                                                                onChange={(option) => {
                                                                    setFieldValue(
                                                                        "memberName",
                                                                        option?.target?.value ?? ""
                                                                    );
                                                                }}
                                                                name="memberName"
                                                                className={
                                                                    touched.memberName && errors.memberName
                                                                        ? "is-invalid"
                                                                        : ""
                                                                }
                                                                onBlur={handleBlur}
                                                                touched={touched.memberName}
                                                            />
                                                        </Col>
                                                        <Col xs="auto" className="mb-3 pb-1 pt-4">
                                                            <Button
                                                                type="button"
                                                                variant="outline-dark"
                                                                className="custom-min-width-85 mt-1 custom-height-42"
                                                            >
                                                                Assign
                                                            </Button>
                                                        </Col>

                                                        <Col xs={12} className="mb-3 pb-1">
                                                            <CommonDataTable
                                                                columns={columns}
                                                                dataQuery={dataQuery}
                                                                pagination={pagination}
                                                                setPagination={setPagination}
                                                                sorting={sorting}
                                                                setSorting={setSorting}
                                                                showPagination={false}
                                                            />
                                                        </Col>
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
                modalHeaderTitle={`Delete Team Member`}
                modalBodyContent={`Are you sure, you want to delete the team member - ${selectedRow?.name}?`}
                handleAction={() => recordDelete(deleteId)}
                buttonName="Delete"
                ActionButtonVariant="danger"
            />
        </React.Fragment>
    );
}