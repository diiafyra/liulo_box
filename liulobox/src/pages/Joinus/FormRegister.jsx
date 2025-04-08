import React, { useState } from 'react';
import { motion } from 'framer-motion';

const RegisterForm = ({ onSubmit }) => {
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');

  const inputVariants = {
    focus: { scale: 1.02, borderColor: 'var(--color-accent)', transition: { duration: 0.3 } },
  };

  return (
    <motion.div initial="hidden" animate="visible" className="form-content">
      <form onSubmit={(e) => onSubmit(e, regUsername, regPassword, regEmail, regPhone)}>
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
          // pattern="[a-zA-Z0-9._%+-]+@gmail\.com"
          // title="Please enter a valid Gmail address"
        />
        <motion.input
          variants={inputVariants}
          whileFocus="focus"
          type="text"
          value={regPhone}
          onChange={(e) => setRegPhone(e.target.value)}
          placeholder="Phone (optional)"
          className="form-input"
          // pattern="\+?\d{10,15}"
          // title="Phone number must be 10-15 digits (optional)"
        />
        <motion.button
          variants={{
            hover: { scale: 1.05, transition: { duration: 0.3 } },
            tap: { scale: 0.95 },
          }}
          whileHover="hover"
          whileTap="tap"
          type="submit"
          className="action-button"
        >
          Ignite
        </motion.button>
      </form>
    </motion.div>
  );
};

export default RegisterForm;
