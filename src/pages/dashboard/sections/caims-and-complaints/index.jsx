import { useQuery, useQueryClient } from '@tanstack/react-query'
import qs from "qs"
import React, { useEffect, useState } from 'react'
import { Button, Card, Stack } from 'react-bootstrap'
import { MdAttachFile } from 'react-icons/md'
import { Link, useLocation } from 'react-router-dom'
import CommonDataTable from '../../../../components/CommonDataTable'
import ReactSelect from '../../../../components/ReactSelect'
import AppTooltip from '../../../../components/tooltip'
import AttachmentsModal from '../../../tickets/modals/attachmentsModal'
import DashboardListFilters from './filters'

const CaimsAndComplaints = () => {
    const location = useLocation();
    const queryClient = useQueryClient();
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

    const [attachmentsModalShow, setAttachmentsModalShow] = useState(false);
    const [clearTableSelection, setClearTableSelection] = useState(false)

    // const sampleData = [
    //     {
    //         ticketId: "TCK-1001",
    //         claimType: "Health Insurance",
    //         subClaimType: "Refinancing Request",
    //         fIEntity: "Entity 1",
    //         slaBreachDays: "5",
    //         createdAt: "2024-11-20",
    //         status: "Closed",
    //     },
    //     {
    //         ticketId: "TCK-1002",
    //         claimType: "Auto Insurance",
    //         subClaimType: "Appointment of Managers",
    //         fIEntity: "Entity 2",
    //         slaBreachDays: "3",
    //         createdAt: "2024-11-21",
    //         status: "In Progress",
    //     },
    //     {
    //         ticketId: "TCK-1003",
    //         claimType: "Travel Insurance",
    //         subClaimType: "Novation Request",
    //         fIEntity: "Entity 3",
    //         slaBreachDays: "7",
    //         createdAt: "2024-11-22",
    //         status: "Rejected",
    //     },
    //     {
    //         ticketId: "TCK-1004",
    //         claimType: "Property Insurance",
    //         subClaimType: "Unauthorized Transfers",
    //         fIEntity: "Entity 4",
    //         slaBreachDays: "2",
    //         createdAt: "2024-11-23",
    //         status: "New",
    //     },
    //     {
    //         ticketId: "TCK-1005",
    //         claimType: "Life Insurance",
    //         subClaimType: "Appointment of Managers",
    //         fIEntity: "Entity 5",
    //         slaBreachDays: "10",
    //         createdAt: "2024-11-24",
    //         status: "Closed",
    //     },
    // ];

    const dataQuery = useQuery({
        queryKey: ["data", pagination, sorting, filter],
        queryFn: async () => {
            return { data: [], page: 1, size: 10 }
        },
        staleTime: 0,
        cacheTime: 0,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: 0,
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
    const getStatusClass = (status) => {
        switch (status) {
            case 'Closed':
                return 'bg-success text-success';
            case 'In Progress':
                return 'bg-custom-info text-custom-info';
            case 'New':
                return 'bg-custom-primary text-custom-primary';
            case 'Rejected':
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
                accessorFn: (row) => row?.ticketId,
                id: "ticketId",
                header: () => "Ticket ID",
                enableSorting: true,
                cell: ({ row }) => (
                    <Stack direction="horizontal" gap={2}>
                        <Link className="text-decoration-none fw-semibold" to={`/tickets/view/${row?.original?.ticketId}`}>{"#" + row?.original?.ticketId}</Link>
                        <AppTooltip title="Attachments">
                            <Button
                                variant="link"
                                className="p-0 border-0 link-dark"
                                onClick={handleAttachmentsClick}
                                aria-label="Attachments"
                            >
                                <MdAttachFile size={16} />
                            </Button>
                        </AppTooltip>
                    </Stack>
                ),
            },
            {
                accessorFn: (row) => row?.claimType,
                id: "claimType",
                header: () => "Claim Type",
                enableSorting: true,
            },
            {
                accessorFn: (row) => row?.subClaimType,
                id: "subClaimType",
                header: () => "Sub Claim Type",
                enableSorting: true,
            },
            {
                accessorFn: (row) => row?.fIEntity,
                id: "fIEntity",
                header: () => "FI Entity",
                enableSorting: true,
            },
            {
                accessorFn: (row) => row?.slaBreachDays,
                id: "slaBreachDays",
                header: () => "SLA",
                enableSorting: true,
            },
            {
                accessorFn: (row) => row?.createdAt,
                id: "createdAt",
                header: () => "Creation Date",
                enableSorting: true,
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

    useEffect(() => {
        setPagination({
            pageIndex: 0,
            pageSize: 10,
        });
    }, [filter]);


    return (
        <React.Fragment>
            <Card className="border-0 shadow rounded-3">
                <Card.Header className="bg-body">
                    <Stack
                        direction="horizontal"
                        gap={2}
                        className="flex-wrap my-1"
                    >
                        <div className="fw-semibold fs-4 mb-0 me-auto">
                            Claims & Complaints
                        </div>
                        <Stack
                            direction="horizontal"
                            gap={2}
                            className="flex-wrap"
                        >
                            <div className="custom-min-width-180 flex-grow-1 flex-md-grow-0">
                                <ReactSelect
                                    wrapperClassName="mb-0"
                                    class="form-select "
                                    placeholder="Select"
                                    id="secondInstanceClaim"
                                    size="sm"
                                    options={[
                                        {
                                            label: "2nd Instance Claim",
                                            value: "",
                                        },
                                        {
                                            label: "Option 1",
                                            value: 'option-1',
                                        },
                                    ]}
                                />
                            </div>
                            <Button
                                type="button"
                                variant='warning'
                                size="sm"
                                className='px-3'
                            >
                                Export to CSV
                            </Button>
                        </Stack>
                    </Stack>
                </Card.Header>
                <Card.Body>
                    <DashboardListFilters filter={filter} setFilter={setFilter} clearTableSelection={clearTableSelection} />
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

            {/* Attachments Modals */}
            <AttachmentsModal
                modal={attachmentsModalShow}
                toggle={() => setAttachmentsModalShow(false)}
            />
        </React.Fragment>
    )
}

export default CaimsAndComplaints