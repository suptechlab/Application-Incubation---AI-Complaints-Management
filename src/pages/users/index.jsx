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

export default function UserList() {
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

  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState();
  const [deleteShow, setDeleteShow] = useState(false);
  const [deleteId, setDeleteId] = useState();

  const dataQuery = useQuery({
    queryKey: ["data", pagination, sorting, filter],
    queryFn: () => {
      const filterObj = qs.parse(qs.stringify(filter, { skipNulls: true }));
      Object.keys(filterObj).forEach(
        (key) => filterObj[key] === "" && delete filterObj[key]
      );

      if (sorting.length === 0) {
        return handleGetUsers({
          page: pagination.pageIndex,
          size: pagination.pageSize,
          ...filterObj,
        });
      } else {
        return handleGetUsers({
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
      await handleStatusChangeState(id, currentStatus);
      dataQuery.refetch();
    } catch (error) {
      toast.error(error?.response?.data?.errorDescription);
    }
  };

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
        accessorFn: (row) => row.name,
        id: "name",
        header: () => t('NAME'),
      },
      {
        accessorFn: (row) => row.roles[0].name ?? "N/A",
        id: "claimTypeName",
        header: () =>  t('ROLE'),
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.email,
        id: "email",
        header: () => t('EMAIL'),
      },
      // {
      //   accessorFn: (row) => row.mobileNo,
      //   id: "mobileNo",
      //   header: () => "Unidad Organizacional",
      //   cell: (info) => {
      //     return (
      //       <span>
      //         {info.row.original.mobileCode} {info.row.original.mobileNo}
      //       </span>
      //     );
      //   },
      // },

      {
        accessorFn: (row) => row.createdDate,
        id: "createdDate",
        header: () => "Fecha de creación",
        cell: (info) => {
          return <span>{moment(info.row.original.createdDate).format("l")}</span>;
        },
      },

      {
        cell: (info) => {
          // console.log('rowstatus 100->',info?.row?.original?.status);
          return (
            <Toggle
              id={`status-${info?.row?.original?.id}`}
              key={"status"}
              name="status"
              value={info?.row?.original?.status == 'ACTIVE' ? true : false }
              checked={info?.row?.original?.status == 'ACTIVE' ? true : false}
              onChange={() =>
                changeStatus(
                  info?.row?.original?.id,
                  info?.row?.original?.status == 'ACTIVE' ? 'BLOCKED' : 'ACTIVE' 
                )
              }
              tooltip="Activo / Bloquear"
            />
          );
        },
        id: "status",
        header: () => t('STATUS'),
        size: "80",
      },

      {
        id: "actions",
        isAction: true,
        // cell: (info) => {
        //     return (
        //         <div className="d-flex items-center gap-2">
        //             <div
        //                 onClick={() => {
        //                     navigate(`/users/edit/${info.row.original.id}`);
        //                 }}
        //             >
        //                 <span className=''>{SvgIcons.editIcon}</span>
        //             </div>
        //             <div
        //                 onClick={() => {
        //                     Swal.fire({
        //                         title: "Reset Password",
        //                         text: "Are you sure you want to reset password again?",
        //                         icon: "warning",
        //                         showCancelButton: true,
        //                         confirmButtonText: "Yes!",
        //                         cancelButtonText: "No, cancel!",
        //                         reverseButtons: true,
        //                     }).then((result) => {
        //                         if (result.isConfirmed) {
        //                             handleUserResetPassword(
        //                                 info.row.original.id
        //                             ).then((response) => {
        //                                 Swal.fire(
        //                                     "Reset Password",
        //                                     response.data.message,
        //                                     "success"
        //                                 );
        //                                 dataQuery.refetch();
        //                             });
        //                         } else if (result.dismiss === Swal.DismissReason.cancel) {
        //                         }
        //                     });
        //                 }}
        //             >
        //                 <span className='' >{SvgIcons.keyIcon}</span>

        //             </div>

        //             <div
        //                 onClick={() => {
        //                     Swal.fire({
        //                         title: "Are you sure?",
        //                         text: "You will not be able to recover this data!",
        //                         icon: "warning",
        //                         showCancelButton: true,
        //                         confirmButtonText: "Yes, delete it!",
        //                         cancelButtonText: "No, cancel!",
        //                         reverseButtons: true,
        //                     }).then((result) => {
        //                         if (result.isConfirmed) {
        //                             console.log(
        //                                 "Delete",
        //                                 info.row.original
        //                             );
        //                             handleDeleteUser(
        //                                 info.row.original.id
        //                             ).then(() => {
        //                                 Swal.fire(
        //                                     "Deleted!",
        //                                     "Your data has been deleted.",
        //                                     "success"
        //                                 );
        //                                 dataQuery.refetch();
        //                             });
        //                         } else if (
        //                             result.dismiss ===
        //                             Swal.DismissReason.cancel
        //                         ) {
        //                         }
        //                     });
        //                 }}
        //             >
        //                 <span className=''>{SvgIcons.deleteIcon}</span>
        //             </div>
        //         </div>
        //     );
        // },
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
          title="Usuarios de SEPS"
          actions={[{ label: t('ADD NEW'), to: "/users/add", variant: "warning" }]}
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
