// public interface IBookingService
// {
//     Task<List<object>> CheckoutAndGenerateInvoicesAsync(int roomId, DateTime endDate);
// }

// public class BookingService : IBookingService
// {
//     private readonly BookingDAO _bookingDAO;

//     public BookingService(BookingDAO bookingDAO)
//     {
//         _bookingDAO = bookingDAO;
//     }

//     public async Task<List<object>> CheckoutAndGenerateInvoicesAsync(int roomId, DateTime endDate)
//     {
//         System.Console.WriteLine($"CheckoutAndGenerateInvoicesAsync called with roomId: {roomId}, endDate: {endDate}");
//         // Lấy danh sách booking và cập nhật IsComplete
//         var bookings = await _bookingDAO.GetOfflineBookingsAsync(roomId, endDate);
//         if (bookings == null || !bookings.Any())
//         {
//             return null;
//         }
//         await _bookingDAO.CheckoutOfflineBookingAsync(roomId, endDate);

//         // Tạo danh sách hóa đơn
//         return GenerateInvoices(bookings);
//     }

//     // Phương thức tái sử dụng: Tạo danh sách hóa đơn
//     private List<object> GenerateInvoices(List<Booking> bookings)
//     {
//         return bookings.Select(booking => CreateInvoice(booking)).ToList();
//     }

//     // Phương thức tái sử dụng: Tạo một hóa đơn chi tiết
//     private object CreateInvoice(Booking booking)
//     {
//         var bookingTimeTotal = CalculateBookingTimeTotal(booking.BookingTimes);
//         var foodDrinkTotal = CalculateFoodDrinkTotal(booking.BookingFoodDrinks);

//         return new
//         {
//             BookingId = booking.Id,
//             UserId = booking.UserId,
//             RoomId = booking.RoomId,
//             BookingType = booking.BookingType,
//             Describe = booking.Describe,
//             BookingStatus = booking.BookingStatus,
//             PaymentMethod = booking.PaymentMethod,
//             IsComplete = booking.IsComplete,
//             BookingTimes = booking.BookingTimes.Select(bt => new
//             {
//                 bt.Id,
//                 bt.StartDate,
//                 bt.EndDate,
//                 bt.PriceId,
//                 RoomPricing = new
//                 {
//                     bt.RoomPricing.Id,
//                     bt.RoomPricing.Price,
//                     bt.RoomPricing.RoomCategoryId,
//                     bt.RoomPricing.TimeSlotDefinitionId
//                 },
//                 TotalPrice = bt.TotalPrice
//             }).ToList(),
//             BookingFoodDrinks = booking.BookingFoodDrinks.Select(bfd => new
//             {
//                 bfd.Id,
//                 bfd.FoodDrinkId,
//                 bfd.Units,
//                 bfd.Price,
//                 TotalFoodDrinkPrice = bfd.Units * bfd.Price
//             }).ToList(),
//             BookingTimeTotal = bookingTimeTotal,
//             FoodDrinkTotal = foodDrinkTotal,
//             GrandTotal = bookingTimeTotal + foodDrinkTotal
//         };
//     }

//     // Phương thức tái sử dụng: Tính tổng giá BookingTime
//     private decimal CalculateBookingTimeTotal(ICollection<BookingTime> bookingTimes)
//     {
//         return bookingTimes.Sum(bt => bt.TotalPrice);
//     }

//     // Phương thức tái sử dụng: Tính tổng giá BookingFoodDrink
//     private decimal CalculateFoodDrinkTotal(ICollection<BookingFoodDrink> bookingFoodDrinks)
//     {
//         return bookingFoodDrinks.Sum(bfd => bfd.Price * bfd.Units);
//     }
// }