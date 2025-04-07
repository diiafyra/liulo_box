import { motion } from 'framer-motion';
import { IonIcon } from '@ionic/react'; // Import IonIcon
import { personOutline } from 'ionicons/icons';

function AccountMenu({ isOpen, setIsOpen, isLoggedIn, onToggleOther }) {
  const handleToggle = () => {
    if (onToggleOther) onToggleOther(); // Đóng menu khác nếu đang mở
    setIsOpen(!isOpen);
  };

  // Variants cho hiệu ứng gesture
  const gestureVariants = {
    initial: { scale: 1, backgroundColor: 'transparent', transition: { duration: 0.2 } },
    hover: { scale: 1.2, transition: { duration: 0.2 } },
    tap: { scale: 0.9, backgroundColor: 'transparent', transition: { duration: 0.1 } },
  };
  

  return (
    
<div className="account">
      <motion.button
        className="account-toggle"
        onClick={handleToggle}
        variants={gestureVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
      >
        <IonIcon icon={personOutline} />
      </motion.button>
    </div>
  );
}

export default AccountMenu;