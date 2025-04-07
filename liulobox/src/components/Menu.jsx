import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { IonIcon } from '@ionic/react'; // Import IonIcon
import { menu } from 'ionicons/icons';

function Menu({ isOpen, setIsOpen, onToggleOther, menuItems }) {
    const navigate = useNavigate(); // Khởi tạo useNavigate

    const handleToggle = () => {
        if (onToggleOther) onToggleOther(); // Đóng menu khác nếu đang mở
        setIsOpen(!isOpen);
    };

    // Hàm điều hướng cho menu chính
    const handleMenuItemClick = (item) => {
        switch (item) {
            case 'Trang chủ':
                navigate('/');
                break;
            case 'Giới Thiệu':
                navigate('/about');
                break;
            case 'Sơ đồ Phòng - Giá':
                navigate('/rooms');
                break;
            case 'Đặt phòng':
                navigate('/booking');
                break;
            case 'Liên hệ':
                navigate('/contact');
                break;
            default:
                navigate('/');
        }
    };

    // Variants cho hiệu ứng gesture
    const gestureVariants = {
        initial: { scale: 1, backgroundColor: 'transparent', transition: { duration: 0.2 } },
        hover: { scale: 1.2, transition: { duration: 0.2 } },
        tap: { scale: 0.9, transition: { duration: 0.1 } },
    };

    return (
        <nav className="nav">
            {/* Nút toggle */}
            <motion.button
                className="menu-toggle"
                onClick={handleToggle}
                variants={gestureVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
            >
                <IonIcon icon={menu} />
            </motion.button>

            {/* Menu cho màn hình lớn */}
            <ul className="menu wide-screen-menu">
                {menuItems.map((item) => (
                    <motion.li
                        key={item}
                        variants={gestureVariants}
                        initial="initial"
                        whileHover="hover"
                        whileTap="tap"
                        onClick={() => handleMenuItemClick(item)} // Gọi hàm điều hướng
                    >
                        {item}
                    </motion.li>
                ))}
            </ul>
        </nav>
    );
}

export default Menu;