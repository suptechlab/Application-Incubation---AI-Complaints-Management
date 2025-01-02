import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Stack } from 'react-bootstrap';
import { MdConfirmationNumber, MdDoDisturb, MdHourglassEmpty, MdPending, MdTaskAlt } from "react-icons/md";
import ReactSelect from '../../../../components/ReactSelect';
import InfoCards from '../../../../components/infoCards';
import ClosedClaimList from './closed-claims';
import PieChart from './pie-chart';
import toast from 'react-hot-toast';
import { getDashboardGraphAndTiles } from '../../../../services/dashboard.service';

const TotalClaimsSection = () => {

    const [isLoading, setLoading] = useState(false)

    const [dashboardData, setDashboardData] = useState({
        "claimStatusCount": {
            "totalClaims": 5,
            "countsByStatus": {
                "NEW": 2,
                "ASSIGNED": 1,
                "IN_PROGRESS": 0,
                "PENDING": 0,
                "REJECTED": 0,
                "CLOSED": 2
            }
        },
        "closeClaimStatusCount": {
            "totalClaims": 2,
            "countsByStatus": [
                {
                    "closedStatus": "CLOSED_IN_FAVOR_OF_CONSUMER",
                    "title": "Cerrado a favor del consumidor.",
                    "count": 0
                },
                {
                    "closedStatus": "CLOSED_IN_PARTIAL_FAVOR_OF_CONSUMER",
                    "title": "Cerrado a favor parcial del consumidor.",
                    "count": 0
                },
                {
                    "closedStatus": "CLOSED_WITH_DENIED_REQUEST",
                    "title": "Cerrado con solicitud denegada.",
                    "count": 0
                },
                {
                    "closedStatus": "CLOSE_WITH_EXPIRED",
                    "title": "Cerrado con caducado.",
                    "count": 0
                },
                {
                    "closedStatus": "CLOSE_WITH_SLA_BREACHED",
                    "title": "Cerrado con SLA incumplido.",
                    "count": 2
                }
            ]
        },
        "slaAdherenceGraph": {
            "labels": [
                "Reclamaciones a tiempo",
                "Reclamaciones incumplidas"
            ],
            "datasets": [
                {
                    "data": [
                        1,
                        1
                    ],
                    "backgroundColor": [
                        "#D93D2A",
                        "#75B13B"
                    ],
                    "hoverBackgroundColor": [
                        "#D93D2A",
                        "#75B13B"
                    ]
                }
            ]
        }
    })


    // const getDashboardInfo = async (identification) => {
    //     setLoading(true)
    //     getDashboardGraphAndTiles(identification).then((response) => {

    //         setDashboardData(response?.data)
    //         setLoading(false)


    //     })
    //         .catch((error) => {
    //             if (error?.response?.data?.errorDescription) {
    //                 toast.error(error?.response?.data?.errorDescription);
    //             } else {
    //                 toast.error(error?.message);
    //             }
    //         }).finally(() => {
    //             setLoading(false)
    //         })
    // };


    // useEffect(()=>{
    //     getDashboardInfo()
    // },[])


    console.log(dashboardData)

    // Info Cards Data
    const cardsData = [
        {
            bgColor: 'bg-primary',
            Icon: <MdConfirmationNumber size={24} />,
            title: 'New Tickets',
            value: 5,
            colProps: { sm: 6, md: 4, className: "col-xl" }
        },
        {
            bgColor: 'bg-orange',
            Icon: <MdHourglassEmpty size={24} />,
            title: 'Tickets in Progress',
            value: 2,
            colProps: { sm: 6, md: 4, className: "col-xl" }
        },
        {
            bgColor: 'bg-custom-orange',
            Icon: <MdPending size={24} />,
            title: 'Pending Tickets',
            value: 1,
            colProps: { sm: 6, md: 4, className: "col-xl" }
        },
        {
            bgColor: 'bg-custom-green',
            Icon: <MdTaskAlt size={24} />,
            title: 'Closed Tickets',
            value: 2,
            colProps: { sm: 6, md: 4, className: "col-xl" }
        },
        {
            bgColor: 'bg-danger',
            Icon: <MdDoDisturb size={24} />,
            title: 'Rejected Tickets',
            value: 2,
            colProps: { sm: 6, md: 4, className: "col-xl" }
        },
    ];

    return (
        <Card className="border-0 shadow mb-3">
            <Card.Header className="bg-body">
                <Stack
                    direction="horizontal"
                    gap={2}
                    className="flex-wrap my-1"
                >
                    <Stack
                        direction="horizontal"
                        gap={2}
                        className="flex-wrap me-auto"
                    >
                        <div className="fw-semibold fs-4 mb-0">
                            Total Claims <span className="fs-14 fw-normal">(submitted across all FIs)</span>
                        </div>
                        <div className="bg-primary bg-opacity-10 p-2 small rounded"><span className="me-2">Average Resolution Time:</span> <span className="fw-semibold">1.2 Days</span></div>
                    </Stack>

                    <div className="custom-min-width-160 flex-grow-1 flex-md-grow-0">
                        <ReactSelect
                            wrapperClassName="mb-0"
                            class="form-select "
                            placeholder="Select"
                            id="fisAndSeps"
                            size="sm"
                            options={[
                                {
                                    label: "FIs & SEPS",
                                    value: "",
                                },
                                {
                                    label: "Option 1",
                                    value: 'option-1',
                                },
                            ]}
                        />
                    </div>
                </Stack>
            </Card.Header>
            <Card.Body>
                <div className="info-cards mb-3">
                    <InfoCards claimStatsData={dashboardData?.claimStatusCount} rowClassName="g-3 text-nowrap" />
                </div>
                <Row className='gx-4 gy-3'>
                    <Col lg={6} xla>
                        <PieChart graphData={dashboardData?.slaAdherenceGraph}/>
                    </Col>
                    <Col lg={6}>
                        <ClosedClaimList closedClaimData ={dashboardData?.closeClaimStatusCount}/>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    )
}

export default TotalClaimsSection