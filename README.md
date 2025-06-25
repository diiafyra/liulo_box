# LIULOBOX KARAOKE MANAGEMENT SYSTEM

> LiuloBox là hệ thống quản lý karaoke hiện đại, hỗ trợ đặt phòng, quản lý dịch vụ, thanh toán trực tuyến (Momo), quản lý kho, phân quyền người dùng và nhiều tính năng khác.

---
##  Mục lục

- [Giới thiệu](#giới-thiệu)
- [Tính năng chính](#tính-năng-chính)
- [Kiến trúc & Công nghệ](#kiến-trúc--công-nghệ)
- [Phân tích thiết kế](#phân-tích--thiết-kế)
- [Backend (API tiêu biểu)](#api-tiêu-biểu)
- [Tích hợp thanh toán Momo](#tích-hợp-thanh-toán-momo)
- [Bảo mật](#bảo-mật)
- [Cài đặt](#cài-đặt)
- [Liên hệ](#Liên-hệ)

---

## Giới thiệu

Project được thực hiện trong học phần web.
[Reports](https://cmcuni-my.sharepoint.com/:w:/g/personal/bit230400_st_cmcu_edu_vn/EYcZafkGFjxNtk_VSmCKHacByNuTIuFeQ4CUc0o5ga_nWA?e=3AW4pn)


## Tính năng chính

- Đặt phòng karaoke online/offline, quản lý lịch đặt
- Quản lý phòng, loại phòng, giá phòng theo khung giờ
- Quản lý thực đơn đồ ăn/thức uống, đặt kèm khi đặt phòng
- Thanh toán trực tuyến qua Momo hoặc tại quầy
- Quản lý kho, lịch sử nhập/xuất kho
- Phân quyền người dùng (user, staff, admin)
- Xác thực qua Firebase Authentication

---

## Kiến trúc & Công nghệ

- Frontend: ReactJS, Vite, Firebase Hosting, Context API, Axios, Chart.js, Ionic UI
- Backend: ASP.NET Core Web API (.NET 9), Entity Framework Core, SQL Server, Firebase Admin SDK, Momo Payment Gateway, JWT Authentication
- Database: SQL Server (Code First)
- DevOps: Hỗ trợ deploy frontend lên Firebase Hosting, backend chạy độc lập

---

## Phân tích & thiết kế
![image](https://github.com/user-attachments/assets/942686c5-3b26-4b49-b8b3-292fd2d093d6)

Phân tích chi tiết nghiệp vụ đặt phòng:
- Gía thuê được xác định dựa vào loại phòng & khung thời gian.
- Người dùng online chọn ngày, chọn phòng, sau đó chọn thời gian đặt phòng
- Thời gian booking online chia theo đơn vị 30 phút.
- Nhân viên đặt phòng cho khách offline: ghi nhận thời gian check-in. Khi check-out cần logic để chia thành các đơn vị 30 phút đồng bộ với đặt phòng online để tính giá phòng.
- Phòng đang có khách online bận toàn bộ thời gian còn lại trong ngày cho đến khi check-out.

Sử dụng 3 procedure để kiểm tra logic tránh lỗi chồng lấn thời gian khi đặt phòng realtime cho cả online/offline booking

- sp_CreateBookingWithTime: Kiểm tra phòng đó còn trống không đước khi create booking và bookingtime đầu tiên (lưu giờ checkin). Nếu không thì throw lỗi.
- GetPriceInfo_ByRoomCategory_AndTime: Bước đầu khi check-out. Ví dụ khách book phòng trải dài sang khung giờ mới thì cần kiểm tra giá trước khi create các booking time tiếp theo.
- ExtendOfflineBookingTimeIfNeeded: Thủ tục chính check-out. Tạo đầy đủ bookingtime dựa trên giờ check-in và check-out.

code cụ thể trong báo cáo gửi kèm.

## API tiêu biểu

Backend viết theo mô hình layered achitecture. Không đóng gói container. Sử dụng ngrok để expose localhost ra internet.

Bookings API:
Gồm 9 endpoints:
- GET: bookings/online
  Lấy tất cả booking online.
  Dùng trong giao diện staff khi trả phòng cho khách online
  
- POST: bookings/online
  Tạo booking online
  Dùng trong giao diện người dùng khi đặt online
  
- PUT: bookings/{bookingId}/paid_online_booking
  Cập nhật trạng thái đặt phòng
  Dùng trong khi thanh toán thành công
  
- PUT: bookings/{bookingId}/complete_online_boooking
  Cập nhật trạng thái đặt phòng online
  Dùng trong giao diện staff trả phòng cho khách online
  
- POST: bookings/offline
  Thêm mới đặt phòng offline
  Dùng trong giao diện staff đặt offline
  
- POST: bookings/checkout_offline
  Checkout booking offline
  Dùng trong giao diện staff để checkout và tính tiền cho khách
  
- PUT: bookings/paid_offline/{bookingId}
  Cập nhật trạng thái đặt phòng offline
  Dùng trong giao diện staff khi khách trả tiền phòng offline
  
- POST: bookings/add-fooddrinks
  Thêm món ăn và đồ uống vào booking
  Dùng trong giao diện staff có thể phát triển lên người dùng
  
- GET: bookings/history
  Lấy tất cả booking của user
  Dùng trong giao diện người dùng khi xem lịch sử đặt phòng


## Tích hợp thanh toán Momo
Sử dụng sandbox mô phỏng với phương thức thanh toán là quét qr.

```bash
  "MomoAPI": {
    "MomoApiUrl": "https://test-payment.momo.vn/gw_payment/transactionProcessor",
    "SecretKey": "K951B6PE1waDMi640xX08PD3vg6EkVlz",
    "AccessKey": "F8BBA842ECF85",
    "ReturnUrl": "http://liulobox.web.app/Checkout/PaymentCallBack",
    "NotifyUrl": "https://b2bd-171-224-84-105.ngrok-free.app/api/payment",
    "PartnerCode": "MOMO",
    "RequestType": "captureMoMoWallet"
  }
```
(Về "NotifyUrl": https://b2bd-171-224-84-105.ngrok-free.app/api/payment, không rõ lý do tại sao momo không trả về endpoint nên project thực hiện 1 cách khác: lấy tham số trực tiếp từ url momo gọi sau khi thanh toán và gọi thủ công 1 endpoint khác)

## Bảo mật
![image](https://github.com/user-attachments/assets/10607475-8cf5-4565-b92a-1c4586692ed6)

-	JWT + Firebase Auth: Xác thực 2 lớp (token + Firebase claims).
-	CORS Policy: Chỉ cho phép truy cập từ domain được chỉ định.
-	Role-based Access Control (RBAC): Sử dụng RoleMiddleware phân quyền chi tiết theo vai trò (Staff, User, Customer).
-	Protected Routes (Frontend).
  
## Cài đặt

```bash
# 1. Clone repo
git clone https://github.com/diiafyra/liulo_box.git
cd apply web
```


```bash
# 2. Cài đặt frontend
cd liulobox
npm install
npm run dev
```


```bash
# 3. Cài đặt backend
cd backend
# Cài package
dotnet restore
# Tạo database (nếu cần)
dotnet ef database update
# Chạy backend
dotnet run
```


```bash
# 4. deploy frontend lên firebase Hosting/optinal vì đã deploy sẵn
cd liulobox
npm run build
firebase deploy
````


---
# Liên hệ
Email: [dii.afyra.work@gmail.com](mailto:dii.afyra.work@gmail.com) 
