import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { IonIcon } from '@ionic/react';
import { logoGoogle } from 'ionicons/icons'; // Icon Google từ Ionic
import './JoinUs.css'; // File CSS riêng để tùy chỉnh

const JoinUs = () => {
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('login');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault(); // Ngăn form submit mặc định để xử lý async
    await loginWithEmail(loginUsername, loginPassword);
  };

  const handleRegister = async (e) => {
    e.preventDefault(); // Ngăn form submit mặc định để xử lý async
    await registerWithEmail(regUsername, regPassword, regEmail, regPhone);
  };

  const tabVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.3 } },
    tap: { scale: 0.95 },
  };

  const inputVariants = {
    focus: { scale: 1.02, borderColor: 'var(--color-accent)', transition: { duration: 0.3 } },
  };

  return (
    <div className="join-us-container">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="join-us-card"
      >
        <h1 className="join-us-title">Join LiuLo</h1>

        {/* Tab Buttons */}
        <div className="tab-buttons">
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => setActiveTab('login')}
            className={`tab-button ${activeTab === 'login' ? 'active' : ''}`}
          >
            Login
          </motion.button>
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => setActiveTab('register')}
            className={`tab-button ${activeTab === 'register' ? 'active' : ''}`}
          >
            Register
          </motion.button>
        </div>

        {/* Login Tab */}
        {activeTab === 'login' && (
          <motion.div variants={tabVariants} initial="hidden" animate="visible" className="form-content">
            <form onSubmit={handleLogin}>
              <motion.input
                variants={inputVariants}
                whileFocus="focus"
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Gmail"
                className="form-input"
                required
              />
              <motion.input
                variants={inputVariants}
                whileFocus="focus"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Password"
                className="form-input"
                required
              />
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                type="submit"
                className="action-button"
              >
                Launch
              </motion.button>
            </form>
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={loginWithGoogle}
              className="google-button"
            >
              <IonIcon icon={logoGoogle} className="google-icon" /> Login with Google
            </motion.button>
            <p className="form-link">
              <a href="#">Quên mật khẩu</a>
            </p>
          </motion.div>
        )}

        {/* Register Tab */}
        {activeTab === 'register' && (
          <motion.div variants={tabVariants} initial="hidden" animate="visible" className="form-content">
            <form onSubmit={handleRegister}>
              <motion.input
                variants={inputVariants}
                whileFocus="focus"
                type="text"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                placeholder="Username"
                className="form-input"
                required
              />
              <motion.input
                variants={inputVariants}
                whileFocus="focus"
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Password"
                className="form-input"
                required
                pattern="(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}"
                title="Password must be at least 8 characters with letters, numbers, and symbols"
              />
              <motion.input
                variants={inputVariants}
                whileFocus="focus"
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="Email"
                className="form-input"
                required
                pattern="[a-zA-Z0-9._%+-]+@gmail\.com"
                title="Please enter a valid Gmail address"
              />
              <motion.input
                variants={inputVariants}
                whileFocus="focus"
                type="text"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                placeholder="Phone (optional)"
                className="form-input"
                pattern="\+?\d{10,15}"
                title="Phone number must be 10-15 digits (optional)"
              />
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                type="submit"
                className="action-button"
              >
                Ignite
              </motion.button>
            </form>
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={loginWithGoogle}
              className="google-button"
            >
              <IonIcon icon={logoGoogle} className="google-icon" /> Register with Google
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default JoinUs;