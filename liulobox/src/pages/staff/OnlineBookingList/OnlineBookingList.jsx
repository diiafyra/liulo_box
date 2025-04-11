import React, { useState, useEffect, useContext } from 'react';
import './OnlineBookingList.css';
import InvoiceModal from './../../../components/staff/Invoice/InvoiceModal'; // Import InvoiceModal
import { AuthContext } from '../../../contexts/AuthContext'; // Import AuthContext
const OnlineBookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Ngày hiện tại
  const { user } = useContext(AuthContext);
  const token = user.accessToken ?? null // Lấy thông tin người dùng từ AuthContext
  // Token giả định từ localStorage (thay bằng cách lấy thực tế nếu cần)

  // Lấy danh sách booking từ API
  useEffect(() => {
    fetchBookings(date);
  }, [date]);

  const fetchBookings = async (selectedDate) => {
    try {
      const response = await fetch(`https://fbb1-171-224-84-105.ngrok-free.app/api/bookings/online?date=${selectedDate}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Thêm token nếu API yêu cầu xác thực
        },
      });
      if (!response.ok) {
        throw new Error('Lỗi khi lấy danh sách booking');
      }
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  // Xử lý khi nhấn vào một booking để xem hóa đơn
  const handleBookingClick = (booking) => {
    setSelectedBooking(booking);
  };

  // Xác nhận booking (cập nhật isComplete = true)
  const handleConfirm = async (bookingId) => {
    try {
      const response = await fetch(`https://fbb1-171-224-84-105.ngrok-free.app/api/bookings/${bookingId}/complete`, {
        method: 'PUT',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Thêm token nếu API yêu cầu
        },
        body: JSON.stringify({ isConfirmed: true }),
      });
      if (response.ok) {
        alert('Booking confirmed!');
        setSelectedBooking(null);
        fetchBookings(date); // Cập nhật lại danh sách
      } else {
        throw new Error('Lỗi khi xác nhận booking');
      }
    } catch (error) {
      console.error('Error confirming booking:', error);
      alert('Lỗi: ' + error.message);
    }
  };

  return (
    <div className="booking-container">
      <h1>Danh sách đặt online</h1>
      <input
        className="date-picker"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      {/* Danh sách booking */}
      <div className="booking-list">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="booking-item"
            onClick={() => handleBookingClick(booking)}
          >
            <p>ID: {booking.id}</p>
            <p>User: {booking.user.username}</p>
            <p>Room: {booking.room.roomNumber}</p>
          </div>
        ))}
      </div>

      {/* Hiển thị InvoiceModal khi chọn booking */}
      {selectedBooking && (
        <InvoiceModal
          bookingDetails={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onConfirm={() => handleConfirm(selectedBooking.id)}
        />
      )}
    </div>
  );
};

export default OnlineBookingList;