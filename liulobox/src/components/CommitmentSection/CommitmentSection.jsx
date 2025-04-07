import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './CommitmentSection.css';
import { IonIcon } from "@ionic/react";
import { cashOutline, tvOutline, bodyOutline } from 'ionicons/icons';

function CommitmentSection() {
    const [sectionRef, sectionInView] = useInView({ triggerOnce: false, threshold: 0.2 });

    const commitments = [
        { icon: cashOutline, title: 'Giá Rẻ Nhất', description: 'Chúng tôi cung cấp box hát giá sinh viên' },
        { icon: tvOutline, title: 'Thiết Bị Tốt Nhất', description: 'Dàn loa, màn hình, microphone hiện đại đang chờ bạn' },
        { icon: bodyOutline, title: 'Chăm sóc khách hàng tốt nhất', description: 'Chúng tôi phục vụ từ 9h sáng - 1h sáng hằng ngày' },
    ];

    return (
        <motion.section
            ref={sectionRef}
            className="section commitment-section"
            initial={{ opacity: 0, y: 50 }}
            animate={sectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.5 }}
        >
            <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={sectionInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                transition={{ duration: 0.5 }}
            >
                Cam kết
            </motion.h2>
            <div className="commitment-items">
                {commitments.map((item, index) => (
                    <motion.div
                        key={index}
                        className="commitment-item"
                        initial={{ opacity: 0, y: 20 }}
                        animate={sectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ duration: 0.5}}
                        whileHover={{ scale: 1.1 }}
                    >
                        <span className="icon">
                            <IonIcon icon={item.icon} />
                        </span>
                        <motion.h3
                            initial={{ backgroundPosition: '0% 50%' }}
                            animate={{ backgroundPosition: '100% 50%' }}
                            transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                        >
                            {item.title}
                        </motion.h3>
                        <p>{item.description}</p>
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
}

export default CommitmentSection;
