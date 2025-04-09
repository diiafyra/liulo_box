
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using RestSharp;

public class MomoService : IMomoService
{
    private readonly IOptions<MomoOptionModel> _options;
    public MomoService(IOptions<MomoOptionModel> options)
    {
        _options = options;
    }
    public async Task<MomoCreatePaymentResponseModel> CreatePaymentAsync(OrderInfoModel model)
    {
        var requestId = DateTime.UtcNow.Ticks.ToString();
        model.OrderInfo = "Khách hàng: " + model.FullName + ". Nội dung: " + model.OrderInfo;

        var rawData =
            $"partnerCode={_options.Value.PartnerCode}" +
            $"&accessKey={_options.Value.AccessKey}" +
            $"&requestId={requestId}" +
            $"&amount={model.Amount}" +
            $"&orderId={model.OrderId}" +
            $"&orderInfo={model.OrderInfo}" +
            $"&returnUrl={_options.Value.ReturnUrl}" +
            $"&notifyUrl={_options.Value.NotifyUrl}" + // Sửa "¬ifyUrl" thành "&notifyUrl"
            $"&extraData=";

        var signature = ComputeHmacSha256(rawData, _options.Value.SecretKey);

        var client = new RestClient(_options.Value.MomoApiUrl);
        var request = new RestRequest { Method = Method.Post };
        request.AddHeader("Content-Type", "application/json; charset=UTF-8");

        var requestData = new
        {
            accessKey = _options.Value.AccessKey,
            partnerCode = _options.Value.PartnerCode,
            requestType = _options.Value.RequestType,
            notifyUrl = _options.Value.NotifyUrl,
            returnUrl = _options.Value.ReturnUrl,
            orderId = model.OrderId,
            amount = model.Amount,
            orderInfo = model.OrderInfo,
            requestId = requestId,
            extraData = "",
            signature = signature
        };

        request.AddParameter("application/json", JsonConvert.SerializeObject(requestData), ParameterType.RequestBody);

        var response = await client.ExecuteAsync(request);
        if (!response.IsSuccessful)
        {
            Console.WriteLine($"MoMo API error: {response.StatusCode} - {response.Content}");
            return null;
        }

        var momoResponse = JsonConvert.DeserializeObject<MomoCreatePaymentResponseModel>(response.Content);
        if (momoResponse?.ErrorCode != 0) // Sửa từ ResultCode thành ErrorCode
        {
            Console.WriteLine($"MoMo response error: {momoResponse.ErrorCode} - {momoResponse.Message}");
        }
        return momoResponse;
    }



    public MomoExecuteResponseModel PaymentExecuteAsync(IQueryCollection collection)
    {
        var amount = collection.First(s => s.Key == "amount").Value;
        var orderInfo = collection.First(s => s.Key == "orderInfo").Value;
        var orderId = collection.First(s => s.Key == "orderId").Value;

        return new MomoExecuteResponseModel()
        {
            Amount = amount,
            OrderId = orderId,
            OrderInfo = orderInfo

        };
    }

    private string ComputeHmacSha256(string message, string secretKey)
    {
        var keyBytes = Encoding.UTF8.GetBytes(secretKey);
        var messageBytes = Encoding.UTF8.GetBytes(message);

        byte[] hashBytes;

        using (var hmac = new HMACSHA256(keyBytes))
        {
            hashBytes = hmac.ComputeHash(messageBytes);
        }

        var hashString = BitConverter.ToString(hashBytes).Replace("-", "").ToLower();

        return hashString;
    }
    private bool VerifySignature(MomoCreatePaymentResponseModel data)
        {
            string rawData = $"partnerCode={data}&orderId={data.OrderId}&requestId={data.RequestId}&amount={data.Amount}&orderInfo={data.OrderInfo}&orderType={data.OrderType}&transId={data.TransId}&resultCode={data.ResultCode}&message={data.Message}&payType={data.PayType}&responseTime={data.ResponseTime}&extraData={data.ExtraData}";
            
            using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_secretKey)))
            {
                byte[] hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(rawData));
                string calculatedSignature = BitConverter.ToString(hash).Replace("-", "").ToLower();
                return calculatedSignature == data.Signature.ToLower();
            }
        }
}


public interface IMomoService
{
    Task<MomoCreatePaymentResponseModel> CreatePaymentAsync(OrderInfoModel model);
    MomoExecuteResponseModel PaymentExecuteAsync(IQueryCollection collection);
    bool VerifySignature(MomoCreatePaymentResponseModel data);
    string ComputeHmacSha256(string message, string secretKey);
}