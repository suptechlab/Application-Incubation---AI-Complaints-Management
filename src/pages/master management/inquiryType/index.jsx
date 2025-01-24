import { useQuery, useQueryClient } from "@tanstack/react-query";
import qs from "qs";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Card } from "react-bootstrap";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { MdEdit } from "react-icons/md";
import { useLocation } from "react-router-dom";
import CommonDataTable from "../../../components/CommonDataTable";
import DataGridActions from "../../../components/DataGridActions";
import ListingSearchForm from "../../../components/ListingSearchForm";
import PageHeader from "../../../components/PageHeader";
import Toggle from "../../../components/Toggle";
import { changeInquiryTypeStatus, downloadInquiryTypes, handleGetInquiryType } from "../../../services/inquiryType.service";
import { getModulePermissions, isAdminUser } from "../../../utils/authorisedmodule";
import Add from "./Add";
import Edit from "./Edit";
import Loader from "../../../components/Loader";
import { AuthenticationContext } from "../../../contexts/authentication.context";

const InquiryType = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const params = qs.parse(location.search, { ignoreQueryPrefix: true });
  const [isLoading, setLoading] = useState(false)
  const [isDownloading, setDownloading] = useState(false)

  const { t } = useTranslation()

  const [pagination, setPagination] = useState({
    pageIndex: params.page ? parseInt(params.page) - 1 : 0,
    pageSize: params.limit ? parseInt(params.limit) : 10,
  });
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState({ row: {}, open: false })
  const [sorting, setSorting] = useState([
    {
      "id": "name",
      "desc": true
    }
  ]);
  const [filter, setFilter] = useState({
    search: "",
  });

  const toggle = () => setModal(!modal);

  const editToggle = () => setEditModal({ row: {}, open: !editModal?.open });


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
      const permissionArr = permissions['Inquiry Type Master'] ?? [];

      if (["INQUIRY_TYPE_CREATE"].some(permission => permissionArr.includes(permission))) {
        updatedPermissions.addModule = true;
      }

      if (["INQUIRY_TYPE_UPDATE"].some(permission => permissionArr.includes(permission))) {
        updatedPermissions.editModule = true;
      }

      if (["INQUIRY_TYPE_STATUS_CHANGE"].some(permission => permissionArr.includes(permission))) {
        updatedPermissions.statusModule = true;
      }

    }

    setPermissionsState(updatedPermissions);
  }, [permissions, currentUser]);

  const editInquiryType = async (rowData) => {
    setEditModal({ row: rowData, open: !editModal?.open })
  };

  const dataQuery = useQuery({
    queryKey: ["data", pagination, sorting, filter],
    queryFn: async () => {
      setLoading(true); // Set loading to true when fetching starts

      // Parse and clean up the filter object
      const filterObj = qs.parse(qs.stringify(filter, { skipNulls: true }));
      Object.keys(filterObj).forEach(key => {
        if (filterObj[key] === "") delete filterObj[key];
      });

      const requestOptions = {
        page: pagination.pageIndex,
        size: pagination.pageSize,
        ...filterObj,
      };

      // Add sorting if it's specified
      if (sorting.length > 0) {
        requestOptions.sort = sorting
          .map((sort) => `${sort.id},${sort.desc ? "desc" : "asc"}`)
          .join(",");
      }

      try {
        // Make the API call
        const response = await handleGetInquiryType(requestOptions);
        return response;
      } finally {
        setLoading(false); // Set loading to false once data is fetched
      }
    },
    onError: () => setLoading(false), // Ensure loading state is reset on error
    staleTime: 0, // Data is always stale
    cacheTime: 0, // Cache expires immediately
    refetchOnWindowFocus: false, // Disable refetching on window focus
    refetchOnMount: false, // Prevent refetching on component remount
    retry: 0, //Disable retry on failure
  });

  const changeStatus = async (id, currentStatus) => {
    changeInquiryTypeStatus(id, !currentStatus).then(response => {
      toast.success(t("STATUS UPDATED"));
      dataQuery.refetch();
    }).catch((error) => {
      if (error?.response?.data?.errorDescription) {
        toast.error(error?.response?.data?.errorDescription);
      } else {
        toast.error(error?.message ?? t("STATUS UPDATE ERROR"));
      }
    })
  };

  // HANDLE INQUIRY TYPES CSV DOWNLOAD
  const handleDownload = () => {
    setDownloading(true)
    toast.loading(t("EXPORT IN PROGRESS"), { id: "downloading", isLoading: isDownloading })
    downloadInquiryTypes({ search: filter?.search ?? "" }).then(response => {
      if (response?.data) {
        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const blobUrl = window.URL.createObjectURL(blob);

        const tempLink = document.createElement('a');
        tempLink.href = blobUrl;
        tempLink.setAttribute('download', 'Inquiry-types.xlsx');

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
    })
  }

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
        accessorFn: (row) => row?.name,
        id: "name",
        header: () => t("INQUIRY CATEGORY"),
        enableSorting: true
      },
      {
        accessorFn: (row) => row?.description != null ? row?.description : '-',
        id: "description",
        header: () => t("DESCRIPTION"),
        enableSorting: true,
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
                  // label="Status"
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
                controlId="inquiry-master"
                rowData={rowData}
                customButtons={[
                  {
                    name: "edit",
                    enabled: permissionsState.editModule,
                    type: "button",
                    title: t("EDIT"),
                    icon: <MdEdit size={18} />,
                    handler: () => editInquiryType(rowData?.row?.original),
                  },
                ]}
              />
            ),
            header: () => <div className="text-center">{t("ACTIONS")}</div>,
            enableSorting: false,
            size: '80',
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


  return <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
    <Loader isLoading={isLoading} />
    {permissionsState.addModule
      ?
      <PageHeader title={t("INQUIRY TYPE")}
        actions={[
          { label: t("EXPORT TO CSV"), onClick: handleDownload, variant: "outline-dark", disabled: isDownloading },
          { label: t("ADD NEW"), onClick: toggle, variant: "warning" },
        ]} />
      : ''}
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
};

export default InquiryType;
