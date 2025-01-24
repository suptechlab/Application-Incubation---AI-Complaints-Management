import { useQuery, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import qs from "qs";
import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  handleGetUsers,
  handleStatusChangeState,
} from "../../services/user.service";

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
import ListingSearchFormUsers from "./ListingSearchFormUsers";

export default function UserList() {

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
      const permissionArr = permissions['SEPS User'] ?? [];
      if (permissionArr.includes("SEPS_USER_CREATE_BY_SEPS")) {
        updatedPermissions.addModule = true;
      }
      if (permissionArr.includes("SEPS_USER_UPDATE_BY_SEPS")) {
        updatedPermissions.editModule = true;
      }
      if (permissionArr.includes("SEPS_USER_STATUS_CHANGE_BY_SEPS")) {
        updatedPermissions.statusModule = true;
      }
    }

    setPermissionsState(updatedPermissions);
  }, [permissions, currentUser]);


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
    subscription: "",
    status: "",
  });

  const [loading, setLoading] = useState(false);

  //handle last page deletion item

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
    refetchOnMount: true, // Prevent refetching on component remount
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



  const columns = React.useMemo(
    () => [
      {
        accessorFn: (row) => row?.name,
        id: "firstName",
        header: () => t('NAME'),
        enableSorting: false,
      },
      {
        accessorFn: (row) => row?.roles,
        id: "role",
        header: () => t('ROLE'),
        enableSorting: false,
        cell: (info) => {
          return <span>
            {
              info?.row?.original?.roles && info?.row?.original?.roles?.length > 0 ? info?.row?.original?.roles[0]?.name : ''
            }

          </span>
        }
      },
      {
        accessorFn: (row) => row?.email,
        id: "email",
        header: () => t('EMAIL'),
      },
      {
        accessorFn: (row) => row?.createdDate,
        id: "createdDate",
        header: () => t("CREATION DATE"),
        cell: (info) => {
          return <span>{moment(info.row?.original.createdDate).format("l")}</span>;
        },
      },

      ...(permissionsState?.statusModule
        ? [
          {
            id: "status",
            header: () => t('STATUS'),
            size: "80",
            cell: (info) => {
              return (
                <Toggle
                  id={`status-${info?.row?.original?.id}`}
                  key={"status"}
                  name="status"
                  value={info?.row?.original?.status === 'ACTIVE'}
                  checked={info?.row?.original?.status === 'ACTIVE'}
                  onChange={() =>
                    changeStatus(
                      info?.row?.original?.id,
                      info?.row?.original?.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE'
                    )
                  }
                  tooltip="Activo / Bloquear"
                />
              );
            },
          }]

        : []),

      ...(permissionsState?.editModule
        ?
        [{
          id: "actions",
          isAction: true,
          cell: (rowData) => (
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

          ),
          header: () => <div className="text-center">{t('ACTIONS')}</div>,
          enableSorting: false,
          size: "80",
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
      //   {
      //   label: t("IMPORT_SEPS_USERS"),
      //   to: "/users/import",
      //   variant: "outline-dark",
      //   disabled: false
      // }
      // ,
      { label: t('ADD NEW'), to: "/users/add", variant: "warning" }]
    : [];

  return (
    <React.Fragment>
      <Loader isLoading={loading} />
      <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
        {permissionsState?.addModule ?
          <PageHeader
            title={t("SEPS USERS")}
            actions={actions}
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

      {/* Delete Modal */}
      {/* <GenericModal
        show={deleteShow}
        handleClose={() => setDeleteShow(false)}
        modalHeaderTitle={`Delete SEPS User`}
        modalBodyContent={`Are you sure, you want to delete the SEPS user - ${selectedRow?.name}?`}
        handleAction={() => recordDelete(deleteId)}
        buttonName="Delete"
        ActionButtonVariant="danger"
      /> */}
    </React.Fragment>
  );
}
