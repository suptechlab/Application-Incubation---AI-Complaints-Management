import { useQuery } from "@tanstack/react-query";
import moment from "moment/moment";
import qs from "qs";
import React, { useContext, useEffect, useState } from "react";
import { Card, Form, Stack } from "react-bootstrap";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { MdAttachFile, MdEdit } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";
import CommonDataTable from "../../../../components/CommonDataTable";
import InfoCards from "../../../../components/infoCards";
import Loader from "../../../../components/Loader";
import AppTooltip from "../../../../components/tooltip";
import { AuthenticationContext } from "../../../../contexts/authentication.context";
import { MasterDataContext } from "../../../../contexts/masters.context";
import { agentTicketToFIagent, agentTicketToSEPSagent, handleGetTicketList, ticketOverviewAPI } from "../../../../services/ticketmanagement.service";
import { calculateDaysDifference } from "../../../../utils/commonutils";
import AttachmentsModal from "../../modals/attachmentsModal";
import TicketsListFilters from "../filters/index";
import { TbBellRingingFilled } from "react-icons/tb";
import DataGridActions from "../../../../components/DataGridActions";
import EditTicketModal from "../../modals/editTicketModal";

const TicketsNormalList = ({ selectedTab }) => {

    const location = useLocation();
    const { currentUser, permissions = {} } = useContext(AuthenticationContext);
    const { masterData } = useContext(MasterDataContext);

      const [editModal, setEditModal] = useState({ row: {}, open: false })


    const editToggle = () => setEditModal({ row: {}, open: !editModal?.open });
    // PERMISSIONS work
    const [permissionsState, setPermissionsState] = React.useState({
        assignPermission: false,
        editModule : false,
    });

    useEffect(() => {
        const updatedPermissions = {
            assignPermission: false,
            editModule:false
        };
        if (currentUser === "SYSTEM_ADMIN") {
            updatedPermissions.assignPermission = true;
            updatedPermissions.editModule = true;
        } else {
            const permissionArr = permissions['Ticket'] ?? [];
            if (["TICKET_ASSIGNED_TO_AGENT_FI", "TICKET_ASSIGNED_TO_AGENT_SEPS"].some(permission => permissionArr.includes(permission))) {
                updatedPermissions.assignPermission = true;
            }
            if (["TICKET_UPDATED_BY_SEPS", "TICKET_UPDATED_BY_FI"].some(permission => permissionArr.includes(permission))) {
                updatedPermissions.editModule = true;
            }
        }

        setPermissionsState(updatedPermissions);
    }, [permissions, currentUser]);

    const { t } = useTranslation()
    const params = qs.parse(location.search, { ignoreQueryPrefix: true });
    const [pagination, setPagination] = React.useState({
        pageIndex: params.page ? parseInt(params.page) - 1 : 0,
        pageSize: params.limit ? parseInt(params.limit) : 10,
    });
    const [columns, setColumns] = useState([]);

    const [sorting, setSorting] = React.useState([
        {
            "id": "slaBreachDate",
            "asc": true
        }
    ]);
    const [filter, setFilter] = React.useState({
        search: "",
        status: "",
        claimTypeId: "",
        instanceType:"",
        claimTicketPriority:"",
        claimTicketStatus:"",
        startDate:null,
        endDate :null
    });

    const [loading, setLoading] = useState(false);
    const [attachmentsModalShow, setAttachmentsModalShow] = useState(false);
    const [ticketIdsArr, setTicketIdsArr] = useState([]);

    const [clearTableSelection, setClearTableSelection] = useState(false)

    const [claimStatsData, setClaimsStatsData] = useState([])

    const dataQuery = useQuery({
        queryKey: ["data", pagination, sorting, filter],
        queryFn: async () => {
            // Set loading state to true before the request starts
            setLoading(true);

            try {
                const filterObj = qs.parse(qs.stringify(filter, { skipNulls: true }));
                Object.keys(filterObj).forEach(key => filterObj[key] === "" && delete filterObj[key]);

                // Make the API request based on sorting
                let response;
                if (sorting.length === 0) {
                    response = await handleGetTicketList({
                        page: pagination.pageIndex,
                        size: pagination.pageSize,
                        ...filterObj,
                    });
                } else {
                    response = await handleGetTicketList({
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

    // The color class based on the status
    const getPriorityClass = (priority) => {
        switch (priority) {
            case 'LOW':
                return 'text-success';
            case 'MEDIUM':
                return 'text-custom-warning';
            case 'HIGH':
                return 'text-custom-danger';
            default:
                return 'text-body';
        }
    };

    // The color class based on the status
    const getStatusClass = (status) => {
        switch (status) {
            case 'CLOSED':
                return 'bg-success text-success';
            case 'IN_PROGRESS':
                return 'bg-custom-info text-custom-info';
            case 'NEW':
                return 'bg-custom-primary text-custom-primary';
            case 'ASSIGNED':
                return 'bg-custom-warning text-custom-warning';
            case 'REJECTED':
                return 'bg-custom-danger text-custom-danger';
            default:
                return 'bg-body text-body';
        }
    };

    // Handle Attachments Button
    const handleAttachmentsClick = () => {
        setAttachmentsModalShow(true)
    }


    const getFilteredColumns = (columnsArray) => {
        // All available column definitions
        const allColumns = [
            {
                id: 'select-col',
                header: ({ table }) => (
                    <Form.Check
                        className="form-check-cursor"
                        checked={table.getIsAllRowsSelected()}
                        indeterminate={table.getIsSomeRowsSelected()}
                        onChange={(e) => {
                            table.toggleAllRowsSelected(e.target.checked);

                            // Filter rows based on status and only include rows that are not "CLOSED" or "REJECTED"
                            const allSelectedIds = e.target.checked
                                ? table.getRowModel().rows
                                    .filter((row) => (
                                        (currentUser === "SEPS_USER" || currentUser === "SYSTEM_ADMIN") && row?.original?.instanceType === 'SECOND_INSTANCE' && row?.original?.status !== "CLOSED" && row?.original?.status !== "REJECTED")
                                        ||
                                        (row?.original?.status !== "CLOSED" && row?.original?.status !== "REJECTED" && currentUser !== "SEPS_USER" && currentUser !== "SYSTEM_ADMIN"))
                                    .map((row) => row.original.id)
                                : [];

                            setTicketIdsArr(allSelectedIds);
                            setClearTableSelection(false);
                        }}

                    // onChange={(e) => {
                    //     table.toggleAllRowsSelected(e.target.checked);
                    //     const allSelectedIds = e.target.checked
                    //         ? table.getRowModel().rows.map((row) => row.original.id)
                    //         : [];
                    //     setTicketIdsArr(allSelectedIds);
                    //     setClearTableSelection(false);
                    // }}
                    />
                ),
                cell: ({ row }) => (

                    (row?.original?.status !== "CLOSED" && row?.original?.status !== "REJECTED" && (
                        ((currentUser === "SEPS_USER" || currentUser === "SYSTEM_ADMIN") && row?.original?.instanceType === 'SECOND_INSTANCE') ||
                        (currentUser === "FI_USER" && row?.original?.instanceType === 'FIRST_INSTANCE')


                        // (currentUser !== "SEPS_USER" && currentUser !== "FI_USER")
                    )) ? (
                        <Form.Check
                            className="form-check-cursor"
                            checked={row.getIsSelected()}
                            disabled={!row.getCanSelect()}
                            onChange={(e) => {
                                row.toggleSelected(e.target.checked);

                                if (e.target.checked) {
                                    setTicketIdsArr((prev) => [...prev, row.original.id]);
                                } else {
                                    setTicketIdsArr((prev) => prev.filter((id) => id !== row.original.id));
                                }
                                setClearTableSelection(false);
                            }}
                        />
                    ) : null
                ),
                size: "15",
                meta: {
                    thClassName: 'pe-0 fs-6',
                    tdClassName: 'pe-0 fs-6',
                },
            },
            {
                accessorFn: (row) => row?.ticketId,
                id: "ticketId",
                header: () => t("TICKET_ID"),
                enableSorting: true,
                cell: ({ row }) => (
                    <Stack direction="horizontal" gap={2}>
                        {
                            (row?.original?.slaPopup && row?.original?.slaPopup !== null) &&
                            <TbBellRingingFilled className="ring text-primary" size={18} />
                        }
                        <Link className="text-decoration-none fw-semibold" to={`/tickets/view/${row?.original?.id}`}>
                            {"#" + row?.original?.ticketId}
                        </Link>
                        {row?.original?.haveClaimTicketDocuments && <MdAttachFile size={16} />}


                        {/* <AppTooltip title="Attachments">
                           <Button
                               variant="link"
                               className="p-0 border-0 link-dark"
                               onClick={handleAttachmentsClick}
                               aria-label="Attachments"
                           >
                               <MdAttachFile size={16} />
                           </Button>                   
                           </AppTooltip> */}
                    </Stack>
                ),
            },
            {
                accessorFn: (row) => row?.createdAt,
                id: "createdAt",
                header: () => t("CREATION_DATE"),
                enableSorting: true,
                cell: ({ row }) => (
                    row?.original?.createdAt
                        ? moment(row?.original?.createdAt).format("DD-MM-YYYY")
                        : ''
                ),
            },
            {
                accessorFn: (row) => row?.claimType?.name,
                id: "claimType",
                header: () => t("CLAIM TYPE"),
                enableSorting: true,
            },
            {
                accessorFn: (row) => row?.createdByUser?.name,
                id: "claimFiledBy",
                header: () => t("CLAIM_FILED_BY"),
                enableSorting: true,
            },
            {
                accessorFn: (row) => row?.organization?.razonSocial,
                id: "entity",
                header: () => t("ENTITY NAME"),
                enableSorting: false,
            },
            {
                accessorFn: (row) => row?.user?.name,
                id: "consumerName",
                header: () => t("CONSUMER_NAME"),
                enableSorting: false,
            },
            {
                accessorFn: (row) => row?.slaBreachDate,
                id: "slaBreachDate",
                header: () => "SLA",
                enableSorting: true,
                cell: ({ row }) => (
                    <span>{row?.original?.slaBreachDate ? calculateDaysDifference(row?.original?.slaBreachDate) + " " + t('DAYS') : 'N/A'}</span>
                )
            },
            {
                accessorFn: (row) => row?.instanceType,
                id: "instanceType",
                header: () => t("INSTANCE_TYPE"),
                enableSorting: false,
                cell: ({ row }) => (
                    <span>{(row?.original?.instanceType && masterData?.instanceType) && masterData?.instanceType[row?.original?.instanceType]}</span>
                )
            },
            {
                accessorFn: (row) => row?.priority,
                id: "priority",
                header: () => t("PRIORITY"),
                size: "100",
                cell: (rowData) => (
                    <span
                        className={`text-nowrap fw-semibold ${getPriorityClass(rowData.row.original.priority)}`}
                    >
                        {masterData?.claimTicketPriority[rowData?.row?.original?.priority]}
                    </span>
                ),
            },
            {
                accessorFn: (row) => row?.fiAgent,
                id: "fiAgent",
                header: () => t("FI_AGENT"),
                enableSorting: false,
                cell: ({ row }) => (
                    <span>{row?.original?.fiAgent?.name}</span>
                ),
            },
            ...(permissionsState.editModule ? [ {
                accessorFn: (row) => row?.action,
                id: "action",
                header: () => t("ACTION"),
                enableSorting: false,
                cell: (rowData) => (
                    <div className="pointer">
                    {
                        (rowData?.row?.original?.instanceType === 'FIRST_INSTANCE' && rowData?.row?.original?.status !=='CLOSED' && rowData?.row?.original?.status!=='REJECTED') && 
                        <DataGridActions
                            controlId="tickets"
                            rowData={rowData}
                            customButtons={[
                                {
                                    name: "edit",
                                    enabled: true,
                                    type: "button",
                                    title: "Edit",
                                    icon: <MdEdit size={18} />,
                                    handler: () => editClaimType(rowData?.row?.original),
                                },
                            ]}
                        />
                    }  
                    </div>
                ),
            },] : []),
           
            {
                accessorFn: (row) => row?.status,
                id: "status",
                header: () => t("STATUS"),
                size: "100",
                cell: (rowData) => (
                    rowData?.row?.original?.status === 'CLOSED' ? <AppTooltip title={masterData?.closedStatus[rowData?.row?.original?.closedStatus]}>
                        <span
                            className={`text-nowrap bg-opacity-10 custom-font-size-12 fw-semibold px-2 py-1 rounded-pill ${getStatusClass(rowData.row.original.status)}`}
                        >
                            {masterData?.claimTicketStatus[rowData.row.original.status]}
                        </span>
                    </AppTooltip> : <span
                        className={`text-nowrap bg-opacity-10 custom-font-size-12 fw-semibold px-2 py-1 rounded-pill ${getStatusClass(rowData.row.original.status)}`}
                    >
                        {masterData?.claimTicketStatus[rowData.row.original.status]}
                    </span>
                ),
            },
        ];

        // Filter and reorder the columns based on the input array
        return columnsArray.map((colId) => allColumns.find((col) => col.id === colId)).filter(Boolean);
    };

    const handleTicketAssignment = (agentId) => {
        // agentTicketToSEPSagent
        if (agentId && agentId !== '') {

            if (currentUser === "SEPS_USER" || currentUser === "SYSTEM_ADMIN") {
                agentTicketToSEPSagent(agentId, { ticketIds: ticketIdsArr }).then(response => {
                    toast.success(t("TICKETS ASSIGNED"));
                    setClearTableSelection(true)
                    setTicketIdsArr([])
                    dataQuery.refetch()
                    getClaimTypeStatsData()
                }).catch((error) => {
                    if (error?.response?.data?.errorDescription) {
                        toast.error(error?.response?.data?.errorDescription);
                    } else {
                        toast.error(error?.message ?? t("STATUS UPDATE ERROR"));
                    }
                }).finally(() => {
                    setLoading(false)
                })
            } else if (currentUser === "FI_USER") {
                //ASSIGN TICKET TO FI AGENT
                agentTicketToFIagent(agentId, { ticketIds: ticketIdsArr }).then(response => {
                    toast.success(t("TICKETS ASSIGNED"));
                    setClearTableSelection(true)
                    setTicketIdsArr([])
                    dataQuery.refetch()
                    getClaimTypeStatsData()
                }).catch((error) => {
                    if (error?.response?.data?.errorDescription) {
                        toast.error(error?.response?.data?.errorDescription);
                    } else {
                        toast.error(error?.message ?? t("STATUS UPDATE ERROR"));
                    }
                }).finally(() => {
                    setLoading(false)
                })
            } else {
                toast.warning("You are not allowed to assign tickets.")
            }
        }
    }
    useEffect(() => {
        setPagination({
            pageIndex: 0,
            pageSize: 10,
        });
    }, [filter]);

    useEffect(() => {
        if (selectedTab === 'allTickets') {
            dataQuery.refetch();
        }
    }, [selectedTab])

    // EDIT CLAIM TYPE
    const editClaimType = async (row) => {
        setEditModal({ row: row, open: !editModal?.open })
    };

    const getColumnsForUser = (currentUser) => {
        let selectedColumns = []; // Declare `selectedColumns` once in the parent scope
        // "consumerName", name of consumer
        switch (currentUser) {
            case 'FI_USER':
                selectedColumns = ["ticketId", "createdAt", "claimType", "fiAgent", "claimFiledBy", "slaBreachDate", "instanceType", "priority", "status","action"];
                break; // Use `break` to avoid executing further cases
            case 'FI_AGENT':
                selectedColumns = ["ticketId", "createdAt", "claimType", "claimFiledBy", "slaBreachDate", "instanceType", "priority", "status","action"];
                break;
            case 'SEPS_USER':
                selectedColumns = ["ticketId", "createdAt", "claimType", "claimFiledBy", "entity", "slaBreachDate", "instanceType", "priority", "status","action"];
                break;
            case 'SEPS_AGENT':
                selectedColumns = ["ticketId", "createdAt", "claimType", "claimFiledBy", "entity", "slaBreachDate", "instanceType", "priority", "status","action"];
                break;
            case 'SYSTEM_ADMIN':
                selectedColumns = ["ticketId", "createdAt", "claimType", "claimFiledBy", "entity", "slaBreachDate", "instanceType", "priority", "status","action"];
                break;
            default:
                // Fallback to default columns (assumes `FIAdminColumns` is predefined elsewhere)
                selectedColumns = ["ticketId", "createdAt", "claimType", "claimFiledBy", "entity", "fiAgent", "slaBreachDate", "instanceType", "priority", "status"];
                break;
        }

        if (permissionsState?.assignPermission === true) {
            selectedColumns.unshift("select-col"); // Adds "select-col" to the beginning of the array
        }
        return getFilteredColumns(selectedColumns); // Call `getFilteredColumns` with the selected columns
    };

    // Inside your component, dynamically decide the columns
    // const columns = getColumnsForUser(currentUser);
    useEffect(() => {
        // Call the function whenever permissionState changes
        const updatedColumns = getColumnsForUser(currentUser);
        setColumns(updatedColumns);
      }, [permissionsState, currentUser]); // Add permissionState and currentUser as dependencies

    // Info Cards Data

    // GET CLAIM TYPE DROPDOWN LIST
    const getClaimTypeStatsData = () => {
        ticketOverviewAPI().then(response => {
            setClaimsStatsData(response?.data)
        }).catch((error) => {
            if (error?.response?.data?.errorDescription) {
                toast.error(error?.response?.data?.errorDescription);
            } else {
                toast.error(error?.message ?? "FAILED TO FETCH CLAIM TYPE DATA");
            }
        })
    }

    useEffect(() => {
        getClaimTypeStatsData()
    }, [])


    return (
        <React.Fragment>
            <Loader isLoading={loading} />
            <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
                <div className="info-cards mb-3">
                    <InfoCards claimStatsData={claimStatsData} />
                </div>
                <Card className="border-0 flex-grow-1 d-flex flex-column shadow">
                    <Card.Body className="d-flex flex-column">
                        <TicketsListFilters
                            filter={filter}
                            setFilter={setFilter}
                            handleTicketAssign={handleTicketAssignment}
                            ticketArr={ticketIdsArr}
                            clearTableSelection={clearTableSelection}
                            permissionsState={permissionsState}
                        />
                        <CommonDataTable
                            columns={columns}
                            dataQuery={dataQuery}
                            pagination={pagination}
                            setPagination={setPagination}
                            sorting={sorting}
                            setSorting={setSorting}
                            clearTableSelection={clearTableSelection}
                        />
                    </Card.Body>
                </Card>
            </div>

            {/* Attachments Modals */}
            <AttachmentsModal
                modal={attachmentsModalShow}
                toggle={() => setAttachmentsModalShow(false)}
            />

            <EditTicketModal modal={editModal?.open} dataQuery={dataQuery} toggle={editToggle} rowData={editModal?.row} />
        </React.Fragment>
    );
}

export default TicketsNormalList