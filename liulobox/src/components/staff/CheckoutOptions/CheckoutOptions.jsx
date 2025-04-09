import React from 'react';

const CheckoutOptions = ({ onCheckout, onExit }) => {
    return (
        <div className="checkout-options">
            <button className="btn_ookingoffline" onClick={onCheckout}>Checkout</button>
            <button className="btn_ookingoffline" onClick={onExit}>Thoát</button>
        </div>
    );
};

export default CheckoutOptions;