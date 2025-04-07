// src/services/apiService.js
export const fetchData = async () => {
  // Giả lập gọi API từ backend C# (Microservices)
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data: 'Sample Data' }), 1000); // Giả lập delay 2s
  });
};