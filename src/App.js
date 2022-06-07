import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
//  Tooltip,
//  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
//import faker from 'faker'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
//  Tooltip,
//  Legend
);

export const options = {
  responsive: false,
  plugins: {
    title: {
      display: true,
    },
  },
};
var datal = [0,1,2,3,4,5,6,7,8,9,10];
const labels = [0,0,0,0,0,0,0,0,0,0, 0];

export const data = {
  labels,
  datasets: [
    {
      data: datal,
    },
  ],
};

export function App() {
  return <Line options={options} data={data} />;
}