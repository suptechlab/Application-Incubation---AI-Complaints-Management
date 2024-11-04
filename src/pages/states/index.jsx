import { useQuery } from "@tanstack/react-query";
import qs from "qs";
import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "reactstrap";
import Header from "./Header";
import SearchForm from "./SearchForm";
import StatesTable from "./StatesTable";
import StateModal from "./StateModal";
import { handleDeleteState, handleStatusChangeState,handleGetStatePagination } from "../../services/state.service";
import toast from 'react-hot-toast';
import Toggle from "../../components/Toggle";
import SvgIcons from "../../components/SVGIcons"
import { isAdminUser, getModulePermissions } from "../../utils/authorisedmodule";
import Swal from "sweetalert2";

export default function StatesList() {
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

    const permission = useRef({ addModule : false, editModule : false, deleteModule : false });
    useEffect(()=>{
        isAdminUser().then(response=>{
            console.log("User Is Admin Response::", response);
            if(response){
                permission.current.addModule = true;
                permission.current.editModule = true;
                permission.current.deleteModule = true;
            }else{
                getModulePermissions("State Master").then(response => {
                    if(response.includes("STATE_CREATE")){
                        permission.current.addModule = true;
                    }
                    if(response.includes("STATE_UPDATE")){
                        permission.current.editModule = true;
                    }
                    if(response.includes("STATE_DELETE")){
                        permission.current.deleteModule = true;
                    }
                }).catch(error => {
                    console.error("Error fetching permissions:", error);
                });
            }
        }).catch(error=>{
            console.error("Error get during to fetch User Type", error);
        })
        
    },[]);
    
    const toggle = () => setModal(!modal);

    const editState = (id) => {
        navigate(`/states/edit/${id}`);
    };

    const deleteState = async (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "Are you sure you want to delete this state?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, cancel!",
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                try {
                    handleDeleteState(id).then((responseDelete) => {
                        toast.success("State deleted successfully");
                        dataQuery.refetch();
                    }).catch((error) => {
                        toast.error(error.response.data.detail);
                    })
                } catch (error) {
                    toast.error(error.response.data.detail);
                }
            } else {

            }
        })
    };


    const changeStatus = async (id, currentStatus) => {
        try {
            await handleStatusChangeState(id, !currentStatus );
            toast.success("State status updated successfully");
            dataQuery.refetch();
        } catch (error) {
            toast.error("Error updating state status");
        }
    };

    const dataQuery = useQuery({
        queryKey: ["data", pagination, sorting, filter],
        queryFn: () => {
            const filterObj = qs.parse(qs.stringify(filter, { skipNulls: true }));
            Object.keys(filterObj).forEach(key => filterObj[key] === "" && delete filterObj[key]);

            if (sorting.length === 0) {
                return handleGetStatePagination({
                    page: pagination.pageIndex,
                    size: pagination.pageSize,
                    ...filterObj,
                });
            } else {
                return handleGetStatePagination({
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
                accessorFn: (row) => row.stateName,
                id: "stateName",
                header: () => "State Name",
                enableSorting: true,
            },
            {
                accessorFn: (row) => row.stateCode != null  ? row.stateCode : '-',
                id: "stateCode",
                header: () => "State Code",
                enableSorting: true,
            },
            {
                cell: (info) => {
                    console.log('rowstatus 100->',info?.row?.original?.status);
                    return ( 
                    
                    <Toggle
                        id={`status-${info?.row?.original?.id}`}
                        key={"status"}
                        // label="Status"
                        name="status"
                        value={info?.row?.original?.status }
                        checked={info?.row?.original?.status }
                        onChange={() => changeStatus(info?.row?.original?.id, info?.row?.original?.status)}
                    />
                    )
                },
                id: "status",
                header: () => "Status",
            },
            {
                id: "actions",
                className:"action",
                isAction: true,
                cell: (info) => {
                    return (
                        <div className="d-flex items-center gap-2 justify-content-center custom-100">
                            { permission.current.editModule ?
                            <div
                                onClick={() => {
                                    editState(info.row.original.id);
                                }}
                            >
                                <span className=''>{SvgIcons.editIcon}</span>
                                
                            </div> : '' }

                            { permission.current.deleteModule?
                            <div
                                onClick={() => {
                                    deleteState(info.row.original.id);
                                }}
                            >
                                <span className=''>{SvgIcons.deleteIcon}</span>
                                
                            </div> : '' }
                        </div>
                    );
                },
                header: () => <div className="text-center">Actions</div>,
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
            { permission.current.addModule?<Header toggle={toggle} /> : '' }
                <div className="flex-grow-1 pageContent position-relative pt-4 overflow-auto">
                    <Card className="h-100 bg-white shadow-lg border-0 theme-card-cover">
                        <SearchForm filter={filter} setFilter={setFilter} />
                        <StatesTable
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
            <StateModal modal={modal} toggle={toggle} />
        </React.Fragment>
    );
}
