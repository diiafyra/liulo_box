import React from 'react';

const Unauthorized = () => {
    return (
        <div style={{ textAlign: 'center', padding: '50px', color: 'white' }}>
            <h1>KHÔNG CÓ QUYỀN</h1>
            <p style={{margin: '40px'}}>Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên.</p>
        </div>
    );
};

export default Unauthorized;
