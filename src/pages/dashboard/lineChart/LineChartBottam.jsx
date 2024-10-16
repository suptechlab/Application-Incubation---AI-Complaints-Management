import React from "react";
import { LineChart } from '@mui/x-charts/LineChart';

const uData = [4000, 3000, 2000, 2780, 1890, 2390, 3490];
const pData = [2400, 1398, 9800, 3908, 4800, 3800, 4300];
const xLabels = [
  'Page A',
  'Page B',
  'Page C',
  'Page D',
  'Page E',
  'Page F',
  'Page G',
];

const LineChartBottam = ({chartData, heading}) => {
    //console.log('chartData',chartData.xLabels)
    return (
      <LineChart
        //width={900}
        height={300}
        // series={[
        //   { data: pData, label: 'ONGC' },
        //   { data: uData, label: 'OIL' },
        // ]}
        // xAxis={[{ scaleType: 'point', data: xLabels }]}
        series={chartData?.series || []}
        xAxis={[{ scaleType: 'point', data: chartData?.xLabels||[] }]}
        yAxis={[{ label: '' }]}
      />
    );
}

export default LineChartBottam;
