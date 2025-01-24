import { useQuery, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import qs from "qs";
import React, { useEffect, useRef, useState } from "react";
import { Card } from "react-bootstrap";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { MdVisibility } from "react-icons/md";
import { useLocation } from "react-router-dom";
import CommonDataTable from "../../components/CommonDataTable";
import DataGridActions from "../../components/DataGridActions";
import Loader from "../../components/Loader";
import PageHeader from "../../components/PageHeader";
import { downloadAuditReportApi, handleGetAuditLogs } from "../../services/reports.services";
import { downloadClaimTypes } from "../../services/claimType.service";
import { handleGetAuditLogs } from "../../services/reports.services";
import { getModulePermissions, isAdminUser } from "../../utils/authorisedmodule";
import SearchForm from "./SearchForm";

const AuditLogs = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const params = qs.parse(location.search, { ignoreQueryPrefix: true });
  const [isLoading] = useState(false);
  const [isDownloading, setDownloading] = useState(false);
  const { t } = useTranslation();

  const [pagination, setPagination] = useState({
    pageIndex: params.page ? parseInt(params.page) - 1 : 1,
    pageSize: params.limit ? parseInt(params.limit) : 10,
  });
  const [sorting, setSorting] = useState([
    {
      id: "createdAt",
      desc: true,
    },
  ]);
  const [filter, setFilter] = useState({
    search: "",
  });


  // DATA QUERY
  const dataQuery = useQuery({
    queryKey: ["data", pagination, sorting, filter],
    queryFn: () => {
      const filterObj = qs.parse(qs.stringify(filter, { skipNulls: true }));
      Object.keys(filterObj).forEach(
        (key) => filterObj[key] === "" && delete filterObj[key]
      );

      if (sorting.length === 0) {
        return handleGetAuditLogs({
          page: pagination.pageIndex,
          size: pagination.pageSize,
          ...filterObj,
        });
      } else {
        return handleGetAuditLogs({
          page: pagination.pageIndex,
          size: pagination.pageSize,
          sort: sorting
            .map((sort) => `${sort.id},${sort.desc ? "desc" : "asc"}`)
            .join(","),
          ...filterObj,
        });
      }
    },
    staleTime: 0, // Data is always stale, so it refetches
    cacheTime: 0, // Cache expires immediately
  });

  // DOWNLOAD AUDIT LOGS LIST
  const handleDownload = () => {
    setDownloading(true);
    toast.loading(t("EXPORT IN PROGRESS"), {
      id: "downloading",
      isLoading: isDownloading,
    });
    downloadAuditReportApi({...filter , search: filter?.search ?? "" })
      .then((response) => {
        if (response?.data) {
          const blob = new Blob([response.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          const blobUrl = window.URL.createObjectURL(blob);

          toast.success(t("DOWNLOAD_SUCCESSFUL"), { id: "downloading" });

          const tempLink = document.createElement("a");
          tempLink.href = blobUrl;
          tempLink.setAttribute("download", "audit_logs.xlsx");

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
      })
      .catch((error) => {
        if (error?.response?.data?.errorDescription) {
          toast.error(error?.response?.data?.errorDescription);
        } else {
          toast.error(error?.message ?? t("STATUS UPDATE ERROR"));
        }
        toast.dismiss("downloading");
      })
      .finally(() => {
        setDownloading(false);
      });
  };

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
        accessorFn: (row) => row.createdAt,
        id: "createdAt",
        header: () => t("DATE AND TIME OF ACTIVITY"),
        cell: (info) => {
          return (
            <span>
              {moment(info?.row?.original?.createdAt).format(
                "D-M-YYYY hh:mm A"
              )}
            </span>
          );
        },
      },
      {
        accessorFn: (row) => row?.userName,
        id: "userName",
        header: () => t("USERNAME/ID"),
      },
      {
        accessorFn: (row) => row.activityType,
        id: "activityType",
        header: () => t("ACTIVITY TYPE"),
      },
      {
        accessorFn: (row) => row.ipAddress,
        id: "ipAddress",
        header: () => t("IP ADDRESS/LOCATION"),
      },
      {
        id: "actions",
        isAction: true,
        cell: (rowData) => (
          <DataGridActions
            controlId="reports"
            rowData={rowData}
            customButtons={[
              {
                name: "audit-trail",
                enabled: true,
                type: "link",
                title: "View",
                icon: <MdVisibility size={18} />,
              },
            ]}
          />
        ),
        header: () => <div className="text-center">{t("ACTIONS")}</div>,
        enableSorting: false,
        size: "100",
      },
    ],
    []
  );

  useEffect(() => {
    if (Object.values(filter).some(value => value)) {
      setPagination({
          pageIndex: 0,
          pageSize: 10,
      });
  }
  }, [filter]);

  // TO REMOVE CURRENT DATA ON COMPONENT UNMOUNT
  useEffect(() => {
    return () => {
      queryClient.removeQueries("data");
    };
  }, [queryClient]);

  return (
    <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
      <Loader isLoading={isLoading} />
      <PageHeader
        title={t("AUDIT TRAIL REPORT")}
        actions={[
          {
            label: t("EXPORT TO EXCEL"),
            onClick: handleDownload,
            variant: "warning",
            // disabled: true,
          },
        ]}
      />
      <Card className="border-0 flex-grow-1 d-flex flex-column shadow">
        <Card.Body className="d-flex flex-column">
          <SearchForm filter={filter} setFilter={setFilter} />
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
  );
};

export default AuditLogs;
