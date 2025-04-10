import React, { useState, useContext } from 'react';
import './OfflineBooking.css';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../../../contexts/AuthContext';
import ServiceTabs from './../../../components/ServiceTabs/ServiceTabs';

const OfflineBooking = () => {
    const { id: roomId } = useParams();
    const { priceId: priceId } = useParams();
    const { user } = useContext(AuthContext);

    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [popupVisible, setPopupVisible] = useState(false);
    const [existingUser, setExistingUser] = useState(null);
    const [userId, setUserId] = useState(null);
    const [quantities, setQuantities] = useState({});
    const [serviceTotal, setServiceTotal] = useState(0);

    const handleVerifySubmit = async (e) => {
        e.preventDefault();

        if (!user || !user.accessToken) {
            console.error('Vui lòng đăng nhập để xác minh khách hàng');
            return;
        }

        try {
            const response = await fetch('http://localhost:5220/api/auth/verify-customer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.accessToken}`,
                },
                body: JSON.stringify({ name, phoneNumber }),
            });

            if (!response.ok) {
                throw new Error('Lỗi khi xác minh khách hàng');
            }

            const data = await response.json();

            if (data.isExistingUser) {
                setExistingUser(data);
                setPopupVisible(true);
            } else {
                setUserId(data.userId);
                setPopupVisible(true);
            }
        } catch (error) {
            console.error('Lỗi khi xác minh:', error);
        }
    };

    const handleConfirmExisting = () => {
        setUserId(existingUser.userId);
        setPopupVisible(false);
    };

    const handleRejectExisting = () => {
        setPhoneNumber('');
        setPopupVisible(false);
    };

    const handleQuantitiesChange = (newQuantities, total) => {
        setQuantities(newQuantities);
        setServiceTotal(total);
    };

    const handleBooking = async (e) => {
        e.preventDefault();

        if (!user || !user.accessToken) {
            console.error('Vui lòng đăng nhập để đặt phòng');
            return;
        }

        if (!userId) {
            console.error('Vui lòng xác minh khách hàng trước khi đặt phòng');
            return;
        }

        if (!roomId) {
            console.error('RoomId không hợp lệ');
            return;
        }
        if(priceId==null) {
            console.error('PriceId không hợp lệ');
        }
        // alert(priceId);

        const bookingData = {
            userId: userId,
            roomId: parseInt(roomId),
            describe: 'Booking offline với dịch vụ',
            paymentMethod: 'Cash',
            priceId: parseInt(priceId),
            bookingFoodDrinks: Object.keys(quantities)
                .filter((key) => quantities[key] > 0)
                .map((foodDrinkId) => ({
                    foodDrinkId: parseInt(foodDrinkId),
                    units: quantities[foodDrinkId],
                    price: quantities[foodDrinkId].rawPrice,
                })),
        };

        try {
            const response = await fetch('http://localhost:5220/api/bookings/offline', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.accessToken}`,
                },
                body: JSON.stringify(bookingData),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Booking thành công:', result);
                alert('Đặt phòng thành công!');
            } else {
                console.error('Lỗi khi tạo booking:', response.statusText);
            }
        } catch (error) {
            console.error('Lỗi khi gửi yêu cầu:', error);
        }
    };

    return (
        <div className="offline-booking-container">
            <h2>Đặt phòng offline (Phòng {roomId})</h2>
            <form onSubmit={handleVerifySubmit}>
                <div>
                    <label>Tên khách hàng</label>
                    <input
                        type="text"
                        value={name}
                        required
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div>
                    <label>Số điện thoại</label>
                    <input
                        type="text"
                        value={phoneNumber}
                        required
                        onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                </div>

                <button className="btn_ookingoffline" type="submit">Xác minh khách hàng</button>
            </form>

            {userId && (
                <>
                    <ServiceTabs
                        showQuantityControls={true}
                        quantities={quantities}
                        onQuantitiesChange={handleQuantitiesChange}
                    />
                    <button className="btn_ookingoffline" onClick={handleBooking}>Đặt phòng</button>
                </>
            )}

            {popupVisible && existingUser && (
                <div className="popup">
                    <div className="popup-content">
                        <h3>Khách hàng đã tồn tại</h3>
                        <p><strong>Tên:</strong> {existingUser.username}</p>
                        <p><strong>Email:</strong> {existingUser.email}</p>
                        <div className="popup-buttons">
                            <button className="btn_ookingoffline" onClick={handleConfirmExisting}>
                                Xác thực
                            </button>
                            <button className="btn_ookingoffline" onClick={handleRejectExisting}>
                                Nhập lại
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {popupVisible && !existingUser && userId && (
                <div className="popup">
                    <div className="popup-content">
                        <h3>Đã tạo khách offline</h3>
                        <p><strong>Tên:</strong> {name}</p>
                        <button className="btn_ookingoffline" onClick={() => setPopupVisible(false)}>
                            Đóng
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OfflineBooking;
