import React, { useState } from 'react';
import CommonDataTable from '../../components/common/CommonDataTable';
import { Col, Container, Row } from 'react-bootstrap';

export default function MyAccount() {
  const [recentActivity, setRecentActivity] = useState([
    { claimId: '#53541', entity_name: 'Entity 1', claim_type: 'Credit Portfolio' , claim_sub_type:'Refinancing Request',created_on : '07-10-2024 | 03:30 pm' , resolved_on : '09-10-2024 | 05:40 pm',instance_type:'',status:'',actions:''},
    { claimId: '#53541', entity_name: 'Entity 1', claim_type: 'Credit Portfolio' , claim_sub_type:'Refinancing Request',created_on : '07-10-2024 | 03:30 pm' , resolved_on : '09-10-2024 | 05:40 pm',instance_type:'',status:'',actions:''},
    { claimId: '#53541', entity_name: 'Entity 1', claim_type: 'Credit Portfolio' , claim_sub_type:'Refinancing Request',created_on : '07-10-2024 | 03:30 pm' , resolved_on : '09-10-2024 | 05:40 pm',instance_type:'',status:'',actions:''},
    // More orders here
  ]);

  // Define columns for this page
  const columns = [
    { field: 'claimId', header: 'Claim Id' },
    { field: 'entity_name', header: 'Entity Name' },
    { field: 'claim_type', header: 'Claim Type' },
    { field: 'claim_sub_type', header: 'Claim sub type' },
    { field: 'created_on', header: 'Created On' },
    { field: 'resolved_on', header: 'Resolved On' },
    { field: 'instance_type', header: 'Instance type' },
    { field: 'status', header: 'Status' },
    { field: 'actions', header: 'Actions' },
  ];

  const handlePageChange = (e) => {
    // Handle page change logic here
  };

  return (

    <React.Fragment>
      <div className="d-flex flex-column flex-grow-1 position-relative w-100 z-1">
        <Container fluid className="my-auto">
          <Row className="justify-content-end">
            <Col md="12">
              <CommonDataTable
                value={recentActivity}
                columns={columns}
                pagination={true}
                rows={5}
                onPageChange={handlePageChange}
                emptyMessage="No orders found"
              />
            </Col>
          </Row>
        </Container>
      </div>
      <div>

      </div>
    </React.Fragment>


  );
}
