import { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Menu from './Menu';
import AccountMenu from './AccountMenu';
import { AuthContext } from '../contexts/AuthContext';
import './Header.css'; // Import CSS styles for the header

function Header() {
  const { user, logout } = useContext(AuthContext); // Lấy thông tin user từ AuthContext
  const isLoggedIn = !!user; // Kiểm tra user có đăng nhập không

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = ['Trang chủ', 'Giới Thiệu', 'Sơ đồ Phòng - Giá', 'Đặt phòng', 'Liên hệ'];

  const closeMenu = () => {
    if (isMenuOpen) setIsMenuOpen(false);
  };

  const closeAccount = () => {
    if (isAccountOpen) setIsAccountOpen(false);
  };

  const handleMenuItemClick = (item) => {
    setIsMenuOpen(false);
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

  const handleAccountItemClick = (item) => {
    setIsAccountOpen(false);
    switch (item) {
      case 'Tài khoản':
        navigate('/profile');
        break;
      case 'Đơn hàng':
        navigate('/order');
        break;
      case 'Đăng xuất':
        logout(); // Gọi hàm đăng xuất từ AuthContext
        navigate('/');
        break;
      case 'Đăng Nhập/Đăng Ký':
        navigate('/joinus');
        break;
      default:
        navigate('/');
    }
  };

  const gestureVariants = {
    initial: { scale: 1, backgroundColor: 'transparent', transition: { duration: 0.2 } },
    hover: { scale: 1.2, transition: { duration: 0.2 } },
    tap: { scale: 0.9, backgroundColor: 'transparent', transition: { duration: 0.1 } },
  };

  const headerVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      height: isMenuOpen || isAccountOpen ? 'auto' : 'auto',
      transition: { duration: 2, ease: 'easeOut' },
    },
  };

  return (
    <motion.header
      className="header"
      variants={headerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="header-top">
        <div className="logo">MyApp</div>
        <div className="header-right">
          <Menu
            isOpen={isMenuOpen}
            setIsOpen={setIsMenuOpen}
            onToggleOther={closeAccount}
            menuItems={menuItems}
          />
          <AccountMenu
            isOpen={isAccountOpen}
            setIsOpen={setIsAccountOpen}
            isLoggedIn={isLoggedIn}
            onToggleOther={closeMenu}
          />
        </div>
      </div>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.ul
            className="menu main"
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {menuItems.map((item, index) => (
              <motion.li
                key={item}
                variants={gestureVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                onClick={() => handleMenuItemClick(item)}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.2 }}
              >
                {item}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isAccountOpen && (
          <motion.ul
            className="menu account-menu"
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {(isLoggedIn ? ['Tài khoản', 'Đơn hàng', 'Đăng xuất'] : ['Đăng Nhập/Đăng Ký']).map((item, index) => (
              <motion.li
                key={item}
                variants={gestureVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                onClick={() => handleAccountItemClick(item)}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.2 }}
              >
                {item}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export default Header;
