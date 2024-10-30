import moment from "moment";
import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Card } from "reactstrap";
import Swal from "sweetalert2";
import { useQuery } from "@tanstack/react-query";
import qs from "qs";
import SvgIcons from "../../components/SVGIcons"

import {
    handleDeleteUser,
    handleGetUsers,
    handleUserResetPassword,
    handleStatusChangeState,
} from "../../services/user.service";

import Header from "./Header";
import SearchForm from "./SearchForm";
import UsersTable from "./UsersTable";
import Toggle from "../../components/Toggle";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Stack } from "react-bootstrap";

export default function UserList() {
    const navigate = useNavigate();
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

    const dataQuery = useQuery({
        queryKey: ["data", pagination, sorting, filter],
        queryFn: () => {
            const filterObj = qs.parse(qs.stringify(filter, { skipNulls: true }))
            Object.keys(filterObj).forEach(key => filterObj[key] === "" && delete filterObj[key])


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
                        .map(
                            (sort) => `${sort.id},${sort.desc ? "desc" : "asc"}`
                        )
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

    const changeStatus = async (id, currentStatus) => {
        try {
            await handleStatusChangeState(id, !currentStatus );
            toast.success("State status updated successfully");
            dataQuery.refetch();
        } catch (error) {
            toast.error("Error updating state status");
        }
    };

    const columns = React.useMemo( 
        () => [
            {
                accessorFn: (row) => row.name,
                id: "name",
                header: () => "Name",
            },
            {
                accessorFn: (row) => row.claimTypeName ?? 'N/A',
                id: "claimTypeName",
                header: () => "Role",
                enableSorting: false,
            },
            {
                accessorFn: (row) => row.email,
                id: "email",
                header: () => "Email",
            },
            {
                accessorFn: (row) => row.mobileNo,
                id: "mobileNo",
                header: () => "Phone",
                cell: (info) => {
                    return (
                        <span>
                            {info.row.original.mobileCode}{" "}
                            {info.row.original.mobileNo}
                        </span>
                    );
                },
            },
            
           
            {
                accessorFn: (row) => row.createdAt,
                id: "createdAt",
                header: () => "Created At",
                cell: (info) => {
                    return (
                        <span>
                            {moment(info.row.original.createdAt).format(
                                "D/M/YYYY hh:mm A"
                            )}
                        </span>
                    );
                },
            },

            {
                cell: (info) => {
                    console.log('rowstatus 100->',info?.row?.original?.activated);
                    return ( 
                    
                    <Toggle
                        id={`status-${info?.row?.original?.id}`}
                        key={"status"}
                        // label="Status"
                        name="status"
                        value={info?.row?.original?.activated }
                        checked={info?.row?.original?.activated }
                        onChange={() => changeStatus(info?.row?.original?.id, info?.row?.original?.activated)}
                    />
                    )
                },
                id: "status",
                header: () => "Status",
            },
            

            
            {
                id: "actions",
                isAction: true,
                cell: (info) => {
                    return (
                        <div className="d-flex items-center gap-2">
                            <div
                                onClick={() => {
                                    navigate(`/users/edit/${info.row.original.id}`);
                                }}
                            >
                                <span className=''>{SvgIcons.editIcon}</span>
                            </div>

                            {/* <div onClick={() => {
                                        navigate(`/users/${info.row.original.id}/transactions`);
                                    }}
                            > */}
                            <div
                                onClick={() => {
                                    Swal.fire({
                                        title: "Reset Password",
                                        text: "Are you sure you want to reset password again?",
                                        icon: "warning",
                                        showCancelButton: true,
                                        confirmButtonText: "Yes!",
                                        cancelButtonText: "No, cancel!",
                                        reverseButtons: true,
                                    }).then((result) => {
                                        if (result.isConfirmed) {
                                            // Perform the delete operation here
                                            
                                            handleUserResetPassword(
                                                info.row.original.id
                                            ).then((response) => {
                                                // Refresh the data
                                                Swal.fire(
                                                    "Reset Password",
                                                    response.data.message,
                                                    "success"
                                                );
                                                dataQuery.refetch();
                                            });
                                        } else if (result.dismiss === Swal.DismissReason.cancel) {
                                            // Swal.fire(
                                            //     "Cancelled",
                                            //     "Your data is safe :)",
                                            //     "error"
                                            // );
                                        }
                                    });
                                }}
                            >
                                <span className='' >{SvgIcons.keyIcon}</span>
                                
                            </div>

                            <div
                                onClick={() => {
                                    Swal.fire({
                                        title: "Are you sure?",
                                        text: "You will not be able to recover this data!",
                                        icon: "warning",
                                        showCancelButton: true,
                                        confirmButtonText: "Yes, delete it!",
                                        cancelButtonText: "No, cancel!",
                                        reverseButtons: true,
                                    }).then((result) => {
                                        if (result.isConfirmed) {
                                            // Perform the delete operation here
                                            console.log(
                                                "Delete",
                                                info.row.original
                                            );
                                            handleDeleteUser(
                                                info.row.original.id
                                            ).then(() => {
                                                // Refresh the data
                                                Swal.fire(
                                                    "Deleted!",
                                                    "Your data has been deleted.",
                                                    "success"
                                                );
                                                dataQuery.refetch();
                                            });
                                        } else if (
                                            result.dismiss ===
                                            Swal.DismissReason.cancel
                                        ) {
                                            // Swal.fire(
                                            //     "Cancelled",
                                            //     "Your data is safe :)",
                                            //     "error"
                                            // );
                                        }
                                    });
                                }}
                            >
                                <span className=''>{SvgIcons.deleteIcon}</span>
                            </div>
                        </div>
                    );
                },
                header: () => "Actions",
                enableSorting: false,
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
        <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
            <div className="contentHeader p-1">
                <Stack
                    direction="horizontal"
                    gap={2}
                    className="flex-wrap justify-content-between custom-min-height-42"
                >
                    <h1 className="fw-semibold h4 mb-0 fs-22">
                    {t('USERS LIST')}
                    </h1>
                    <Link to={`/users/add`} 
                    className="fw-semibold fs-14 custom-width-85 bg-info text-white text-decoration-none rounded-2 p-2 text-center"  type="button" variant="info" size="sm">Add New</Link>
                
                </Stack>
            </div>
            <div className="flex-grow-1 pageContent position-relative pt-4 overflow-auto">
                <Card className="h-100 bg-white shadow-lg border-0 theme-card-cover">
                    <SearchForm filter={filter} setFilter={setFilter} />
                    <UsersTable
                        columns={columns}
                        dataQuery={dataQuery}
                        pagination={pagination}
                        setPagination={setPagination}
                        sorting={sorting}
                        setSorting={setSorting}
                    />
                </Card>
            </div>
        </div>
    );
}
