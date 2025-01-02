import React, { useState } from 'react';
import { Card, Col, Ratio, Row } from 'react-bootstrap';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const RADIAN = Math.PI / 180;

const PieChartComponent = ({ graphData }) => {
    // State to manage hovered sector
    const [activeIndex, setActiveIndex] = useState(null);

    // Prepare data for the Pie chart
    const chartData = graphData?.datasets?.[0]?.data?.map((value, index) => ({
        name: graphData?.labels?.[index],
        value: value
    })) || [];

    // Get dynamic colors from the API (backgroundColor)
    const COLORS = graphData?.datasets?.[0]?.backgroundColor || ['#D93D2A', '#75B13B']; // Default colors if not provided
    const HOVER_COLORS = graphData?.datasets?.[0]?.hoverBackgroundColor || ['#D93D2A', '#75B13B']; // Default hover colors if not provided

    // Handle hover to set active index
    const onPieEnter = (_, index) => {
        setActiveIndex(index);
    };

    // Handle hover leave to reset active index
    const onPieLeave = () => {
        setActiveIndex(null);
    };

    return (
        <Card className='rounded-3 border-custom-gray h-100'>
            <Card.Body>
                <Row>
                    <Col className='d-flex flex-column'>
                        <div className='custom-font-size-18 fw-semibold pb-3'>SLA Adherence</div>
                        <div className='my-auto pb-4'>
                            <ul className='list-unstyled'>
                                {graphData?.labels?.map((label, index) => (
                                    <li key={index} className='d-flex align-items-center gap-2 mb-2 pb-1'>
                                        <span className={`custom-width-10 custom-height-10 flex-shrink-1 rounded-circle`} 
                                              style={{ backgroundColor: COLORS[index] }}></span>
                                        <span className='small'>{label}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Col>
                    <Col sm="auto">
                        <Ratio aspectRatio={'1x1'} className='custom-width-280 m-auto'>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart width={280} height={280}>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={130}
                                        dataKey="value"
                                        onMouseEnter={onPieEnter}
                                        onMouseLeave={onPieLeave}
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={activeIndex === index ? HOVER_COLORS[index % HOVER_COLORS.length] : COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </Ratio>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

export default PieChartComponent;
