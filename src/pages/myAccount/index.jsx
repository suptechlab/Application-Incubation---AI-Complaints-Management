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
import ClaimChat from './modals/chat';

export default function MyAccount() {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState([
    {
      id: 'created_on',
      desc: true,
    },
  ]);
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

  const columns = React.useMemo(
    () => [
      { accessorFn: (row) => row.claimId, id: 'claimId', header: 'Claim Id', enableSorting: true },
      { accessorFn: (row) => row.entity_name, id: 'entity_name', header: 'Entity Name', enableSorting: true },
      { accessorFn: (row) => row.claim_type, id: 'claim_type', header: 'Claim Type', enableSorting: true },
      { accessorFn: (row) => row.claim_sub_type, id: 'claim_sub_type', header: 'Claim Sub Type', enableSorting: true },
      { accessorFn: (row) => row.created_on, id: 'created_on', header: 'Created On', enableSorting: true },
      { accessorFn: (row) => row.resolved_on, id: 'resolved_on', header: 'Resolved On', enableSorting: true },
      {
        accessorFn: (row) => row.instance_type,
        id: 'instance_type',
        header: 'Instance Type',
        enableSorting: true,
        cell: (rowData) => (
          <span className={rowData.row.original.instance_type === 'Complaint' ? 'text-danger' : ''}>{rowData.row.original.instance_type}</span>
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
  const dataQuery = useQuery({
    queryKey: ['myAccountData', pagination, sorting, filter],
    queryFn: async () => {
      return {
        data: mockData,
        totalPages: 1,
      };
    },
    staleTime: 0,
    cacheTime: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 0,
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

          <div className="fw-bold fs-5 pt-4 mt-2">
            Recent Activity
          </div>
        </div>

        <div className="flex-grow-1 d-flex flex-column pb-4">
          <DataTable
            columns={columns}
            dataQuery={dataQuery}
            pagination={pagination}
            setPagination={handlePaginationChange}
            sorting={sorting}
            setSorting={handleSortingChange}
          />
        </div>
      </div>

      {/* CLIAM DETAILS MODAL */}
      <ViewClaim
        handleShow={showViewModal}
        handleClose={handleCloseModal}
      />

      {/* TICKET MODAL */}
      <ClaimChat
        handleShow={showTicketModal}
        handleClose={handleCloseTicketModal}
      />

    </React.Fragment>
  );
}
