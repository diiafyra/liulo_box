// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoadingProvider } from './contexts/LoadingContext';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home/Home';
import AboutUs from './pages/About/About';
import Contact from './pages/contact';
import FoodDrinkDetail from './pages/FoodDrinkDetail/FoodDrinkDetail';
import RoomDetail from './pages/RoomDetail/RoomDetail';

import { AuthProvider } from './contexts/AuthContext';
import JoinUs from './pages/Joinus/JoinUs';
import Booking from './pages/Booking/Booking';

import './App.css';
import RoomLayout from './components/RoomLayout/RoomLayout';

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

              {/* <Route path="/profile" element={<Profile />} /> */}
              {/* <Route path="/order" element={<Order />} /> */}
            </Routes>
          </MainLayout>

        </AuthProvider>
      </LoadingProvider>
    </Router>

  );
}

export default App;