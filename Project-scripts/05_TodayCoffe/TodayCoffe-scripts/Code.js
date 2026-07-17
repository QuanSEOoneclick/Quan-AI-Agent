function doGet(e) {
  return HtmlService.createHtmlOutput("<h3>Today Coffee Web App is active and ready to receive POST requests!</h3>");
}

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  try {
    var data = JSON.parse(e.postData.contents);
    
    // Tạo mã đơn hàng duy nhất bằng timestamp để nhóm các món cùng một đơn nhiều lại
    var orderId = "ORD-" + new Date().getTime();
    var orderMode = data.orderMode || "Đơn lẻ";
    
    // Kiểm tra nếu có danh sách nhiều món (Giỏ hàng)
    if (data.items && data.items.length > 0) {
      data.items.forEach(function(item) {
        // Ghi nhận dữ liệu: 
        // [Thời gian, Người bán, Loại đơn, Loại cà phê, Size, Số lượng, Đơn giá, Thành tiền, Thanh toán, Ghi chú, Mã đơn hàng]
        sheet.appendRow([
          new Date(), 
          data.seller, 
          orderMode,
          item.coffeeType, 
          item.size, 
          item.quantity, 
          item.price,
          item.price * item.quantity,
          data.payment, 
          data.note || "",
          orderId
        ]);
      });
    } else {
      // Hỗ trợ dự phòng nếu gửi đơn lẻ kiểu cũ (không qua mảng items)
      var price = data.price || 0;
      sheet.appendRow([
        new Date(), 
        data.seller, 
        orderMode,
        data.coffeeType, 
        data.size, 
        data.quantity, 
        price,
        price * data.quantity,
        data.payment, 
        data.note || "",
        orderId
      ]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({"result": "success"}))
                         .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({"result": "error", "message": error.toString()}))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}
