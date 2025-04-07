import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './RoomDetail.css';

const RoomDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    // Fetch chi tiết phòng từ API
    useEffect(() => {
        const fetchRoomDetail = async () => {
            try {
                const response = await fetch(`http://localhost:5220/api/room/${id}`);
                if (!response.ok) throw new Error('Không thể tải thông tin phòng');
                const data = await response.json();
                setRoom(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        if (id) {
            fetchRoomDetail();
        } else {
            setError('ID phòng không hợp lệ');
            setLoading(false);
        }
    }, [id]);

    // Xử lý khi nhấn nút đặt phòng
    const handleBookNow = () => {
        navigate(`/booking`);
    };

    // Xử lý khi nhấn vào ảnh trong gallery
    const handleImageClick = (image) => {
        setSelectedImage(image);
    };

    // Đóng modal
    const closeModal = () => {
        setSelectedImage(null);
    };

    if (loading) return <div className="loading">Đang tải...</div>;
    if (error) return <div className="error">Lỗi: {error}</div>;

    return (
        <div className="room-detail-container">
            {/* Main Layout */}
            <section className="room-main">
                {/* Ảnh chính */}
                <div className="room-hero">
                    <img
                        src={
                            selectedImage?.url ||
                            room.roomImages.find((img) => img.isMain)?.url ||
                            room.roomCategory.url
                        }
                        alt={room.roomNumber}
                        className="hero-image"
                    />
                    <div className="hero-overlay">
                        <h1>{room.roomNumber} - {room.roomCategory.name}</h1>
                        <p className="status">{room.isActive ? 'Còn trống' : 'Đã đặt'}</p>
                    </div>
                </div>

                {/* Info (bên phải trên màn hình lớn) */}
                <div className="info">
                    <h2>Mô tả</h2>
                    <p>{room.description}</p>

                    <h2>Loại phòng</h2>
                    <p>{room.roomCategory.name} - {room.roomCategory.description}</p>

                    <h2>Sức chứa tối đa</h2>
                    <p>{room.roomCategory.maxCapacity} người</p>

                    <button className="book-now-btn" onClick={handleBookNow}>
                        Đặt phòng ngay
                    </button>
                </div>
            </section>

            {/* Gallery (bên dưới) */}
            <section className="gallery-section">
                <div className="gallery">
                    {room.roomImages.map((image) => (
                        <img
                            key={image.id}
                            src={image.url}
                            alt={image.alt}
                            className="gallery-image"
                            onClick={() => handleImageClick(image)}
                        />
                    ))}
                </div>
            </section>

            {/* Modal hiển thị ảnh lớn */}
            {selectedImage && (
                <div className="image-modal" onClick={closeModal}>
                    <div className="modal-content">
                        <img src={selectedImage.url} alt={selectedImage.alt} className="modal-image" />
                        <button className="close-modal-btn" onClick={closeModal}>
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomDetail;