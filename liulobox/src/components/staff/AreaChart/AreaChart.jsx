import React from 'react';
import { Line } from 'react-chartjs-2'; // Dùng Line với fill để tạo biểu đồ miền
import { Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale);

function AreaChart({ title, data }) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Online Revenue',
        data: data.onlineRevenue,
        backgroundColor: 'rgba(76, 175, 80, 0.5)',
        borderColor: '#4caf50',
        fill: true,
      },
      {
        label: 'Offline Revenue',
        data: data.offlineRevenue,
        backgroundColor: 'rgba(244, 67, 54, 0.5)',
        borderColor: '#f44336',
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: { y: { stacked: true, beginAtZero: true } },
  };

  return (
    <div className="chart-box">
      <h3>{title}</h3>
      <Line data={chartData} options={options} />
    </div>
  );
}

export default AreaChart;