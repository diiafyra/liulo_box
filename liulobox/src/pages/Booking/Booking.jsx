import React, { useState } from "react";
import UserInfoForm from "../../components/UserInfoForm/UserInfoForm";
import DatePicker from "../../components/DatePicker/DatePicker";
import RoomLayout from "../../components/RoomLayout/RoomLayout";
import TimeSelector from "../../components/TimeSelector/TimeSelector";
import ServiceTabs from "../../components/ServiceTabs/ServiceTabs";
import "./Booking.css";
import { IonIcon } from "@ionic/react";
import { arrowBack } from "ionicons/icons";

// 🔧 Giả lập dữ liệu tab dịch vụ (nếu chưa được truyền từ props/context/API)
const tabData = [
  {
    tabName: "Đồ uống",
    items: [
      { id: "drink1", name: "Trà sữa", rawPrice: 25000 },
      { id: "drink2", name: "Cà phê", rawPrice: 30000 },
    ],
  },
  {
    tabName: "Đồ ăn",
    items: [
      { id: "food1", name: "Khoai tây chiên", rawPrice: 40000 },
      { id: "food2", name: "Gà rán", rawPrice: 50000 },
    ],
  },
];

const Booking = () => {
  const [step, setStep] = useState(1);
  const [subStep, setSubStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    serviceQuantities: {},
    serviceTotal: 0,
  });

  const handleUserInfoComplete = (userInfo) => {
    setBookingData({ ...bookingData, userInfo });
    setStep(2);
    setSubStep(1);
  };

  const handleDateComplete = (selectedDate) => {
    setBookingData({ ...bookingData, selectedDate });
    setSubStep(2);
  };

  const handleRoomComplete = (room) => {
    setBookingData({ ...bookingData, selectedRoom: room });
    setSubStep(3);
  };

  const handleTimeComplete = ({ selectedSlots, totalCost }) => {
    setBookingData({ ...bookingData, selectedSlots, totalCost });
    setStep(3);
  };

  const handleServiceQuantitiesChange = (quantities, serviceTotal) => {
    setBookingData((prev) => ({
      ...prev,
      serviceQuantities: quantities,
      serviceTotal,
    }));
  };

  const handlePayment = async () => {
    const totalAmount = (bookingData.totalCost || 0) + (bookingData.serviceTotal || 0);
    const paymentData = {
      amount: totalAmount,
      orderId: `order-${Date.now()}`,
      orderInfo: `Thanh toán đặt phòng ${bookingData.selectedRoom?.id} và dịch vụ`,
      redirectUrl: window.location.href,
    };
    console.log("Gọi API MoMo với dữ liệu:", paymentData);
    alert("Chuyển hướng sang MoMo để thanh toán! (Giả lập)");
  };

  const handleTimelineClick = (newStep) => {
    setStep(newStep);
    if (newStep === 2) {
      setSubStep(1);
    }
  };

  const calculateFinalTotal = () => {
    return (bookingData.totalCost || 0) + (bookingData.serviceTotal || 0);
  };

  return (
    <div className="booking-container">
      <div className="timeline">
        <div className="timeline-steps">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`timeline-step ${step >= s ? "active" : ""}`}
              onClick={() => handleTimelineClick(s)}
            >
              <div className="timeline-icon">{s}</div>
              <p>
                {s === 1 ? "Thông tin" :
                 s === 2 ? "Chọn phòng" :
                 s === 3 ? "Mua kèm" : "Thanh toán"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <UserInfoForm
          onComplete={handleUserInfoComplete}
          userInfo={bookingData.userInfo}
        />
      )}

      {step === 2 && (
        <div className="step-content">
          {subStep === 1 && (
            <DatePicker
              onComplete={handleDateComplete}
              selectedDate={bookingData.selectedDate}
            />
          )}
          {subStep === 2 && (
            <RoomLayout
              onComplete={handleRoomComplete}
              selectedRoom={bookingData.selectedRoom}
            />
          )}
          {subStep === 3 && (
            <TimeSelector
              selectedRoom={bookingData.selectedRoom}
              selectedDate={bookingData.selectedDate}
              onComplete={handleTimeComplete}
              selectedSlots={bookingData.selectedSlots}
            />
          )}
          {subStep > 1 && (
            <button
              className="back-button"
              onClick={() => setSubStep(subStep - 1)}
            >
              <IonIcon icon={arrowBack} />
            </button>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="step-content">
          <ServiceTabs
            showQuantityControls={true}
            quantities={bookingData.serviceQuantities}
            onQuantitiesChange={handleServiceQuantitiesChange}
          />
          <button onClick={() => setStep(4)} className="action-button">
            Tiếp tục đến bước thanh toán
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="step-content">
          <h2>Xác nhận và thanh toán</h2>
          <div className="bill">
            <h3>Hóa đơn cuối cùng</h3>
            <p>Ngày: {bookingData.selectedDate}</p>
            <p>Phòng: {bookingData.selectedRoom?.id}</p>
            <p>Thời gian: {bookingData.selectedSlots?.join(", ")}</p>
            <p>
              Tiền phòng: {(bookingData.totalCost / 1000)?.toLocaleString()}K
            </p>

            {bookingData.serviceQuantities &&
              Object.keys(bookingData.serviceQuantities).length > 0 && (
                <>
                  <h4>Dịch vụ:</h4>
                  {Object.entries(bookingData.serviceQuantities).map(
                    ([itemId, quantity]) => {
                      if (quantity > 0) {
                        const allItems = tabData
                          .flatMap((tab) => tab.items)
                          .filter((item) => item);
                        const item = allItems.find((i) => i.id === itemId);
                        return (
                          item && (
                            <p key={itemId}>
                              {item.name}: {quantity} x {(item.rawPrice / 1000)}K ={" "}
                              {(quantity * item.rawPrice) / 1000}K
                            </p>
                          )
                        );
                      }
                      return null;
                    }
                  )}
                  <p>
                    Tổng tiền dịch vụ:{" "}
                    {(bookingData.serviceTotal / 1000)?.toLocaleString()}K
                  </p>
                </>
              )}

            <p>
              <strong>
                Tổng cộng: {(calculateFinalTotal() / 1000)?.toLocaleString()}K
              </strong>
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

export default Booking;
