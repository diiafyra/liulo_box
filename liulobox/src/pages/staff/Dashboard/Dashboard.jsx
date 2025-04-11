import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LineChart from '../../../components/staff/LineChart/LineChart'; // Component biểu đồ đường
import AreaChart from '../../../components/staff/AreaChart/AreaChart'; // Component biểu đồ miền
import Notes from '../../../components/staff/Note/Notes'; // Component ghi chú
import './Dashboard.css';
import { useNavigate } from 'react-router-dom'; // Thư viện điều hướng
function Dashboard() {
  const navigate = useNavigate(); // Sử dụng useNavigate để điều hướng
  const [roomData, setRoomData] = useState(null); // Dữ liệu biểu đồ phòng
  const [revenueData, setRevenueData] = useState(null); // Dữ liệu biểu đồ doanh thu

  // useEffect(() => {
  //   fetchDashboardData();
  // }, []);

//   const fetchDashboardData = async () => {
//     try {
//       const roomResponse = await axios.get('https://fbb1-171-224-84-105.ngrok-free.app/api/dashboard/room-stats');
//       setRoomData(roomResponse.data);

//       const revenueResponse = await axios.get('https://fbb1-171-224-84-105.ngrok-free.app/api/dashboard/revenue-stats');
//       setRevenueData(revenueResponse.data);
//     } catch (error) {
//       console.error('Error fetching dashboard data:', error);
//     }
//   };

  const handleRoomListClick = () => {
    navigate('/staff/booking/offline'); // Chuyển hướng đến trang danh sách phòng
  };

  const handleInventoryClick = () => {
    navigate('/staff/stockin'); // Chuyển hướng đến trang nhập hàng
  };

  const handleCheckInClick = () => {
    navigate('/staff/booking/online'); // Chuyển hướng đến trang trả phòng khách Online};
  }
  const handleShiftEndClick = () => {
    console.log('/staff/booking/create-employee');
  };

  return (
    <div className="dashboard">
      {/* 4 nút lớn */}
      <div className="button-container">
        <button className="modern-button" onClick={handleRoomListClick}>
          Danh sách phòng
        </button>
        <button className="modern-button" onClick={handleInventoryClick}>
          Nhập hàng
        </button>
        <button className="modern-button" onClick={handleCheckInClick}>
          Trả phòng khách Online
        </button>
        <button className="modern-button" onClick={handleShiftEndClick}>
          Tạo tài khoản NV
        </button>
      </div>

      {/* Khu vực biểu đồ và ghi chú */}
      {/* <div className="content-container">
        <div className="charts-container">
          {roomData && <LineChart title="Số lượng phòng đặt (7 ngày)" data={roomData} />}
          {revenueData && <AreaChart title="Doanh thu Online/Offline (7 ngày)" data={revenueData} />}
        </div>
        <Notes />
      </div> */}
    </div>
  );
}

export default Dashboard;