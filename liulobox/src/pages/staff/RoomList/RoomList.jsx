import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RoomList.css';

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5220/api/room/room-state')
      .then(res => res.json())
      .then(data => {
        setRooms(data);
        setFilteredRooms(data);
        const uniqueCategories = ['Tất cả', ...new Set(data.map(room => room.roomCategoryName))];
        setCategories(uniqueCategories);
      })
      .catch(err => console.error('Error fetching room data:', err));
  }, []);

  useEffect(() => {
    if (selectedCategory === 'Tất cả') {
      setFilteredRooms(rooms);
    } else {
      const filtered = rooms.filter(room => room.roomCategoryName === selectedCategory);
      setFilteredRooms(filtered);
    }
  }, [selectedCategory, rooms]);

  const getCardColor = (bookingStatus) => {
    switch (bookingStatus) {
      case 'online': return 'card red';
      case 'offline': return 'card gray';
      default: return 'card green';
    }
  };

  const handleRoomClick = (room) => {
    if (room.bookingStatus === 'online') return; // Không cho nhấp vào phòng đỏ
    if (room.bookingStatus !== 'offline') {
      navigate(`/staff/booking/offline/${room.roomId}/${room.currentIdPrice}`); // Chuyển hướng đến trang offline booking
    }
  };

  return (
    <div className="room-list-container">
      <div style={{ padding: '0 20px', marginTop: '10px' }}>
        <label htmlFor="category-filter" style={{ color: 'var(--color-text-primary)', fontWeight: 'bold', marginRight: '10px' }}>
          Lọc theo loại phòng:
        </label>
        <select
          id="category-filter"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            backgroundColor: 'var(--color-button)',
            color: 'var(--color-text-black)',
            fontWeight: 'bold',
            border: '1px solid var(--color-border-light)'
          }}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="room-grid">
        {filteredRooms.map(room => (
          <div
            key={room.roomId}
            className={`${getCardColor(room.bookingStatus)} ${room.bookingStatus === 'online' ? 'disabled' : 'clickable'}`}
            onClick={() => handleRoomClick(room)}
          >
            <h3>{room.roomNumber}</h3>
            <p><strong>{room.roomCategoryName}</strong></p>
            <p><strong>Giá hiện tại:</strong> {room.currentPrice.toLocaleString()} VND</p>

            {room.futureOnlineBookings.length > 0 && (
              <div className="future-bookings">
                <p><strong>Booking hôm nay:</strong></p>
                <ul>
                  {room.futureOnlineBookings.map(b => (
                    <li key={b.bookingId}>
                      {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                      {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomList;