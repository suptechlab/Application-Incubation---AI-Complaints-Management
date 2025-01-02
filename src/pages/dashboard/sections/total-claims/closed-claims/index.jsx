import React, { useState } from 'react'
import { Card } from 'react-bootstrap'

const ClosedClaimList = ({closedClaimData}) => {


    const [claimData] = useState(closedClaimData?.countsByStatus)

    //Claim Data
    // const claimData = [
    //     { label: 'Completely In favor of client', count: 75 },
    //     { label: 'Partially In favor of client', count: 82 },
    //     { label: 'Denied', count: 1245 },
    //     { label: 'Expired', count: 96 },
    // ];

    return (
        <Card className='rounded-3 border-custom-gray h-100'>
            <Card.Header className='border-custom-gray'>
                <div className='custom-font-size-18 fw-semibold py-1'>Closed Claims</div>
            </Card.Header>
            <Card.Body className='p-0'>
                <ul className='list-unstyled mb-0'>
                    {claimData?.map((item, index) => (
                        <li key={index} className={`d-flex align-items-center gap-2 justify-content-between small p-3 lh-sm ${index % 2 === 1 ? 'bg-body-tertiary' : ''} ${index === claimData?.length - 1 ? 'rounded-bottom-3' : ''}`}>
                            <span>{item.title}</span>
                            <span className='text-end'>{item.count}</span>
                        </li>
                    ))}
                </ul>
            </Card.Body>
        </Card>
    )
}

export default ClosedClaimList