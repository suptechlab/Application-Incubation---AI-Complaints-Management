import { useQuery } from "@tanstack/react-query";
import qs from "qs";
import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Stack } from "reactstrap";
import Header from "./Header";
import SearchForm from "./SearchForm";
import DistrictsTable from "./DistrictsTable";
import DistrictModal from "./DistrictModal";
import { handleGetDistricts, handleEditDistricts, handleDeleteDistrict } from "../../services/district.service";  // Update the import to the district service
import Toggle from "../../components/Toggle";
import toast from "react-hot-toast";
import SvgIcons from "../../components/SVGIcons"
import { getModulePermissions, isAdminUser } from "../../utils/authorisedmodule";
import Swal from "sweetalert2";
export default function DistrictsList() {
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

    const permission = useRef({ addModule : false, editModule : false, deleteModule : false });
    useEffect(()=>{
        isAdminUser().then(response=>{
            if(response){
                permission.current.addModule = true;
                permission.current.editModule = true;
                permission.current.deleteModule = true;
            }else{
                getModulePermissions("District Master").then(response => {
                    if(response.includes("DISTRICT_CREATE")){
                        permission.current.addModule = true;
                    }
                    if(response.includes("DISTRICT_UPDATE")){
                        permission.current.editModule = true;
                    }
                    if(response.includes("DISTRICT_DELETE")){
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

    const editDistricts = async (id) => {
        navigate(`/districts/edit/${id}`);
    };

    const deleteDistrict = async (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "Are you sure you want to delete this district?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, cancel!",
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                try {
                    handleDeleteDistrict(id).then((responseDelete) => {
                        toast.success("District deleted successfully");
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

    const dataQuery = useQuery({
        queryKey: ["data", pagination, sorting, filter],
        queryFn: () => {
            const filterObj = qs.parse(qs.stringify(filter, { skipNulls: true }));
            Object.keys(filterObj).forEach(key => filterObj[key] === "" && delete filterObj[key]);

            if (sorting.length === 0) {
                return handleGetDistricts({
                    page: pagination.pageIndex,
                    size: pagination.pageSize,
                    ...filterObj,
                });
            } else {
                return handleGetDistricts({
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

    const changeStatus = async (id, currentStatus) => {
        try {
            await handleEditDistricts(id, { status: !currentStatus });
            toast.success("State status updated successfully");
            dataQuery.refetch();
        } catch (error) {
            toast.error("Error updating state status");
        }
    };

    useEffect(() => {
        if (dataQuery.data?.data?.totalPages < pagination.pageIndex + 1) {
            setPagination({
                pageIndex: dataQuery.data?.data?.totalPages - 1,
                pageSize: 10,
            });
        }
    }, [dataQuery.data?.data?.totalPages]);
    // }, []);

    const columns = React.useMemo(
        () => [
            {
                accessorFn: (row) => row.districtName,
                id: "districtName",
                header: () => "District Name",
            },
            {
                accessorFn: (row) => row.districtCode != null  ? row.districtCode : '-',
                id: "districtCode",
                header: () => "District Code",
                enableSorting: true,
            },
            {
                accessorFn: (row) => row.stateName,
                id: "stateName",
                header: () => "State Name",
            },
            {
                // accessorFn: (row) => row.status ? "Active" : "Inactive",
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
                isAction: true,
                cell: (info) => {
                    return (
                        <div className="d-flex items-center gap-2 justify-content-center">
                            { permission.current.editModule ?
                            <div
                                onClick={() => {
                                    console.log("Info::", info.row.original.id);
                                    editDistricts(info.row.original.id);
                                }}
                            >
                                <span className=''>{SvgIcons.editIcon}</span>
                            </div> : <div></div> }

                            { permission.current.deleteModule?
                            <div
                                onClick={() => {
                                    deleteDistrict(info.row.original.id);
                                }}
                            >
                                <span className=''>{SvgIcons.deleteIcon}</span>
                            </div> : ''}
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
            { permission.current.addModule?<Header toggle={toggle} />:""}
                <div className="flex-grow-1 pageContent position-relative pt-4 overflow-auto">
                    <Card className="h-100 bg-white shadow-lg border-0 theme-card-cover">
                        <SearchForm filter={filter} setFilter={setFilter} />
                        <DistrictsTable
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
            <DistrictModal modal={modal} toggle={toggle} />
        </React.Fragment>
    );
}
