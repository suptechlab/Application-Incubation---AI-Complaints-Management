import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "../../../components/PageHeader";
import { Card } from "reactstrap";
import qs from "qs";
import ListingSearchForm from "../../../components/ListingSearchForm";
import CommonDataTable from "../../../components/CommonDataTable";

import { useLocation, useNavigate } from "react-router-dom";
import SvgIcons from "../../../components/SVGIcons"
import { getModulePermissions, isAdminUser } from "../../../utils/authorisedmodule";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import Toggle from "../../../components/Toggle";
import Add from "./Add";
import Edit from "./Edit";
const ClaimSubType = () => {

  const location = useLocation();
  const navigate = useNavigate();
  const params = qs.parse(location.search, { ignoreQueryPrefix: true });

  const [pagination, setPagination] = useState({
    pageIndex: params.page ? parseInt(params.page) - 1 : 1,
    pageSize: params.limit ? parseInt(params.limit) : 10,
  });
  const [modal, setModal] = useState(false);
  const [editModal , setEditModal] = useState({id :'' , open : false})
  const [sorting, setSorting] = useState([]);
  const [filter, setFilter] = useState({
    search: "",
  });

  const toggle = () => setModal(!modal);
  const editToggle = () => setEditModal({id : '' , open : !editModal?.open});


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

  const editClaimSubType = async (id) => {
    setEditModal({id : id , open : !editModal?.open })
  };

  const deleteDistrict = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Are you sure you want to delete this claim type?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        try {
          toast.success("Claim type deleted successfully")
          // handleDeleteDistrict(id).then((responseDelete) => {
          //   toast.success("District deleted successfully");
          //   dataQuery.refetch();
          // }).catch((error) => {
          //   toast.error(error.response.data.detail);
          // })
        } catch (error) {
          toast.error(error.response.data.detail);
        }
      } else {

      }
    })
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
          claimSubType  : 'Refinancing Request',
          claimType: 'Credit Portfolio',
          slaBreach : '12',
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        },
        {
          id: 2,
          claimSubType  : 'Unauthorized and/or Unrequested Refinancing',
          claimType: 'Credit Portfolio',
          slaBreach : '10',
          description: 'Nam congue orci a odio ultricies.',
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
      toast.success("State status updated successfully");
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
        accessorFn: (row) => row.claimSubType,
        id: "claimSubType",
        header: () => "Claim Sub Type",
      },
      {
        accessorFn: (row) => row.claimType,
        id: "claimType",
        header: () => "Claim Type",
      },
      {
        accessorFn: (row) => row.slaBreach,
        id: "slaBreach",
        header: () => "SLA Breach",
      },
      {
        accessorFn: (row) => row.description != null ? row.description : '-',
        id: "description",
        header: () => "Description",
        enableSorting: false,
      },
      {
        // accessorFn: (row) => row.status ? "Active" : "Inactive",
        cell: (info) => {
          console.log('rowstatus 100->', info?.row?.original?.status);
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
        header: () => "Status",
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
                    console.log("Info::", info.row.original.id);
                    editClaimSubType(info.row.original.id);
                  }}
                >
                  <span className=''>{SvgIcons.editIcon}</span>
                </div> : <div></div>}
            </div>
          );
        },
        header: () => <div className="d-flex justify-content-center">Actions</div>,
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
    <PageHeader title={"Claim Sub Type"} toggle={toggle} />
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

export default ClaimSubType;
