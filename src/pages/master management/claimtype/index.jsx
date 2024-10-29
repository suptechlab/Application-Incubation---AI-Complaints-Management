import React, { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PageHeader from "../../../components/PageHeader";

import qs from "qs";
import ListingSearchForm from "../../../components/ListingSearchForm";
import CommonDataTable from "../../../components/CommonDataTable";

import { useLocation } from "react-router-dom";
import SvgIcons from "../../../components/SVGIcons"
import { getModulePermissions, isAdminUser } from "../../../utils/authorisedmodule";
import toast from "react-hot-toast";
import Toggle from "../../../components/Toggle";
import Add from "./Add";
import Edit from "./Edit";
import { useTranslation } from "react-i18next";
import { changeClaimTypeStatus, downloadClaimTypes, handleGetClaimTypes } from "../../../services/claimType.service";
import { Card } from "react-bootstrap";
const ClaimType = () => {

  const location = useLocation();
  const queryClient = useQueryClient();

  const params = qs.parse(location.search, { ignoreQueryPrefix: true });

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

  const editToggle = () => setEditModal({ id: '', open: !editModal?.open });

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
    queryFn: () => {
      const filterObj = qs.parse(qs.stringify(filter, { skipNulls: true }));
      Object.keys(filterObj).forEach(key => filterObj[key] === "" && delete filterObj[key]);

      if (sorting.length === 0) {
        return handleGetClaimTypes({
          page: pagination.pageIndex,
          size: pagination.pageSize,
          ...filterObj,
        });
      } else {
        return handleGetClaimTypes({
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
    },
    staleTime: 0, // Data is always stale, so it refetches
    cacheTime: 0, // Cache expires immediately
  });

  // STATUS UPDATE FUNCTION
  const changeStatus = async (id, currentStatus) => {

    // await handleEditDistricts(id, { status: !currentStatus });
    changeClaimTypeStatus(id, !currentStatus).then(response => {
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

  // DOWNLOAD CLAIM TYPES LIST
  const handleDownload = () => {
    downloadClaimTypes({ search: filter?.search ?? "" }).then(response => {
      if (response?.data) {
        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const blobUrl = window.URL.createObjectURL(blob);

        const tempLink = document.createElement('a');
        tempLink.href = blobUrl;
        tempLink.setAttribute('download', 'claim-types.xlsx');

        // Append the link to the document body before clicking it
        document.body.appendChild(tempLink);

        tempLink.click();

        // Clean up by revoking the Blob URL
        window.URL.revokeObjectURL(blobUrl);

        // Remove the link from the document body after clicking
        document.body.removeChild(tempLink);
      } else {
        throw new Error('Response data is empty.');
      }
      // toast.success(t("STATUS UPDATED"));
    }).catch((error) => {
      if (error?.response?.data?.errorDescription) {
        toast.error(error?.response?.data?.errorDescription);
      } else {
        toast.error(error?.message ?? t("STATUS UPDATE ERROR"));
      }
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
        header: () => t("CLAIM TYPE"),
        enableSorting: true
      },
      {
        accessorFn: (row) => row?.description != null ? row?.description : '-',
        id: "description",
        header: () => t("DESCRIPTION"),
        enableSorting: false,
      },
      {
        cell: (info) => {
          return (
            <Toggle
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
        size : '90'
      },
      {
        id: "actions",
        isAction: true,
        cell: (info) => {
          return (
            <div className="d-flex items-center gap-2 justify-content-center">
              {permission.current.editModule ?
                <div
                  onClick={() => {
                    editClaimType(info?.row?.original);
                  }}
                >
                  <span className=''>{SvgIcons.editIcon}</span>
                </div> : <div></div>}
            </div>
          );
        },
        header: () => <div className="d-flex justify-content-center">{t("ACTIONS")}</div>,
        enableSorting: false,
        size : '80'
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
    {/* <PageHeader title={t("CLAIM TYPE")} toggle={toggle} download={handleDownload} /> */}
    <PageHeader
      title={t("CLAIM TYPE")}
      actions={[
        { label: t("EXPORT TO CSV"), onClick: handleDownload, variant: "outline-dark" },
        { label: t("ADD NEW"), onClick: toggle, variant: "warning" },
        // { label: "Help", to: "/help", variant: "outline-dark" },
        // { label: "Learn More", onClick: handleAdd, variant: "primary" },

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
    <Edit modal={editModal?.open} dataQuery={dataQuery} toggle={editToggle} rowData={editModal?.row} />
  </div>
};

export default ClaimType;
