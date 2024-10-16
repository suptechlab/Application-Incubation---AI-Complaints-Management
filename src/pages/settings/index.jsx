
import { useQuery } from "@tanstack/react-query";
import qs from "qs";
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "reactstrap";
import Swal from "sweetalert2";

import {
    handleDeleteUser,
    handleGetUsers,
} from "../../services/user.service";

import Header from "./Header";
import SearchForm from "./SearchForm";
import TemplatesTable from "./SettingsTable";

export default function LlmConnection() {
    const navigate = useNavigate();
    const location = useLocation();
    const params = qs.parse(location.search, { ignoreQueryPrefix: true });
    const [pagination, setPagination] = React.useState({
        pageIndex: params.page ? parseInt(params.page) - 1 : 0,
        pageSize: params.limit ? parseInt(params.limit) : 10,
    });

    const [sorting, setSorting] = React.useState([]);

    const [filter, setFilter] = React.useState({
        search: "",
        subscription: "free",
        status: "all",
    });

    const dataQuery = useQuery({
        queryKey: ["data", pagination, sorting, filter],
        queryFn: () => {
            const filterObj = qs.parse(qs.stringify(filter, { skipNulls: true }))
            Object.keys(filterObj).forEach(key => filterObj[key] === "" && delete filterObj[key])


            if (sorting.length === 0) {
                return handleGetUsers({
                    page: pagination.pageIndex + 1,
                    limit: pagination.pageSize,
                    ...filterObj,
                });
            } else {
                return handleGetUsers({
                    page: pagination.pageIndex + 1,
                    limit: pagination.pageSize,
                    sortBy: sorting
                        .map(
                            (sort) => `${sort.id}:${sort.desc ? "desc" : "asc"}`
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

    const columns = React.useMemo(
        () => [
            {
                accessorFn: (row) => row.title,
                id: "title",
                header: () => "Title",
            },

            {
                id: "actions",
                isAction: true,
                cell: (info) => {
                    return (
                        <div className="d-flex items-center gap-2">
                            <div
                                onClick={() => {
                                    navigate(`/settings/${info.row.original.id}`);
                                }}
                            >
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M2.99878 17.4613V20.5013C2.99878 20.7813 3.21878 21.0013 3.49878 21.0013H6.53878C6.66878 21.0013 6.79878 20.9513 6.88878 20.8513L17.8088 9.94128L14.0588 6.19128L3.14878 17.1013C3.04878 17.2013 2.99878 17.3213 2.99878 17.4613ZM20.7088 7.04128C21.0988 6.65128 21.0988 6.02128 20.7088 5.63128L18.3688 3.29128C17.9788 2.90128 17.3488 2.90128 16.9588 3.29128L15.1288 5.12128L18.8788 8.87128L20.7088 7.04128Z"
                                        fill="#2F61A8"
                                    />
                                </svg>
                            </div>

                            <div>
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M13.404 3.00178C8.31401 2.86178 4.14401 6.95178 4.14401 12.0018H2.35401C1.90401 12.0018 1.68401 12.5418 2.00401 12.8518L4.79401 15.6518C4.99401 15.8518 5.30401 15.8518 5.50401 15.6518L8.29401 12.8518C8.60401 12.5418 8.38401 12.0018 7.93401 12.0018H6.14401C6.14401 8.10178 9.32401 4.95178 13.244 5.00178C16.964 5.05178 20.094 8.18178 20.144 11.9018C20.194 15.8118 17.044 19.0018 13.144 19.0018C11.534 19.0018 10.044 18.4518 8.86401 17.5218C8.46401 17.2118 7.90401 17.2418 7.54401 17.6018C7.12401 18.0218 7.15401 18.7318 7.62401 19.0918C9.14401 20.2918 11.054 21.0018 13.144 21.0018C18.194 21.0018 22.284 16.8318 22.144 11.7418C22.014 7.05178 18.094 3.13178 13.404 3.00178ZM12.894 8.00178C12.484 8.00178 12.144 8.34178 12.144 8.75178V12.4318C12.144 12.7818 12.334 13.1118 12.634 13.2918L15.754 15.1418C16.114 15.3518 16.574 15.2318 16.784 14.8818C16.994 14.5218 16.874 14.0618 16.524 13.8518L13.644 12.1418V8.74178C13.644 8.34178 13.304 8.00178 12.894 8.00178Z"
                                        fill="#2F61A8"
                                    />
                                </svg>
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
                                            Swal.fire(
                                                "Cancelled",
                                                "Your data is safe :)",
                                                "error"
                                            );
                                        }
                                    });
                                }}
                            >
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V9C18 7.9 17.1 7 16 7H8C6.9 7 6 7.9 6 9V19ZM18 4H15.5L14.79 3.29C14.61 3.11 14.35 3 14.09 3H9.91C9.65 3 9.39 3.11 9.21 3.29L8.5 4H6C5.45 4 5 4.45 5 5C5 5.55 5.45 6 6 6H18C18.55 6 19 5.55 19 5C19 4.45 18.55 4 18 4Z"
                                        fill="#FB4D4D"
                                    />
                                </svg>
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
            <Header />
            <div className="flex-grow-1 pageContent position-relative pt-4 overflow-auto">
                <Card className="h-100 bg-white shadow-lg border-0 theme-card-cover">
                    <SearchForm filter={filter} setFilter={setFilter} />
                    <TemplatesTable
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
