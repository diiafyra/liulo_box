import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Thêm useLocation để lấy query params
import { useLoading } from './../../contexts/LoadingContext'; // Import useLoading để dùng context
import './RoomLayout.css'; // Đảm bảo bạn có file CSS cho theme
import withLoading from './../../components/withLoading'; // Import HOC với loading
const RoomLayout = ({ onComplete }) => {
  const { setIsLoading } = useLoading(); // Lấy setIsLoading từ context
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]); // Danh sách category
  const navigate = useNavigate(); // Sử dụng useNavigate thay vì useHistory
  const location = useLocation(); // Lấy URL hiện tại
  const queryParams = new URLSearchParams(location.search); // Lấy query parameters từ URL
  const categoryId = queryParams.get('category'); // Lấy giá trị category từ URL

  // Fetch danh sách phòng và category từ API
  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoading(true); // Bật loading trước khi fetch
      try {
        const response = await fetch('http://localhost:5220/api/room');
        const data = await response.json();

        // Lấy các category duy nhất từ dữ liệu phòng
        const categorySet = new Set(data.map((room) => room.roomCategory.name));
        setCategories(Array.from(categorySet)); // Cập nhật danh sách category
        setRooms(data); // Lưu tất cả phòng vào state
        setFilteredRooms(data); // Mặc định hiển thị tất cả phòng
      } catch (error) {
        console.error('Lỗi lấy danh sách phòng:', error);
      } finally {
        setIsLoading(false); // Tắt loading sau khi fetch xong
      }
    };

    fetchRooms();
  }, [setIsLoading]); // Chỉ fetch dữ liệu phòng một lần khi component mount, thêm setIsLoading vào dependency

  // Điều chỉnh danh sách phòng theo category từ query params
  useEffect(() => {
    if (categoryId) {
      setSelectedCategory(categoryId);
      setFilteredRooms(rooms.filter((room) => room.roomCategory.name === categoryId));
    } else {
      setSelectedCategory(null);
      setFilteredRooms(rooms); // Nếu không có category, hiển thị tất cả phòng
    }
  }, [categoryId, rooms]); // Cập nhật khi categoryId hoặc rooms thay đổi

  // Handle khi người dùng chọn category
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    if (category) {
      setFilteredRooms(rooms.filter((room) => room.roomCategory.name === category)); // Lọc phòng theo category name
      navigate(`?category=${category}`); // Điều hướng với query parameter category (dùng name thay vì id)
    } else {
      setFilteredRooms(rooms); // Nếu không chọn category nào, hiển thị tất cả
      navigate('?'); // Xóa query parameter khi chọn "All"
    }
  };

  // Handle khi người dùng chọn phòng
  const handleRoomSelect = (room) => {
    setSelectedRoom(room.id); // Lưu lại phòng đã chọn
    if (typeof onComplete === 'function') {
      onComplete(room); // Truyền toàn bộ phòng đã chọn
    } else { // Truyền toàn bộ phòng đã chọn
      navigate(`/room-detail/${room.id}`);
    } // Điều hướng đến trang chi tiết phòng
    // alert(`Bạn đã chọn phòng ${room.roomNumber}`); // Thông báo phòng đã chọn
  };

  return (
    <div className="room-layout">
      {/* Tab Bar lọc theo Category */}
      <div className="tab-bar">
        {categories.map((category) => (
          <button
            key={category}
            className={selectedCategory === category ? 'active' : ''}
            onClick={() => handleCategorySelect(category)} // Đổi category khi click
          >
            {category}
          </button>
        ))}
        <button
          className={!selectedCategory ? 'active' : ''}
          onClick={() => handleCategorySelect(null)} // Để trống để xem tất cả phòng
        >
          All
        </button>
      </div>

      {/* Hiển thị các phòng */}
      <div className="room-grid">
        {filteredRooms.map((room) => (
          <div
            key={room.id}
            className={`room-item ${selectedRoom === room.id ? 'selected' : ''}`}
            onClick={() => handleRoomSelect(room)} // Truyền toàn bộ phòng
          >
            <img
              src={room.roomCategory.url}
              alt={room.roomCategory.name}
              className="room-image"
            />
            <div className="room-info">
              <h3>{room.roomNumber}</h3>
              <p>{room.roomCategory.name}</p>
              <p>{room.roomCategory.description}</p>
              <p>Tối đa {room.roomCategory.maxCapacity} người</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Áp dụng HOC withLoading
export default withLoading(RoomLayout);