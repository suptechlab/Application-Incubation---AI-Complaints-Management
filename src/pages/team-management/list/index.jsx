import { useQuery, useQueryClient } from "@tanstack/react-query";
import qs from "qs";
import React, { useEffect, useRef, useState } from "react";
import { Card } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { MdEdit } from "react-icons/md";
import { useLocation } from "react-router-dom";
import CommonDataTable from "../../../components/CommonDataTable";
import DataGridActions from "../../../components/DataGridActions";
import ListingSearchForm from "../../../components/ListingSearchForm";
import Loader from "../../../components/Loader";
import PageHeader from "../../../components/PageHeader";
import { handleGetTableData, handleStatusChangeState } from "../../../services/teamManagment.service";
import toast from "react-hot-toast";
import Toggle from "../../../components/Toggle";

export default function TeamManagementList() {

    const location = useLocation();
    const queryClient = useQueryClient();
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

    // Permissoin work
    const permission = useRef({ addModule: false, editModule: false, deleteModule: false, statusModule: false, });
    useEffect(() => {
        // isAdminUser().then(response => {
        //     if (response) {
        //         permission.current.statusModule = true;
        //         permission.current.addModule = true;
        //         permission.current.editModule = true;
        //         permission.current.deleteModule = true;
        //     } else {
        //         getModulePermissions("FI User").then(response => {
        //             console.log('response',response)
        //             if (response.includes("FI_USER_CREATE_BY_FI")) {
        //                 permission.current.addModule = true;
        //             }
        //             if (response.includes("FI_UPDATE_CREATE_BY_FI")) {
        //                 permission.current.editModule = true;
        //             }
        //             if (response.includes("FI_STATUS_CHANGE_CREATE_BY_FI")) {
        //                 permission.current.statusModule = true;
        //             }
        //         }).catch(error => {
        //             console.error("Error fetching permissions:", error);
        //         });
        //     }
        // }).catch(error => {
        //     console.error("Error get during to fetch User Type", error);
        // })

    }, []);

    const dataQuery = useQuery({
        queryKey: ["data", pagination, sorting, filter],
        queryFn: async () => {

            setLoading(true);

            try {
                const filterObj = qs.parse(qs.stringify(filter, { skipNulls: true }));
                Object.keys(filterObj).forEach(
                    (key) => filterObj[key] === "" && delete filterObj[key]
                );

                let response;
                if (sorting.length === 0) {
                    response = await handleGetTableData({
                        page: pagination.pageIndex,
                        size: pagination.pageSize,
                        ...filterObj,
                    });
                } else {
                    response = await handleGetTableData({
                        page: pagination.pageIndex,
                        size: pagination.pageSize,
                        sort: sorting
                            .map((sort) => `${sort.id},${sort.desc ? "desc" : "asc"}`)
                            .join(","),
                        ...filterObj,
                    });
                }

                // Return the API response data
                return response;
            } catch (error) {
                console.error("Error fetching data", error);
                // Optionally, handle errors here
            } finally {
                // Set loading state to false when the request finishes (whether successful or not)
                setLoading(false);
            }
        },
        staleTime: 0, // Data is always stale, so it refetches
        cacheTime: 0, // Cache expires immediately
        refetchOnWindowFocus: false, // Disable refetching on window focus
        refetchOnMount: false, // Prevent refetching on component remount
        retry: 0, //Disable retry on failure
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

    // const changeStatus = async (id, currentStatus) => {
    //     setLoading(true)
    //     let toggleStatus = currentStatus === true ? false : true;
    //     handleStatusChangeState(id, toggleStatus).then(response => {
    //         toast.success(t("STATUS UPDATED"));
    //         dataQuery.refetch();
    //     }).catch((error) => {
    //         if (error?.response?.data?.errorDescription) {
    //             toast.error(error?.response?.data?.errorDescription);
    //         } else {
    //             toast.error(error?.message ?? t("STATUS UPDATE ERROR"));
    //         }
    //     }).finally(() => {
    //         setLoading(false)
    //     })
    // };

    const columns = React.useMemo(
        () => [
            {
                accessorFn: (row) => row.teamName,
                id: "teamName",
                header: () => t('TEAM NAME'),
                enableSorting: true,
            },
            {
                accessorFn: (row) => row.description,
                id: "description",
                header: () => t('DESCRIPTION'),
                enableSorting: true,
            },
            {
                accessorFn: (row) => row.entityType ?? t('N/A'),
                id: "entityType",
                header: () => t('ASSOCIATION'),
                enableSorting: true,
            },
            // {
            //     id: "status",
            //     isAction: true,
            //     cell: (info) => {

            //         if (info?.row?.original?.status === true || info?.row?.original?.status === false) {
            //             return (
            //                 //   permission.current.statusModule ?
            //                 <Toggle
            //                     id={`status-${info?.row?.original?.id}`}
            //                     key={"status"}
            //                     name="status"
            //                     value={info?.row?.original?.status === true}
            //                     checked={info?.row?.original?.status === true}
            //                     onChange={() =>
            //                         changeStatus(
            //                             info?.row?.original?.id,
            //                             info?.row?.original?.status
            //                         )
            //                     }
            //                     tooltip={info?.row?.original?.status ? t("ACTIVE") : t("BLOCKED")}
            //                 />
            //                 //   : ''
            //             );
            //         } else {
            //             return <span>{info?.row?.original?.status} </span>
            //         }
            //     },
            //     header: () => t("STATUS"),
            //     enableSorting: false,
            //     size: "80",
            // },
            // Conditionally add the "actions" column
            // ...(permission.current.editModule
            //     ? [
            {
                id: "actions",
                isAction: true,
                cell: (rowData) => (
                    <div className="pointer">
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
                            ]}
                        />
                    </div>
                ),
                header: () => <div className="text-center">{t("ACTIONS")}</div>,
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

    useEffect(() => {
        return () => {
            queryClient.removeQueries("data");
        };
    }, [queryClient]);

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
                        <ListingSearchForm filter={filter} setFilter={setFilter} hideFilter={true}/>
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
        </React.Fragment>
    );
}