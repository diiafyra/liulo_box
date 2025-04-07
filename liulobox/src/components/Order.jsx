import React, { useState } from 'react';
import UserInfoForm from '../../components/UserInfoForm/UserInfoForm';
import DatePicker from '../../components/DatePicker/DatePicker';
import RoomLayout from '../../components/RoomLayout/RoomLayout';
import TimeSelector from '../../components/TimeSelector/TimeSelector';
import ServiceTabs from '../../components/ServiceTabs/ServiceTabs'; // Đừng quên import ServiceTabs
import './Booking.css';
import { IonIcon } from '@ionic/react';
import { arrowBack } from 'ionicons/icons';

const Order = () => {
  const [step, setStep] = useState(1);
  const [subStep, setSubStep] = useState(1);
  const [bookingData, setBookingData] = useState({});
  
  // Thêm state cho các dịch vụ kèm
  const [serviceItems, setServiceItems] = useState([
    { id: 1, name: 'Dịch vụ 1', price: 50000, quantity: 0 }, // Dịch vụ với giá và số lượng mặc định
    { id: 2, name: 'Dịch vụ 2', price: 30000, quantity: 0 },
  ]);

  // Hàm xử lý thay đổi số lượng dịch vụ
  const handleServiceQuantityChange = (serviceId, quantity) => {
    setServiceItems(prevItems =>
      prevItems.map(item =>
        item.id === serviceId ? { ...item, quantity } : item
      )
    );
  };

  // Các phần còn lại của logic...

  return (
    <div className="booking-container">
      {/* Bước 1 đến Bước 3 */}
      
      {step === 3 && (
        <div className="step-content">
          {/* ServiceTabs để chọn dịch vụ kèm */}
          <ServiceTabs
            serviceItems={serviceItems}
            onQuantityChange={handleServiceQuantityChange} // Khi thay đổi số lượng
          />
          <button onClick={() => setStep(4)} className="action-button">
            Tiếp tục đến bước thanh toán
          </button>
        </div>
      )}

      {/* Bước 4: Xác nhận và thanh toán */}
      {step === 4 && (
        <div className="step-content">
          <h2>Xác nhận và thanh toán</h2>
          <div className="bill">
            <h3>Hóa đơn cuối cùng</h3>

            <p>Ngày: {bookingData.selectedDate}</p>
            <p>Phòng: {bookingData.selectedRoom?.id}</p>
            <p>Thời gian: {bookingData.selectedSlots?.join(', ')}</p>

            {/* Hiển thị dịch vụ kèm */}
            <div className="service-details">
              {serviceItems.map((item) => (
                item.quantity > 0 && (
                  <p key={item.id}>
                    {item.name}: {item.quantity} x {item.price.toLocaleString()} VNĐ = {(item.quantity * item.price).toLocaleString()} VNĐ
                  </p>
                )
              ))}
            </div>

            <p>
              Tổng tiền (Phòng + Dịch vụ):{' '}
              {(
                bookingData.totalCost +
                serviceItems.reduce((acc, item) => acc + item.quantity * item.price, 0)
              ).toLocaleString()} VNĐ
            </p>
          </div>
          <button onClick={handlePayment} className="action-button">
            Thanh toán qua MoMo
          </button>
        </div>
      )}
    </div>
  );
};

export default Order;
