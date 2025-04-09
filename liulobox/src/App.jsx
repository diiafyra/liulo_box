// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoadingProvider } from './contexts/LoadingContext';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home/Home';
import AboutUs from './pages/About/About';
import Contact from './pages/contact';
import FoodDrinkDetail from './pages/FoodDrinkDetail/FoodDrinkDetail';
import RoomDetail from './pages/RoomDetail/RoomDetail';
import Unauthorized from './pages/Unauthorized';
import CreateEmployeeAccount from './pages/staff/CreateEmployeeAccount/CreateEmployeeAccount';
import ProtectedRoute from './components/ProtectRoute';
import PaymentResult from './pages/PaymentResult';

import { AuthProvider } from './contexts/AuthContext';
import JoinUs from './pages/Joinus/JoinUs';
import Booking from './pages/Booking/Booking';

import './App.css';
import RoomLayout from './components/RoomLayout/RoomLayout';
import Dashboard from './pages/staff/Dashboard/Dashboard';
import OnlineBookingList from './pages/staff/OnlineBookingList/OnlineBookingList';
import RoomList from './pages/staff/RoomList/RoomList';
import StockIn from './pages/staff/StockIn/StockIn';
import OfflineBooking from './pages/staff/OfflineBooking/OfflineBooking';
import InvoiceHistory from './pages/InvoiceHistory/InvoiceHistory';

// const ProtectedRoute = ({ children }) => {
//   const { user } = useContext(AuthContext);
//   return user ? children : <Navigate to="/login" />;
// };
function App() {
  return (
    <Router> {/* Đặt Router ở cấp cao nhất */}

      <LoadingProvider>
        <AuthProvider>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/joinus" element={<JoinUs />} />
              <Route path="/rooms" element={<RoomLayout />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/fooddrink/:id" element={<FoodDrinkDetail />} />
              <Route path="/room-detail/:id" element={<RoomDetail />} />
              <Route path="/history" element={<InvoiceHistory />} />

              <Route path="/Checkout/PaymentCallBack" element={<PaymentResult />} />

              {/* <Route path="/profile" element={<Profile />} /> */}
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/staff/create-employee" element={<CreateEmployeeAccount />} />
              <Route path="/staff/dashboard" element={<Dashboard />} />
              <Route path="/staff/booking/online" element={<OnlineBookingList />} />
              <Route path="/staff/booking/offline" element={<RoomList />} />
              <Route path="/staff/booking/offline/:id/:priceId" element={<OfflineBooking />} />
              <Route path="/staff/stockin" element={<StockIn/>} />
              {/* Trang tạo tài khoản nhân viên */}
              {/* <Route
                path="/staff/create-employee"
                element={
                  <ProtectedRoute allowedRoles={['staff']}>
                    <CreateEmployeeAccount />
                  </ProtectedRoute>
                }
              /> */}
            </Routes>
          </MainLayout>

        </AuthProvider>
      </LoadingProvider>
    </Router>

  );
}

export default App;