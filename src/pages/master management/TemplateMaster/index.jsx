import { useQuery } from "@tanstack/react-query";
import qs from "qs";
import React, { useEffect, useRef, useState } from "react";
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
import {
  getModulePermissions,
  isAdminUser,
} from "../../../utils/authorisedmodule";
import Add from "./Add";
import Edit from "./Edit";


import {
  handleGetTemplateMaster,
  changeTemplateMaster,
  downloadTemplateList,
} from "../../../services/templateMaster.service";
import Loader from "../../../components/Loader";

const TemplateMaster = () => {
  const { t } = useTranslation();

  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const params = qs.parse(location.search, { ignoreQueryPrefix: true });
  const [isDownloading, setDownloading] = useState(false)
  const [pagination, setPagination] = useState({
    pageIndex: params.page ? parseInt(params.page) - 1 : 1,
    pageSize: params.limit ? parseInt(params.limit) : 10,
  });
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState({ id: "", open: false });
  const [sorting, setSorting] = useState([]);
  const [filter, setFilter] = useState({
    search: "",
  });

  const toggle = () => setModal(!modal);

  const editToggle = () => setEditModal({ id: "", open: !editModal?.open });

  const permission = useRef({
    addModule: false,
    editModule: false,
    deleteModule: false,
    statusModule: false,
  });

  useEffect(() => {
    isAdminUser()
      .then((response) => {
        if (response) {
          permission.current.addModule = true;
          permission.current.editModule = true;
          permission.current.deleteModule = true;
          permission.current.statusModule = true;
        } else {
          getModulePermissions("Template Master")
            .then((response) => {
              if (response.includes("TEMPLATE_CREATE")) {
                permission.current.addModule = true;
              }
              if (response.includes("TEMPLATE_UPDATE")) {
                permission.current.editModule = true;
              }
              if (response.includes("TEMPLATE_STATUS_CHANGE")) {
                permission.current.statusModule = true;
              }
            })
            .catch((error) => {
              console.error("Error fetching permissions:", error);
            });
        }
      })
      .catch((error) => {
        console.error("Error get during to fetch Province Master", error);
      });
  }, []);

  const editCityMaster = async (rowData) => {
    setEditModal({ row: rowData, open: !editModal?.open });
  };

  const dataQuery = useQuery({
    queryKey: ["data", pagination, sorting, filter],
    // queryFn: () => {
    //   const filterObj = qs.parse(qs.stringify(filter, { skipNulls: true }));
    //   Object.keys(filterObj).forEach(
    //     (key) => filterObj[key] === "" && delete filterObj[key]
    //   );

    //   // For now, returning default data without API request
    //   return [
    //     {
    //       id: 1,
    //       templateMaster: "Cuenca",
    //     },
    //     {
    //       id: 2,
    //       templateMaster: "Guaranda",
    //     },
    //   ];
    // },
    queryFn: () => {

      setLoading(true); // Start loading
      try {
        const filterObj = qs.parse(qs.stringify(filter, { skipNulls: true }));
        Object.keys(filterObj).forEach(key => filterObj[key] === "" && delete filterObj[key]);

        if (sorting.length === 0) {
          return handleGetTemplateMaster({
            page: pagination.pageIndex,
            size: pagination.pageSize,
            ...filterObj,
          });
        } else {
          return handleGetTemplateMaster({
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
    setLoading(true);
    if (dataQuery.data?.data?.totalPages < pagination.pageIndex + 1) {
      setPagination({
        pageIndex: dataQuery.data?.data?.totalPages - 1,
        pageSize: 10,
      });
    }
    setLoading(false);
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
        // accessorFn: (row) => row.status ? "Active" : "Inactive",
        cell: (info) => {
          return (
            permission.current.statusModule ?
            <Toggle
              id={`status-${info?.row?.original?.id}`}
              key={"status"}
              // label="Status"
              name="status"
              value={info?.row?.original?.status}
              checked={info?.row?.original?.status}
              onChange={() => changeStatus(info?.row?.original?.id, info?.row?.original?.status)}
              tooltip="Active"
            /> : ''
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
          permission.current.editModule ? 
          <DataGridActions
            controlId="role-rights"
            rowData={rowData}
            customButtons={[
              {
                name: "edit",
                enabled: permission.current.editModule,
                type: "button",
                title: "Edit",
                icon: <MdEdit size={18} />,
                handler: () => editCityMaster(rowData?.row?.original),
              },
            ]}
          /> : ''
        ),
        header: () => (
          <div className="text-center">{t("ACTIONS")}</div>
        ),
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
        tempLink.setAttribute('download', 'cities.xlsx');

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
      {
        loading ? <Loader isLoading={loading} />
          :

          <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">

            <PageHeader
              title={t("TEMPLATE MASTER")}
              actions={[
                { label: "Export to CSV", onClick: exportHandler, variant: "outline-dark", disabled: isDownloading ?? false },
                { label: "Add New", onClick: toggle, variant: "warning" },
              ]}
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
            <Add modal={modal} dataQuery={dataQuery} toggle={toggle} />
            <Edit modal={editModal?.open} dataQuery={dataQuery} rowData={editModal?.row} toggle={editToggle} />
          </div>
      }
    </React.Fragment>
  );
};

export default TemplateMaster;
