import { motion } from 'framer-motion';

function LoadingEqualizer() {
  // Tạo mảng 5 thanh để animate
  const bars = [0, 1, 2, 3, 4];

  // Variants cho từng thanh: chiều cao thay đổi ngẫu nhiên
  const barVariants = {
    animate: (i) => ({
      height: `${20 + Math.random() * 30}px`, // Chiều cao ngẫu nhiên từ 20px đến 50px
      transition: {
        duration: 0.5, // Thời gian animate mỗi lần
        repeat: Infinity, // Lặp vô hạn
        repeatType: 'reverse', // Nhấp nhô lên xuống
        delay: i * 0.1, // Độ trễ giữa các thanh để tạo hiệu ứng sóng
      },
    }),
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '5px', // Khoảng cách giữa các thanh
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {bars.map((i) => (
        <motion.div
          key={i}
          style={{
            width: '10px', // Chiều rộng mỗi thanh
            height: '20px', // Chiều cao ban đầu
            background: '#00b7ff', // Màu xanh nhạc điện tử
            borderRadius: '2px', // Bo góc nhẹ
          }}
          variants={barVariants}
          animate="animate"
          custom={i} // Truyền index để tạo độ trễ
        />
      ))}
    </div>
  );
}

export default LoadingEqualizer;