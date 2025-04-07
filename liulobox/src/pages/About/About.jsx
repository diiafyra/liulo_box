import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './AboutUs.css';
import { useNavigate } from 'react-router-dom';

function AboutUs() {
    const navigate = useNavigate();
    const [sectionRef, sectionInView] = useInView({ triggerOnce: false, threshold: 0.2 });

    const milestones = [
        { year: '2024', event: 'Music Box chính thức ra mắt', description: 'Chúng tôi bắt đầu hành trình mang âm nhạc đến gần hơn với mọi người.' },
        { year: '2025', event: 'Kỷ niệm 1 năm thành lập', description: 'Hơn 10.000 khách hàng đã chọn Music Box để tận hưởng những khoảnh khắc âm nhạc đáng nhớ.' },
    ];

    return (
        <motion.section
            ref={sectionRef}
            className="about-us-section"
            initial={{ opacity: 0 }}
            animate={sectionInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8 }}
        >
            <div className="about-us-container">
                <motion.h1
                    initial={{ y: 50, opacity: 0 }}
                    animate={sectionInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    Về Chúng Tôi
                </motion.h1>

                <motion.div
                    className="about-us-content"
                    initial={{ y: 50, opacity: 0 }}
                    animate={sectionInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <h2>Chào mừng đến với Hộc Líu Lo – You really can sing!</h2>
                    <p>
                        Tại Music Box, chúng tôi tin rằng âm nhạc không chỉ là âm thanh – đó là một hành trình, một kỷ niệm, và là cách để kết nối mọi người. Ra mắt vào năm 2024, chỉ sau hơn một năm, Music Box đã trở thành điểm đến yêu thích của hàng ngàn bạn trẻ yêu âm nhạc tại Việt Nam.
                    </p>
                    <p>
                        Chúng tôi tự hào mang đến không gian hiện đại, thiết bị âm thanh tiên tiến, và dịch vụ tận tâm để bạn có thể thăng hoa trong từng giai điệu. Dù bạn muốn hát karaoke, thu âm, hay chỉ đơn giản là thư giãn cùng âm nhạc, LiuLo luôn sẵn sàng đồng hành cùng bạn.
                    </p>
                </motion.div>

                <div className="milestone-section">
                    <h3>Hành Trình Của Chúng Tôi</h3>
                    <div className="milestone-items">
                        {milestones.map((milestone, index) => (
                            <motion.div
                                key={index}
                                className="milestone-item"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={sectionInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.5, delay: 0.2 * (index + 1) }}
                            >
                                <div className="milestone-year">{milestone.year}</div>
                                <div className="milestone-details">
                                    <h4>{milestone.event}</h4>
                                    <p>{milestone.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <motion.div
                    className="cta-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={sectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                >
                    <h3>Hãy Đến Với Music Box Ngay Hôm Nay!</h3>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="cta-button"
                        onClick={() => navigate('/booking')}

                    >
                        Đặt Phòng Ngay
                    </motion.button>
                </motion.div>
            </div>
        </motion.section>
    );
}

export default AboutUs;