import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './HeroSection.css';
import heroImage from "../../assets/hero-image.jpg";


function HeroSection() {
    const { scrollY } = useScroll();
    const [sectionRef, sectionInView] = useInView({ triggerOnce: false, threshold: 0.2 });

    const [typedText, setTypedText] = useState('');
    const fullText = 'Liu Lo Box';

    useEffect(() => {
        let index = 0;
        const typingInterval = setInterval(() => {
            if (index < fullText.length) {
                setTypedText(fullText.slice(0, index + 1));
                index++;
            } else {
                clearInterval(typingInterval);
            }
        }, 100);

        return () => clearInterval(typingInterval);
    }, []);

    // Hiệu ứng parallax cho ảnh
    const imageY = useTransform(scrollY, [0, 300], [0, 50]);

    return (
        <motion.section
            ref={sectionRef}
            className="section hero-section"
            initial={{ opacity: 0 }}
            animate={sectionInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8 }}
        >
            <div className="hero-content">
                <div className="hero-text">
                    <h1>
                        Welcome to <br />
                        <motion.span
                            className="typed-text"
                            initial={{ backgroundPosition: '0% 50%' }}
                            animate={{ backgroundPosition: '100% 50%' }}
                            transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                        >
                            {typedText}
                        </motion.span>
                    </h1>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={sectionInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        Nơi thỏa mãn đam mê ca hát. Ấn nút nhớ thả giấc mơ.
                    </motion.p>
                    <motion.button
                        className="price-button"
                        whileHover={{ scale: 1.1, backgroundColor: 'var(--color-button-active)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => document.getElementById('price-section').scrollIntoView({ behavior: 'smooth' })}
                    >
                        Bảng giá
                    </motion.button>
                </div>
                <motion.div
                    className="hero-image"
                    style={{ y: imageY }}
                >
                    <img src={heroImage} alt="Hotel" />
                </motion.div>
            </div>
        </motion.section>
    );
}

export default HeroSection;