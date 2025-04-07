import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLoading } from "../../contexts/LoadingContext";
import { motion } from "framer-motion";
import withLoading from "../../components/withLoading";
import { IonIcon } from "@ionic/react";
import { cart } from "ionicons/icons"; // Import the cart icon

import "./FoodDrinkDetail.css"; // Import the CSS file

function FoodDrinkDetail() {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { setIsLoading } = useLoading();

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`http://localhost:5220/api/fooddrink/byid/${id}`);
        const data = await res.json();
        setDetail(data);
      } catch (error) {
        console.error("Error fetching detail:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [id, setIsLoading]);

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const updatedCart = [...cart, { ...detail, quantity }];
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    alert("Added to cart!");
  };

  const handleBuyNow = () => {
    alert("Proceeding to checkout...");
  };

  const increaseQuantity = () => setQuantity(prev => (prev < detail.stock ? prev + 1 : detail.stock));
  const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  if (!detail) return null; // loading handled by context

  return (
    <motion.div
      className="food-detail-page"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.img
        src={detail.imageUrl}
        alt={detail.name}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        className="food-image"
      />
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="food-info"
      >
        <h2>{detail.name}</h2>
        <p>
          <strong>Hình thức nhận hàng: Trực tiếp tại box</strong> 
        </p>
        <p>
          <strong>Giá:</strong> {detail.price / 1000}K
        </p>
        <p>
          <strong>Loại:</strong> {detail.category}
        </p>
        <p className="description">{detail.description}</p>

        {/* Quantity Selector */}
        <div className="quantity-container">
          <button className="quantity-btn" onClick={decreaseQuantity}>-</button>
          <input 
            type="number" 
            value={quantity} 
            className="quantity-input" 
            readOnly 
            max={detail.stock}  // Giới hạn số lượng tối đa
          />
          <button className="quantity-btn" onClick={increaseQuantity}>+</button>
          <span className="stock-info">Còn lại: {detail.stock}</span> {/* Thêm thông tin còn lại */}
        </div>

        {/* Action Buttons */}

        <button onClick={handleAddToCart} className="btn btn-add-to-cart">
          <IonIcon icon={cart} className="cart-icon" />
        </button>
      </motion.div>
    </motion.div>
  );
}

export default withLoading(FoodDrinkDetail); // Container cho các nút
