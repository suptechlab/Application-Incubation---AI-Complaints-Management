import * as React from 'react';
import { Card } from "react-bootstrap";
import { ChartContainer } from '@mui/x-charts/ChartContainer';
import { BarPlot } from '@mui/x-charts/BarChart';
import { BarChart } from '@mui/x-charts/BarChart';

const BarChartModel = ({ chartData, heading }) => {
  return (
    
      

      <Card.Body>
        <div className="d-flex w-100 justify-content-between align-items-center">
          <div className=" bar_width_height">
            <BarChart
             
              
              series={[{  
                 data: chartData.graphValues || [],  
                 type: 'bar', 
                //  label: 'Cr.',
                barWidth: 30, // Set the bar width to 50% of the available space
              }]}
              xAxis={[
                { scaleType: 'band', 
                  data: chartData.valueNames || [],
                  barGapRatio: 0.4, // Adjust the gap between bars
                  categoryGapRatio: 0.6 
                }
              ]}
              yAxis={[{ label: '' }]}
              barLabel="value"
              colors={['#A12B31']}
              borderRadius={26}
            >
              {/* <BarPlot /> */}
            </BarChart>
          </div>
        </div>
      </Card.Body>
    

  );
}
export default BarChartModel;


