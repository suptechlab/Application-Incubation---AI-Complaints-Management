import { useQuery } from "@tanstack/react-query";
import qs from "qs";
import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { MdDelete, MdEdit } from "react-icons/md";
import { useLocation } from "react-router-dom";
import CommonDataTable from "../../../components/CommonDataTable";
import DataGridActions from "../../../components/DataGridActions";
import GenericModal from "../../../components/GenericModal";
import ListingSearchForm from "../../../components/ListingSearchForm";
import Loader from "../../../components/Loader";
import PageHeader from "../../../components/PageHeader";
import { handleDeleteUser, handleGetUsers } from "../../../services/user.service";

export default function TeamManagementList() {

    const location = useLocation();
    const { t } = useTranslation(); // use the translation hook
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

    const [loading, setLoading] = useState(false);
    const [selectedRow, setSelectedRow] = useState();
    const [deleteShow, setDeleteShow] = useState(false);
    const [deleteId, setDeleteId] = useState();

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
                header: () => t('Team Name'),
                enableSorting: true,
            },
            {
                accessorFn: (row) => row.roles[0].name ?? "N/A",
                id: "claimTypeName",
                header: () => t('DESCRIPTION'),
                enableSorting: false,
            },
            {
                accessorFn: (row) => row.email,
                id: "email",
                header: () => t('ASSOCIATION'),
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
                                name: "edit",
                                enabled: true,
                                type: "link",
                                title: "Edit",
                                icon: <MdEdit size={18} />,
                            },
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

    useEffect(() => {
        setPagination({
            pageIndex: 0,
            pageSize: 10,
        });
    }, [filter]);

    return (
        <React.Fragment>
            <Loader isLoading={loading} />
            <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
                <PageHeader
                    title={t('TEAM MANAGEMENT')}
                    actions={[{ label: t('ADD NEW'), to: "/team-management/add", variant: "warning" }]}
                />
                <Card className="border-0 flex-grow-1 d-flex flex-column shadow">
                    <Card.Body className="d-flex flex-column">
                        <ListingSearchForm filter={filter} setFilter={setFilter} />
                        <CommonDataTable
                            columns={columns}
                            dataQuery={dataQuery}
                            pagination={pagination}
                            setPagination={setPagination}
                            sorting={sorting}
                            setSorting={setSorting}
                        />
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