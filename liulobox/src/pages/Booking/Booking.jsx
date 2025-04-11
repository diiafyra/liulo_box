import React, { useState, useContext } from "react";
import UserInfoForm from "../../components/UserInfoForm/UserInfoForm";
import DatePicker from "../../components/DatePicker/DatePicker";
import RoomLayout from "../../components/RoomLayout/RoomLayout";
import TimeSelector from "../../components/TimeSelector/TimeSelector";
import ServiceTabs from "../../components/ServiceTabs/ServiceTabs";
import "./Booking.css";
import { IonIcon } from "@ionic/react";
import { arrowBack } from "ionicons/icons";
import { AuthContext } from "../../contexts/AuthContext";
import axios from "axios";

import { useLoading } from '../../contexts/LoadingContext'; // Điều chỉnh đường dẫn nếu cần

const Booking = () => {
  const { user } = useContext(AuthContext);
  const token = user?.accessToken || null;
  const { setIsLoading } = useLoading(); // Thêm useLoading
  const [step, setStep] = useState(1);
  const [subStep, setSubStep] = useState(1);
  const [bookingData, setBookingData] = useState({});
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
    setIsLoading(true); // Bật loading khi bắt đầu xử lý
    const bookingRequest = {
      Username: bookingData.userInfo?.name,
      phoneNumber: bookingData.userInfo?.phone,
      email: bookingData.userInfo?.email,
      selectedDate: bookingData.selectedDate,
      roomId: bookingData.selectedRoom?.id,
      timeSlots: bookingData.selectedSlots.map((slot) => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        priceId: slot.priceId,
      })),
      foodDrinks: bookingData.serviceQuantities
        ? Object.fromEntries(
            Object.entries(bookingData.serviceQuantities).map(([id, data]) => [
              id,
              {
                quantity: data.quantity,
                rawPrice: data.rawPrice,
              },
            ])
          )
        : {},
    };

    try {
      // Gửi request tạo booking
      const bookingResponse = await axios.post(
        "https://fbb1-171-224-84-105.ngrok-free.app/api/bookings/online",
        bookingRequest,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { bookingId } = bookingResponse.data;
      if (!bookingId) {
        throw new Error("Không nhận được bookingId từ server");
      }

      // Chuẩn bị dữ liệu thanh toán
      const totalAmount = (bookingData.totalCost || 0) + (bookingData.serviceTotal || 0);
      const paymentData = {
        orderId: `liulobox-${bookingId}-${Date.now()}`,
        amount: totalAmount.toString(),
        fullName: bookingData.userInfo?.fullName || "Khách hàng",
        orderInfo: bookingId.toString(),
      };

      // Gửi request tạo thanh toán MoMo
      const paymentResponse = await axios.post(
        "https://fbb1-171-224-84-105.ngrok-free.app/api/payment/create-payment",
        paymentData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { payUrl } = paymentResponse.data;
      if (payUrl) {
        window.location.href = payUrl; // Chuyển hướng sang MoMo
      } else {
        alert("Không thể lấy URL thanh toán từ MoMo");
      }
    } catch (error) {
      console.error("Lỗi khi xử lý thanh toán:", error.response?.data || error.message);
      alert("Có lỗi xảy ra khi tạo booking hoặc thanh toán. Vui lòng thử lại!");
    } finally {
      setIsLoading(false); // Tắt loading dù thành công hay thất bại
    }
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
                {s === 1
                  ? "Thông tin"
                  : s === 2
                  ? "Chọn phòng"
                  : s === 3
                  ? "Mua kèm"
                  : "Thanh toán"}
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
              selectedSlots={bookingData.selectedSlots}
              onComplete={handleTimeComplete}
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
            <p>Ngày: {bookingData.selectedDate || "Chưa chọn ngày"}</p>
            <p>Phòng: {bookingData.selectedRoom?.id || "Chưa chọn phòng"}</p>
            <p>
              Thời gian:{" "}
              {bookingData.selectedSlots?.map((s) => s.slot).join(", ") ||
                "Chưa chọn thời gian"}
            </p>
            <p>Tiền phòng: {(bookingData.totalCost / 1000)?.toLocaleString() || 0}K</p>

            {bookingData.serviceQuantities &&
              Object.keys(bookingData.serviceQuantities).length > 0 && (
                <>
                  <h4>Dịch vụ:</h4>
                  <p>
                    Tổng tiền dịch vụ:{" "}
                    {(bookingData.serviceTotal / 1000)?.toLocaleString() || 0}K
                  </p>
                </>
              )}

            <p>
              <strong>
                Tổng cộng: {(calculateFinalTotal() / 1000)?.toLocaleString() || 0}K
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