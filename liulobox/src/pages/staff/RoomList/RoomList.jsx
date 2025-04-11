import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../contexts/AuthContext';
import InvoiceModal from '../../../components/staff/Invoice/InvoiceModal';
import ServiceTabs from '../../../components/ServiceTabs/ServiceTabs'; // Import ServiceTabs
import './RoomList.css';

const RoomList = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const token = user?.accessToken;

  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [categories, setCategories] = useState(['Tất cả']);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showCheckoutOptions, setShowCheckoutOptions] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showServiceTabs, setShowServiceTabs] = useState(false); // State để hiển thị ServiceTabs
  const [quantities, setQuantities] = useState({}); // State lưu số lượng sản phẩm

  // Fetch danh sách phòng
  const fetchRooms = async () => {
    try {
      const res = await fetch('https://fbb1-171-224-84-105.ngrok-free.app/api/room/room-state', {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      setRooms(data);
      setFilteredRooms(data);

      const unique = ['Tất cả', ...new Set(data.map(room => room.roomCategoryName))];
      setCategories(unique);
    } catch (error) {
      console.error('Lỗi lấy danh sách phòng:', error);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Lọc phòng theo loại
  useEffect(() => {
    const filtered = selectedCategory === 'Tất cả'
      ? rooms
      : rooms.filter(room => room.roomCategoryName === selectedCategory);
    setFilteredRooms(filtered);
  }, [selectedCategory, rooms]);

  const getCardColor = (status) => {
    switch (status) {
      case 'online': return 'card red';
      case 'offline': return 'card gray';
      default: return 'card green';
    }
  };

  

  const handleRoomClick = (room) => {
    if (room.bookingStatus === 'online') return;

    if (room.bookingStatus === 'offline') {
      setSelectedRoom(room);
      setShowCheckoutOptions(true);
    } else {
      navigate(`/staff/booking/offline/${room.roomId}/${room.currentIdPrice}`);
    }
  };

  const handleExit = () => {
    setSelectedRoom(null);
    setShowCheckoutOptions(false);
    setShowServiceTabs(false); // Đóng ServiceTabs khi thoát
  };


  const handleCheckout = async () => {
    handleExit();
    if (!token || !selectedRoom) return;
  
    const payloadCheckout = {
      bookingId: selectedRoom.bookingId,
      roomId: selectedRoom.roomId,
    };
  
    try {
      const res = await fetch(`https://fbb1-171-224-84-105.ngrok-free.app/api/bookings/checkout`, {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payloadCheckout),
      });
  
      if (!res.ok) throw new Error('Không thể thực hiện checkout');
      const data = await res.json();
      setBookingDetails(data[0]);
      setShowInvoice(true);
  
    } catch (error) {
      console.error(error);
      alert('Checkout thất bại: ' + error.message);
    }
  };
  

  // Xử lý khi nhấn nút "Kèm" để hiển thị ServiceTabs
  const handleAddItems = () => {
    setShowCheckoutOptions(false); // Ẩn checkout options
    setShowServiceTabs(true); // Hiển thị ServiceTabs
  };

  // Xử lý khi thay đổi số lượng trong ServiceTabs
  const handleQuantitiesChange = (updatedQuantities) => {
    setQuantities(updatedQuantities);
  };

  // Xử lý gửi API khi nhấn nút "Xác nhận" trong ServiceTabs
  const handleConfirmAddItems = async () => {
    if (!selectedRoom || !token || Object.keys(quantities).length === 0) {
      alert('Vui lòng chọn ít nhất một sản phẩm!');
      return;
    }

    const payload = {
      bookingId: selectedRoom.bookingId,
      items: Object.entries(quantities).map(([itemId, units]) => ({
        foodDrinkId: itemId,
        units,
      })),
    };

    try {
      const res = await fetch('https://fbb1-171-224-84-105.ngrok-free.app/api/bookings/add-fooddrinks', {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Không thể thêm đơn đồ ăn');
      alert('Thêm đơn đồ ăn thành công!');
      setShowServiceTabs(false);
      setQuantities({}); // Reset quantities sau khi gửi
      await fetchRooms(); // Cập nhật lại danh sách phòng
    } catch (error) {
      console.error(error);
      alert('Thêm đơn thất bại: ' + error.message);
    }
  };

  const handleConfirmCheckout = async () => {
    alert('Xác nhận checkout?');
    if (!bookingDetails || !token) {
      alert('???');
      return;
    }

    try {
      const res = await fetch(`https://fbb1-171-224-84-105.ngrok-free.app/api/bookings/confirm/${bookingDetails.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Xác nhận checkout thất bại');

      alert('Xác nhận checkout thành công');
      setShowInvoice(false);
      setShowCheckoutOptions(false);
      setSelectedRoom(null);
      await fetchRooms();
    } catch (error) {
      console.error(error);
      alert('Lỗi xác nhận: ' + error.message);
    }
  };

  return (
    <div className="room-list-container">
      {/* Bộ lọc loại phòng */}
      <div className="filter-container">
        <label htmlFor="category-filter">Lọc theo loại phòng:</label>
        <select
          id="category-filter"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Lưới hiển thị phòng */}
      <div className="room-grid">
        {filteredRooms.map(room => (
          <div
            key={room.roomId}
            className={`${getCardColor(room.bookingStatus)} ${room.bookingStatus !== 'online' ? 'clickable' : 'disabled'}`}
            onClick={() => handleRoomClick(room)}
          >
            <h3>{room.roomNumber}</h3>
            <p><strong>{room.roomCategoryName}</strong></p>
            <p>Giá hiện tại: {room.currentPrice.toLocaleString()} VND</p>

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

      {/* Nút checkout/thoát khi chọn phòng offline */}
      {showCheckoutOptions && selectedRoom && (
        <div className="checkout-options">
          <button onClick={handleCheckout}>Checkout</button>
          <button onClick={handleAddItems}>Kèm</button>
          <button onClick={handleExit}>Thoát</button>
        </div>
      )}

      {/* Hiển thị ServiceTabs khi nhấn "Kèm" */}
      {showServiceTabs && selectedRoom && (
        <div className="service-tabs-modal">
          <ServiceTabs
            showQuantityControls={true}
            quantities={quantities}
            onQuantitiesChange={handleQuantitiesChange}
          />
          <div className="service-tabs-actions">
            <button onClick={handleConfirmAddItems}>Xác nhận</button>
            <button onClick={handleExit}>Thoát</button>
          </div>
        </div>
      )}

      {/* Hiển thị hóa đơn */}
      {showInvoice && bookingDetails && (
        <InvoiceModal
          bookingDetails={bookingDetails}
          onClose={() => setShowInvoice(false)}
          onConfirm={handleConfirmCheckout}
        />
      )}
    </div>
  );
};

export default RoomList;