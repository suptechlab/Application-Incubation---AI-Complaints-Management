import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { Button, Stack } from 'react-bootstrap';
import { MdChatBubbleOutline, MdOutlineVisibility } from 'react-icons/md';
import DataTable from '../../components/common/DataTable';

import moment from 'moment';
import qs from "qs";
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../../components/Loader';
import AppTooltip from '../../components/tooltip';
import { fileClaimList } from '../../redux/slice/fileClaimSlice';
import InfoCards from './cards';
import PageHeader from './header';
import ViewClaim from './modals/view';

import { useTranslation } from 'react-i18next';
import ClaimChat from './modals/chat';
import InstanceModal from './modals/instance';
import RaisedComplaintModal from './modals/raised-complaint';
import infographicImage from '../../assets/images/seps-infographic.jpg'

export default function MyAccount() {

  const { t } = useTranslation()

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const dispatch = useDispatch()

  const [loading, setLoading] = useState(false)
  const [sorting, setSorting] = useState([]);
  const [filter, setFilter] = useState({
    search: '',
  });
  const [selectedRow, setSelectedRow] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showTicketModal, setTicketModal] = useState(false);
  const [instanceModalShow, setInstanceModalShow] = useState(false);
  const [raisedComplaintModalShow, setRaisedComplaintModalShow] = useState(false);
  const { instance_types, masterData } = useSelector((state) => state?.masterSlice);


  const handleShowModal = (row) => {
    setSelectedRow(row);
    setShowViewModal(true);
  };
  const handleTicketModal = (row) => {
    setSelectedRow(row);
    setTicketModal(true);
  };


  const handleCloseModal = () => {
    setSelectedRow({});
    setShowViewModal(false);
  };
  const handleCloseTicketModal = () => {
    setSelectedRow({});
    setTicketModal(false);
  };

  const handleCloseInstanceModal = () => {
    setSelectedRow(null);
    setInstanceModalShow(false);
    dataQuery.refetch();
  };


  const handleCloseComplaintModal = () => {
    setSelectedRow(null);
    setRaisedComplaintModalShow(false);
    dataQuery.refetch();
  };



  const instanceClickHandler = (row) => {
    setSelectedRow(row);
    setInstanceModalShow(true);
  }

  const raisedComplaintClickHandler = (row) => {
    setSelectedRow(row);
    setRaisedComplaintModalShow(true);
  }
  // The color class based on the status
  const getStatusClass = (status) => {
    switch (status) {
      case 'CLOSED':
        return 'bg-success bg-opacity-25 text-success';
      case 'IN_PROGRESS':
        return 'bg-info-25 text-info';
      case 'NEW':
        return 'bg-primary bg-opacity-25 text-primary';
      case 'REJECTED':
        return 'bg-danger bg-opacity-25 text-danger';
      case 'ASSIGNED':
        return 'bg-orange bg-opacity-25 text-orange';
      default:
        return 'bg-body bg-opacity-25 text-warning';
    }
  };


  // TABLE COLUMNS
  const columns = React.useMemo(
    () => [
      { accessorFn: (row) => row.ticketId, id: 'ticketId', header: t("TICKET_ID"), enableSorting: false },
      {
        accessorFn: (row) => row.entity_name,
        id: 'entity_name',
        header: t("ENTITY_NAME"),
        enableSorting: false,
        cell: (rowData) => (
          <span>{rowData.row.original.organization?.razonSocial}</span>
        )
      },
      { accessorFn: (row) => row.claimType.name, id: 'claimType.name', header: t("CLAIM_TYPE"), enableSorting: false },
      { accessorFn: (row) => row.claimSubType.name, id: 'claimSubType.name', header: t("CLAIM_SUB_TYPE"), enableSorting: false },
      {
        accessorFn: (row) => row.createdAt,
        id: "createdAt",
        header: t("CREATED_ON"),
        enableSorting: false,
        cell: (rowData) => moment(rowData.row.original.createdAt).format("YYYY-MM-DD | HH:mm"),
      },
      {
        accessorFn: (row) => row.resolvedOn,
        id: "resolvedOn",
        header: t("RESOLVED_ON"),
        enableSorting: false,
        cell: (rowData) =>
          rowData?.row?.original?.resolvedOn
            ? moment(rowData?.row?.original?.resolvedOn).format("YYYY-MM-DD | HH:mm")
            : t("N/A"),
      },
      {
        accessorFn: (row) => row.instanceType,
        id: 'instanceType',
        header: t("INSTANCE_TYPE"),
        enableSorting: true,
        cell: (rowData) => {
          // const matchedInstanceType = instance_types.find(
          //   (type) => type.value === rowData.row.original.instanceType
          // );
          // const displayLabel = matchedInstanceType ? matchedInstanceType.label : rowData.row.original.instanceType;

          return (
            <span className={rowData.row.original.instanceType === 'COMPLAINT' ? 'text-danger' : ''}>
              {masterData?.instanceType[rowData?.row?.original?.instanceType]}
            </span>
          );
        }
      },
      {
        accessorFn: (row) => row.status,
        id: 'status',
        header: t("STATUS"),
        enableSorting: true,
        cell: (rowData) => (
          <span
            className={`text-nowrap bg-opacity-25 custom-font-size-12 fw-semibold px-2 py-1 rounded-pill ${getStatusClass(rowData.row.original.status)}`}
          >
            {masterData?.claimTicketStatus[rowData?.row?.original?.status]}
          </span>
        )
      },
      {
        accessorFn: (row) => row.actions,
        id: 'actions',
        header: t("ACTIONS"),
        enableSorting: false,
        cell: (info) => {
          const renderButton = ({ label, onClickHandler, variant = "link", className = "", ariaLabel, disabled = false }) => (
            <Button
              variant={variant}
              className={`p-0 border-0 lh-sm position-relative text-nowrap fw-medium text-decoration-none text-info ${className}`}
              aria-label={ariaLabel || label}
              onClick={onClickHandler}
              disabled={disabled}
            >
              {t(label)}
            </Button>
          );
          let tooltipTitle = '';
          const instanceButton = (info.row.original.instanceType === "FIRST_INSTANCE" &&
            (info.row.original.status === "CLOSED" || info.row.original.status === "REJECTED") &&
            info?.row?.original?.canCreateInstance)
            ? renderButton({
              label: "FILE_SECOND_INSTANCE",
              onClickHandler: () => instanceClickHandler(info.row.original),
              ariaLabel: t("FILE_SECOND_INSTANCE"),
            })
            : info.row.original.instanceType === "SECOND_INSTANCE" &&
            (info.row.original.status === "CLOSED" || info.row.original.status === "REJECTED") &&
            info?.row?.original?.canCreateInstance &&
            renderButton({
              label: "RAISE_COMPLAINT",
              onClickHandler: () => raisedComplaintClickHandler(info.row.original),
              ariaLabel: t("RAISE_COMPLAINT"),
            });
          return (
            <Stack direction='horizontal' gap={3}>
              <AppTooltip title={t("VIEW")}>
                <Button
                  variant="link"
                  onClick={() => handleShowModal(info.row.original)}
                  className='p-0 border-0 lh-sm text-body'
                  aria-label={t("VIEW")}
                >
                  <MdOutlineVisibility size={24} />
                </Button>
              </AppTooltip>
              <AppTooltip title={t("CHAT")}>
                <Button
                  variant="link"
                  onClick={() => handleTicketModal(info.row.original)}
                  className='p-0 border-0 lh-sm text-body position-relative'
                  aria-label={t("CHAT")}
                // disabled={['CLOSED', 'REJECTED'].includes(info?.row?.original?.status)}
                >
                  <MdChatBubbleOutline size={24} />
                  {/* <Badge
                    bg="danger"
                    className="border border-white custom-font-size-12 fw-semibold ms-n1 p-1 position-absolute rounded-pill start-100 top-0 translate-middle custom-min-width-22"
                  >
                    2 <span className="visually-hidden">{t("UNREAD_CHAT")}</span>
                  </Badge> */}
                </Button>
              </AppTooltip>
              {instanceButton && (
                <Stack direction='horizontal' gap={2}>
                  {instanceButton}
                  {/* <AppTooltip title={t(tooltipTitle)}> */}
                  <Button
                    variant="link"
                    className='p-0 border-0 lh-sm position-relative text-body'
                    aria-label={t(tooltipTitle)}
                  >
                    {/* <MdOutlineInfo size={24} /> */}
                  </Button>
                  {/* </AppTooltip> */}
                </Stack>
              )}
            </Stack>
          );
        },
      },
    ],
    []
  );
  // Data query for fetching paginated and sorted data
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
        if (sorting.length === 0) {
          response = await dispatch(fileClaimList({
            page: pagination.pageIndex,
            size: pagination.pageSize,
            ...filterObj,
          }));
        } else {
          response = await dispatch(fileClaimList({
            page: pagination.pageIndex,
            size: pagination.pageSize,
            sort: sorting
              .map(
                (sort) => `${sort.id},${sort.desc ? "desc" : "asc"}`
              )
              .join(","),
            ...filterObj,
          }));
        }
        // Return the API response data
        return response;
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
    refetchOnMount: true, // Prevent refetching on component remount
    retry: 0, //Disable retry on failure
  });


  useEffect(() => {
    dataQuery.refetch();
  }, []);

  // Handle table pagination changes
  const handlePaginationChange = (newPagination) => {
    setPagination(newPagination);
  };

  // Handle table sorting changes
  const handleSortingChange = (newSorting) => {
    setSorting(newSorting);
  };

  return (
    <React.Fragment>
      <Loader isLoading={loading} />
      <div className="d-flex flex-column flex-grow-1 p-3 pageContainer">
        <div className='text-center pb-3'>
          <img src={infographicImage} alt="infographic-image" className='img-fluid'/>
        </div>
        <div className="pb-2">
          <PageHeader
            title={t("MY_ACCOUNT")}
            filter={filter}
            setFilter={setFilter}
          />
          <InfoCards filter={filter} setLoading={setLoading} />
          {/* RECENT ACTIVITY */}
          <div className="fw-bold fs-5 pt-4 mt-2">
            {t("RECENT_ACTIVITY")}
          </div>
        </div>

        <div className="flex-grow-1 d-flex flex-column pb-4">
          <DataTable
            columns={columns}
            dataQuery={dataQuery}
            pagination={pagination}
            setPagination={setPagination}
            sorting={sorting}
            setSorting={setSorting}
          // setPagination={() => { }}
          // setSorting={() => { }}
          // pagination={{ pageIndex: 0, pageSize: 100 }}
          // sorting={[]}
          // showPagination={false} // Hide pagination
          />
        </div>
      </div>

      {/* CLIAM DETAILS MODAL */}
      <ViewClaim
        handleShow={showViewModal}
        selectedRow={selectedRow}
        handleClose={handleCloseModal}
      />

      {/* TICKET MODAL */}
      <ClaimChat
        handleShow={showTicketModal}
        selectedRow={selectedRow}
        handleClose={handleCloseTicketModal}
      />

      {/* Instance MODAL */}
      <InstanceModal
        handleShow={instanceModalShow}
        selectedRow={selectedRow}
        handleClose={handleCloseInstanceModal}
      />

      {/* Raised Complaint MODAL */}
      <RaisedComplaintModal
        handleShow={raisedComplaintModalShow}
        selectedRow={selectedRow}
        handleClose={handleCloseComplaintModal}
      />

    </React.Fragment>
  );
}
