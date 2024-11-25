import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { MdDelete, MdEditDocument, MdHourglassEmpty, MdTask } from 'react-icons/md';
import DataTable from '../../components/common/DataTable';
import InfoCards from './cards';
import PageHeader from './header';

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
      instance_type: 'Type A',
      status: 'Pending',
    },
    {
      claimId: '#53542',
      entity_name: 'Entity 2',
      claim_type: 'Loan Application',
      claim_sub_type: 'Personal Loan',
      created_on: '08-10-2024 | 10:00 am',
      resolved_on: '10-10-2024 | 11:15 am',
      instance_type: 'Type B',
      status: 'Completed',
    },
  ];

  const columns = React.useMemo(
    () => [
      { accessorFn: (row) => row.claimId, id: 'claimId', header: 'Claim Id', enableSorting: true },
      { accessorFn: (row) => row.entity_name, id: 'entity_name', header: 'Entity Name', enableSorting: true },
      { accessorFn: (row) => row.claim_type, id: 'claim_type', header: 'Claim Type', enableSorting: true },
      { accessorFn: (row) => row.claim_sub_type, id: 'claim_sub_type', header: 'Claim Sub Type', enableSorting: true },
      { accessorFn: (row) => row.created_on, id: 'created_on', header: 'Created On', enableSorting: true },
      { accessorFn: (row) => row.resolved_on, id: 'resolved_on', header: 'Resolved On', enableSorting: true },
      { accessorFn: (row) => row.instance_type, id: 'instance_type', header: 'Instance Type', enableSorting: true },
      { accessorFn: (row) => row.status, id: 'status', header: 'Status', enableSorting: true },
      {
        accessorFn: (row) => row.actions,
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        cell: (info) => (
          <div>
            <Button variant="link" onClick={() => handleShowModal(info.row.original)}>
              View
            </Button>
            <Button variant="link" onClick={() => handleTicketModal(info.row.original)}>
              ticket
            </Button>
          </div>
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
      Icon: <MdHourglassEmpty size={30} />,
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
      Icon: <MdDelete size={30} />,
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

        <div className="flex-grow-1 d-flex flex-column">
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
      <Modal show={showViewModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Claim Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRow ? (
            <div>
              <p><strong>Claim Id:</strong> {selectedRow.claimId}</p>
              <p><strong>Entity Name:</strong> {selectedRow.entity_name}</p>
            </div>
          ) : (
            <p>No details available</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

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
