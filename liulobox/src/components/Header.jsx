import { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Menu from './Menu';
import AccountMenu from './AccountMenu';
import { AuthContext } from '../contexts/AuthContext';
import { IonIcon } from '@ionic/react';
import { logOutOutline } from 'ionicons/icons';
import './Header.css';

function Header() {
  const { user, role, logout } = useContext(AuthContext);
  const isLoggedIn = !!user;
  const isStaff = role === 'staff';

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const navigate = useNavigate();

  const customerMenuItems = ['Trang chủ', 'Giới Thiệu', 'Sơ đồ Phòng - Giá', 'Đặt phòng', 'Liên hệ'];
  const staffMenuItems = ['Trang chủ', 'Tạo tài khoản nhân viên', 'Quản lý đặt phòng', 'Nhập hàng','Trả phòng khách Online', 'Báo cáo'];
  const menuItems = isStaff ? staffMenuItems : customerMenuItems;

  const closeMenu = () => {
    if (isMenuOpen) setIsMenuOpen(false);
  };

  const closeAccount = () => {
    if (isAccountOpen) setIsAccountOpen(false);
  };

  const handleMenuItemClick = (item) => {
    setIsMenuOpen(false);
    if (isStaff) {
      switch (item) {
        case 'Trang chủ':
          navigate('/staff/dashboard');
          break;
        case 'Tạo tài khoản nhân viên':
          navigate('/staff/create-employee');
          break;
        case 'Quản lý đặt phòng':
          navigate('/staff/booking/offline');
          break;
        case 'Nhập hàng':
          navigate('/staff/stockin');
          break;
        case 'Trả phòng khách Online':
          navigate('/staff/booking/online');
          break;
        case 'Báo cáo':
          navigate('/staff/reports');
          break;
        default:
          navigate('/staff/dashboard');
      }
    } else {
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

  const handleAccountItemClick = (item) => {
    setIsAccountOpen(false);
    switch (item) {
      // case 'Tài khoản':
      //   navigate('/profile');
      //   break;
      case 'Lịch sử':
        navigate('/history');
        break;
      case 'Đăng xuất':
        logout();
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

  return (
    <header className="header"> {/* Thay motion.header thành header thường để bỏ animation load */}
      <div className="header-top">
        <div className="logo">MyApp</div>
        <div className="header-right">
          <Menu
            isOpen={isMenuOpen}
            setIsOpen={setIsMenuOpen}
            onToggleOther={closeAccount}
            menuItems={menuItems}
          />
          {isStaff ? (
            <button
              className="logout-btn"
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              <IonIcon icon={logOutOutline} />
            </button>
          ) : (
            <AccountMenu
              isOpen={isAccountOpen}
              setIsOpen={setIsAccountOpen}
              isLoggedIn={isLoggedIn}
              onToggleOther={closeMenu}
            />
          )}
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
      {!isStaff && (
        <AnimatePresence>
          {isAccountOpen && (
            <motion.ul
              className="menu account-menu"
              initial={{ height: 0, opacity: 0, y: -10 }}
              animate={{ height: 'auto', opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {(isLoggedIn ? [ 'Lịch sử', 'Đăng xuất'] : ['Đăng Nhập/Đăng Ký']).map(
                (item, index) => (
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
                )
              )}
            </motion.ul>
          )}
        </AnimatePresence>
      )}
    </header>
  );
}

export default Header;