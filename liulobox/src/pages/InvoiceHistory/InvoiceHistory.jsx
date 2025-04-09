import React, { useEffect, useState } from 'react';
import InvoiceModal from './../../components/staff/Invoice/InvoiceModal';
import './InvoiceHistory.css';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';

const InvoiceHistory = () => {
    const { user } = React.useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const token = user?.accessToken; // Lấy token từ context hoặc localStorage
    useEffect(() => {
        const fetchData = async () => {
            try {
                if ( !token) {
                    setErrorMessage("Vui lòng đăng nhập để xem lịch sử hóa đơn.");
                    return;
                }
                const response = await axios.get(`http://localhost:5220/api/bookings/history`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });                
                const data = response.data;

                if (!data || !Array.isArray(data) || data.length === 0) {
                    setErrorMessage("Bạn chưa có hóa đơn nào");
                    setBookings([]);
                } else {
                    setBookings(data);
                }
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu booking:', error);
                setErrorMessage("Đã xảy ra lỗi khi tải dữ liệu hóa đơn.");
            }
        };

        fetchData();
    }, []);

    const completedBookings = bookings.filter(b => b?.isComplete);
    const pendingBookings = bookings.filter(b => b && !b.isComplete);

    const renderBookingCard = (booking) => (
        <div key={booking.id} className="invoice-card" onClick={() => setSelectedBooking(booking)}>
            <h4>Phòng {booking.room?.roomNumber || "Không rõ"}</h4>
            <p><strong>Khách:</strong> {booking.user?.username || "Không rõ"}</p>
            <p><strong>Mô tả:</strong> {booking.describe}</p>
            <p><strong>Trạng thái:</strong> {booking.bookingStatus}</p>
            <p><strong>Thanh toán:</strong> {booking.paymentMethod}</p>
        </div>
    );

    return (
        <div className="invoice-history">
            <h2>Lịch sử hóa đơn</h2>

            {errorMessage && (
                <div className="error-message" style={{ color: "red", fontWeight: "bold", marginBottom: "1rem" }}>
                    {errorMessage}
                </div>
            )}

            {!errorMessage && (
                <>
                    <div className="invoice-section">
                        <h3>Đang xử lý</h3>
                        <div className="invoice-list">
                            {pendingBookings.length ? pendingBookings.map(renderBookingCard) : <p>Không có hóa đơn đang xử lý</p>}
                        </div>
                    </div>

                    <div className="invoice-section">
                        <h3>Đã hoàn tất</h3>
                        <div className="invoice-list">
                            {completedBookings.length ? completedBookings.map(renderBookingCard) : <p>Chưa có hóa đơn hoàn tất</p>}
                        </div>
                    </div>
                </>
            )}

            {selectedBooking && (
                <InvoiceModal
                    bookingDetails={selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                    onConfirm={() => setSelectedBooking(null)}
                    confirmLabel="Đóng"
                />
            )}
        </div>
    );
};

export default InvoiceHistory;
