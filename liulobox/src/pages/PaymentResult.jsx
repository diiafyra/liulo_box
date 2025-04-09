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
        const message = query.get("message");       // Thông điệp từ MoMo
        const amount = query.get("amount");       // Mã đơn hàng
        const extraData = query.get("extraData");   // Dữ liệu bổ sung (nếu có)

        if (errorCode === "0") {
            // Trường hợp thanh toán thành công
            setResult({
                message: "Thanh toán thành công! Cảm ơn bạn đã đặt phòng.",
                amount: amount,
                extraData: extraData,
            });
            // Gọi API thêm đơn hàng (nếu cần)
            // Ví dụ: callApiToSaveOrder(amount);
        } else {
            // Trường hợp thanh toán thất bại
            setResult({
                message: `Thanh toán thất bại: ${message || "Vui lòng thử lại."}`,
                amount: amount,
                // extraData: extraData,
            });
        }
    }, [location]);

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