import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import qs from "qs";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  handleDeleteUser,
  handleGetUsers,
  handleStatusChangeState,
} from "../../services/user.service";

import { Card } from "react-bootstrap";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { MdDelete, MdEdit } from "react-icons/md";
import CommonDataTable from "../../components/CommonDataTable";
import DataGridActions from "../../components/DataGridActions";
import GenericModal from "../../components/GenericModal";
import ListingSearchForm from "../../components/ListingSearchForm";
import Loader from "../../components/Loader";
import PageHeader from "../../components/PageHeader";
import Toggle from "../../components/Toggle";
import { handleGetFIusersList } from "../../services/fiusers.services";

export default function FIUserList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation(); // use the translation hook
  const params = qs.parse(location.search, { ignoreQueryPrefix: true });
  const [pagination, setPagination] = React.useState({
    pageIndex: params.page ? parseInt(params.page) - 1 : 0,
    pageSize: params.limit ? parseInt(params.limit) : 10,
  });

  const [sorting, setSorting] = React.useState([]);

  const [filter, setFilter] = React.useState({
    search: "",
  });

  const [loading, setLoading] = useState(false);


  const dataQuery = useQuery({
    queryKey: ["data", pagination, sorting, filter],
    queryFn: () => {
      const filterObj = qs.parse(qs.stringify(filter, { skipNulls: true }));
      Object.keys(filterObj).forEach(
        (key) => filterObj[key] === "" && delete filterObj[key]
      );

      if (sorting.length === 0) {
        return handleGetFIusersList({
          page: pagination.pageIndex,
          size: pagination.pageSize,
          ...filterObj,
        });
      } else {
        return handleGetFIusersList({
          page: pagination.pageIndex,
          size: pagination.pageSize,
          sort: sorting
            .map((sort) => `${sort.id},${sort.desc ? "desc" : "asc"}`)
            .join(","),
          ...filterObj,
        });
      }
    },
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

  const changeStatus = async (id, currentStatus) => {
    try {
      await handleStatusChangeState(id, !currentStatus);
      toast.success("State status updated successfully");
      dataQuery.refetch();
    } catch (error) {
      toast.error("Error updating state status");
    }
  };


  const columns = React.useMemo(
    () => [
      {
        accessorFn: (row) => row.name,
        id: "name",
        header: () => t("NAME"),
      },
      {
        accessorFn: (row) => row.email,
        id: "email",
        header: () => t("EMAIL"),
      },
      {
        accessorFn: (row) => row.mobileNo,
        id: "mobileNo",
        header: () =>t("ORGANIZATIONAL UNIT") ,
        cell: (info) => {
          return (
            <span>
              {info.row.original.mobileCode} {info.row.original.mobileNo}
            </span>
          );
        },
      },
      {
        accessorFn: (row) => row.entityName ?? "N/A",
        id: "entityName",
        header: () => t("ENTITY NAME"),
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.createdAt,
        id: "createdAt",
        header: () => t("CREATION DATE"),
        cell: (info) => {
          return <span>{moment(info.row.original.createdAt).format("l")}</span>;
        },
      },
      {
        cell: (info) => {
          return (
            <Toggle
              id={`status-${info?.row?.original?.id}`}
              key={"status"}
              name="status"
              value={info?.row?.original?.status}
              checked={info?.row?.original?.status}
              onChange={() =>
                changeStatus(
                  info?.row?.original?.id,
                  info?.row?.original?.status
                )
              }
              tooltip={info?.row?.original?.status ? t("ACTIVE") : t("INACTIVE")}
            />
          );
        },
        id: "status",
        header: () => t("STATUS"),
        size: "80",
      },
      {
        id: "actions",
        isAction: true,
        cell: (rowData) => (
          <DataGridActions
            controlId="fi-users"
            rowData={rowData}
            customButtons={[
              {
                name: "edit",
                enabled: true,
                type: "link",
                title: t("EDIT"),
                icon: <MdEdit size={18} />,
              },
            ]}
          />
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

  return (
    <React.Fragment>
      <Loader isLoading={loading} />
      <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
        <PageHeader
          title={t("FI USERS")}
          actions={[
            {
              label: t("IMPORT FI USERS"),
              to: "/fi-users/import",
              variant: "outline-dark",
            },
            { label: t("ADD NEW"), to: "/fi-users/add", variant: "warning" },
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

      {/* Delete Modal */}
    
    </React.Fragment>
  );
}
