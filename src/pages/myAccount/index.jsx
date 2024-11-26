import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Badge, Button, Modal, Stack } from 'react-bootstrap';
import { MdChatBubbleOutline, MdEditDocument, MdOutlineInfo, MdOutlineVisibility, MdTask } from 'react-icons/md';
import DataTable from '../../components/common/DataTable';
import SvgIcons from '../../components/SVGIcons';
import AppTooltip from '../../components/tooltip';
import InfoCards from './cards';
import PageHeader from './header';
import ViewClaim from './modals/view';
import qs from "qs";
import { fileClaimList } from '../../redux/slice/fileClaimSlice';
import { useDispatch } from 'react-redux';
import moment from 'moment';


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



  // The color class based on the status
  const getStatusClass = (status) => {
    switch (status) {
      case 'Closed':
        return 'bg-success bg-opacity-25 text-success';
      case 'In Progress':
        return 'bg-orange-25 text-orange';
      case 'New':
        return 'bg-primary bg-opacity-25 text-primary';
      case 'Rejected':
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
          <span className={rowData.row.original.instanceType === 'Complaint' ? 'text-danger' : ''}>{rowData.row.original.instanceType}</span>
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
        cell: (info) => (
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
            <Stack direction='horizontal' gap={2}>
              <Button
                variant="link"
                className='p-0 border-0 lh-sm position-relative text-nowrap fw-medium text-decoration-none text-body text-opacity-50'
                aria-label='Chat'
              >
                File a 2nd Instance
              </Button>
              <AppTooltip title="Info Tooltip">
                <Button
                  variant="link"
                  className='p-0 border-0 lh-sm position-relative text-body'
                  aria-label='Info'
                >
                  <MdOutlineInfo size={24} />
                </Button>
              </AppTooltip>
            </Stack>
          </Stack>
        ),
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

  // Info Cards Data
  const cardsData = [
    {
      bgColor: 'bg-primary',
      Icon: <MdEditDocument size={30} />,
      title: 'Total Claims',
      value: 3,
      colProps: { sm: 6, lg: 3 }
    },
    {
      bgColor: 'bg-orange',
      Icon: SvgIcons.fileInfoIcon,
      title: 'Claims in Progress',
      value: 1,
      colProps: { sm: 6, lg: 3 }
    },
    {
      bgColor: 'bg-success',
      Icon: <MdTask size={30} />,
      title: 'Claims Closed',
      value: 2,
      colProps: { sm: 6, lg: 3 }
    },
    {
      bgColor: 'bg-danger',
      Icon: SvgIcons.fileCloseIcon,
      title: 'Claims Rejected',
      value: 0,
      colProps: { sm: 6, lg: 3 }
    },
  ];

  return (
    <React.Fragment>
      <div className="d-flex flex-column flex-grow-1 p-3 pageContainer">
        <div className="pb-2">
          <PageHeader
            title="My Account"
            filter={filter}
            setFilter={setFilter}
          />
          <InfoCards cardsData={cardsData} />
          {/* RECENT ACTIVITY */}
          <div className="fw-bold fs-5 pt-4 mt-2">
            Recent Activity
          </div>
        </div>

        <div className="flex-grow-1 d-flex flex-column">
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
      <Modal show={showTicketModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Claim Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRow ? (
            <div>
              Ticket modal
            </div>
          ) : (
            <p>No details available</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseTicketModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
}
