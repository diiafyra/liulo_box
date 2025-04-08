import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale);

function LineChart({ title, data }) {
  const chartData = {
    labels: data.labels,
    datasets: [
      { label: 'Small Rooms', data: data.smallRooms, borderColor: '#4caf50', fill: false },
      { label: 'Medium Rooms', data: data.mediumRooms, borderColor: '#ff9800', fill: false },
      { label: 'Large Rooms', data: data.largeRooms, borderColor: '#f44336', fill: false },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: { y: { beginAtZero: true } },
  };

  return (
    <div className="chart-box">
      <h3>{title}</h3>
      <Line data={chartData} options={options} />
    </div>
  );
}

export default LineChart;