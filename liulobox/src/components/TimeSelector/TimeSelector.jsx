import React, { useState, useEffect } from 'react';
import { useLoading } from './../../contexts/LoadingContext'; // Import useLoading để dùng context
import './TimeSelector.css'; // Đảm bảo bạn có file CSS cho theme
import withLoading from './../../components/withLoading'; // Import HOC với loading
const TimeSelector = ({ selectedRoom, selectedDate, onComplete }) => {
  const { setIsLoading } = useLoading(); // Lấy setIsLoading từ context
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [priceRanges, setPriceRanges] = useState([]);
  const [rangeColorMap, setRangeColorMap] = useState({});
  const [bookedSlots, setBookedSlots] = useState([]); // Thêm state để lưu các slot đã được đặt

  /* trả về [
  {
    slot: "09:00-09:30",
    pricePerHour: 0,
    priceId: null,
    startTime: "09:00",
    endTime: "09:30",
    isBooked: false
  },
  {
    slot: "09:30-10:00",
    pricePerHour: 0,
    PriceId: null,
    startTime: "09:30",
    endTime: "10:00",
    isBooked: false
  },...] */
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endMinute = minute + 30;
        const endHour = endMinute === 60 ? hour + 1 : hour;
        const endTime = `${endHour.toString().padStart(2, '0')}:${(endMinute % 60).toString().padStart(2, '0')}`;
        slots.push({ slot: `${startTime}-${endTime}`, pricePerHour: 0, priceId: null, startTime: startTime, endTime: endTime, isBooked: false });
      }
    }
    return slots;
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // Bật loading trước khi fetch
      try {
        // Lấy dữ liệu giá
        const pricingResponse = await fetch(
          `https://fbb1-171-224-84-105.ngrok-free.app/api/room/pricing/${selectedRoom.roomCategoryId}/${selectedDate}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true'
            }
          }
        );
        const pricingData = await pricingResponse.json();
        setPriceRanges(pricingData);

        // Lấy dữ liệu về các slot đã đặt
        const bookedResponse = await fetch(
          `https://fbb1-171-224-84-105.ngrok-free.app/api/room/booked/${selectedRoom.id}?date=${selectedDate}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true'
            }
          }
        );
        const bookedData = await bookedResponse.json();
        setBookedSlots(bookedData);

        const themeColors = [
          'var(--color-container)', // xanh dịu
          'var(--color-border-light)', // xanh đậm
          'var(--color-button-active)', // cam đậm cho khung giá khác biệt
          '#4CAF50' // xanh lá
        ];

        // Tạo map màu cho các khoảng giá dạng dự liệu 
        // "09:00:00-12:00:00": themeColors[0],  // Màu đầu tiên trong mảng themeColors
        // "12:00:00-17:00:00": themeColors[1],  // Màu thứ hai
        // "17:00:00-23:59:59": themeColors[2]   // Màu thứ ba

        const newRangeColorMap = {};
        pricingData.forEach((range, index) => {
          const rangeKey = `${range.timeSlotDefinition.startTime}-${range.timeSlotDefinition.endTime}`;
          newRangeColorMap[rangeKey] = themeColors[index % themeColors.length];
        });
        setRangeColorMap(newRangeColorMap);

        // gán price và priceId cho các slot
        const slots = generateTimeSlots();
        slots.forEach((slot) => {
          const slotStart = slot.startTime;
          const slotTime = parseTime(slotStart);
          pricingData.forEach((range) => {
            const rangeStart = parseTime(range.timeSlotDefinition.startTime);
            const rangeEnd = parseTime(range.timeSlotDefinition.endTime);
            if (slotTime >= rangeStart && slotTime < rangeEnd) {
              slot.pricePerHour = range.price;
              slot.priceId = range.id;
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
      } finally {
        setIsLoading(false); // Tắt loading sau khi fetch xong
      }
    };

    if (selectedRoom && selectedDate) {
      fetchData();
    }
  }, [selectedRoom, selectedDate, setIsLoading]);

  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const getSlotColor = (slot) => {
    if (slot.isBooked) {
      return 'var(--color-booked-slot)'; // Tô màu cho các slot đã đặt
    }
    if (selectedSlots.includes(slot)) {
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
    // alert(`Bạn đã chọn slot ${slot.slot}`);
    if (slot.isBooked) {
      // alert('Slot này đã được đặt. Vui lòng chọn slot khác!');
      return; // Không cho phép chọn slot đã được đặt
    }

    if (selectedSlots.includes(slot)) {
      // alert(`Bạn đã bỏ chọn slot ${slot.slot}`);
      setSelectedSlots(selectedSlots.filter((s) => s !== slot));
    } else {
      setSelectedSlots([...selectedSlots, slot]);
      // alert("selected"+selectedSlots.length);
    }
  };

  const handleSubmit = () => {
    const totalCost = selectedSlots
      .reduce((sum, slot) => {
        return sum + (slot.pricePerHour * 0.5);
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
        <p>Thời gian: {selectedSlots.map(s => s.slot).join(", ")};
        </p>
        <p>
          Tổng tiền:{' '}
          {selectedSlots
            .reduce((sum, slot) => {
              return sum + (slot.pricePerHour * 0.5);
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

// Áp dụng HOC withLoading
export default withLoading(TimeSelector);