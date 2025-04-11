import React, { useState, useContext } from 'react';
import { AuthContext } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom'; // Sửa lỗi import
import axios from 'axios';
import RegisterForm from '../../Joinus/FormRegister';
import './CreateEmployeeAccount.css';

const CreateEmployeeAccount = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Thêm state cho loading

    const handleRegisterSubmit = async (e, regUsername, regPassword, regEmail, regPhone) => {
        e.preventDefault();
        console.log("Username:", regUsername);
        setError('');
        setSuccess('');
        setIsLoading(true); // Bật loading khi bắt đầu gửi request

        const formData = {
            username: regUsername,
            password: regPassword,
            email: regEmail,
            phoneNumber: regPhone,
            isGoogleAuth: false
        };

        try {
            console.log("Form data:", formData);
            const idToken = user?.accessToken; // Lấy accessToken từ user context
            const response = await axios.post(
                'https://fbb1-171-224-84-105.ngrok-free.app/api/auth/create-user',
                formData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': 'true',
                        Authorization: `Bearer ${idToken}`,
                    },
                }
            );

            setSuccess(response.data.message);
            setIsLoading(false); // Tắt loading khi thành công
        } catch (err) {
            setError(err.response?.data?.Message || 'Failed to create employee account');
            setIsLoading(false); // Tắt loading khi lỗi
        }
    };

    return (
        <div className="create-employee-container">
            <h1>Tạo tài khoản nhân viên</h1>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
            {isLoading && <p className="loading">Đang tạo tài khoản, vui lòng đợi...</p>} {/* Hiển thị loading */}

            <div className="form-container">
                <RegisterForm onSubmit={handleRegisterSubmit} isLoading={isLoading} /> {/* Truyền isLoading vào RegisterForm */}
            </div>
        </div>
    );
};

export default CreateEmployeeAccount;