import React from 'react'
import { Card, Col, Image, Ratio, Row } from 'react-bootstrap'

const PieChart = () => {
    return (
        <Card className='rounded-3 border-custom-gray h-100'>
            <Card.Body>
                <Row>
                    <Col className='d-flex flex-column'>
                        <div className='custom-font-size-18 fw-semibold pb-3'>SLA Adherence</div>
                        <div className='my-auto pb-4'>
                            <ul className='list-unstyled'>
                                <li className='d-flex align-items-center gap-2 mb-2 pb-1'>
                                    <span className='custom-width-10 custom-height-10 flex-shrink-1 rounded-circle bg-custom-green'></span>
                                    <span className='small'>On Time Claims</span>
                                </li>
                                <li className='d-flex align-items-center gap-2 mb-2 pb-1'>
                                    <span className='custom-width-10 custom-height-10 flex-shrink-1 rounded-circle bg-custom-red'></span>
                                    <span className='small'>Breached Claims</span>
                                </li>
                            </ul>
                        </div>
                    </Col>
                    <Col sm="auto">
                        <Ratio aspectRatio={'1x1'} className='custom-width-218 m-auto'>
                            <Image
                                className="object-fit-cover"
                                src={'https://placehold.co/266/ccc/000.png?text=PieChart'}
                                width={218}
                                height={218}
                                alt={'Chart Placeholder'}
                                roundedCircle
                            />
                        </Ratio>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    )
}

export default PieChart