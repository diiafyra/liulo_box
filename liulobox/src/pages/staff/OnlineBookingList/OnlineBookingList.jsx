import React, { useState, useEffect } from 'react';
import './OnlineBookingList.css';

const OnlineBookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Ngày hiện tại

  // Lấy danh sách booking từ API
  useEffect(() => {
    fetchBookings(date);
  }, [date]);

  const fetchBookings = async (selectedDate) => {
    try {
      const response = await fetch(`http://localhost:5220/api/bookings/online?date=${selectedDate}`);
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
      const response = await fetch(`http://localhost:5220/api/bookings/${bookingId}/confirm`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isComplete: true }),
      });
      if (response.ok) {
        alert('Booking confirmed!');
        setSelectedBooking(null);
        fetchBookings(date); // Cập nhật lại danh sách
      }
    } catch (error) {
      console.error('Error confirming booking:', error);
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
            <p>User: {booking.username}</p>
            <p>Room: {booking.roomName}</p>
            <p>Total: {booking.totalPrice.toLocaleString()} VND</p>
          </div>
        ))}
      </div>

      {/* Hóa đơn */}
      {selectedBooking && (
        <div className="invoice">
          <h2>Invoice</h2>
          <p><strong>User:</strong> {selectedBooking.username}</p>
          <p><strong>Room:</strong> {selectedBooking.roomName}</p>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Units</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {selectedBooking.times.map((time, index) => (
                <tr key={index}>
                  <td>Room Time ({time.start} - {time.end})</td>
                  <td>1</td>
                  <td>{time.price.toLocaleString()} VND</td>
                </tr>
              ))}
              {selectedBooking.foodDrinks.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.units}</td>
                  <td>{item.price.toLocaleString()} VND</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p><strong>Total:</strong> {selectedBooking.totalPrice.toLocaleString()} VND</p>
          <button onClick={() => handleConfirm(selectedBooking.id)}>Confirm</button>
          <button onClick={() => setSelectedBooking(null)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default OnlineBookingList;