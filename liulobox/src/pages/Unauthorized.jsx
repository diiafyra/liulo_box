import React from 'react';

const Unauthorized = () => {
    return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <h1>Không có quyền truy cập</h1>
            <p>Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên.</p>
        </div>
    );
};

export default Unauthorized;