import { useQuery, useQueryClient } from "@tanstack/react-query";
import qs from "qs";
import React, { useContext, useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { MdEdit } from "react-icons/md";
import { useLocation } from "react-router-dom";
import CommonDataTable from "../../components/CommonDataTable";
import DataGridActions from "../../components/DataGridActions";
import Loader from "../../components/Loader";
import PageHeader from "../../components/PageHeader";
import {
  handleGetRoleRights,
  roleRightsStatusChanges
} from "../../services/rolerights.service"; // Update the import to include delete function
import { AuthenticationContext } from "../../contexts/authentication.context";
import toast from "react-hot-toast";
import Toggle from "../../components/Toggle";
import ListingSearchForm from "../../components/ListingSearchForm";

export default function RoleRightsList() {

  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const location = useLocation();
  const params = qs.parse(location.search, { ignoreQueryPrefix: true });

  const [pagination, setPagination] = useState({
    pageIndex: params.page ? parseInt(params.page) - 1 : 0,
    pageSize: params.limit ? parseInt(params.limit) : 10,
  });
  const [sorting, setSorting] = useState([]);
  const [filter, setFilter] = useState({
    search: "",
  });

  const [loading, setLoading] = useState(true);


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
      const permissionArr = permissions['Role & Rights'] ?? [];

      if (["ROLE_AND_RIGHT_CREATE_BY_SEPS"].some(permission => permissionArr.includes(permission))) {
        updatedPermissions.addModule = true;
      }

      if (["ROLE_AND_RIGHT_STATUS_CHANGE_BY_SEPS"].some(permission => permissionArr.includes(permission))) {
        updatedPermissions.statusModule = true;
      }

      if (["ROLE_AND_RIGHT_UPDATE_BY_SEPS"].some(permission => permissionArr.includes(permission))) {
        updatedPermissions.editModule = true;
      }

    }

    setPermissionsState(updatedPermissions);
  }, [permissions, currentUser]);


  // STATUS UPDATE FUNCTION
  const changeStatus = async (id, currentStatus) => {
    setLoading(true)
    roleRightsStatusChanges(id, !currentStatus).then(response => {
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

  const dataQuery = useQuery({
    queryKey: ["data", pagination, sorting, filter],
    queryFn: async () => {
      setLoading(true); // Start loading
      try {

        //   starting
        const filterObj = qs.parse(qs.stringify(filter, { skipNulls: true }));
        Object.keys(filterObj).forEach(key => filterObj[key] === "" && delete filterObj[key]);

        // Make the API request based on sorting
        let response;
        if (sorting.length === 0) {
          response = await handleGetRoleRights({
            page: pagination.pageIndex,
            size: pagination.pageSize,
            ...filterObj,
          });
        } else {
          response = await handleGetRoleRights({
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
        setLoading(false); // Start loading
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
        header: () => t('ROLE'),
        enableSorting: true,
      },
      {
        accessorFn: (row) => row.description,
        id: "description",
        header: () => t('DESCRIPTION'),
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.userType == 'SEPS_USER' ? 'SEPS-USER' : 'FI-User',
        id: "userType",
        header: () => t('ROLE & RIGHTS'),
        enableSorting: false,
      },
      ...(permissionsState?.statusModule
        ? [
          {
            cell: (info) => {
              return (
                <Toggle
                  tooltip={info?.row?.original?.status ? t("ACTIVE") : t("INACTIVE")}
                  id={`status-${info?.row?.original?.id}`}
                  key={"status"}
                  name="status"
                  value={info?.row?.original?.status}
                  checked={info?.row?.original?.status}
                  onChange={() => changeStatus(info?.row?.original?.id, info?.row?.original?.status)}
                />
              )
            },
            id: "status",
            header: () => t("STATUS"),
            size: '80'
          },] : []),
      ...(permissionsState?.editModule
        ? [
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
                  }
                ]}
              />
            ),
            header: () => <div className="text-center">{t('ACTIONS')}</div>,
            size: "100",
          }] : []),
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
    ? [
      { label: t('ADD NEW'), to: "/role-rights/add", variant: "warning" }
    ]
    : [];



  return (
    <React.Fragment>

      <Loader isLoading={loading} />

      <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
        <PageHeader
          title={t('ROLE & RIGHTS')}
          actions={actions}
        />
        <Card className="border-0 flex-grow-1 d-flex flex-column shadow">
          <Card.Body className="d-flex flex-column">
            <ListingSearchForm filter={filter} setFilter={setFilter}/>
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
    </React.Fragment>
  );
}
