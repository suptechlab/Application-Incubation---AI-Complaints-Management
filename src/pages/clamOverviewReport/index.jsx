import { useQuery, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import qs from "qs";
import React, { useContext, useEffect, useState } from "react";
import { Card, Stack } from "react-bootstrap";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { MdAttachFile } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";
import CommonDataTable from "../../components/CommonDataTable";
import Loader from "../../components/Loader";
import PageHeader from "../../components/PageHeader";
import AppTooltip from "../../components/tooltip";
import { MasterDataContext } from "../../contexts/masters.context";
import { claimOverviewReportApi, downloadClaimOverviewReportApi } from "../../services/reports.services";
import { calculateDaysDifference } from "../../utils/commonutils";
import ListFilters from "./ListFilters";

const ClaimOverviewReport = () => {

  const location = useLocation();
  const queryClient = useQueryClient();

  const params = qs.parse(location.search, { ignoreQueryPrefix: true });

  const [isLoading, setLoading] = useState(false)
  const [isDownloading, setDownloading] = useState(false)

  const { masterData } = useContext(MasterDataContext)

  const { t } = useTranslation()

  const [pagination, setPagination] = useState({
    pageIndex: params.page ? parseInt(params.page) - 1 : 1,
    pageSize: params.limit ? parseInt(params.limit) : 10,
  });
  const [sorting, setSorting] = useState([
    // {
    //   "id": "slaBreachDate",
    //   "asc": true
    // }
  ]);
  const [filter, setFilter] = useState({
    search: "",
  });

  // COLUMNS FOR CLAIM REPORT TABLE
  const columns = React.useMemo(
    () => [

      {
        accessorFn: (row) => row?.ticketId,
        id: "ticketId",
        header: () => t("TICKET_ID"),
        enableSorting: false,
        cell: ({ row }) => (
          <Stack direction="horizontal" gap={2}>
            <Link className="text-decoration-none fw-semibold" to={`/tickets/view/${row?.original?.id}`}>{"#" + row?.original?.ticketId}</Link>
            {row?.original?.haveClaimTicketDocuments && <MdAttachFile size={16} />}
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
        // accessorFn: (row) => row?.claimFilledBy,
        accessorFn: (row) => row?.user?.name,
        id: "claimFilledBy",
        header: () => t("CLAIM_FILED_BY"),
        enableSorting: false,
      },
      {
        accessorFn: (row) => row?.claimType?.name,
        // accessorFn: (row) => row?.claimType,
        id: "claimType",
        header: () => t("CLAIM TYPE"),
        enableSorting: false,
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

  // DATA QUERY
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
          response = await claimOverviewReportApi({
            page: pagination.pageIndex,
            size: pagination.pageSize,
            ...filterObj,
          });
        } else {
          response = await claimOverviewReportApi({
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


  // DOWNLOAD CLAIM TYPES LIST
  const handleDownload = () => {
    setDownloading(true)
    toast.loading(t("EXPORT IN PROGRESS"), { id: "downloading", isLoading: isDownloading })
    const filterObj = qs.parse(qs.stringify(filter, { skipNulls: true }));
    Object.keys(filterObj).forEach(key => filterObj[key] === "" && delete filterObj[key]);
    downloadClaimOverviewReportApi(filterObj).then(response => {
      if (response?.data) {
        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const blobUrl = window.URL.createObjectURL(blob);

        toast.success(t("CSV DOWNLOADED"), { id: "downloading" })


        const tempLink = document.createElement('a');
        tempLink.href = blobUrl;
        tempLink.setAttribute('download', 'claimOverview.xlsx');

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

  useEffect(() => {
    if (dataQuery.data?.data?.totalPages < pagination.pageIndex + 1) {
      setPagination({
        pageIndex: dataQuery.data?.data?.totalPages - 1,
        pageSize: 10,
      });
    }
  }, [dataQuery.data?.data?.totalPages]);


  // The color class based on the priority
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


  useEffect(() => {
    if (Object.values(filter).some(value => value)) {
      setPagination({
        pageIndex: 0,
        pageSize: 10,
      });
    }
  }, [filter]);


  useEffect(() => {
    dataQuery.refetch()
  }, [])

  // TO REMOVE CURRENT DATA ON COMPONENT UNMOUNT
  useEffect(() => {
    return () => {
      queryClient.removeQueries("data");
    };
  }, [queryClient]);

  return <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
    <Loader isLoading={isLoading} />
    <PageHeader
      title={t("CLAIM_OVERVIEW_REPORT")}
      actions={[
        { label: t("EXPORT TO CSV"), onClick: handleDownload, variant: "outline-dark", disabled: isDownloading },
      ]}
    />
    <Card className="border-0 flex-grow-1 d-flex flex-column shadow">
      <Card className="border-0 flex-grow-1 d-flex flex-column shadow">
        <Card.Body className="d-flex flex-column">
          <ListFilters filter={filter} setFilter={setFilter} />
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
    </Card>

  </div>
};

export default ClaimOverviewReport;

