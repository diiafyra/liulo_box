import React from 'react';
import './InvoiceModal.css';

const InvoiceModal = ({ bookingDetails, onClose, onConfirm, confirmLabel = "Xác nhận" }) => {
  const calculateTotal = () => {
    const roomTotal = bookingDetails.bookingTimes.reduce((sum, bt) => sum + bt.totalPrice, 0);
    const foodDrinkTotal = bookingDetails.bookingFoodDrinks.reduce((sum, bfd) => sum + (bfd.price * bfd.units), 0);
    return roomTotal + foodDrinkTotal;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="invoice-modal-overlay">
      <div className="invoice-modal">
        <h2>Hóa đơn phòng {bookingDetails.room.roomNumber}</h2>
        <div className="invoice-details">
          <p><strong>Khách hàng:</strong> {bookingDetails.user.username}</p>
          <p><strong>Mô tả:</strong> {bookingDetails.describe}</p>
          <p><strong>Trạng thái:</strong> {bookingDetails.bookingStatus}</p>
          <p><strong>Phương thức thanh toán:</strong> {bookingDetails.paymentMethod}</p>

          <h3>Chi tiết thời gian sử dụng</h3>
          <table>
            <thead>
              <tr>
                <th>Thời gian bắt đầu</th>
                <th>Thời gian kết thúc</th>
                <th>Giá</th>
                <th>Tổng tiền</th>
              </tr>
            </thead>
            <tbody>
              {bookingDetails.bookingTimes.map((bt) => (
                <tr key={bt.id}>
                  <td>{new Date(bt.startDate).toLocaleString()}</td>
                  <td>{new Date(bt.endDate).toLocaleString()}</td>
                  <td>{bt.price.toLocaleString()} VND</td>
                  <td>{bt.totalPrice.toLocaleString()} VND</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Dịch vụ đi kèm</h3>
          <table>
            <thead>
              <tr>
                <th>Tên món</th>
                <th>Số lượng</th>
                <th>Giá</th>
                <th>Tổng tiền</th>
              </tr>
            </thead>
            <tbody>
              {bookingDetails.bookingFoodDrinks.map((bfd) => (
                <tr key={bfd.id}>
                  <td>{bfd.foodDrink.name}</td>
                  <td>{bfd.units}</td>
                  <td>{bfd.price.toLocaleString()} VND</td>
                  <td>{(bfd.price * bfd.units).toLocaleString()} VND</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Tổng cộng: {calculateTotal().toLocaleString()} VND</h3>
        </div>

        <div className="invoice-buttons">
          <button onClick={onConfirm}>{confirmLabel}</button>
          <button onClick={handlePrint}>In</button>
          <button onClick={onClose}>Thoát</button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
