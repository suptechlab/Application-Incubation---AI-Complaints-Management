import React, { useState } from 'react';
import { Card, Col, Ratio, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
// import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const RADIAN = Math.PI / 180;

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', width: '150px' }}>
                <p style={{ margin: 0 }}>{payload[0].name}</p>
                <p style={{ margin: 0 }}>Value: {payload[0].value}</p>
            </div>
        );
    }
    return null;
};

const PieChartComponent = ({ graphData }) => {


    const { t } = useTranslation()
    // State to manage hovered sector
    // Prepare data for the Pie chart

    // Get dynamic colors from the API (backgroundColor)
    // const HOVER_COLORS = graphData?.datasets?.[0]?.hoverBackgroundColor || ['#D93D2A', '#75B13B']; // Default hover colors if not provided

    const data = {
        labels: graphData?.labels || [],
        datasets: [
            {
                label: '',
                data: graphData?.datasets?.[0]?.data || [],
                backgroundColor: graphData?.datasets?.[0]?.backgroundColor || ['#D93D2A', '#75B13B'], // Default colors if not provided,
                borderColor: graphData?.datasets?.[0]?.backgroundColor || ['#D93D2A', '#75B13B'], // Default colors if not provided,
                borderWidth: 1,
                hoverBackgroundColor: graphData?.datasets?.[0]?.hoverBackgroundColor || ['#D93D2A', '#75B13B'],
                // radius: '80%',
            },
        ],
    };
    const options = {
        plugins: {
            legend: {
                position: 'left', // Position legend on the left
                align: 'center', // Align legend to the left edge
                labels: {
                    usePointStyle: true, // Use pointStyle for circular icons
                    boxWidth: 10, // Adjust the size of the legend icon
                    boxHeight: 10, // Adjust the height of the legend icon
                    padding: 20, // Space between legend items
                },
            },
        },
        layout: {
            padding: {
                left: 0, // Remove left padding for the chart
                right: 0, // Remove right padding for the chart
                top: 10, // Adjust top padding
                bottom: 10, // Adjust bottom padding
            },
        },
        elements: {
            arc: {
                borderWidth: 2, // Border width for arcs
                radius: '100%', // Increase the arc size
            },
        },
        responsive: true,
        maintainAspectRatio: false,
    };

    return (
        <Card className='rounded-3 border-custom-gray h-100'>
            <Card.Body>
                <Row>
                    <Col className='d-flex flex-column'>
                        <div className='custom-font-size-18 fw-semibold pb-3'>{t("SLA ADHERENCE")}</div>
                        {/* <div className='my-auto pb-4'>
                            <ul className='list-unstyled'>
                                {graphData?.labels?.map((label, index) => (
                                    <li key={index} className='d-flex align-items-center gap-2 mb-2 pb-1'>
                                        <span className={`custom-width-10 custom-height-10 flex-shrink-1 rounded-circle`}
                                            style={{ backgroundColor: COLORS[index] }}></span>
                                        <span className='small'>{label}</span>
                                    </li>
                                ))}
                            </ul>
                        </div> */}
                    </Col>

                </Row>
                <Row>
                    <Col sm="12 chart-container">
                        <div className="d-flex justify-content-end">
                            <Pie data={data} options={options} />
                        </div>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

export default PieChartComponent;
