import { useQuery } from "@tanstack/react-query";
import qs from "qs";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "reactstrap";
import Header from "./Header";
import SearchForm from "./SearchForm";
import RoleRightsTable from "./RoleRightsTable";
import RoleRightsModal from "./RoleRightsModal";
import { handleGetRoleRights, handleDeleteRoleRight } from "../../services/rolerights.service"; // Update the import to include delete function
import toast from 'react-hot-toast';
import SvgIcons from "../../components/SVGIcons"
export default function RoleRightsList() {
    const location = useLocation();
    const navigate = useNavigate();
    const params = qs.parse(location.search, { ignoreQueryPrefix: true });

    const [pagination, setPagination] = useState({
        pageIndex: params.page ? parseInt(params.page) - 1 : 0,
        pageSize: params.limit ? parseInt(params.limit) : 10,
    });
    const [modal, setModal] = useState(false);
    const [sorting, setSorting] = useState([]);
    const [filter, setFilter] = useState({
        search: "",
    });

    const toggle = () => setModal(!modal);

    const editRoleRight = async (id) => {
        navigate(`/role-rights/edit/${id}`);
    };

    const deleteRoleRight = async (id) => {
        if (window.confirm("Are you sure you want to delete this role right?")) {
            try {
                await handleDeleteRoleRight(id);
                toast.success("Role right deleted successfully");
                dataQuery.refetch();
            } catch (error) {
                toast.error(error.response.data.detail);
            }
        }
    };

    const dataQuery = useQuery({
        queryKey: ["data", pagination, sorting, filter],
        queryFn: () => {
            const filterObj = qs.parse(qs.stringify(filter, { skipNulls: true }));
            Object.keys(filterObj).forEach(key => filterObj[key] === "" && delete filterObj[key]);

            if (sorting.length === 0) {
                return handleGetRoleRights({
                    page: pagination.pageIndex,
                    size: pagination.pageSize,
                    ...filterObj,
                });
            } else {
                return handleGetRoleRights({
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
                id: "name",
                header: () => "Name",
            },
            {
                accessorFn: (row) => row.description,
                id: "description",
                header: () => "Description",
            },
            {
                id: "actions",
                isAction: true,
                cell: (info) => {
                    return (
                        <div className="d-flex items-center gap-2 justify-content-center">
                            <div
                                onClick={() => {
                                    console.log("Info::", info.row.original.id);
                                    editRoleRight(info.row.original.id);
                                }}
                            >
                                <span className=''>{SvgIcons.editIcon}</span>
                            </div>
                            <div
                                onClick={() => {
                                    deleteRoleRight(info.row.original.id);
                                }}
                            >
                                <span className=''>{SvgIcons.deleteIcon}</span>
                            </div>
                        </div>
                    );
                },
                header: () => <div className="d-flex justify-content-center">Actions</div>,
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

        <React.Fragment>
            <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
                <Header toggle={toggle} />
                <div className="flex-grow-1 pageContent position-relative pt-4 overflow-auto">
                    <Card className="h-100 bg-white shadow-lg border-0 theme-card-cover">
                        <SearchForm filter={filter} setFilter={setFilter} />
                        {/* <pre>{JSON.stringify(dataQuery.data.data,null,2)}</pre> */}
                        <RoleRightsTable
                            columns={columns}
                            dataQuery={dataQuery?.data?.data}
                            pagination={pagination}
                            setPagination={setPagination}
                            sorting={sorting}
                            setSorting={setSorting}
                        />
                    </Card>
                </div>
            </div>
            <RoleRightsModal modal={modal} toggle={toggle} />
        </React.Fragment>
    );
}
