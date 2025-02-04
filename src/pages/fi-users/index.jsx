import { useQuery, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import qs from "qs";
import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";


import { Card } from "react-bootstrap";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { MdEdit } from "react-icons/md";
import CommonDataTable from "../../components/CommonDataTable";
import DataGridActions from "../../components/DataGridActions";
import Loader from "../../components/Loader";
import PageHeader from "../../components/PageHeader";
import Toggle from "../../components/Toggle";
import { AuthenticationContext } from "../../contexts/authentication.context";
import { handleFIUsersStatusChange, handleGetFIusersList } from "../../services/fiusers.services";
import SearchForm from "./SearchForm";

export default function FIUserList() {

  const queryClient = useQueryClient();
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
    status: "",
    roleId: ""
  });

  const [loading, setLoading] = useState(false);

  const { currentUser, permissions = {} } = useContext(AuthenticationContext)
  // PERMISSIONS work

  const [permissionsState, setPermissionsState] = React.useState({
    statusModule: false,
    addModule: false,
    editModule: false,
  });

  useEffect(() => {
    const updatedPermissions = {
      statusModule: false,
      addModule: false,
      editModule: false,
    };
    if (currentUser === "SYSTEM_ADMIN") {
      updatedPermissions.statusModule = true;
      updatedPermissions.addModule = true;
      updatedPermissions.editModule = true;
    } else {
      const permissionArr = permissions['FI User'] ?? [];

      if (["FI_USER_CREATE_BY_SEPS", "FI_USER_CREATE_BY_FI"].some(permission => permissionArr.includes(permission))) {
        updatedPermissions.addModule = true;
      }

      if (["FI_UPDATE_CREATE_BY_SEPS", "FI_UPDATE_CREATE_BY_FI"].some(permission => permissionArr.includes(permission))) {
        updatedPermissions.editModule = true;
      }

      if (["FI_STATUS_CHANGE_CREATE_BY_SEPS", "FI_STATUS_CHANGE_CREATE_BY_FI"].some(permission => permissionArr.includes(permission))) {
        updatedPermissions.statusModule = true;
      }

    }

    setPermissionsState(updatedPermissions);
  }, [permissions, currentUser]);




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
          response = await handleGetFIusersList({
            page: pagination.pageIndex,
            size: pagination.pageSize,
            ...filterObj,
          });
        } else {
          response = await handleGetFIusersList({
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
    setLoading(true)
    // await handleEditDistricts(id, { status: !currentStatus });

    let toggleStatus = currentStatus === "ACTIVE" ? "BLOCKED" : "ACTIVE"

    handleFIUsersStatusChange(id, toggleStatus).then(response => {
      toast.success(t("STATUS UPDATED"));
      dataQuery.refetch();
    }).catch((error) => {
      if (error?.response?.data?.errorDescription) {
        toast.error(error?.response?.data?.errorDescription);
      } else {
        toast.error(error?.message ?? t("STATUS UPDATE ERROR"));
      }
    }).finally(() => {
      setLoading(false)
    })
  };


  const columns = React.useMemo(
    () => [
      {
        accessorFn: (row) => row.name,
        id: "firstName",
        header: () => t("NAME"),
        cell: (info) => {
          return (
            <span>
              {info.row.original.name ? info?.row?.original?.name : "N/A"}
            </span>
          );
        },
      },
      {
        accessorFn: (row) => row.email,
        id: "email",
        header: () => t("EMAIL"),
      },
      {
        accessorFn: (row) => row.phoneNumber,
        id: "phoneNumber",
        header: () => t("PHONE"),
        cell: (info) => {
          return (
            <span>
              {info.row.original.phoneNumber ? `${info.row.original.countryCode}  ${info.row.original.phoneNumber}` : ''}
            </span>
          );
        },
        size: "120",
      },
      {
        accessorFn: (row) => row?.entityName,
        id: "entityName",
        header: () => t("ENTITY NAME"),
        enableSorting: false,
        cell: (info) => {
          return (
            <span>
              {info.row.original.organization?.razonSocial ? info?.row?.original?.organization?.razonSocial : "N/A"}
            </span>
          );
        },
      },
      {
        accessorFn: (row) => row?.roles?.name,
        id: "role",
        header: () => t("ROLE"),
        enableSorting: false,
        cell: (info) => {
          return (
            <span>
              {info?.row?.original?.roles?.length > 0 ? info?.row?.original?.roles[0]?.name : "N/A"}
            </span>
          );
        },
      },
      {
        accessorFn: (row) => row.createdDate,
        id: "createdDate",
        header: () => t("CREATION DATE"),
        cell: (info) => {
          return <span>{moment(info.row.original.createdDate).format("l")}</span>;
        },
      },
      ...(permissionsState?.statusModule
        ?
        [{
          id: "status",
          isAction: true,
          cell: (info) => {

            if (info?.row?.original?.status === "ACTIVE" || info?.row?.original?.status === "BLOCKED") {
              return (

                <Toggle
                  id={`status-${info?.row?.original?.id}`}
                  key={"status"}
                  name="status"
                  value={info?.row?.original?.status === "ACTIVE"}
                  checked={info?.row?.original?.status === "ACTIVE"}
                  onChange={() =>
                    changeStatus(
                      info?.row?.original?.id,
                      info?.row?.original?.status
                    )
                  }
                  tooltip={info?.row?.original?.status !== "ACTIVE" ? t("ACTIVE") : t("INACTIVE")}
                />

              );
            } else {
              return <span>{info?.row?.original?.status} </span>
            }
          },
          header: () => t("STATUS"),
          enableSorting: false,
          size: "80",
        }] : ''),
      ...(permissionsState?.editModule
        ?
        [
          {
            id: "actions",
            isAction: true,
            cell: (rowData) => (
              permissionsState.editModule ?
                <div className="pointer">
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
                </div>
                : ''
            ),
            header: () => <div className="text-center">{t("ACTIONS")}</div>,
            enableSorting: false,
            size: "80",
          }] : ''),
    ],
    [permissionsState]
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

  const actions = permissionsState?.addModule
    ? [{
      label: t("IMPORT FI USERS"),
      to: "/fi-users/import",
      variant: "outline-dark",
      disabled: false
    },
    { label: t("ADD NEW"), to: "/fi-users/add", variant: "warning" },]
    : [];
  return (
    <React.Fragment>
      <Loader isLoading={loading} />
      <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
        <PageHeader
          title={t("FI USERS")}
          actions={actions}
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
      {/* Delete Modal */}
    </React.Fragment>
  );
}
