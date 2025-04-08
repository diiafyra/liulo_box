import React, { useState, useContext } from 'react';
import { AuthContext } from '../../../contexts/AuthContext';
import { data, useNavigate } from 'react-router-dom';
import axios from 'axios';
import RegisterForm from '../../Joinus/FormRegister'; // Import the reusable RegisterForm component
import './CreateEmployeeAccount.css'; // Import your CSS file for styling

const CreateEmployeeAccount = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleRegisterSubmit = async (e, regUsername, regPassword, regEmail, regPhone) => {
        e.preventDefault();
        // console.log("Form is being submitted");
        console.log("Username:", regUsername);
        setError('');
        setSuccess('');

        const formData = {
            username: regUsername,
            password: regPassword,
            email: regEmail,
            phoneNumber: regPhone,
            isGoogleAuth: false
        };

        try {
            const idToken = user.accessToken;
            console.log(formData);
            const response = await axios.post('http://localhost:5220/api/auth/create-user', formData, {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
            });

            setSuccess(response.data.message);
        } catch (err) {
            setError(err.response?.data?.Message || 'Failed to create employee account');
        }
    };

    return (
        <div className="create-employee-container">
            <h1>Tạo tài khoản nhân viên</h1>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
            
            {/* Pass the handleSubmit to RegisterForm */}
            <div className='form-container'>
            <RegisterForm onSubmit={handleRegisterSubmit} />
            </div>

        </div>
    );
};

export default CreateEmployeeAccount;
