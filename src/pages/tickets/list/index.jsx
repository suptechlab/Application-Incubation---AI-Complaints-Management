import { useQuery } from "@tanstack/react-query";
import qs from "qs";
import React, { useEffect, useState } from "react";
import { Button, Card, Form, Stack } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CommonDataTable from "../../../components/CommonDataTable";
import InfoCards from "../../../components/infoCards";
import Loader from "../../../components/Loader";
import PageHeader from "../../../components/PageHeader";
import { handleGetUsers } from "../../../services/user.service";
import TicketsListFilters from "./filters";
import { agentTicketToSEPSagent, handleGetTicketList } from "../../../services/ticketmanagement.service";
import AppTooltip from "../../../components/tooltip";
import AttachmentsModal from "../modals/attachmentsModal";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

export default function TicketsList() {
    const location = useLocation();
    const navigate = useNavigate();

    const { t } = useTranslation()
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
    const [attachmentsModalShow, setAttachmentsModalShow] = useState(false);
    const [ticketIdsArr, setTicketIdsArr] = useState([]);

    const [clearTableSelection, setClearTableSelection] = useState(false)


    const dataQuery = useQuery({
        queryKey: ["data", pagination, sorting, filter],
        queryFn: async () => {
            // Set loading state to true before the request starts

            // return { data: sampleData, page: 1, size: 10 }

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

    const sampleData = [
        {
            ticketId: "TCK-1001",
            createdAt: "2024-11-20",
            claimType: "Health Insurance",
            claimFilledBy: "John Doe",
            slaBreachDays: "5 Days",
            priority: "Low",
            status: "Closed",
        },
        {
            ticketId: "TCK-1002",
            createdAt: "2024-11-21",
            claimType: "Auto Insurance",
            claimFilledBy: "Jane Smith",
            slaBreachDays: "3 Days",
            priority: "Medium",
            status: "In Progress",
        },
        {
            ticketId: "TCK-1003",
            createdAt: "2024-11-22",
            claimType: "Travel Insurance",
            claimFilledBy: "Robert Brown",
            slaBreachDays: "7 Days",
            priority: "High",
            status: "Rejected",
        },
        {
            ticketId: "TCK-1004",
            createdAt: "2024-11-23",
            claimType: "Property Insurance",
            claimFilledBy: "Emily Davis",
            slaBreachDays: "2 Days",
            priority: "NIL",
            status: "New",
        },
        {
            ticketId: "TCK-1005",
            createdAt: "2024-11-24",
            claimType: "Life Insurance",
            claimFilledBy: "Michael Wilson",
            slaBreachDays: "10 Days",
            priority: "NIL",
            status: "Closed",
        },
    ];


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


    const columns = React.useMemo(
        () => [
            {
                id: 'select-col',
                header: ({ table }) => (
                    <Form.Check
                        className="form-check-cursor"
                        checked={table.getIsAllRowsSelected()}
                        indeterminate={table.getIsSomeRowsSelected()}
                        // onChange={table.getToggleAllRowsSelectedHandler()} //or getToggleAllPageRowsSelectedHandler
                        onChange={(e) => {
                            table.toggleAllRowsSelected(e.target.checked);
                            const allSelectedIds = e.target.checked
                                ? table.getRowModel().rows.map((row) => row.original.id)
                                : [];
                            setTicketIdsArr(allSelectedIds);
                            setClearTableSelection(false)
                        }}
                    />
                ),
                cell: ({ row }) => (
                    <Form.Check
                        className="form-check-cursor"
                        checked={row.getIsSelected()}
                        disabled={!row.getCanSelect()}
                        // onChange={row.getToggleSelectedHandler()}
                        onChange={(e) => {
                            row.toggleSelected(e.target.checked);

                            if (e.target.checked) {
                                // Add the ID to the array if the row is selected
                                setTicketIdsArr((prev) => [...prev, row.original.id]);
                            } else {
                                // Remove the ID from the array if the row is deselected
                                setTicketIdsArr((prev) => prev.filter((id) => id !== row.original.id));
                            }

                            setClearTableSelection(false)
                        }}
                    />
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
                header: () => "Ticket ID",
                enableSorting: true,
                cell: ({ row }) => (
                    <Stack direction="horizontal" gap={2}>
                        <Link className="text-decoration-none fw-semibold" to={`/tickets/view/${row?.original?.id}`}>{"#" + row?.original?.ticketId}</Link>
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
                accessorFn: (row) => row?.claimType?.name,
                // accessorFn: (row) => row?.claimType,
                id: "claimType",
                header: () => "Claim Type",
                enableSorting: true,
            },
            {
                accessorFn: (row) => row?.createdAt,
                id: "createdAt",
                header: () => "Creation Date",
                enableSorting: true,
                cell: ({ row }) => (
                    row?.original?.createdAt
                ),
            },
            {
                // accessorFn: (row) => row?.claimFilledBy,
                accessorFn: (row) => row?.user?.name,
                id: "claimFilledBy",
                header: () => "Claim filled by",
                enableSorting: true,
            },
            {
                accessorFn: (row) => row?.slaBreachDays,
                id: "slaBreachDays",
                header: () => "SLA",
                enableSorting: true,
            },
            {
                accessorFn: (row) => row?.priority,
                id: "priority",
                header: () => "Priority",
                size: "100",
                cell: (rowData) => (
                    <span
                        className={`text-nowrap fw-semibold ${getPriorityClass(rowData.row.original.priority)}`}
                    >
                        {rowData.row.original.priority}
                    </span>
                )
            },
            {
                accessorFn: (row) => row?.status,
                id: "status",
                header: () => "Status",
                size: "100",
                cell: (rowData) => (
                    <span
                        className={`text-nowrap bg-opacity-10 custom-font-size-12 fw-semibold px-2 py-1 rounded-pill ${getStatusClass(rowData.row.original.status)}`}
                    >
                        {rowData.row.original.status}
                    </span>
                )
            },
        ],
        []
    );

    const handleTicketAssignment = (agentId) => {
        // agentTicketToSEPSagent
        if (agentId && agentId !== '') {
            agentTicketToSEPSagent(agentId, { ticketIds: ticketIdsArr }).then(response => {
                toast.success(t("TICKETS ASSIGNED"));
                setClearTableSelection(true)
                setTicketIdsArr([])
            }).catch((error) => {
                if (error?.response?.data?.errorDescription) {
                    toast.error(error?.response?.data?.errorDescription);
                } else {
                    toast.error(error?.message ?? t("STATUS UPDATE ERROR"));
                }
            }).finally(() => {
                setLoading(false)
            })
        }
    }

    useEffect(() => {
        setPagination({
            pageIndex: 0,
            pageSize: 10,
        });
    }, [filter]);

    //Add New Click Hanlder
    const addNewClickHanlder = () => {
        // navigate tickets/view/1
        // navigate('/tickets/view/1')
    }


    return (
        <React.Fragment>
            <Loader isLoading={loading} />
            <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
                <PageHeader
                    title="Tickets"
                    actions={[
                        { label: "Add New Claim", onClick: addNewClickHanlder, variant: "warning", disabled: true },
                    ]}
                />
                <div className="info-cards mb-3">
                    <InfoCards/>
                </div>
                <Card className="border-0 flex-grow-1 d-flex flex-column shadow">
                    <Card.Body className="d-flex flex-column">
                        <TicketsListFilters filter={filter} setFilter={setFilter} handleTicketAssign={handleTicketAssignment} ticketArr={ticketIdsArr} clearTableSelection={clearTableSelection} />
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

        </React.Fragment>
    );
}
