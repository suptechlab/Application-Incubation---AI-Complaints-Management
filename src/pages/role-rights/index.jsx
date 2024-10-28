import { useQuery } from "@tanstack/react-query";
import qs from "qs";
import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import toast from "react-hot-toast";
import { MdDelete, MdEdit } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import CommonDataTable from "../../components/CommonDataTable";
import DataGridActions from "../../components/DataGridActions";
import ListingSearchForm from "../../components/ListingSearchForm";
import PageHeader from "../../components/PageHeader";
import Toggle from "../../components/Toggle";
import {
  handleDeleteRoleRight,
  handleGetRoleRights,
} from "../../services/rolerights.service"; // Update the import to include delete function
import { handleStatusChangeState } from "../../services/user.service";
import RoleRightsModal from "./RoleRightsModal";
export default function RoleRightsList() {
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

  const deleteRoleRight = async (id) => {
    if (window.confirm("Are you sure you want to delete this role right?")) {
      try {
        await handleDeleteRoleRight(id);
        toast.success("Role right deleted successfully");
        dataQuery.refetch();
      } catch (error) {
        toast.error(error.response.data.detail);
      }
    }
  };

  const dataQuery = useQuery({
    queryKey: ["data", pagination, sorting, filter],
    queryFn: () => {
      const filterObj = qs.parse(qs.stringify(filter, { skipNulls: true }));
      Object.keys(filterObj).forEach(
        (key) => filterObj[key] === "" && delete filterObj[key]
      );

      if (sorting.length === 0) {
        return handleGetRoleRights({
          page: pagination.pageIndex,
          size: pagination.pageSize,
          ...filterObj,
        });
      } else {
        return handleGetRoleRights({
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
        header: () => "Role",
        enableSorting: true,
      },
      {
        accessorFn: (row) => row.description,
        id: "description",
        header: () => "Description",
        enableSorting: false,
      },
      {
        cell: (info) => {
          console.log("rowstatus 100->", info?.row?.original?.activated);
          return (
            <Toggle
              id={`status-${info?.row?.original?.id}`}
              key={"status"}
              name="status"
              value={info?.row?.original?.activated}
              checked={info?.row?.original?.activated}
              onChange={() =>
                changeStatus(
                  info?.row?.original?.id,
                  info?.row?.original?.activated
                )
              }
            />
          );
        },
        id: "status",
        header: () => "Status",
        size: '90',
      },
      {
        id: "actions",
        isAction: true,
        cell: (rowData) => (
          <DataGridActions
            controlId="role-rights"
            rowData={rowData}
            customButtons={[
              {
                name: "edit",
                enabled: true,
                type: "link",
                title: "Edit",
                icon: <MdEdit size={18} />,
              },
              {
                name: "delete",
                enabled: true,
                type: "button",
                title: "Delete",
                icon: <MdDelete size={18} />,
                handler: () => deleteRoleRight(rowData.row.original.id),
              },
            ]}
          />
        ),
        header: () => (
          <div className="text-center">Actions</div>
        ),
        size: '100',
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
        <PageHeader
          title="Roles & Rights"
          actions={[
            { label: "Add New", to: "/role-rights/add", variant: "warning" },
          ]}
        />
        <Card className="border-0 flex-grow-1 d-flex flex-column shadow">
          <Card.Body className="d-flex flex-column">
            <ListingSearchForm filter={filter} setFilter={setFilter} />
            <CommonDataTable
              columns={columns}
              dataQuery={dataQuery?.data?.data}
              pagination={pagination}
              setPagination={setPagination}
              sorting={sorting}
              setSorting={setSorting}
            />
          </Card.Body>
        </Card>
      </div>
      <RoleRightsModal modal={modal} toggle={toggle} />
    </React.Fragment>
  );
}
