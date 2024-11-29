import { useQuery, useQueryClient } from "@tanstack/react-query";
import qs from "qs";
import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import toast from "react-hot-toast";
import { MdDelete, MdEdit } from "react-icons/md";
import { useLocation } from "react-router-dom";
import CommonDataTable from "../../components/CommonDataTable";
import DataGridActions from "../../components/DataGridActions";
import GenericModal from "../../components/GenericModal";
import ListingSearchFormUsers from "../../components/ListingSearchFormUsers";
import PageHeader from "../../components/PageHeader";
import Toggle from "../../components/Toggle";
import {
  handleDeleteRoleRight,
  handleGetRoleRights,
} from "../../services/rolerights.service"; // Update the import to include delete function
import { handleStatusChangeState } from "../../services/user.service";
import { useTranslation } from "react-i18next";
import Loader from "../../components/Loader";

export default function RoleRightsList() {

  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const location = useLocation();
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

  const [loading, setLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState();
  const [deleteShow, setDeleteShow] = useState(false);
  const [deleteId, setDeleteId] = useState();

  //Handle Delete
  const deleteAction = (rowData) => {
    setSelectedRow(rowData);
    setDeleteId(rowData.id);
    setDeleteShow(true);
  };

  const recordDelete = async (deleteId) => {
    setLoading(true);
    try {
      await handleDeleteRoleRight(deleteId);
      toast.success("Role right deleted successfully");
      dataQuery.refetch();
      setDeleteShow(false);
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const dataQuery = useQuery({
    queryKey: ["data", pagination, sorting, filter],
    queryFn: () => {
      setLoading(true); // Start loading
      try {
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
    setLoading(true);
    if (dataQuery.data?.data?.totalPages < pagination.pageIndex + 1) {
      setPagination({
        pageIndex: dataQuery.data?.data?.totalPages - 1,
        pageSize: 10,
      });
    }
    setLoading(false);
    console.log('114: set page ')
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
      // {
      //   cell: (info) => {
      //     return (
      //       <Toggle
      //         id={`status-${info?.row?.original?.id}`}
      //         key={"status"}
      //         name="status"
      //         value={info?.row?.original?.status == 'ACTIVE' ? true : false }
      //         checked={info?.row?.original?.status == 'ACTIVE' ? true : false}
      //         onChange={() =>
      //           changeStatus(
      //             info?.row?.original?.id,
      //             info?.row?.original?.status == 'ACTIVE' ? 'BLOCKED' : 'ACTIVE' 
      //           )
      //         }
      //         tooltip="Active"
      //       />
      //     );
      //   },
      //   id: "status",
      //   header: () => t('STATUS'),
      //   size: "90",
      // },
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
              // {
              //   name: "delete",
              //   enabled: true,
              //   type: "button",
              //   title: "Delete",
              //   icon: <MdDelete size={18} />,
              //   handler: () => deleteAction(rowData.row.original),
              // },
            ]}
          />
        ),
        header: () => <div className="text-center">{t('ACTIONS')}</div>,
        size: "100",
      },
    ],
    []
  );

  useEffect(() => {
    console.log('203: set pagnination called')
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
      {
          loading ? <Loader isLoading={loading} />
          :
          <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
            <PageHeader
              title={t('ROLE & RIGHTS')}
              actions={[
                { label: t('ADD NEW'), to: "/role-rights/add", variant: "warning" },
              ]}
            />
            <Card className="border-0 flex-grow-1 d-flex flex-column shadow">
              <Card.Body className="d-flex flex-column">
                {/* <ListingSearchFormUsers filter={filter} setFilter={setFilter} /> */}
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
        modalHeaderTitle={`Delete Role`}
        modalBodyContent={`Are you sure, you want to delete the role - ${selectedRow?.name}?`}
        handleAction={() => recordDelete(deleteId)}
        buttonName="Delete"
        ActionButtonVariant="danger"
      />
    </React.Fragment>
  );
}
