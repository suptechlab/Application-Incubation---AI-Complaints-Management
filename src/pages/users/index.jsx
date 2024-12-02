import { useQuery, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import qs from "qs";
import React, { useEffect, useRef, useState } from "react";
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
import ListingSearchFormUsers from "./ListingSearchFormUsers";
import Loader from "../../components/Loader";
import PageHeader from "../../components/PageHeader";
import Toggle from "../../components/Toggle";
import { getModulePermissions, isAdminUser } from "../../utils/authorisedmodule";

export default function UserList() {

  const queryClient = useQueryClient();
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
    subscription: "",
    status: "",
  });

  const [loading, setLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState();
  const [deleteShow, setDeleteShow] = useState(false);
  const [deleteId, setDeleteId] = useState();

  const dataQuery = useQuery({
    queryKey: ["data", pagination, sorting, filter],
    queryFn: async() => {
      setLoading(true);
      try {
        const filterObj = qs.parse(qs.stringify(filter, { skipNulls: true }));
        Object.keys(filterObj).forEach(
          (key) => filterObj[key] === "" && delete filterObj[key]
        );

        let response;
        if (sorting.length === 0) {
          response = await handleGetUsers({
            page: pagination.pageIndex,
            size: pagination.pageSize,
            ...filterObj,
          });
        } else {
          response = await handleGetUsers({
            page: pagination.pageIndex,
            size: pagination.pageSize,
            sort: sorting
              .map((sort) => `${sort.id},${sort.desc ? "desc" : "asc"}`)
              .join(","),
            ...filterObj,
          });
        }
        return response;
      } catch (error) {
      } finally {
        setLoading(false); // Start loading
      }
    },
    onError: () => setLoading(false), // Ensure loading state is reset on error
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

  const changeStatus = async (id, currentStatus) => {
    try {
      setLoading(true)
      await handleStatusChangeState(id, currentStatus);
      dataQuery.refetch();
      setLoading(false)
    } catch (error) {
      setLoading(false)
      toast.error(error?.response?.data?.errorDescription);
    }
  };

  // Permissoin work
  const permission = useRef({ addModule: false, editModule: false, deleteModule: false, statusModule: false, });
  useEffect(() => {
    isAdminUser().then(response => {
      if (response) {
        permission.current.statusModule = true;
        permission.current.addModule = true;
        permission.current.editModule = true;
        permission.current.deleteModule = true;
      } else {
        getModulePermissions("SEPS User").then(response => {
          if (response.includes("SEPS_USER_CREATE_BY_SEPS")) {
            permission.current.addModule = true;
          }
          if (response.includes("SEPS_USER_UPDATE_BY_SEPS")) {
            permission.current.editModule = true;
          }
          if (response.includes("SEPS_USER_STATUS_CHANGE_BY_SEPS")) {
            permission.current.statusModule = true;
          }
        }).catch(error => {
          console.error("Error fetching permissions:", error);
        });
      }
    }).catch(error => {
      console.error("Error get during to fetch User Type", error);
    })

  }, []);

  //Handle Delete
  const deleteAction = (rowData) => {
    setSelectedRow(rowData);
    setDeleteId(rowData.id);
    setDeleteShow(true);
  };

  const recordDelete = async (deleteId) => {
    setLoading(true);
    try {
      await handleDeleteUser(deleteId);
      toast.success("Your data has been deleted successfully");
      dataQuery.refetch();
      setDeleteShow(false);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const columns = React.useMemo(
    () => [
      {
        accessorFn: (row) => row?.name,
        id: "firstName",
        header: () => t('NAME'),
        enableSorting: false,
      },
      {
        accessorFn: (row) => row?.roles.length !== 0 ? row?.roles[0]?.name : 'N/A',
        id: "role",
        header: () => t('ROLE'),
        enableSorting: false,
      },
      {
        accessorFn: (row) => row?.email,
        id: "email",
        header: () => t('EMAIL'),
      },
      {
        accessorFn: (row) => row?.createdDate,
        id: "createdDate",
        header: () => "Fecha de creación",
        cell: (info) => {
          return <span>{moment(info.row?.original.createdDate).format("l")}</span>;
        },
      },

      {
        cell: (info) => {
          return (
            permission.current.statusModule ?
              <Toggle
                id={`status-${info?.row?.original?.id}`}
                key={"status"}
                name="status"
                value={info?.row?.original?.status == 'ACTIVE' ? true : false}
                checked={info?.row?.original?.status == 'ACTIVE' ? true : false}
                onChange={() =>
                  changeStatus(
                    info?.row?.original?.id,
                    info?.row?.original?.status == 'ACTIVE' ? 'BLOCKED' : 'ACTIVE'
                  )
                }
                tooltip="Activo / Bloquear"
              />
              : ''
          );
        },
        id: "status",
        header: () => t('STATUS'),
        size: "80",
      },

      {
        id: "actions",
        isAction: true,
        cell: (rowData) => (
          permission.current.editModule ?
            <DataGridActions
              controlId="users"
              rowData={rowData}
              customButtons={[
                {
                  name: "edit",
                  enabled: true,
                  type: "link",
                  title: "Edit",
                  icon: <MdEdit size={18} />,
                },
              ]}
            />
            : ''
        ),
        header: () => <div className="text-center">{t('ACTIONS')}</div>,
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

  // TO REMOVE CURRENT DATA ON COMPONENT UNMOUNT
  useEffect(() => {
    return () => {
      queryClient.removeQueries("data");
    };
  }, [queryClient]);

  return (
    <React.Fragment>

      {loading ? <Loader isLoading={loading} />
        :
        <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
          {permission.current.addModule ?
            <PageHeader
              title="Usuarios de SEPS"
              actions={[{ label: t('ADD NEW'), to: "/users/add", variant: "warning" }]}
            />
            : ''}
          <Card className="border-0 flex-grow-1 d-flex flex-column shadow">
            <Card.Body className="d-flex flex-column">
              <ListingSearchFormUsers filter={filter} setFilter={setFilter} />
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
      }
      {/* Delete Modal */}
      <GenericModal
        show={deleteShow}
        handleClose={() => setDeleteShow(false)}
        modalHeaderTitle={`Delete SEPS User`}
        modalBodyContent={`Are you sure, you want to delete the SEPS user - ${selectedRow?.name}?`}
        handleAction={() => recordDelete(deleteId)}
        buttonName="Delete"
        ActionButtonVariant="danger"
      />
    </React.Fragment>
  );
}
