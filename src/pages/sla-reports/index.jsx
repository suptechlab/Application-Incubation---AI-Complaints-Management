import { useQuery, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import qs from "qs";
import React, { useContext, useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import CommonDataTable from "../../components/CommonDataTable";
import Loader from "../../components/Loader";
import PageHeader from "../../components/PageHeader";
import AppTooltip from "../../components/tooltip";
import { MasterDataContext } from "../../contexts/masters.context";
import { averageResolutionTimeApi, downloadSLAComplianceReportApi, slaComplianceReportApi } from "../../services/reports.services";
import ListingSearchForm from "./ListingSearchForm";

const SLAComplianceReport = () => {

  const location = useLocation();
  const queryClient = useQueryClient();

  const { masterData } = useContext(MasterDataContext)

  const params = qs.parse(location.search, { ignoreQueryPrefix: true });

  const [isLoading, setLoading] = useState(false)
  const [isDownloading, setDownloading] = useState(false)

  const [averageResolutionTime, setAverageResolutionTime] = useState([])

  const { t } = useTranslation()

  const [pagination, setPagination] = useState({
    pageIndex: params.page ? parseInt(params.page) - 1 : 0,
    pageSize: params.limit ? parseInt(params.limit) : 10,
  });

  console.log(pagination)
  const [sorting, setSorting] = useState([]);
  const [filter, setFilter] = useState({
    search: "",
    status: "",
    claimTypeId: "",
    claimSubTypeId: "",
    slaCompliance: "",
    startDate: null,
    endDate: null,
    instanceType: "",
    organizationId: "",
    claimTicketPriority: ""
  });


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
          response = await slaComplianceReportApi({
            page: pagination.pageIndex,
            size: pagination.pageSize,
            ...filterObj,
          });
        } else {
          response = await slaComplianceReportApi({
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
    downloadSLAComplianceReportApi({ ...filter, search: filter?.search }).then(response => {
      if (response?.data) {
        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const blobUrl = window.URL.createObjectURL(blob);

        toast.success(t("DOWNLOAD_SUCCESSFUL"), { id: "downloading" })


        const tempLink = document.createElement('a');
        tempLink.href = blobUrl;
        tempLink.setAttribute('download', 'sla_compliance_report.xlsx');

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
        return 'bg-secondary text-body';
    }
  };


  // GET AVERAGE RESOLUTION TIME
  const getAverageResolutionTime = () => {
    averageResolutionTimeApi().then((response) => {
      console.log()
      setAverageResolutionTime(response?.data?.averageResolutionTime.toFixed(2))
      // setAverageResolutionTime()
    }).catch((error) => {
      if (error?.response?.data?.errorDescription) {
        toast.error(error?.response?.data?.errorDescription);
      } else {
        toast.error(error?.message ?? t("STATUS UPDATE ERROR"));
      }
    })
  }


  useEffect(() => {
    getAverageResolutionTime()
  }, [])

  // useEffect(() => {
  //   if (dataQuery.data?.data?.totalPages < pagination.pageIndex + 1) {
  //     setPagination({
  //       pageIndex: dataQuery.data?.data?.totalPages - 1,
  //       pageSize: 10,
  //     });
  //   }
  // }, [dataQuery.data?.data?.totalPages]);


  useEffect(() => {
    if (Object.values(filter).some(value => value)) {
      setPagination({
        pageIndex: 0,
        pageSize: 10,
      });
    }
  }, [filter]);
  // filter
  // TO REMOVE CURRENT DATA ON COMPONENT UNMOUNT
  useEffect(() => {
    return () => {
      queryClient.removeQueries("data");
    };
  }, [queryClient]);

  const columns = React.useMemo(
    () => [
      {
        accessorFn: (row) => row?.ticketId,
        id: "ticketId",
        header: () => t("TICKET_ID"),
        enableSorting: true,
        cell: ({ row }) => (<Link className="text-decoration-none fw-semibold" to={`/tickets/view/${row?.original?.id}`}>
          {"#" + row?.original?.ticketId}
        </Link>)
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
        accessorFn: (row) => row?.slaDueDate,
        id: "slaDueDate",
        header: () => t("SLA_DUE_DATE"),
        enableSorting: true,
        cell: ({ row }) => (
          row?.original?.slaBreachDate
            ? moment(row?.original?.slaBreachDate).format("DD-MM-YYYY")
            : ''
        ),
      },
      {
        accessorFn: (row) => row?.slaBreachDays,
        id: "slaBreachDays",
        header: () => t("SLA_BREACH_DAYS"),
        enableSorting: true,
        cell: (({ row }) => (
          <span>{row?.original?.slaBreachDays + " " + t("DAYS")}</span>
        )),

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



  return <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
    <Loader isLoading={isLoading} />
    <PageHeader
      title={t("SLA_COMPLIANCE_REPORT")}
      averageResolutionTime={averageResolutionTime ?? ''}
      actions={[
        { label: t("EXPORT TO EXCEL"), onClick: handleDownload, variant: "warning", disabled: isDownloading },
        // { label: t("ADD NEW"), onClick: toggle, variant: "warning" },
      ]}
    />
    <Card className="border-0 flex-grow-1 d-flex flex-column shadow">
      <Card.Body className="d-flex flex-column">
        <ListingSearchForm filter={filter} setFilter={setFilter} />
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
};

export default SLAComplianceReport;

