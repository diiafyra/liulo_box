import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // Import useNavigate từ react-router-dom
import PriceSwitcher from '../PriceSwitcher/PriceSwitcher';
import './PriceCard.css';

function PriceCard({
    image,
    title,
    capacity,
    description,
    prices,
    index,
    sectionInView,
    categoryName,
}) {
    const navigate = useNavigate(); // Khởi tạo hook useNavigate

    // Hàm xử lý click cho điều hướng
    const handleClick = (e) => {
        e.preventDefault(); // Ngăn hành vi mặc định nếu có
        navigate(`/rooms?category=${categoryName}`); // Điều hướng tới trang rooms và thêm categoryId vào query parameter
    };

    return (
        <motion.div
            className="price-card"
            initial={{ opacity: 0, x: -50 }}
            animate={sectionInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.5, delay: 0.2 * (index + 1) }}
            whileHover={{ scale: 1.05, transition: { duration: 0.1 } }} // Hiệu ứng hover cho toàn card
        >
            <img
                src={image}
                alt={title}
                className="room-highlight"
                onClick={handleClick} // Gắn sự kiện click vào hình ảnh
                style={{ cursor: 'pointer' }} // Con trỏ tay cho hình ảnh
            />
            <div className="room-infor">
                <motion.h3
                    initial={{ backgroundPosition: '0% 50%' }}
                    animate={{ backgroundPosition: '100% 50%' }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                >
                    {title}
                </motion.h3>
                <motion.p
                    initial={{ y: 10, opacity: 0 }}
                    animate={sectionInView ? { y: 0, opacity: 1 } : { y: 10, opacity: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 * (index + 1) + 0.2 }}
                >
                    Giới hạn: {capacity} người
                </motion.p>
                <motion.p
                    initial={{ y: 10, opacity: 0 }}
                    animate={sectionInView ? { y: 0, opacity: 1 } : { y: 10, opacity: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 * (index + 1) + 0.3 }}
                >
                    {description}
                </motion.p>
                <PriceSwitcher prices={prices} /> {/* PriceSwitcher giữ nguyên chức năng */}
            </div>
        </motion.div>
    );
}

export default PriceCard;
