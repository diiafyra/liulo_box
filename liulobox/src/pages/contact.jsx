// src/pages/ContactPage.jsx
import React, { useEffect } from 'react';
import { useLoading } from '../contexts/LoadingContext';
import { fetchData } from '../services/apiServices'; // Giả sử bạn có service này
import withLoading from '../components/withLoading';
import './Contact.css'; // File CSS cho trang liên hệ

function Contact() {
  const { setIsLoading } = useLoading();

  useEffect(() => {
    setIsLoading(true);
    fetchData().then(() => setIsLoading(false)); // Giả lập fetch dữ liệu
  }, [setIsLoading]);

  return (
    <div className="contact-container">
      {/* Header */}
      <header className="contact-header">
        <h1>Liên hệ với chúng tôi</h1>
        <p>Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy để lại thông tin hoặc ghé thăm chúng tôi!</p>
      </header>

      {/* Main Content */}
      <section className="contact-content">
        {/* Contact Form */}
        <div className="contact-form">
          <h2>Gửi tin nhắn cho chúng tôi</h2>
          <form>
            <div className="form-group">
              <label htmlFor="name">Họ và tên</label>
              <input type="text" id="name" placeholder="Nhập tên của bạn" />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" placeholder="Nhập email của bạn" />
            </div>
            <div className="form-group">
              <label htmlFor="message">Tin nhắn</label>
              <textarea id="message" placeholder="Viết tin nhắn của bạn..." rows="5"></textarea>
            </div>
            <button type="submit" className="submit-button">
              Gửi tin nhắn
            </button>
          </form>
        </div>

        {/* Contact Info & Map */}
        <div className="contact-info">
          <h2>Thông tin liên hệ</h2>
          <ul>
            <li>
              <strong>Địa chỉ:</strong> Home Box Studio Hà Đông, Hà Nội
            </li>
            <li>
              <strong>Email:</strong> quynhtrang.a3.w@gmail.com
            </li>
            <li>
              <strong>Số điện thoại:</strong> +84 0852 885 411
            </li>
          </ul>

          {/* Google Maps */}
          <div className="map-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d29803.94176895018!2d105.76359993802114!3d20.972877335148272!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ad0008bcb81f%3A0xc6ad21c94720b137!2zSG9tZSBCb3ggU3R1ZGlvIEjDoCDEkMO0bmc!5e0!3m2!1svi!2s!4v1744185452148!5m2!1svi!2s"
              width="100%"
              height="250"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default withLoading(Contact);