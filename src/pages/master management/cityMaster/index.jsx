import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { changeCityStatus, downloadCityList, handleGetCities, provinceDropdownData } from "../../../services/cityMaster.service";
import Loader from "../../../components/Loader";


const CityMaster = () => {
  const { t } = useTranslation();

  const location = useLocation();
  const queryClient = useQueryClient();
  const params = qs.parse(location.search, { ignoreQueryPrefix: true });
  const [isDownloading, setDownloading] = useState(false)

  const [isLoading, setLoading] = useState(false)

  const [pagination, setPagination] = useState({
    pageIndex: params.page ? parseInt(params.page) - 1 : 1,
    pageSize: params.limit ? parseInt(params.limit) : 10,
  });
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState({ id: "", open: false });
  const [sorting, setSorting] = useState([
    {
      "id": "name",
      "desc": true
    }
  ]);
  const [filter, setFilter] = useState({
    search: "",
  });

  const [provinces, setProvinces] = useState([])

  const toggle = () => setModal(!modal);

  const editToggle = () => setEditModal({ id: "", open: !editModal?.open });

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
              getModulePermissions("City Master").then(response => {
                  console.log('response',response)
                  if (response.includes("CITY_CREATE")) {
                      permission.current.addModule = true;
                  }
                  if (response.includes("CITY_UPDATE")) {
                      permission.current.editModule = true;
                  }
                  if (response.includes("CITY_STATUS_CHANGE")) {
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

  const editCityMaster = async (rowData) => {
     setEditModal({ row: rowData, open: !editModal?.open })
  };

  // FETCH DATA


  const dataQuery = useQuery({
    queryKey: ["data", pagination, sorting, filter],
    queryFn: async () => {
      setLoading(true); // Start loading
  
      try {
        // Clean up the filter object to remove empty strings and null values
        const filterObj = qs.parse(qs.stringify(filter, { skipNulls: true }));
        Object.keys(filterObj).forEach(key => {
          if (filterObj[key] === "") delete filterObj[key];
        });
  
        const requestOptions = {
          page: pagination.pageIndex,
          size: pagination.pageSize,
          ...filterObj,
        };
  
        // Handle sorting if applicable
        if (sorting.length > 0) {
          requestOptions.sort = sorting
            .map(sort => `${sort.id},${sort.desc ? "desc" : "asc"}`)
            .join(",");
        }
  
        // Fetch data using handleGetProvinceMaster API call
        const response = await handleGetCities(requestOptions);
        return response;
      } finally {
        setLoading(false); // Ensure loading state is reset
      }
    },
    onError: () => setLoading(false), // Reset loading state on error
    staleTime: 0, // Data is always considered stale
    cacheTime: 0, // Cache expires immediately
    refetchOnWindowFocus: false, // Disable refetching on window focus
    refetchOnMount: false, // Prevent refetching on component remount
    retry: 0, // Disable automatic retries to prevent multiple calls on error
  });

  //CITY STATUS UPDATE FUNCTION
  const changeStatus = async (id, currentStatus) => {
    setLoading(true)
    changeCityStatus(id, !currentStatus).then(response => {
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
        accessorFn: (row) => row?.name,
        id: "name",
        header: () => t("CITY NAME"),
      },
      {
        accessorFn: (row) => row?.provinceName,
        id: "provinceName",
        header: () => t("PROVINCE"),
      },
      {
        // accessorFn: (row) => row.status ? "Active" : "Inactive",
        cell: (info) => {
          return (
            <div className="d-flex items-center gap-2 pointer">
                    {permission.current.statusModule ?
                        <Toggle
                            tooltip={
                              info?.row?.original?.status ? t("ACTIVE") : t("INACTIVE")
                            }
                            id={`status-${info?.row?.original?.id}`}
                            key={"status"}
                            // label="Status"
                            name="status"
                            value={info?.row?.original?.status}
                            checked={info?.row?.original?.status}
                            onChange={() =>
                              changeStatus(
                                info?.row?.original?.id,
                                info?.row?.original?.status
                              )
                            }
                          />
                    : ""}
              </div>
            
          );
        },
        id: "status",
        header: () => t("STATUS"),
        size: "80",
      },
      {
        id: "actions",
        isAction: true,
        cell: (rowData) => (
              <div className="d-flex items-center gap-2 pointer">
                    {permission.current.editModule ?
                        <DataGridActions
                            controlId="province-master"
                            rowData={rowData}
                            customButtons={[
                              {
                                name: "edit",
                                enabled: permission.current.editModule,
                                type: "button",
                                title: t("EDIT"),
                                icon: <MdEdit size={18} />,
                                handler: () => editCityMaster(rowData?.row?.original),
                              },
                            ]}
                          />
                    : ""}
              </div> 
          
        ),
        header: () => <div className="text-center">{t("ACTIONS")}</div>,
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
    toast.loading( t("EXPORT IN PROGRESS") , {id: "downloading" , isLoading : isDownloading ?? false})
    downloadCityList({ search: filter?.search ?? "" }).then(response => {
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
        toast.success(t("CSV DOWNLOADED"),{id: "downloading"})
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

  // TO REMOVE CURRENT DATA ON COMPONENT UNMOUNT
  useEffect(() => {
    return () => {
      queryClient.removeQueries("data");
    };
  }, [queryClient]);

  // GET CLAIM TYPE DROPDOWN LIST
  const getProvinceDropdownData = () => {
    provinceDropdownData().then(response => {
      if (response?.data && response?.data?.length > 0) {
        const dropdownData = response?.data.map(item => ({
          value: item?.id,
          label: item?.name
        }));
        setProvinces(dropdownData)
      }
    }).catch((error) => {
      if (error?.response?.data?.errorDescription) {
        toast.error(error?.response?.data?.errorDescription);
      } else {
        toast.error(error?.message ?? "FAILED TO FETCH CLAIM TYPE DATA");
      }
    })
  }

  useEffect(() => {
    getProvinceDropdownData()
  }, [])

  return (
    <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
      <Loader isLoading={isLoading} />
      {permission.current.addModule
        ?
      <PageHeader
        title={t("CITY MASTER")}
        actions={[
          {  label: "Export to CSV", onClick: exportHandler, variant: "outline-dark",disabled : isDownloading ? true : false},
          { label: "Add New", onClick: toggle, variant: "warning" },
        ]}
      /> : ''}
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
      <Add modal={modal} toggle={toggle} provinces={provinces} dataQuery={dataQuery} />
      <Edit modal={editModal?.open} toggle={editToggle} provinces={provinces} dataQuery={dataQuery} rowData={editModal?.row} />
    </div>
  );
};

export default CityMaster;
