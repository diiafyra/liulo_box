using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class PaymentController : ControllerBase
{
    private readonly IMomoService _momoService;

    public PaymentController(IMomoService momoService)
    {
        _momoService = momoService;
    }

    /// <summary>
    /// Tạo URL thanh toán MoMo
    /// </summary>
    [HttpPost("create-payment")]
    public async Task<IActionResult> CreateMomoPaymentUrl([FromBody] OrderInfoModel model)
    {
        if (model == null)
            return BadRequest("Invalid order information.");

        var response = await _momoService.CreatePaymentAsync(model);
        if (response == null || string.IsNullOrEmpty(response.PayUrl))
            return StatusCode(500, "Failed to create MoMo payment.");

        return Ok(new { payUrl = response.PayUrl });
    }
    [HttpGet]
    public IActionResult PaymentCallBack()
    {
        System.Console.WriteLine("Received MoMo callback: " + HttpContext.Request.Query.ToString());
        var response = _momoService.PaymentExecuteAsync(HttpContext.Request.Query);
        return Ok(response);
    }
    // [HttpPost("Checkout/MomoNotify")]
    //     public IActionResult HandleMomoNotify([FromBody] MomoCreatePaymentResponseModel notification)
    //     {
    //         System.Console.WriteLine("Received MoMo notification: " + notification.ToString());
    //         // Kiểm tra chữ ký
    //         bool isValidSignature = _momoService.VerifySignature(notification);
    //         if (!isValidSignature)
    //         {
    //             Console.WriteLine("Invalid signature!");
    //             return BadRequest(new { Message = "Invalid signature" });
    //         }

    //         // Xử lý kết quả
    //         if (notification.ErrorCode == 0)
    //         {

    //         }
    //         else
    //         {
    //             Console.WriteLine($"Thanh toán thất bại cho đơn hàng {notification.OrderId}: {notification.Message}");
    //             // TODO: Cập nhật trạng thái đơn hàng (ví dụ: "FAILED")
    //         }

    //         // Trả về HTTP 200 cho MoMo
    //         return Ok(new { Message = "Notification received" });
    //     }

}
