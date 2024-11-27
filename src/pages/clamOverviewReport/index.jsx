import { useQuery, useQueryClient } from "@tanstack/react-query";
import qs from "qs";
import React, { useEffect, useRef, useState } from "react";
import { Card } from "react-bootstrap";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { MdEdit } from "react-icons/md";
import { useLocation } from "react-router-dom";
import CommonDataTable from "../../components/CommonDataTable";
import DataGridActions from "../../components/DataGridActions";
import ListingSearchForm from "../../components/ListingSearchForm";
import Loader from "../../components/Loader";
import PageHeader from "../../components/PageHeader";
import Toggle from "../../components/Toggle";
import { getModulePermissions, isAdminUser } from "../../utils/authorisedmodule";

const ClaimOverviewReport = () => {

  const location = useLocation();
  const queryClient = useQueryClient();

  const params = qs.parse(location.search, { ignoreQueryPrefix: true });

  const [isLoading, setLoading] = useState(false)
  const [isDownloading, setDownloading] = useState(false)

  const { t } = useTranslation()

  const [pagination, setPagination] = useState({
    pageIndex: params.page ? parseInt(params.page) - 1 : 1,
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


  const permission = useRef({ addModule: false, editModule: false, deleteModule: false });

  useEffect(() => {
    isAdminUser().then(response => {
      if (response) {
        permission.current.addModule = true;
        permission.current.editModule = true;
        permission.current.deleteModule = true;
      } else {
        getModulePermissions("Master management").then(response => {
          if (response.includes("CLAIM_TYPE_CREATE")) {
            permission.current.addModule = true;
          }
          if (response.includes("CLAIM_TYPE_UPDATE")) {
            permission.current.editModule = true;
          }
          if (response.includes("CLAIM_TYPE_DELETE")) {
            permission.current.deleteModule = true;
          }
        }).catch(error => {
          console.error("Error fetching permissions:", error);
        });
      }
    }).catch(error => {
      console.error("Error get during to fetch User Type", error);
    })

  }, []);
  // EDIT CLAIM TYPE
  const editClaimType = async (row) => {
    setEditModal({ row: row, open: !editModal?.open })
  };

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
        // if (sorting.length === 0) {
        //   response = await handleGetClaimTypes({
        //     page: pagination.pageIndex,
        //     size: pagination.pageSize,
        //     ...filterObj,
        //   });
        // } else {
        //   response = await handleGetClaimTypes({
        //     page: pagination.pageIndex,
        //     size: pagination.pageSize,
        //     sort: sorting
        //       .map(
        //         (sort) => `${sort.id},${sort.desc ? "desc" : "asc"}`
        //       )
        //       .join(","),
        //     ...filterObj,
        //   });
        // }

        // Return the API response data
        return response?.payload;
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

  // STATUS UPDATE FUNCTION
  const changeStatus = async (id, currentStatus) => {
    setLoading(true)
    // await handleEditDistricts(id, { status: !currentStatus });
    // changeClaimTypeStatus(id, !currentStatus).then(response => {
    //   toast.success(t("STATUS UPDATED"));
    //   dataQuery.refetch();
    // }).catch((error) => {
    //   if (error?.response?.data?.errorDescription) {
    //     toast.error(error?.response?.data?.errorDescription);
    //   } else {
    //     toast.error(error?.message ?? t("STATUS UPDATE ERROR"));
    //   }
    // }).finally(() => {
    //   setLoading(false)
    // })
  };

  // DOWNLOAD CLAIM TYPES LIST
  const handleDownload = () => {
    setDownloading(true)
    toast.loading(t("EXPORT IN PROGRESS"), { id: "downloading", isLoading: isDownloading })
    // downloadClaimTypes({ search: filter?.search ?? "" }).then(response => {
    //   if (response?.data) {
    //     const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    //     const blobUrl = window.URL.createObjectURL(blob);

    //     toast.success(t("CSV DOWNLOADED"), { id: "downloading" })


    //     const tempLink = document.createElement('a');
    //     tempLink.href = blobUrl;
    //     tempLink.setAttribute('download', 'claim-types.xlsx');

    //     // Append the link to the document body before clicking it
    //     document.body.appendChild(tempLink);

    //     tempLink.click();

    //     // Clean up by revoking the Blob URL
    //     window.URL.revokeObjectURL(blobUrl);

    //     // Remove the link from the document body after clicking
    //     document.body.removeChild(tempLink);
    //   } else {
    //     throw new Error(t("EMPTY RESPONSE"));
    //   }
    //   // toast.success(t("STATUS UPDATED"));
    // }).catch((error) => {
    //   if (error?.response?.data?.errorDescription) {
    //     toast.error(error?.response?.data?.errorDescription);
    //   } else {
    //     toast.error(error?.message ?? t("STATUS UPDATE ERROR"));
    //   }
    //   toast.dismiss("downloading");
    // }).finally(() => {
    //   // Ensure the loading toast is dismissed
    //   // toast.dismiss("downloading");
    //   setDownloading(false)
    // });
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
        header: () => t("CLAIM TYPE"),
        enableSorting: true
      },
      {
        accessorFn: (row) => row?.description != null ? row?.description : '-',
        id: "description",
        header: () => t("DESCRIPTION"),
        enableSorting: true,
      },
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
      },
      {
        id: "actions",
        isAction: true,
        cell: (rowData) => (
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
                handler: () => editClaimType(rowData?.row?.original),
              },
            ]}
          />
        ),
        header: () => <div className="text-center">{t("ACTIONS")}</div>,
        enableSorting: false,
        size: '80',
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


  return <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
    <Loader isLoading={isLoading} />
    <PageHeader
      title={t("CLAIM TYPE")}
      actions={[
        { label: t("EXPORT TO CSV"), onClick: handleDownload, variant: "outline-dark", disabled: isDownloading },
        { label: t("ADD NEW"), onClick: toggle, variant: "warning" },
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
  
  </div>
};

export default ClaimOverviewReport;

