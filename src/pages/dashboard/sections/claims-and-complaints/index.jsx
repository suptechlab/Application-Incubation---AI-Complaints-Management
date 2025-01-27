import { useQuery, useQueryClient } from '@tanstack/react-query'
import qs from "qs"
import React, { useContext, useEffect, useState } from 'react'
import { Button, Card, Stack } from 'react-bootstrap'
import { MdAttachFile } from 'react-icons/md'
import { Link, useLocation } from 'react-router-dom'
import CommonDataTable from '../../../../components/CommonDataTable'
import ReactSelect from '../../../../components/ReactSelect'
import AppTooltip from '../../../../components/tooltip'
import DashboardListFilters from './filters'
import { downloadClaimAndComplaints, getClaimsandComplaints } from '../../../../services/dashboard.service'
import { useTranslation } from 'react-i18next'
import { calculateDaysDifference } from '../../../../utils/commonutils'
import moment from 'moment'
import { MasterDataContext } from '../../../../contexts/masters.context'
import { convertToLabelValue } from '../../../../services/ticketmanagement.service'
import toast from 'react-hot-toast'
import PropTypes from "prop-types"

const ClaimsAndComplaints = ({ setLoading }) => {
    const location = useLocation();
    const queryClient = useQueryClient();
    const params = qs.parse(location.search, { ignoreQueryPrefix: true });
    const [isDownloading, setDownloading] = useState(false)
    const [pagination, setPagination] = React.useState({
        pageIndex: params.page ? parseInt(params.page) - 1 : 0,
        pageSize: params.limit ? parseInt(params.limit) : 10,
    });

    const { masterData } = useContext(MasterDataContext)

    const [sorting, setSorting] = React.useState([]);
    const [filter, setFilter] = React.useState({
        search: "",
        subscription: "",
        status: "",
    });

    const [clearTableSelection] = useState(false)

    const [instanceType, setInstanceType] = useState([])

    const { t } = useTranslation()

    useEffect(() => {
        if (masterData?.instanceType) {
            setInstanceType([{ select: '', label: t('ALL_INSTANCE') }, ...convertToLabelValue(masterData?.instanceType)])
        }

    }, [masterData])


    // DOWNLOAD TICKET LIST DATA
    const handleDownload = () => {
        setDownloading(true)
        toast.loading(t("EXPORT IN PROGRESS"), { id: "downloading", isLoading: isDownloading })
        downloadClaimAndComplaints(filter).then(response => {
            if (response?.data) {
                const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const blobUrl = window.URL.createObjectURL(blob);

                toast.success(t("CSV DOWNLOADED"), { id: "downloading" })


                const tempLink = document.createElement('a');
                tempLink.href = blobUrl;
                tempLink.setAttribute('download', 'tickets.xlsx');

                // Append the link to the document body before clicking it
                document.body.appendChild(tempLink);

                tempLink.click();

                // Clean up by revoking the Blob URL
                window.URL.revokeObjectURL(blobUrl);

                // Remove the link from the document body after clicking
                document.body.removeChild(tempLink);
            } else {
                throw new Error(t("EMPTY RESPONSE"));
            }
            // toast.success(t("STATUS UPDATED"));
        }).catch((error) => {
            if (error?.response?.data?.errorDescription) {
                toast.error(error?.response?.data?.errorDescription);
            } else {
                toast.error(error?.message ?? t("STATUS UPDATE ERROR"));
            }
            toast.dismiss("downloading");
        }).finally(() => {
            // Ensure the loading toast is dismissed
            // toast.dismiss("downloading");
            setDownloading(false)
        });
    }
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
                    response = await getClaimsandComplaints({
                        page: pagination.pageIndex,
                        size: pagination.pageSize,
                        ...filterObj,
                    });
                } else {
                    response = await getClaimsandComplaints({
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

    // TO REMOVE CURRENT DATA ON COMPONENT UNMOUNT
    useEffect(() => {
        return () => {
            queryClient.removeQueries("data");
        };
    }, [queryClient]);
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
    // const handleAttachmentsClick = () => {
    //     setAttachmentsModalShow(true)
    // }

    const columns = React.useMemo(
        () => [
            {
                accessorFn: (row) => row?.ticketId,
                id: "ticketId",
                header: () => t("TICKET_ID"),
                enableSorting: true,
                cell: ({ row }) => (
                    <Stack direction="horizontal" gap={2}>
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
                accessorFn: (row) => row?.claimSubType?.name,
                id: "claimSubType",
                header: () => t("CLAIM SUB TYPE"),
                enableSorting: true,
            },
            {
                accessorFn: (row) => row?.fiAgent?.name,
                id: "fiAgent",
                header: () => t("FI_ENTITY"),
                enableSorting: true,
            },
            {
                accessorFn: (row) => row?.slaBreachDate,
                id: "slaBreachDate",
                header: () => t("SLA"),
                enableSorting: true,
                cell: ({ row }) => (
                    <span>{row?.original?.slaBreachDate ? calculateDaysDifference(row?.original?.slaBreachDate) + " " + t('DAYS') : 'N/A'}</span>
                )
            },
            {
                accessorFn: (row) => row?.instanceType,
                id: "instanceType",
                header: () => t("INSTANCE_TYPE"),
                enableSorting: true,
                cell: ({ row }) => (
                    <span>{(row?.original?.instanceType && masterData?.instanceType) && masterData?.instanceType[row?.original?.instanceType]}</span>
                )
            },
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
        ],
        [masterData]
    );

    useEffect(() => {
        if (Object.values(filter).some(value => value)) {
            setPagination({
                pageIndex: 0,
                pageSize: 10,
            });
        }

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
                            {t("CLAIM_AND_COMPLAINTS")}
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
                                    placeholder={t("SELECT")}
                                    id="instanceType"
                                    onChange={(event) => {
                                        setFilter({
                                            ...filter,
                                            instanceType: event.target.value,
                                        });
                                    }}
                                    value={filter?.instanceType ?? ''}
                                    size="sm"
                                    options={instanceType ?? []}
                                />
                            </div>
                            <Button
                                type="button"
                                variant='warning'
                                size="sm"
                                className='px-3'
                                onClick={handleDownload}
                                disabled={isDownloading ?? false}
                            >
                                {t("EXPORT TO CSV")}
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
            {/* <AttachmentsModal
                modal={attachmentsModalShow}
                toggle={() => setAttachmentsModalShow(false)}
            /> */}
        </React.Fragment>
    )
}


ClaimsAndComplaints.propTypes = {
    setLoading: PropTypes.func.isRequired, // setLoading is a required function
};

export default ClaimsAndComplaints