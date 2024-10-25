import { useQuery } from "@tanstack/react-query";
import qs from "qs";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import SearchForm from "./SearchForm";
import RoleRightsTable from "./RoleRightsTable";
import RoleRightsModal from "./RoleRightsModal";
import {
  handleGetRoleRights,
  handleDeleteRoleRight,
} from "../../services/rolerights.service"; // Update the import to include delete function
import toast from "react-hot-toast";
import SvgIcons from "../../components/SVGIcons";
import PageHeader from "../../components/PageHeader";
import ListingSearchForm from "../../components/ListingSearchForm";
import { Button, Card, Stack } from "react-bootstrap";
import CommonDataTable from "../../components/CommonDataTable";
import DataGridActions from "../../components/DataGridActions";
import { MdDelete, MdEdit } from "react-icons/md";
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

  const editRoleRight = async (id) => {
    navigate(`/role-rights/edit/${id}`);
  };

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

  const columns = React.useMemo(
    () => [
      {
        accessorFn: (row) => row.name,
        id: "name",
        header: () => "Name",
      },
      {
        accessorFn: (row) => row.description,
        id: "description",
        header: () => "Description",
        enableSorting: true,
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
          <div className="d-flex justify-content-center">Actions</div>
        ),
        enableSorting: false,
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
          <Card.Body>
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
