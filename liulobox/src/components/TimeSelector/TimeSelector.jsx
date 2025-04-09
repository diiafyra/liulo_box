import React, { useState, useEffect } from 'react';
import './TimeSelector.css'; // Đảm bảo bạn có file CSS cho theme

const TimeSelector = ({ selectedRoom, selectedDate, onComplete }) => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [priceRanges, setPriceRanges] = useState([]);
  const [rangeColorMap, setRangeColorMap] = useState({});
  const [bookedSlots, setBookedSlots] = useState([]); // Thêm state để lưu các slot đã được đặt

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endMinute = minute + 30;
        const endHour = endMinute === 60 ? hour + 1 : hour;
        const endTime = `${endHour.toString().padStart(2, '0')}:${(endMinute % 60).toString().padStart(2, '0')}`;
        slots.push({ slot: `${startTime}-${endTime}`, pricePerHour: 0, isBooked: false });
      }
    }
    return slots;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy dữ liệu giá
        const pricingResponse = await fetch(
          `http://localhost:5220/api/room/pricing/${selectedRoom.roomCategoryId}/${selectedDate}`
        );
        const pricingData = await pricingResponse.json();
        setPriceRanges(pricingData);

        // Lấy dữ liệu về các slot đã đặt
        const bookedResponse = await fetch(
          `http://localhost:5220/api/room/booked/${selectedRoom.id}?date=${selectedDate}`
        );
        const bookedData = await bookedResponse.json();
        setBookedSlots(bookedData);

        const themeColors = [
          'var(--color-container)', // xanh dịu
          'var(--color-border-light)', // xanh đậm
          'var(--color-button-active)', // cam đậm cho khung giá khác biệt
          '#4CAF50' // xanh lá
        ];

        const newRangeColorMap = {};
        pricingData.forEach((range, index) => {
          const rangeKey = `${range.timeSlotDefinition.startTime}-${range.timeSlotDefinition.endTime}`;
          newRangeColorMap[rangeKey] = themeColors[index % themeColors.length];
        });
        setRangeColorMap(newRangeColorMap);

        const slots = generateTimeSlots();
        slots.forEach((slot) => {
          const slotStart = slot.slot.split('-')[0];
          const slotTime = parseTime(slotStart);
          pricingData.forEach((range) => {
            const rangeStart = parseTime(range.timeSlotDefinition.startTime);
            const rangeEnd = parseTime(range.timeSlotDefinition.endTime);
            if (slotTime >= rangeStart && slotTime < rangeEnd) {
              slot.pricePerHour = range.price;
            }
          });

          // Kiểm tra xem slot này đã được đặt chưa
          const isBooked = bookedData.some(
            (booking) =>
              booking.BookingStatus === 'Confirmed' &&
              parseTime(booking.startDate.split('T')[1]) <= slotTime &&
              parseTime(booking.endDate.split('T')[1]) > slotTime
          );
          
          slot.isBooked = isBooked;
        });
        setTimeSlots(slots);
      } catch (error) {
        console.error('Lỗi lấy dữ liệu:', error);
      }
    };

    if (selectedRoom && selectedDate) {
      fetchData();
    }
  }, [selectedRoom, selectedDate]);

  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const getSlotColor = (slot) => {
    if (slot.isBooked) {
      return 'var(--color-booked-slot)'; // Tô màu cho các slot đã đặt
    }
    if (selectedSlots.includes(slot.slot)) {
      return 'var(--color-slot-selected)'; // Màu khi được chọn
    }
    const slotStart = slot.slot.split('-')[0];
    const slotTime = parseTime(slotStart);
    const range = priceRanges.find((r) => {
      const start = parseTime(r.timeSlotDefinition.startTime);
      const end = parseTime(r.timeSlotDefinition.endTime);
      return slotTime >= start && slotTime < end;
    });
    if (range) {
      const rangeKey = `${range.timeSlotDefinition.startTime}-${range.timeSlotDefinition.endTime}`;
      return rangeColorMap[rangeKey] || '#ccc';
    }
    return '#ccc';
  };

  const handleSlotSelect = (slot) => {
    if (slot.isBooked) return; // Không cho phép chọn slot đã được đặt

    if (selectedSlots.includes(slot.slot)) {
      setSelectedSlots(selectedSlots.filter((s) => s !== slot.slot));
    } else {
      setSelectedSlots([...selectedSlots, slot.slot]);
    }
  };

  const handleSubmit = () => {
    const totalCost = selectedSlots.reduce((sum, slot) => {
      const slotData = timeSlots.find((s) => s.slot === slot);
      return sum + (slotData ? slotData.pricePerHour * 0.5 : 0);
    }, 0);
    onComplete({ selectedSlots, totalCost });
  };

  return (
    <div className="step-content">
      <div className="price-legend-horizontal">
        {priceRanges.map((range) => {
          const rangeKey = `${range.timeSlotDefinition.startTime}-${range.timeSlotDefinition.endTime}`;
          return (
            <div key={range.id} className="legend-item-horizontal">
              <span
                className="color-box"
                style={{
                  backgroundColor: rangeColorMap[rangeKey],
                  width: '20px',
                  height: '20px',
                  display: 'inline-block',
                  marginRight: '5px',
                }}
              ></span>
              <span>{range.price.toLocaleString()} VNĐ/h</span>

            </div>

          );
        })}
      </div>
      <div className="time-slots">
        {timeSlots.map((slot) => (
          <div
            key={slot.slot}
            className={`time-slot ${selectedSlots.includes(slot.slot) ? 'selected' : ''}`}
            style={{ backgroundColor: getSlotColor(slot) }}
            onClick={() => handleSlotSelect(slot)}
          >
            {slot.slot}
          </div>
        ))}
      </div>

      <div className="bill">
        <h3>Hóa đơn</h3>
        <p>Ngày: {selectedDate}</p>
        <p>Phòng: {selectedRoom.id}</p>
        <p>Thời gian: {selectedSlots.join(', ')}</p>
        <p>
          Tổng tiền:{' '}
          {selectedSlots
            .reduce((sum, slot) => {
              const slotData = timeSlots.find((s) => s.slot === slot);
              return sum + (slotData ? slotData.pricePerHour * 0.5 : 0);
            }, 0)
            .toLocaleString()}{' '}
          VNĐ
        </p>
      </div>
      <button
        onClick={handleSubmit}
        className="action-button"
        disabled={selectedSlots.length === 0}
      >
        Tiếp tục
      </button>
    </div>
  );
};

export default TimeSelector;
