import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './UserInfoForm.css';

const UserInfoForm = ({ onComplete, userInfo }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    if (userInfo) {
      setFormData(userInfo); // Khi nhận được dữ liệu, cập nhật lại form
    }
  }, [userInfo]);

  const inputVariants = {
    focus: { scale: 1.02, borderColor: 'var(--color-accent)', transition: { duration: 0.3 } },
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete(formData); // Gửi dữ liệu ra ngoài
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="step-content"
    >
      <form onSubmit={handleSubmit}>
        <motion.input
          variants={inputVariants}
          whileFocus="focus"
          type="text"
          placeholder="Tên"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="form-input"
          required
        />
        <motion.input
          variants={inputVariants}
          whileFocus="focus"
          type="email"
          placeholder="Email (Gmail)"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="form-input"
          required
          pattern="[a-zA-Z0-9._%+-]+@gmail\.com"
          title="Vui lòng nhập địa chỉ Gmail hợp lệ"
        />
        <motion.input
          variants={inputVariants}
          whileFocus="focus"
          type="text"
          placeholder="Số điện thoại"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="form-input"
          required
          pattern="\+?\d{10,15}"
          title="Số điện thoại phải có 10-15 chữ số"
        />
        <p className="note">
          Đảm bảo thông tin của bạn đúng vì chúng tôi sẽ gửi mã qua Gmail.
        </p>
        <button type="submit" className="action-button">
          Tiếp tục
        </button>
      </form>
    </motion.div>
  );
};

export default UserInfoForm;
