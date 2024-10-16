import moment from "moment";
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "reactstrap";
import Swal from "sweetalert2";
import { useQuery } from "@tanstack/react-query";
import qs from "qs";

import {
    handleDeleteUser,
    handleGetUsers,
    handleUpdateUser,
} from "../../../services/user.service";

import Header from "./Header";
import SearchForm from "./SearchForm";
import UsersTable from "./UserTransactionsTable";
import UserTransactionsTable from "../UsersTable";

export default function UserList() {
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
                accessorFn: (row) => row.name,
                id: "type",
                header: () => "Transaction Type",
            },
            {
                accessorFn: (row) => row.name,
                id: "date",
                header: () => "Transaction Date",
            },

            {
                accessorFn: (row) => row.name,
                id: "date",
                header: () => "Period",
            },

            {
                accessorFn: (row) => row.name,
                id: "date",
                header: () => "Amount",
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
                    <UserTransactionsTable
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
