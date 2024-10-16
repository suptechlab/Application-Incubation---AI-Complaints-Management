import {
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    Title,
    Tooltip,
} from "chart.js";
import React from "react";
import { Card } from "react-bootstrap";
import { Line } from "react-chartjs-2";
import ReactSelect from "react-select";

import { productData } from "../sample";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);
const primary = "#1A3866";

const LineChart = ({heading, chartData}) => {
    const productCount = productData.length;
    const data = {
        labels: [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
        ],
        datasets: [
            {
                label: "Product Sale",
                data: [
                    productCount / 2,
                    productCount / 4,
                    productCount,
                    productCount / 2,
                    productCount,
                    productCount / 3,
                    productCount / 2,
                ],
                borderColor: primary,
                tension: 0.1,
            },
        ],
    };
    const options = {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
        },
    };

    return (
        <Card className="h-100 border-0 p-3 border-0 custom-shadow">
            <Card.Header as="h6" className="fw-semibold bg-body border-0">
                
                <h2 className="fs-16 fw-bolder">{heading}</h2>   
                    
                
            </Card.Header>
            <Card.Body>
                <div className="d-flex w-100 justify-content-between align-items-center">
                    <div className="chart-cover">
                        <Line options={options} data={data} /></div>

                    <div className="min-width-200 align-items-center">
                        <div className=" gap-4">
                            <div className="fs-13 fw-normal">
                                <span className="on_trail_box"></span>ONGC
                            </div>
                            <div className="fs-13 fw-normal">
                                <span className="free_box"></span>Oil India
                            </div>
                        </div>
                       
                    </div>
                    </div>
            </Card.Body>
        </Card>
    );
};

export default LineChart;
