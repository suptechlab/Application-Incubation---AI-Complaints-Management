import { useQuery, useQueryClient } from "@tanstack/react-query";
import qs from "qs";
import React, { useEffect, useRef, useState } from "react";
import { Card } from "react-bootstrap";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import CommonDataTable from "../../components/CommonDataTable";
import Loader from "../../components/Loader";
import PageHeader from "../../components/PageHeader";
import { getModulePermissions, isAdminUser } from "../../utils/authorisedmodule";
import ListingSearchForm from "./ListingSearchForm";

const SLAComplianceReport = () => {

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
  const [sorting, setSorting] = useState([]);
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

  // Dummy Data for SLAComplianceReport
const dummyData = {
  data: {
    totalPages: 5,
    totalItems: 50,
    data: Array.from({ length: 10 }, (_, index) => ({
      ticketId: `TICK-${index + 1}`,
      name: `Claim Type ${index + 1}`,
      claimSubType: { name: `Sub Type ${index + 1}` },
      createdAt: new Date().toISOString(),
      slaDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      slaBreachDays: index % 3 === 0 ? index : 0, // Breach days for every 3rd item
      status: index % 2 === 0 ? "Active" : "Inactive", // Alternating status
    })),
  },
};

  // DATA QUERY
  const dataQuery = useQuery({
    queryKey: ["data", pagination, sorting, filter],
    queryFn: async () => {
      setLoading(true);
  
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));
  
        const filterObj = qs.parse(qs.stringify(filter, { skipNulls: true }));
        Object.keys(filterObj).forEach((key) => filterObj[key] === "" && delete filterObj[key]);
  
        // Use dummy data instead of API call
        return dummyData.data;
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    },
    staleTime: 0,
    cacheTime: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 0,
  });
  


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
        accessorFn: (row) => row?.ticketId,
        id: "ticketId",
        header: () => t("TICKET_ID"),
        enableSorting: true
      },
      {
        accessorFn: (row) => row?.name,
        id: "name",
        header: () => t("CLAIM TYPE"),
        enableSorting: true
      },
      {
        accessorFn: (row) => row?.claimSubType?.name,
        id: "claimSubType",
        header: () => t("CLAIM SUB TYPE"),
        enableSorting: true,
      },
      {
        accessorFn: (row) => row?.createdAt,
        id: "createdAt",
        header: () => t("CREATION DATE"),
        enableSorting: true,
      },
      {
        accessorFn: (row) => row?.slaDueDate,
        id: "slaDueDate",
        header: () => t("SLA DUE DATE"),
        enableSorting: true,
      },
      {
        accessorFn: (row) => row?.slaBreachDays,
        id: "slaBreachDays",
        header: () => t("SLA BREACH DAYS"),
        enableSorting: true,
      },
      {
        accessorFn: (row) => row?.status,
        id: "status",
        header: () => t("STATUS"),
        enableSorting: true,
      },
    ],
    []
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
    <PageHeader
      title={t("SLA COMPLIANCE REPORT")}
      actions={[
        { label: t("EXPORT TO CSV"), onClick: handleDownload, variant: "outline-dark", disabled: isDownloading },
        // { label: t("ADD NEW"), onClick: toggle, variant: "warning" },
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

export default SLAComplianceReport;

