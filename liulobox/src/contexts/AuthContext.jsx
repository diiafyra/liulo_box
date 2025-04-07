import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, signInWithPopup, signInWithEmailAndPassword, signOut, googleProvider } from '../firebase';
import axios from 'axios';
import { useLoading } from '../contexts/LoadingContext';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const { isLoading, setIsLoading } = useLoading();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();


    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            if (firebaseUser) {
                const idToken = await firebaseUser.getIdToken();
                try {
                    const response = await axios.post('http://localhost:5220/api/auth/login', { idToken });
                    setUser({ ...firebaseUser, ...response.data });
                } catch (error) {
                    setUser(firebaseUser);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        console.log("User hiện tại:", user);
    }, [user]);

    const loginWithGoogle = async () => {
        try {
            setIsLoading(true);
            console.log("Đang đăng nhập bằng Google...");
            const result = await signInWithPopup(auth, googleProvider);
            const idToken = await result.user.getIdToken();
            console.log("Đăng nhập thành công bằng Google!");
            
            const response = await axios.post('http://localhost:5220/api/auth/register', { idToken, isGoogleAuth: true });
            
            if (response.status === 200) {
                alert("Đăng nhập thành công bằng Google!");
                navigate('/');
            } else {
                alert("Đăng nhập thất bại: " + response.data.Message);
            }
        } catch (error) {
            console.error("Lỗi đăng nhập bằng Google:", error.message);
            alert("Lỗi đăng nhập bằng Google: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const loginWithEmail = async (email, password) => {
        try {
            setIsLoading(true);
            console.log("Đang đăng nhập:", email);
            if (!email || !password) {
                alert("⚠️ Vui lòng nhập đầy đủ email và mật khẩu");
                return;
            }
            const result = await signInWithEmailAndPassword(auth, email, password);
            if (!result.user) {
                alert("Không tìm thấy người dùng");
                return;
            }
            const idToken = await result.user.getIdToken();
            const response = await axios.post('http://localhost:5220/api/auth/login', { idToken });
            setUser({ ...result.user, ...response.data });
            alert("Đăng nhập thành công!");
            navigate('/');

        } catch (error) {
            switch (error.code) {
                case 'auth/invalid-credential':
                    alert("Sai email hoặc mật khẩu. Vui lòng kiểm tra lại.");
                    break;
                case 'auth/user-not-found':
                    alert("Không tìm thấy tài khoản này.");
                    break;
                case 'auth/wrong-password':
                    alert("Mật khẩu không chính xác.");
                    break;
                default:
                    alert("Có lỗi xảy ra. Vui lòng thử lại.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const registerWithEmail = async (username, password, email, phoneNumber) => {
        console.log("Đang gửi request đăng ký...");
        const requestData = { username, password, email, phoneNumber, isGoogleAuth: false };
        try {
            setIsLoading(true);
            const response = await axios.post('http://localhost:5220/api/auth/register', requestData);
            console.log("Đăng ký thành công!", response.data);
            alert("Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.");
            navigate('/');

        } catch (error) {
            alert("Lỗi đăng ký: " + (error.response ? error.response.data : error.message));
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        signOut(auth).then(() => {
            alert("Đã đăng xuất thành công!");
            setUser(null);
        }).catch((error) => {
            alert("Lỗi khi đăng xuất: " + error.message);
        });
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginWithEmail, registerWithEmail, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
