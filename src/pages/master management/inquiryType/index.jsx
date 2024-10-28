import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "../../../components/PageHeader";
import { Card } from "reactstrap";
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
import { downloadInquiryTypes, handleGetInquiryType } from "../../../services/inquiryType.service";
import axios from "axios";
const InquiryType = () => {

  const location = useLocation();
  const params = qs.parse(location.search, { ignoreQueryPrefix: true });
  const { t } = useTranslation()

  const [pagination, setPagination] = useState({
    pageIndex: params.page ? parseInt(params.page) - 1 : 1,
    pageSize: params.limit ? parseInt(params.limit) : 10,
  });
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState({ id: '', open: false })
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
      console.error("Error get during to fetch Inquiry Type", error);
    })

  }, []);
  const editInquiryType = async (id) => {
    setEditModal({ id: id, open: !editModal?.open })
  };

  const dataQuery = useQuery({
    queryKey: ["data", pagination, sorting, filter],
    queryFn: () => {
      const filterObj = qs.parse(qs.stringify(filter, { skipNulls: true }));
      Object.keys(filterObj).forEach(key => filterObj[key] === "" && delete filterObj[key]);

      // For now, returning default data without API request
      return [
        {
          id: 1,
          inquiryCategory: 'Corporate Governance',
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
        },
        {
          id: 2,
          inquiryCategory: 'Non-Profit Organizations',
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
        },
      ];
    },
    // queryFn: () => {
    //   const filterObj = qs.parse(qs.stringify(filter, { skipNulls: true }));
    //   Object.keys(filterObj).forEach(key => filterObj[key] === "" && delete filterObj[key]);

    //   if (sorting.length === 0) {
    //     return handleGetDistricts({
    //       page: pagination.pageIndex,
    //       size: pagination.pageSize,
    //       ...filterObj,
    //     });
    //   } else {
    //     return handleGetDistricts({
    //       page: pagination.pageIndex,
    //       size: pagination.pageSize,
    //       sort: sorting
    //         .map(
    //           (sort) => `${sort.id},${sort.desc ? "desc" : "asc"}`
    //         )
    //         .join(","),
    //       ...filterObj,
    //     });
    //   }
    // },
  });

  const changeStatus = async (id, currentStatus) => {
    try {
      // await handleEditDistricts(id, { status: !currentStatus });
      toast.success("Inquiry type status updated successfully");
      dataQuery.refetch();
    } catch (error) {
      toast.error("Error updating state status");
    }
  };

  // HANDLE INQUIRY TYPES CSV DOWNLOAD
  const handleDownload = () => {
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
  // }, []);

  const columns = React.useMemo(
    () => [
      {
        accessorFn: (row) => row.inquiryCategory,
        id: "inquiryCategory",
        header: () => t("INQUIRY CATEGORY"),
      },
      {
        accessorFn: (row) => row.description != null ? row.description : '-',
        id: "description",
        header: () => t("DESCRIPTION"),
        enableSorting: false,
      },
      {
        // accessorFn: (row) => row.status ? "Active" : "Inactive",
        cell: (info) => {
          return (
            <Toggle
              id={`status-${info?.row?.original?.id}`}
              key={"status"}
              // label="Status"
              name="status"
              value={info?.row?.original?.status}
              checked={info?.row?.original?.status}
            // onChange={() => changeStatus(info?.row?.original?.id, info?.row?.original?.status)}
            />
          )
        },
        id: "status",
        header: () => t("STATUS"),
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
                    editInquiryType(info?.row?.original?.id);
                  }}
                >
                  <span className=''>{SvgIcons.editIcon}</span>
                </div> : <div></div>}
            </div>
          );
        },
        header: () => <div className="d-flex justify-content-center">{t("ACTIONS")}</div>,
        enableSorting: false,
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


  return <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
    <PageHeader title={t("INQUIRY TYPE")}
      actions={[
        { label: t("EXPORT TO CSV"), onClick: handleDownload, variant: "outline-dark" },
        { label: t("ADD NEW"), onClick: toggle, variant: "warning" },
      ]} />
    <div className="flex-grow-1 pageContent position-relative pt-4 overflow-auto">
      <Card className="h-100 bg-white shadow-lg border-0 theme-card-cover">
        <ListingSearchForm filter={filter} setFilter={setFilter} />
        <CommonDataTable
          columns={columns}
          dataQuery={dataQuery}
          pagination={pagination}
          setPagination={setPagination}
          sorting={sorting}
          setSorting={setSorting}
        />
      </Card>
    </div>
    <Add modal={modal} toggle={toggle} />
    <Edit modal={editModal?.open} toggle={editToggle} />
  </div>
};

export default InquiryType;
