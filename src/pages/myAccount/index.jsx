import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Badge, Button, Modal, Stack } from 'react-bootstrap';
import { MdChatBubbleOutline, MdOutlineInfo, MdOutlineVisibility } from 'react-icons/md';
import DataTable from '../../components/common/DataTable';

import moment from 'moment';
import qs from "qs";
import { useDispatch } from 'react-redux';
import AppTooltip from '../../components/tooltip';
import { fileClaimList } from '../../redux/slice/fileClaimSlice';
import InfoCards from './cards';
import PageHeader from './header';
import ViewClaim from './modals/view';
import Loader from '../../components/Loader';

import ClaimChat from './modals/chat';
import InstanceModal from './modals/instance';
import RaisedComplaintModal from './modals/raised-complaint';

export default function MyAccount() {
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

  const handleShowModal = (row) => {
    setSelectedRow(row);
    setShowViewModal(true);
  };
  const handleTicketModal = (row) => {
    setSelectedRow(row);
    setTicketModal(true);
  };


  const handleCloseModal = () => {
    setSelectedRow(null);
    setShowViewModal(false);
  };
  const handleCloseTicketModal = () => {
    setSelectedRow(null);
    setTicketModal(false);
  };



  const instanceClickHandler = () => {
    setInstanceModalShow(true)
  }

  const raisedComplaintClickHandler = () => {
    setRaisedComplaintModalShow(true)
  }

  // Mock data to display in the table
  const mockData = [
    {
      claimId: '#53541',
      entity_name: 'Entity 1',
      claim_type: 'Credit Portfolio',
      claim_sub_type: 'Refinancing Request',
      created_on: '07-10-2024 | 03:30 pm',
      resolved_on: '09-10-2024 | 05:40 pm',
      instance_type: '1st Instance',
      status: 'Closed',
    },
    {
      claimId: '#53542',
      entity_name: 'Entity 2',
      claim_type: 'Loan Application',
      claim_sub_type: 'Personal Loan',
      created_on: '08-10-2024 | 10:00 am',
      resolved_on: '10-10-2024 | 11:15 am',
      instance_type: '2nd Instance',
      status: 'In Progress',
    },
    {
      claimId: '#53542',
      entity_name: 'Entity 2',
      claim_type: 'Loan Application',
      claim_sub_type: 'Personal Loan',
      created_on: '08-10-2024 | 10:00 am',
      resolved_on: '10-10-2024 | 11:15 am',
      instance_type: 'Complaint',
      status: 'Rejected',
    },
  ];

  // The color class based on the status
  const getStatusClass = (status) => {
    switch (status) {
      case 'CLOSED':
        return 'bg-success bg-opacity-25 text-success';
      case 'IN_PROGRESS':
        return 'bg-orange-25 text-orange';
      case 'NEW':
        return 'bg-primary bg-opacity-25 text-primary';
      case 'REJECTED':
        return 'bg-danger bg-opacity-25 text-danger';
      case 'PENDING':
        return 'bg-danger bg-opacity-25 text-danger';
      case 'ASSIGNED':
        return 'bg-danger bg-opacity-25 text-danger';
      default:
        return 'bg-body bg-opacity-25 text-body';
    }
  };

  // TABLE COLUMNS
  const columns = React.useMemo(
    () => [
      { accessorFn: (row) => row.ticketId, id: 'ticketId', header: 'Ticket Id', enableSorting: false },
      {
        accessorFn: (row) => row.entity_name,
        id: 'entity_name',
        header: 'Entity Name',
        enableSorting: false,
        cell: (rowData) => (
          <span>{rowData.row.original.organization?.nemonicoTipoOrganizacion}</span>
        )
      },
      { accessorFn: (row) => row.claimType.name, id: 'claimType.name', header: 'Claim Type', enableSorting: false },
      { accessorFn: (row) => row.claimSubType.name, id: 'claimSubType.name', header: 'Claim Sub Type', enableSorting: false },
      {
        accessorFn: (row) => row.createdAt,
        id: "createdAt",
        header: "Created On",
        enableSorting: false,
        cell: (rowData) => moment(rowData.row.original.createdAt).format("YYYY-MM-DD HH:mm"), // Format as needed
      },
      {
        accessorFn: (row) => row.resolvedOn,
        id: "resolvedOn",
        header: "Resolved On",
        enableSorting: false,
        cell: (rowData) =>
          rowData?.row?.original?.resolvedOn
            ? moment(rowData?.row?.original?.resolvedOn).format("YYYY-MM-DD HH:mm") // Format if value exists
            : "N/A", // Handle null or undefined values
      },
      {
        accessorFn: (row) => row.instanceType,
        id: 'instanceType',
        header: 'Instance Type',
        enableSorting: true,
        cell: (rowData) => (
          <span className={rowData.row.original.instanceType === 'COMPLAINT' ? 'text-danger' : ''}>{rowData.row.original.instanceType}</span>
        )
      },
      {
        accessorFn: (row) => row.status,
        id: 'status',
        header: 'Status',
        enableSorting: true,
        cell: (rowData) => (
          <span
            className={`text-nowrap bg-opacity-25 custom-font-size-12 fw-semibold px-2 py-1 rounded-pill ${getStatusClass(rowData.row.original.status)}`}
          >
            {rowData.row.original.status}
          </span>
        )
      },
      {
        accessorFn: (row) => row.actions,
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        cell: (info) => {
          const renderButton = (label, onClickHandler, textColorClass) => (
            <Button
              variant="link"
              className={`p-0 border-0 lh-sm position-relative text-nowrap fw-medium text-decoration-none ${textColorClass}`}
              aria-label={label}
              onClick={onClickHandler}
            >
              {label}
            </Button>
          );

          let instanceButton = null;
          let tooltipTitle = '';
          switch (info.row.original.instance_type) {
            case "1st Instance":
              instanceButton = renderButton("File a 2nd Instance", instanceClickHandler, 'text-body text-opacity-50');
              tooltipTitle = "File a 2nd instance Tooltip";
              break;
            case "2nd Instance":
              instanceButton = renderButton("Raised a Complaint", raisedComplaintClickHandler, 'text-info');
              tooltipTitle = "Raise a complaint Tooltip";
              break;
            case "Complaint":
              break;
            default:
              break;
          }

          return (
            <Stack direction='horizontal' gap={3}>
              <AppTooltip title="View">
                <Button
                  variant="link"
                  onClick={() => handleShowModal(info.row.original)}
                  className='p-0 border-0 lh-sm text-body'
                  aria-label='View'
                >
                  <MdOutlineVisibility size={24} />
                </Button>
              </AppTooltip>
              <AppTooltip title="Chat">
                <Button
                  variant="link"
                  onClick={() => handleTicketModal(info.row.original)}
                  className='p-0 border-0 lh-sm text-body position-relative'
                  aria-label='Chat'
                  disabled={true}
                >
                  <MdChatBubbleOutline size={24} />
                  <Badge
                    bg="danger"
                    className="border border-white custom-font-size-12 fw-semibold ms-n1 p-1 position-absolute rounded-pill start-100 top-0 translate-middle custom-min-width-22"
                  >
                    2 <span className="visually-hidden">Unread Chat</span>
                  </Badge>
                </Button>
              </AppTooltip>
              {instanceButton && (
                <Stack direction='horizontal' gap={2} className="d-none">
                  {instanceButton}
                  <AppTooltip title={tooltipTitle}>
                    <Button
                      variant="link"
                      className='p-0 border-0 lh-sm position-relative text-body'
                      aria-label={tooltipTitle}
                    >
                      <MdOutlineInfo size={24} />
                    </Button>
                  </AppTooltip>
                </Stack>
              )}
            </Stack>
          )
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
    refetchOnMount: false, // Prevent refetching on component remount
    retry: 0, //Disable retry on failure
  });


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
        <div className="pb-2">
          <PageHeader
            title="My Account"
            filter={filter}
            setFilter={setFilter}
          />
          <InfoCards filter={filter} setLoading={setLoading}/>
          {/* RECENT ACTIVITY */}
          <div className="fw-bold fs-5 pt-4 mt-2">
            Recent Activity
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
        handleClose={handleCloseTicketModal}
      />

      {/* Instance MODAL */}
      <InstanceModal
        handleShow={instanceModalShow}
        handleClose={() => setInstanceModalShow(false)}
      />
      
      {/* Raised Complaint MODAL */}
      <RaisedComplaintModal
        handleShow={raisedComplaintModalShow}
        handleClose={() => setRaisedComplaintModalShow(false)}
      />

    </React.Fragment>
  );
}
