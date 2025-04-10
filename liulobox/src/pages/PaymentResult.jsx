import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./PaymentResult.css"; // Đảm bảo bạn có file CSS cho style
const PaymentResult = () => {
    const [result, setResult] = useState({
        message: "Đang kiểm tra kết quả thanh toán...",
        amount: null,
        extraData: null,
    });
    const location = useLocation();
    useEffect(() => {
        // Lấy các tham số từ query string trong URL
        const query = new URLSearchParams(location.search);
        const errorCode = query.get("errorCode"); // Mã kết quả từ MoMo
        const message = query.get("message");     // Thông điệp từ MoMo
        const amount = query.get("amount");       // Số tiền
        const orderId = query.get("orderId");     // Mã đơn hàng
        const orderInfo = query.get("orderInfo"); // Thông tin đơn hàng
        if (errorCode === "0") {
            // Trường hợp thanh toán thành công
            setResult({
                message: "Thanh toán thành công! Cảm ơn bạn đã đặt phòng.",
                amount: amount,
                extraData: extraData,
            });

            // Gọi API để cập nhật trạng thái đơn hàng
            updateOrderStatus(true, orderInfo);
        } else {
            // Trường hợp thanh toán thất bại
            setResult({
                message: `Thanh toán thất bại: ${message || "Vui lòng thử lại."}`,
                amount: amount,
            });

            // Cập nhật đơn hàng với trạng thái thất bại
            if (orderId) {
                updateOrderStatus(false, orderInfo);
            }
        }
    }, [location]);

    // Hàm gọi API để cập nhật trạng thái đơn hàng
    const updateOrderStatus = async (isConfirmed, orderInfo) => {
        alert("id booking: "+orderInfo)
        try {
            const response = await fetch(`http://localhost:5220/api/bookings/${orderInfo}/confirm`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}`, // Thêm token nếu API yêu cầu
                },
                body: JSON.stringify({ isConfirmed: isConfirmed }),
            });
            if (response.ok) {
                alert('Booking confirmed!');
                setSelectedBooking(null);
                fetchBookings(date); // Cập nhật lại danh sách
            } else {
                throw new Error('Lỗi khi xác nhận booking');
            }
        } catch (error) {
            console.error('Error confirming booking:', error);
            alert('Lỗi: ' + error.message);
        }

        const data = await response.json();
        console.log('Order update response:', data);

        // Có thể xử lý thêm dựa trên kết quả từ API
        if (!data.success) {
            console.error('Failed to update order:', data.message);
        }

    };

    return (
        <div className="payment-result" style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>Kết quả thanh toán</h2>
            <p className="paymess">{result.message}</p>
            {result.amount && (
                <p className="paymoney">
                    <strong>Số tiền:</strong> {result.amount} VNĐ
                </p>
            )}
            {/* {result.extraData && (
                <p>
                    <strong>Thông tin bổ sung:</strong> {result.extraData}
                </p>
            )} */}
            <p className="note"> Đăng nhập/Đăng kí với email đã đặt để xem lại đơn hàng</p>
            <a href="/" style={{ color: "#007BFF", textDecoration: "none" }}>
                Quay lại trang chủ
            </a>
        </div>
    );
};

export default PaymentResult;