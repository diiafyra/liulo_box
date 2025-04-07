import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './DatePicker.css';

const DatePicker = ({ onComplete, selectedDate }) => {
  const [date, setDate] = useState('');
  
  // Get tomorrow's date in YYYY-MM-DD format
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };
  
  const minDate = getTomorrowDate();

  useEffect(() => {
    if (selectedDate) {
      setDate(selectedDate); // Update date when selectedDate changes
    }
  }, [selectedDate]);

  const inputVariants = {
    focus: { scale: 1.02, borderColor: 'var(--color-accent)', transition: { duration: 0.3 } },
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete(date); // Send data to parent component
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="step-content"
    >
      <h2>Chọn ngày</h2>
      <form onSubmit={handleSubmit}>
        <motion.input
          variants={inputVariants}
          whileFocus="focus"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="form-input"
          min={minDate} // Restrict dates to tomorrow and beyond
          required
        />
        <button type="submit" className="action-button">
          Tiếp tục
        </button>
      </form>
    </motion.div>
  );
};

export default DatePicker;