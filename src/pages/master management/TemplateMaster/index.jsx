import { useQuery } from "@tanstack/react-query";
import qs from "qs";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Card } from "react-bootstrap";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { MdEdit } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import CommonDataTable from "../../../components/CommonDataTable";
import DataGridActions from "../../../components/DataGridActions";

import PageHeader from "../../../components/PageHeader";
import Toggle from "../../../components/Toggle";
import {
  getModulePermissions,
  isAdminUser,
} from "../../../utils/authorisedmodule";
import Add from "./Add";
import Edit from "./Edit";
import ListingSearchForm from "./ListingSearchForm";
import {
  handleGetTemplateMaster,
  changeTemplateMaster,
  downloadTemplateList,
} from "../../../services/templateMaster.service";
import Loader from "../../../components/Loader";
import { AuthenticationContext } from "../../../contexts/authentication.context";

const TemplateMaster = () => {
  const { t } = useTranslation();

  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const params = qs.parse(location.search, { ignoreQueryPrefix: true });
  const [isDownloading, setDownloading] = useState(false)
  const [pagination, setPagination] = useState({
    pageIndex: params.page ? parseInt(params.page) - 1 : 0,
    pageSize: params.limit ? parseInt(params.limit) : 10,
  });
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState({ row: {}, open: false });
  const [sorting, setSorting] = useState([]);
  const [filter, setFilter] = useState({
    search: "",
  });

  const toggle = () => setModal(!modal);
  const editToggle = () => setEditModal({ row: {}, open: !editModal?.open });

  // const permission = useRef({
  //   addModule: false,
  //   editModule: false,
  //   deleteModule: false,
  //   statusModule: false,
  // });

  // useEffect(() => {
  //   isAdminUser()
  //     .then((response) => {
  //       if (response) {
  //         permission.current.addModule = true;
  //         permission.current.editModule = true;
  //         permission.current.deleteModule = true;
  //         permission.current.statusModule = true;
  //       } else {
  //         getModulePermissions("Template Master")
  //           .then((response) => {
  //             if (response.includes("TEMPLATE_CREATE")) {
  //               permission.current.addModule = true;
  //             }
  //             if (response.includes("TEMPLATE_UPDATE")) {
  //               permission.current.editModule = true;
  //             }
  //             if (response.includes("TEMPLATE_STATUS_CHANGE")) {
  //               permission.current.statusModule = true;
  //             }
  //           })
  //           .catch((error) => {
  //             console.error("Error fetching permissions:", error);
  //           });
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Error get during to fetch Province Master", error);
  //     });
  // }, []);


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
      const permissionArr = permissions['Claim Type Master'] ?? [];

      if (["CLAIM_TYPE_CREATE", "CLAIM_TYPE_CREATE_FI"].some(permission => permissionArr.includes(permission))) {
        updatedPermissions.addModule = true;
      }

      if (["CLAIM_TYPE_STATUS_CHANGE", "CLAIM_TYPE_STATUS_CHANGE_FI"].some(permission => permissionArr.includes(permission))) {
        updatedPermissions.editModule = true;
      }

      if (["CLAIM_TYPE_UPDATE", "CLAIM_TYPE_UPDATE_FI"].some(permission => permissionArr.includes(permission))) {
        updatedPermissions.statusModule = true;
      }

    }

    setPermissionsState(updatedPermissions);
  }, [permissions, currentUser]);


  const editTemplateMaster = async (rowData) => {
    navigate(`/template-master/edit/${rowData?.id}`)
    // setEditModal({ row: rowData, open: !editModal?.open });
  };

  const dataQuery = useQuery({
    queryKey: ["data", pagination, sorting, filter],
    queryFn: async () => {

      setLoading(true);
      try {
        const filterObj = qs.parse(qs.stringify(filter, { skipNulls: true }));
        Object.keys(filterObj).forEach(key => filterObj[key] === "" && delete filterObj[key]);

        let response;
        if (sorting.length === 0) {
          response = await handleGetTemplateMaster({
            page: pagination.pageIndex,
            size: pagination.pageSize,
            ...filterObj,
          });
        } else {
          response = await handleGetTemplateMaster({
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
      } catch (error) { // Start loading
      } finally {
        setLoading(false); // Start loading
      }
    },
    onError: () => setLoading(false), // Ensure loading state is reset on error
    staleTime: 0, // Data is always stale, so it refetches
    cacheTime: 0, // Cache expires immediately
    refetchOnWindowFocus: false, // Disable refetching on window focus
    refetchOnMount: true, // Prevent refetching on component remount
    retry: 0, //Disable retry on failure
  });

  const changeStatus = async (id, currentStatus) => {
    setLoading(true);
    try {
      await changeTemplateMaster(id, { status: !currentStatus });

      dataQuery.refetch();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error();
    } finally {
      setLoading(false); // Start loading
    }

  };
  useEffect(() => {
    if (dataQuery.data?.data?.totalPages < pagination.pageIndex + 1) {
      setPagination({
        pageIndex: dataQuery.data?.data?.totalPages - 1,
        pageSize: 10,
      });
    }
  }, [dataQuery.data?.data?.totalPages]);
  // }, []);

  const columns = React.useMemo(
    () => [
      {
        accessorFn: (row) => row.templateName,
        id: "templateName",
        header: () => t("TEMPLATE MASTER"),
      },
      {
        accessorFn: (row) => row.templateType,
        id: "templateType",
        header: () => t("TEMPLATE TYPE"),
      },
      {
        accessorFn: (row) => row?.userType,
        id: "userType",
        header: () => t("USER TYPE"),
      },
      {
        // accessorFn: (row) => row.status ? "Active" : "Inactive",
        cell: (info) => {
          return (
            permissionsState.statusModule ?
              <Toggle
                id={`status-${info?.row?.original?.id}`}
                key={"status"}
                // label="Status"
                name="status"
                value={info?.row?.original?.status}
                checked={info?.row?.original?.status}
                onChange={() => changeStatus(info?.row?.original?.id, info?.row?.original?.status)}
                tooltip="Active"
              />
              : ''
          )
        },
        id: "status",
        header: () => t("STATUS"),
        size: '90',
      },
      {
        id: "actions",
        isAction: true,
        cell: (rowData) => (
          permissionsState.editModule ?
            <DataGridActions
              controlId="role-rights"
              rowData={rowData}
              customButtons={[
                {
                  name: "edit",
                  enabled: true,
                  type: "button",
                  title: "Edit",
                  icon: <MdEdit size={18} />,
                  handler: () => editTemplateMaster(rowData?.row?.original),
                },
              ]}
            />
            : ''
        ),
        header: () => (
          <div className="text-center">{t("ACTIONS")}</div>
        ),
        enableSorting: false,
        size: "80",
      },
    ],
    [permissionsState]
  );

  useEffect(() => {
    setPagination({
      pageIndex: 0,
      pageSize: 10,
    });
  }, [filter]);

  // EXPORT TO CSV CLICK HANDLER
  const exportHandler = () => {
    setDownloading(true)
    toast.loading(t("EXPORT IN PROGRESS"), { id: "downloading", isLoading: isDownloading })
    downloadTemplateList({ search: filter?.search ?? "" }).then(response => {
      if (response?.data) {
        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const blobUrl = window.URL.createObjectURL(blob);

        const tempLink = document.createElement('a');
        tempLink.href = blobUrl;
        tempLink.setAttribute('download', 'templates.xlsx');

        // Append the link to the document body before clicking it
        document.body.appendChild(tempLink);

        tempLink.click();

        // Clean up by revoking the Blob URL
        window.URL.revokeObjectURL(blobUrl);

        // Remove the link from the document body after clicking
        document.body.removeChild(tempLink);
        toast.success(t("CSV DOWNLOADED"), { id: "downloading" })
      } else {
        throw new Error(t("EMPTY RESPONSE"));
      }
      // toast.success(t("STATUS UPDATED"));
    }).catch((error) => {
      if (error?.response?.data?.errorDescription) {
        toast.error(error?.response?.data?.errorDescription);
      } else {
        toast.error(error?.message ?? t("STATUS UPDATE ERROR"));
      }
      toast.dismiss("downloading");
    }).finally(() => {
      // Ensure the loading toast is dismissed
      // toast.dismiss("downloading");
      setDownloading(false)
    });
  }

  return (
    <React.Fragment>
      <Loader isLoading={loading} />
      <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
        {
          permissionsState.addModule ?
            <PageHeader
              title={t("TEMPLATE MASTER")}
              actions={[
                { label: t("EXPORT TO CSV"), onClick: exportHandler, variant: "outline-dark", disabled: isDownloading ?? false },
                { label: t("ADD NEW"), to: "/template-master/add", variant: "warning", disabled: false },
              ]}
            /> : ''
        }

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
        <Add modal={modal} dataQuery={dataQuery} toggle={toggle} />
        <Edit modal={editModal?.open} dataQuery={dataQuery} rowData={editModal?.row} toggle={editToggle} />
      </div>
    </React.Fragment>
  );
};

export default TemplateMaster;
