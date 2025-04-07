import { useState, useEffect } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import './PriceSwitcher.css';

function PriceSwitcher({ prices }) {
    const [activePrice, setActivePrice] = useState('weekday');
    const [timeSlots, setTimeSlots] = useState([]);
    const [displayPrices, setDisplayPrices] = useState([]);

    // Khởi tạo MotionValues ở cấp cao nhất
    const morningPrice = useMotionValue(0);
    const afternoonPrice = useMotionValue(0);
    const nightPrice = useMotionValue(0);

    // Mảng cố định 3 MotionValues tương ứng với 3 khung giờ
    const priceMotionValues = [morningPrice, afternoonPrice, nightPrice];

    useEffect(() => {
        const filteredPricing = prices.filter((pricing) => pricing.timeSlot.dayType === activePrice);
        setTimeSlots(filteredPricing);

        // Khởi tạo displayPrices với giá trị 0
        const initialPrices = filteredPricing.map(() => 0);
        setDisplayPrices(initialPrices);

        // Animate giá
        filteredPricing.forEach((pricing, index) => {
            animate(priceMotionValues[index], pricing.price, {
                duration: 0.5,
                ease: 'easeInOut',
                onUpdate: (latest) => {
                    setDisplayPrices((prev) => {
                        const newPrices = [...prev];
                        newPrices[index] = Math.round(latest);
                        return newPrices;
                    });
                },
            });
        });
    }, [activePrice, prices]);

    const scaleVariants = {
        scale: {
            scale: [1, 1.2, 1],
            transition: { duration: 0.3 },
        },
    };

    return (
        <div className="price-table">
            <h4>Giá</h4>
            <div className="price-switcher">
                <motion.div
                    className="switcher-background"
                    animate={{
                        x: activePrice === 'weekday' ? 0 : '100%',
                    }}
                    transition={{ duration: 0.3 }}
                />
                <motion.button
                    className={`switch-button ${activePrice === 'weekday' ? 'active' : ''}`}
                    onClick={() => setActivePrice('weekday')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    T2-T6
                </motion.button>
                <motion.button
                    className={`switch-button ${activePrice === 'weekend' ? 'active' : ''}`}
                    onClick={() => setActivePrice('weekend')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    T7-CN
                </motion.button>
            </div>
            <div className="price-details-table">
                <div className="table-header">
                    {timeSlots.map((slot, index) => (
                        <span key={index}>
                            {slot.timeSlot.startTime.slice(0, 5)} - {slot.timeSlot.endTime.slice(0, 5)}
                        </span>
                    ))}
                </div>
                <div className="table-row">
                    {displayPrices.map((price, index) => (
                        <motion.span
                            key={`price-${index}`}
                            variants={scaleVariants}
                            animate="scale"
                        >
                            {Math.round(price / 1000)}K/h
                        </motion.span>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default PriceSwitcher;