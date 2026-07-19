function doGet(e) {
  return HtmlService.createHtmlOutput("<h3>Today Coffee Web App is active and ready to receive POST requests!</h3>");
}

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  try {
    var data = JSON.parse(e.postData.contents);
    
    // 1. LẤY DANH SÁCH TÊN ĐĂNG NHẬP (Từ cột A sheet "Dang-nhap" để làm dropdown)
    if (data.action === "getUsers") {
      var loginSheet = ss.getSheetByName("Dang-nhap");
      if (!loginSheet) {
        return ContentService.createTextOutput(JSON.stringify({"result": "error", "message": "Không tìm thấy sheet Dang-nhap"}))
                             .setMimeType(ContentService.MimeType.JSON);
      }
      
      // Đọc toàn bộ giá trị trong một lần gọi API duy nhất
      var loginData = loginSheet.getDataRange().getValues();
      var users = [];
      for (var i = 1; i < loginData.length; i++) {
        var dbUser = String(loginData[i][0]).trim();
        if (dbUser && users.indexOf(dbUser) === -1) {
          users.push(dbUser);
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({"result": "success", "users": users}))
                           .setMimeType(ContentService.MimeType.JSON);
    }

    // 1.5 LẤY DANH SÁCH MÃ KHO (Từ cột A sheet "Ma-kho" để làm dropdown)
    if (data.action === "getWarehouses") {
      var warehouseSheet = ss.getSheetByName("Ma-kho");
      if (!warehouseSheet) {
        return ContentService.createTextOutput(JSON.stringify({"result": "error", "message": "Không tìm thấy sheet Ma-kho"}))
                             .setMimeType(ContentService.MimeType.JSON);
      }
      
      var warehouseData = warehouseSheet.getDataRange().getValues();
      var warehouses = [];
      for (var i = 1; i < warehouseData.length; i++) {
        var dbWarehouse = String(warehouseData[i][0]).trim();
        if (dbWarehouse && warehouses.indexOf(dbWarehouse) === -1) {
          warehouses.push(dbWarehouse);
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({"result": "success", "warehouses": warehouses}))
                           .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 2. XỬ LÝ ĐĂNG NHẬP (Từ sheet "Dang-nhap")
    if (data.action === "login") {
      var loginSheet = ss.getSheetByName("Dang-nhap");
      if (!loginSheet) {
        return ContentService.createTextOutput(JSON.stringify({"result": "error", "message": "Không tìm thấy sheet Dang-nhap"}))
                             .setMimeType(ContentService.MimeType.JSON);
      }
      
      var loginData = loginSheet.getDataRange().getValues();
      var username = data.username ? String(data.username).trim().toLowerCase() : "";
      var password = data.password ? String(data.password).trim() : "";
      
      for (var i = 1; i < loginData.length; i++) {
        var dbUser = String(loginData[i][0]).trim().toLowerCase();
        var dbPass = String(loginData[i][1]).trim();
        
        if (dbUser === username && dbPass === password) {
          var displayName = String(loginData[i][0]).trim();
          return ContentService.createTextOutput(JSON.stringify({"result": "success", "username": displayName}))
                               .setMimeType(ContentService.MimeType.JSON);
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({"result": "error", "message": "Sai mật khẩu!"}))
                           .setMimeType(ContentService.MimeType.JSON);
    }

    // 2.3. LẤY DANH SÁCH HẠNG MỤC NHẬP XUẤT (Từ sheet "Danh-sach-hang-muc-nhap-xuat")
    if (data.action === "getIngressItems") {
      var sheet = ss.getSheetByName("Danh-sach-hang-muc-nhap-xuat");
      if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({"result": "error", "message": "Không tìm thấy sheet Danh-sach-hang-muc-nhap-xuat"}))
                             .setMimeType(ContentService.MimeType.JSON);
      }
      
      var rangeData = sheet.getDataRange().getValues();
      var items = [];
      for (var i = 1; i < rangeData.length; i++) {
        var name = String(rangeData[i][0]).trim();
        var stdUnit = String(rangeData[i][1]).trim();
        var stdQty = Number(rangeData[i][2]);
        var cupQty = Number(rangeData[i][3]);
        var cupUnit = String(rangeData[i][4]).trim();
        
        if (name) {
          items.push({
            name: name,
            stdUnit: stdUnit,
            stdQty: stdQty,
            cupQty: cupQty,
            cupUnit: cupUnit
          });
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({"result": "success", "items": items}))
                           .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 2.5. XỬ LÝ GHI NHẬN NHẬP KHO (Vào sheet "Nhap-kho")
    if (data.action === "nhapKho") {
      var nhapKhoSheet = ss.getSheetByName("Nhap-kho");
      if (!nhapKhoSheet) {
        return ContentService.createTextOutput(JSON.stringify({"result": "error", "message": "Không tìm thấy sheet Nhap-kho"}))
                             .setMimeType(ContentService.MimeType.JSON);
      }
      
      var row = [
        new Date(),
        data.warehouse || "",
        data.username || "", // Người nhập kho
        data.itemName || "",
        data.stdUnit || "",
        Number(data.qty || 0),
        Number(data.price || 0),
        data.cupUnit || "",
        Number(data.cupQty || 0)
      ];
      
      var lastRow = getLastDataRow(nhapKhoSheet);
      nhapKhoSheet.getRange(lastRow + 1, 1, 1, row.length).setValues([row]);
      
      return ContentService.createTextOutput(JSON.stringify({"result": "success"}))
                           .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 3. XỬ LÝ GHI NHẬN ĐƠN HÀNG (Vào sheet "Thong_ke")
    var orderSheet = ss.getSheetByName("Thong_ke");
    if (!orderSheet) {
      return ContentService.createTextOutput(JSON.stringify({"result": "error", "message": "Không tìm thấy sheet Thong_ke"}))
                           .setMimeType(ContentService.MimeType.JSON);
    }
    
    var orderId = "ORD-" + new Date().getTime();
    var orderMode = data.orderMode || "Đơn lẻ";
    
    // Tối ưu hóa: Thu thập tất cả các hàng cần chèn vào mảng 2 chiều và ghi nhận bằng 1 giao dịch duy nhất thay vì lặp đi lặp lại
    var rowsToInsert = [];
    var warehouse = data.warehouse || "";
    
    if (data.items && data.items.length > 0) {
      data.items.forEach(function(item) {
        rowsToInsert.push([
          new Date(), 
          warehouse,
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
      var price = data.price || 0;
      rowsToInsert.push([
        new Date(), 
        warehouse,
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
    
    // Thực hiện chèn hàng loạt (Bulk Write) bằng setValues - Cực kỳ nhanh!
    if (rowsToInsert.length > 0) {
      var lastRow = getLastDataRow(orderSheet);
      orderSheet.getRange(lastRow + 1, 1, rowsToInsert.length, rowsToInsert[0].length).setValues(rowsToInsert);
    }
    
    return ContentService.createTextOutput(JSON.stringify({"result": "success"}))
                         .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({"result": "error", "message": error.toString()}))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

// Hàm bổ trợ tìm dòng cuối cùng thực tế chứa dữ liệu (tránh ảnh hưởng bởi MAP/ARRAYFORMULA)
function getLastDataRow(sheet) {
  var values = sheet.getRange("A:A").getValues();
  for (var i = values.length - 1; i >= 0; i--) {
    if (values[i][0] !== "") {
      return i + 1; // Trả về dòng dạng 1-indexed
    }
  }
  return 1;
}
