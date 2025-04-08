import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { menu } from 'ionicons/icons';
import { useContext } from 'react'; // Thêm useContext
import { AuthContext } from '../contexts/AuthContext'; // Thêm AuthContext

function Menu({ isOpen, setIsOpen, onToggleOther, menuItems }) {
  const { role } = useContext(AuthContext); // Lấy role từ AuthContext
  const navigate = useNavigate();
  const isStaff = role === 'staff'; // Kiểm tra xem có phải staff không

  const handleToggle = () => {
    if (onToggleOther) onToggleOther(); // Đóng menu khác nếu đang mở
    setIsOpen(!isOpen);
  };

  // Hàm điều hướng tùy theo role
  const handleMenuItemClick = (item) => {
    setIsOpen(false); // Đóng menu sau khi click
    if (isStaff) {
      // Điều hướng cho staff
      switch (item) {
        case 'Trang chủ':
          navigate('/staff/dashboard');
          break;
        case 'Quản lý phòng':
          navigate('/staff/rooms');
          break;
        case 'Quản lý đặt phòng':
          navigate('/staff/bookings');
          break;
        case 'Báo cáo':
          navigate('/staff/reports');
          break;
        default:
          navigate('/staff/dashboard');
      }
    } else {
      // Điều hướng cho customer
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