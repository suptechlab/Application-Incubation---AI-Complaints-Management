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
} from "../../../services/templateMaster.service";

const TemplateMaster = () => {
  const { t } = useTranslation();

  const location = useLocation();
  const params = qs.parse(location.search, { ignoreQueryPrefix: true });

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
  });

  useEffect(() => {
    isAdminUser()
      .then((response) => {
        if (response) {
          permission.current.addModule = true;
          permission.current.editModule = true;
          permission.current.deleteModule = true;
        } else {
          getModulePermissions("Master management")
            .then((response) => {
              if (response.includes("CLAIM_TYPE_CREATE")) {
                permission.current.addModule = true;
              }
              if (response.includes("CLAIM_TYPE_UPDATE")) {
                permission.current.editModule = true;
              }
              if (response.includes("CLAIM_TYPE_DELETE")) {
                permission.current.deleteModule = true;
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

  const editCityMaster = async (id) => {
    setEditModal({ id: id, open: !editModal?.open });
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
    },
  });

  const changeStatus = async (id, currentStatus) => {
    try {
      // await handleEditDistricts(id, { status: !currentStatus });
      toast.success("Province master status updated successfully");
      dataQuery.refetch();
    } catch (error) {
      toast.error("Error updating state status");
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
              onChange={() => changeStatus(info?.row?.original?.id, info?.row?.original?.status)}
              tooltip="Active"
            />
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
                handler: () => editCityMaster(rowData?.row?.original?.id),
              },
            ]}
          />
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

  // Export to CSV Click Handler
  const exportHandler = () => {
    console.log("Export to CSV");
  };

  return (
    <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
      <PageHeader
        title={t("TEMPLATE MASTER")}
        actions={[
          { label: "Export to CSV", to: exportHandler, variant: "outline-dark", disabled: true},
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
      <Add modal={modal} toggle={toggle} />
      <Edit modal={editModal?.open} toggle={editToggle} />
    </div>
  );
};

export default TemplateMaster;
