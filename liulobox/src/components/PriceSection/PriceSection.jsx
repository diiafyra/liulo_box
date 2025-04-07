import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import PriceCard from '../PriceCard/PriceCard';
import './PriceSection.css';
import { useNavigate } from 'react-router-dom'; // Thêm useNavigate

function PriceSection() {
    const navigate = useNavigate(); // Khởi tạo useNavigate
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sectionRef, sectionInView] = useInView({ triggerOnce: false, threshold: 0.2 });

    // Fetch rooms data từ API khi component mount hoặc khi có thay đổi
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await fetch('http://localhost:5220/api/priceconfig/getcategories'); // API endpoint của bạn
                if (!response.ok) {
                    throw new Error('Failed to fetch rooms data');
                }
                const data = await response.json();
                setRooms(data); // Cập nhật state với dữ liệu từ API
            } catch (error) {
                setError(error.message); // Xử lý lỗi nếu có
            } finally {
                setLoading(false); // Đặt loading là false khi đã lấy dữ liệu
            }
        };

        fetchRooms();
    }, []); // Chạy effect này khi component mount

    const handleCardClick = (categoryId) => {
        navigate(`/rooms/${categoryId}`); // Điều hướng đến route danh sách phòng theo categoryId
    };

    if (loading) {
        return <div>Loading...</div>; // Hiển thị loading khi đang lấy dữ liệu
    }

    if (error) {
        return <div>Error: {error}</div>; // Hiển thị lỗi nếu có vấn đề khi fetch dữ liệu
    }

    return (
        <motion.section
            id="price-section"
            ref={sectionRef}
            className="section price-section"
            initial={{ opacity: 0, y: 50 }}
            animate={sectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.5 }}
        >
            <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={sectionInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                transition={{ duration: 0.5 }}
            >
                Các hạng phòng
            </motion.h2>
            <div className="price-cards">
                {rooms.map((room, index) => (
                    <PriceCard
                        key={index}
                        image={room.url}
                        title={room.name}
                        capacity={room.maxCapacity}
                        description={room.description}
                        prices={room.roomPricing}
                        index={index}
                        sectionInView={sectionInView}
                        categoryName={room.name} // Truyền id của category
                        onCardClick={handleCardClick} // Truyền hàm xử lý điều hướng
                    />
                ))}
            </div>
        </motion.section>
    );
}

export default PriceSection;
