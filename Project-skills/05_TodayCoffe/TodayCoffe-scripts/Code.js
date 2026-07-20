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
      var loginData = loginSheet.getDataRange().getValues();
      var balanceColIdx = getOrInitBalanceColumn(loginSheet, loginData[0]);
      var users = [];
      for (var i = 1; i < loginData.length; i++) {
        var dbUser = String(loginData[i][0]).trim();
        if (dbUser) {
          var dbRole = String(loginData[i][2] || "").trim();
          var balance = Number(loginData[i][balanceColIdx - 1] || 0);
          users.push({
            username: dbUser,
            role: dbRole,
            balance: balance
          });
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
          var balanceColIdx = getOrInitBalanceColumn(loginSheet, loginData[0]);
          var dbRoleName = String(loginData[i][2] || "").trim();
          var rolePermissions = resolvePermissions(ss, dbRoleName);
          var balance = Number(loginData[i][balanceColIdx - 1] || 0);
          return ContentService.createTextOutput(JSON.stringify({"result": "success", "username": displayName, "role": rolePermissions, "balance": balance}))
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
        Number(data.price || 0), // Giá Bán Theo Đơn Vị Chuẩn (VNĐ)
        Number(data.qty || 0), // Số Lượng Nhập Kho Theo Đơn Vị Chuẩn
        Number(data.price || 0) * Number(data.qty || 0), // Thành Tiền Theo Đơn Vị Chuẩn
        data.cupUnit || "",
        Number(data.cupQty || 0) // Số Lượng Nhập Kho Theo Đơn Vị / Ly Nước
      ];
      
      var lastRow = getLastDataRow(nhapKhoSheet);
      nhapKhoSheet.getRange(lastRow + 1, 1, 1, row.length).setValues([row]);
      
      return ContentService.createTextOutput(JSON.stringify({"result": "success"}))
                           .setMimeType(ContentService.MimeType.JSON);
    }

    // 2.6. LẤY BẢNG GIÁ DÀNH CHO WEB POS (Từ sheet "Dinh-luong-tren-1-ly-nuoc")
    if (data.action === "getPricingTable") {
      var sheet = ss.getSheetByName("Dinh-luong-tren-1-ly-nuoc");
      if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({"result": "error", "message": "Không tìm thấy sheet Dinh-luong-tren-1-ly-nuoc"}))
                             .setMimeType(ContentService.MimeType.JSON);
      }
      
      var rangeData = sheet.getDataRange().getValues();
      var pricing = {};
      
      for (var i = 1; i < rangeData.length; i++) {
        var item = String(rangeData[i][0]).trim();
        var size = String(rangeData[i][1]).trim();
        var price = Number(rangeData[i][2] || 0);
        
        if (item && size) {
          if (!pricing[item]) {
            pricing[item] = {};
          }
          pricing[item][size] = price;
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({"result": "success", "pricingTable": pricing}))
                           .setMimeType(ContentService.MimeType.JSON);
    }

    // 2.7. XỬ LÝ LẤY DỮ LIỆU THỐNG KÊ (Cho Web POS)
    if (data.action === "getAnalytics") {
      var warehouse = data.warehouse || "TC01";
      var monthFilter = data.month || "";
      var dateFilter = data.date || "";
      var analyticsResult = getAnalyticsData(ss, warehouse, monthFilter, dateFilter);
      return ContentService.createTextOutput(JSON.stringify(analyticsResult))
                           .setMimeType(ContentService.MimeType.JSON);
    }

    // 2.8. CẬP NHẬT TRẠNG THÁI ĐƠN ĐẶT TRƯỚC (Sheet "Thong_ke")
    if (data.action === "updatePreOrderStatus") {
      var sheet = ss.getSheetByName("Thong_ke");
      if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({"result": "error", "message": "Không tìm thấy sheet Thong_ke"}))
                             .setMimeType(ContentService.MimeType.JSON);
      }
      
      var orderId = data.orderId;
      var newStatus = data.status || "Thành công";
      if (!orderId) {
        return ContentService.createTextOutput(JSON.stringify({"result": "error", "message": "Thiếu mã đơn hàng"}))
                             .setMimeType(ContentService.MimeType.JSON);
      }
      
      var range = sheet.getDataRange();
      var values = range.getValues();
      var updatedCount = 0;
      var oldStatus = "";
      var totalVal = 0;
      var noteStr = "";
      
      // Tìm trạng thái cũ, tổng giá trị đơn hàng và ghi chú
      for (var i = 1; i < values.length; i++) {
        var rowOrderId = String(values[i][11]).trim();
        if (rowOrderId === orderId) {
          oldStatus = String(values[i][12] || "Chờ nhận nước").trim();
          totalVal += Number(values[i][8] || 0); // Cộng dồn cột I
          if (!noteStr) {
            noteStr = String(values[i][10] || "").trim(); // Ghi chú cột K
          }
        }
      }
      
      // Nếu trạng thái thực sự thay đổi và hợp lệ
      if (oldStatus !== newStatus && !oldStatus.startsWith("Cập nhật") && !oldStatus.startsWith("Update")) {
        var parsedTags = parseOrderNoteTags(noteStr);
        var orderUser = parsedTags.username;
        var usedWalletAmount = parsedTags.wallet;
        
        // Cập nhật trạng thái
        for (var i = 1; i < values.length; i++) {
          var rowOrderId = String(values[i][11]).trim();
          if (rowOrderId === orderId) {
            sheet.getRange(i + 1, 13).setValue(newStatus);
            if (newStatus === "Thành công") {
              sheet.getRange(i + 1, 1).setValue(new Date());
            }
            updatedCount++;
          }
        }
        
        // Xử lý tiền ví
        if (orderUser) {
          if (newStatus === "Thành công") {
            // Tích lũy 1% trên số tiền thực trả bằng tiền mặt/chuyển khoản
            var actualCash = Math.max(0, totalVal - usedWalletAmount);
            var earned = Math.floor(actualCash * 0.01);
            if (earned > 0) {
              var finalBal = adjustUserWalletBalance(ss, orderUser, earned);
              logWalletTransaction(ss, "Hệ thống", orderUser, "Tích lũy đơn Đặt Trước", orderId, earned, finalBal, "Tích lũy 1% khi hoàn tất đơn " + orderId);
            }
          } else if (newStatus === "Đã huỷ") {
            // Hoàn ví nếu có sử dụng ví
            if (usedWalletAmount > 0) {
              var finalBal = adjustUserWalletBalance(ss, orderUser, usedWalletAmount);
              logWalletTransaction(ss, "Hệ thống", orderUser, "Hoàn ví hủy đơn", orderId, usedWalletAmount, finalBal, "Hoàn trả tiền ví khi hủy đơn " + orderId);
            }
          }
        }
      } else {
        // Vẫn cập nhật trạng thái đơn thuần
        for (var i = 1; i < values.length; i++) {
          var rowOrderId = String(values[i][11]).trim();
          if (rowOrderId === orderId) {
            sheet.getRange(i + 1, 13).setValue(newStatus);
            updatedCount++;
          }
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({"result": "success", "updatedCount": updatedCount}))
                           .setMimeType(ContentService.MimeType.JSON);
    }

    // 2.9. LẤY DANH SÁCH ĐƠN ĐẶT TRƯỚC CHƯA HOÀN THÀNH (Sheet "Thong_ke")
    if (data.action === "getPreOrders") {
      var sheet = ss.getSheetByName("Thong_ke");
      if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({"result": "error", "message": "Không tìm thấy sheet Thong_ke"}))
                             .setMimeType(ContentService.MimeType.JSON);
      }
      
      var currentUser = data.currentUser || "";
      var userRole = (data.userRole || "").toLowerCase();
      var isSeller = userRole.indexOf("bán hàng") !== -1;
      
      var warehouse = data.warehouse || "TC01";
      var values = sheet.getDataRange().getValues();
      var orders = {};
      
      for (var i = values.length - 1; i >= 1; i--) { // Đọc ngược từ mới nhất
        var row = values[i];
        var rowWarehouse = String(row[1]).trim(); // Cột B
        var rowOrderMode = String(row[3]).trim(); // Cột D
        var rowStatus = String(row[12] || "Chờ nhận nước").trim(); // Cột M (Trạng thái đơn hàng)
        var rowCustomer = String(row[2]).trim(); // Cột C (Khách: Tên - SĐT)
        var rowNote = String(row[10]).trim(); // Cột K (Ghi chú)
        
        // Nếu không có quyền Bán hàng, chỉ lấy đơn do chính tài khoản này đặt
        if (!isSeller) {
          // Tài khoản sẽ được gán vào trường note khi đặt đơn, vd: "[Tên_Tài_Khoản]"
          if (rowCustomer.indexOf(currentUser) === -1 && rowNote.indexOf("[" + currentUser + "]") === -1) {
            continue;
          }
        }
        
        if (rowWarehouse === warehouse && rowOrderMode === "Đặt trước" && rowStatus !== "Thành công") {
          var orderId = String(row[11]).trim(); // Cột L
          if (!orderId) continue;
          
          if (!orders[orderId]) {
            orders[orderId] = {
              orderId: orderId,
              time: row[0],
              seller: String(row[2]).trim(), // Khách: Tên - SĐT
              payment: String(row[9]).trim(),
              note: String(row[10]).trim(),
              status: rowStatus,
              items: []
            };
          }
          
          orders[orderId].items.push({
            coffeeType: String(row[4]).trim(),
            size: String(row[5]).trim(),
            quantity: Number(row[6] || 0),
            price: Number(row[7] || 0)
          });
        }
      }
      
      var orderList = [];
      for (var key in orders) {
        orderList.push(orders[key]);
      }
      
      return ContentService.createTextOutput(JSON.stringify({"result": "success", "orders": orderList}))
                           .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 3.1. ADMIN ĐIỀU CHỈNH VÍ TÀI KHOẢN (Cho Admin)
    if (data.action === "adjustUserBalance") {
      var requester = data.requester || "";
      var targetUser = data.targetUser || "";
      var amount = Math.max(0, Number(data.amount || 0));
      var adjustType = data.adjustType || "increase"; // "increase" hoặc "decrease"
      var note = data.note || "";
      
      var loginSheet = ss.getSheetByName("Dang-nhap");
      if (!loginSheet) {
        return ContentService.createTextOutput(JSON.stringify({"result": "error", "message": "Không tìm thấy sheet Dang-nhap"}))
                             .setMimeType(ContentService.MimeType.JSON);
      }
      
      // 1. Kiểm tra quyền Admin của requester
      var loginValues = loginSheet.getDataRange().getValues();
      var isRequesterAdmin = false;
      for (var i = 1; i < loginValues.length; i++) {
        if (String(loginValues[i][0]).trim().toLowerCase() === requester.trim().toLowerCase()) {
          var dbRoleName = String(loginValues[i][2] || "").trim();
          var roleStr = resolvePermissions(ss, dbRoleName).toLowerCase();
          if (roleStr.indexOf("admin") !== -1) {
            isRequesterAdmin = true;
            break;
          }
        }
      }
      
      if (!isRequesterAdmin) {
        return ContentService.createTextOutput(JSON.stringify({"result": "error", "message": "Bạn không có quyền Admin để điều chỉnh ví!"}))
                             .setMimeType(ContentService.MimeType.JSON);
      }
      
      // 2. Thực hiện điều chỉnh ví của targetUser
      var balanceColIdx = getOrInitBalanceColumn(loginSheet, loginValues[0]);
      var targetUserRowIdx = -1;
      var currentBalance = 0;
      
      for (var i = 1; i < loginValues.length; i++) {
        if (String(loginValues[i][0]).trim().toLowerCase() === targetUser.trim().toLowerCase()) {
          targetUserRowIdx = i + 1;
          currentBalance = Number(loginValues[i][balanceColIdx - 1] || 0);
          break;
        }
      }
      
      if (targetUserRowIdx === -1) {
        return ContentService.createTextOutput(JSON.stringify({"result": "error", "message": "Không tìm thấy tài khoản đích!"}))
                             .setMimeType(ContentService.MimeType.JSON);
      }
      
      var changeAmount = adjustType === "increase" ? amount : -amount;
      var newBalance = Math.max(0, currentBalance + changeAmount);
      
      loginSheet.getRange(targetUserRowIdx, balanceColIdx).setValue(newBalance);
      
      var logType = adjustType === "increase" ? "Admin cộng ví" : "Admin trừ ví";
      logWalletTransaction(ss, requester, targetUser, logType, "", changeAmount, newBalance, note);
      
      return ContentService.createTextOutput(JSON.stringify({"result": "success", "newBalance": newBalance}))
                           .setMimeType(ContentService.MimeType.JSON);
    }

    // 3.3. LẤY LỊCH SỬ GIAO DỊCH VÍ TÍCH LŨY CỦA TỪNG USER (Từ sheet "Lich-su-vi")
    if (data.action === "getUserWalletHistory") {
      var username = data.username || "";
      var auditSheet = ss.getSheetByName("Lich-su-vi");
      if (!auditSheet) {
        return ContentService.createTextOutput(JSON.stringify({"result": "success", "history": []}))
                             .setMimeType(ContentService.MimeType.JSON);
      }
      
      var values = auditSheet.getDataRange().getValues();
      var history = [];
      
      for (var i = values.length - 1; i >= 1; i--) {
        var row = values[i];
        var targetUser = String(row[2]).trim();
        if (targetUser.toLowerCase() === username.toLowerCase()) {
          history.push({
            time: row[0],
            actor: String(row[1]).trim(),
            type: String(row[3]).trim(),
            orderId: String(row[4]).trim(),
            amount: Number(row[5] || 0),
            newBalance: Number(row[6] || 0),
            note: String(row[7] || "").trim()
          });
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({"result": "success", "history": history}))
                           .setMimeType(ContentService.MimeType.JSON);
    }

    // 3.2. LẤY LỊCH SỬ MUA HÀNG & TÍCH LŨY CỦA TỪNG USER
    if (data.action === "getUserOrderHistory") {
      var username = data.username || "";
      var orderSheet = ss.getSheetByName("Thong_ke");
      if (!orderSheet) {
        return ContentService.createTextOutput(JSON.stringify({"result": "error", "message": "Không tìm thấy sheet Thong_ke"}))
                             .setMimeType(ContentService.MimeType.JSON);
      }
      
      var values = orderSheet.getDataRange().getValues();
      var orders = {};
      
      for (var i = values.length - 1; i >= 1; i--) {
        var row = values[i];
        var rowStatus = String(row[12] || "").trim();
        if (rowStatus.startsWith("Cập nhật") || rowStatus.startsWith("Update")) continue;
        
        var rowCustomer = String(row[2]).trim();
        var rowNote = String(row[10]).trim();
        
        var isUserOrder = false;
        if (rowCustomer.indexOf(username) !== -1 || rowNote.indexOf("[" + username + "]") !== -1) {
          isUserOrder = true;
        }
        
        if (!isUserOrder) continue;
        
        var orderId = String(row[11]).trim();
        if (!orderId) continue;
        
        if (!orders[orderId]) {
          var parsedTags = parseOrderNoteTags(rowNote);
          orders[orderId] = {
            orderId: orderId,
            time: row[0],
            seller: rowCustomer,
            payment: String(row[9] || "Tiền mặt").trim(),
            note: rowNote,
            status: rowStatus,
            items: [],
            totalAmount: 0,
            usedBalance: parsedTags.wallet
          };
        }
        
        var qty = Number(row[6] || 0);
        var price = Number(row[7] || 0);
        orders[orderId].totalAmount += qty * price;
        orders[orderId].items.push({
          name: String(row[4]).trim(),
          size: String(row[5]).trim(),
          quantity: qty,
          price: price
        });
      }
      
      var orderList = [];
      for (var key in orders) {
        var ord = orders[key];
        var earned = 0;
        if (ord.status === "Thành công") {
          var cashPaid = Math.max(0, ord.totalAmount - ord.usedBalance);
          earned = Math.floor(cashPaid * 0.01);
        }
        ord.earnedBalance = earned;
        orderList.push(ord);
      }
      
      return ContentService.createTextOutput(JSON.stringify({"result": "success", "orders": orderList}))
                           .setMimeType(ContentService.MimeType.JSON);
    }

        // 3. XỬ LÝ GHI NHẬN ĐƠN HÀNG (Vào sheet "Thong_ke")
    var orderSheet = ss.getSheetByName("Thong_ke");
    if (!orderSheet) {
      return ContentService.createTextOutput(JSON.stringify({"result": "error", "message": "Không tìm thấy sheet Thong_ke"}))
                           .setMimeType(ContentService.MimeType.JSON);
    }
    
    var orderId = data.orderId || ("ORD-" + new Date().getTime());
    var orderMode = data.orderMode || "Đơn lẻ";
    var statusVal = (orderMode.indexOf("Đặt trước") !== -1) ? "Chờ nhận nước" : "Thành công";
    
    // Gắn currentUser vào Ghi chú để tiện lọc
    var finalNote = data.note || "";
    if (data.currentUser) {
      finalNote += " [" + data.currentUser + "]";
    }
    
    // Tính tổng tiền đơn hàng để xử lý điểm và ví
    var totalVal = 0;
    if (data.items && data.items.length > 0) {
      data.items.forEach(function(item) {
        totalVal += Number(item.price || 0) * Number(item.quantity || 0);
      });
    } else {
      totalVal = Number(data.price || 0) * Number(data.quantity || 1);
    }
    
    // Xử lý thanh toán ví tích lũy bảo mật
    var usedBalance = Number(data.usedBalance || 0);
    usedBalance = Math.min(usedBalance, totalVal);
    
    var dbUserBalance = 0;
    var loginSheet = ss.getSheetByName("Dang-nhap");
    var loginValues = loginSheet.getDataRange().getValues();
    var balanceColIdx = getOrInitBalanceColumn(loginSheet, loginValues[0]);
    var userRowIdx = -1;
    
    if (data.currentUser) {
      for (var i = 1; i < loginValues.length; i++) {
        if (String(loginValues[i][0]).trim().toLowerCase() === String(data.currentUser).trim().toLowerCase()) {
          dbUserBalance = Number(loginValues[i][balanceColIdx - 1] || 0);
          userRowIdx = i + 1;
          break;
        }
      }
    }
    
    usedBalance = Math.min(usedBalance, dbUserBalance);
    
    if (usedBalance > 0) {
      finalNote += " [VÍ_TRỪ: " + usedBalance + "]";
    }
    
    var finalPayment = data.payment || "";
    if (usedBalance > 0) {
      finalPayment += " (Ví: " + usedBalance + "đ)";
    }
    
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
          finalPayment, 
          finalNote,
          orderId,
          statusVal
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
        finalPayment, 
        finalNote,
        orderId,
        statusVal
      ]);
    }
    
    // Thực hiện chèn hàng loạt (Bulk Write) bằng setValues - Cực kỳ nhanh!
    if (rowsToInsert.length > 0) {
      var lastRow = getLastDataRow(orderSheet);
      orderSheet.getRange(lastRow + 1, 1, rowsToInsert.length, rowsToInsert[0].length).setValues(rowsToInsert);
      
      // Khấu trừ ví của user ngay lập tức (Áp dụng cho cả POS trực tiếp và Đặt trước để giữ chỗ ví)
      if (usedBalance > 0 && data.currentUser) {
        adjustUserWalletBalance(ss, data.currentUser, -usedBalance, loginSheet, balanceColIdx, loginValues);
        logWalletTransaction(ss, data.currentUser, data.currentUser, "Trừ ví đơn POS", orderId, -usedBalance, dbUserBalance - usedBalance, "Thanh toán cho đơn hàng " + orderId);
      }
      
      // Nếu là đơn hàng POS thành công trực tiếp, cộng điểm tích lũy ngay lập tức
      var earnedPoints = 0;
      if (statusVal === "Thành công" && data.currentUser) {
        var actualCashPaid = Math.max(0, totalVal - usedBalance);
        earnedPoints = Math.floor(actualCashPaid * 0.01);
        if (earnedPoints > 0) {
          var finalBal = adjustUserWalletBalance(ss, data.currentUser, earnedPoints, loginSheet, balanceColIdx, loginValues);
          logWalletTransaction(ss, "Hệ thống", data.currentUser, "Tích lũy đơn POS", orderId, earnedPoints, finalBal, "Tích lũy 1% cho đơn hàng " + orderId);
        }
      }
      
      // Xử lý cập nhật đơn cũ nếu có (Tính năng Chỉnh sửa đơn)
      if (data.oldOrderIdToUpdate) {
        var range = orderSheet.getDataRange();
        var values = range.getValues();
        for (var i = 1; i < values.length; i++) {
          if (String(values[i][11]).trim() === data.oldOrderIdToUpdate) {
            orderSheet.getRange(i + 1, 13).setValue("Update (" + orderId + ")");
          }
        }
      }
      
      // Nếu là đặt trước, gửi thông báo Telegram & Discord
      if (orderMode.indexOf("Đặt trước") !== -1) {
        var msg = "🔔 <b>ĐƠN ĐẶT TRƯỚC MỚI</b>\n" +
                  "• <b>Chi nhánh:</b> " + warehouse + "\n" +
                  "• <b>Khách hàng:</b> " + String(data.seller).replace("Khách: ", "") + "\n" +
                  "• <b>Ghi chú:</b> " + (data.note || "Không") + "\n" +
                  "• <b>Mã đơn:</b> <code>" + orderId + "</code>\n" +
                  "• <b>Chi tiết món:</b>\n";
                  
        var tVal = 0;
        var discordItemsText = "";
        if (data.items && data.items.length > 0) {
          data.items.forEach(function(item) {
            msg += "  + " + item.coffeeType + " (" + item.size + ") x " + item.quantity + "\n";
            discordItemsText += "• " + item.coffeeType + " (" + item.size + ") x " + item.quantity + "\n";
            tVal += item.price * item.quantity;
          });
        } else {
          msg += "  + " + data.coffeeType + " (" + data.size + ") x " + data.quantity + "\n";
          discordItemsText += "• " + data.coffeeType + " (" + data.size + ") x " + data.quantity + "\n";
          tVal = (data.price || 0) * (data.quantity || 1);
        }
        msg += "• <b>Tổng tiền:</b> " + tVal.toLocaleString('vi-VN') + "đ (" + (data.payment || "Tiền mặt") + ")";
        sendTelegramMessage(msg);
        
        // Gửi thông báo qua Discord Webhook
        var discordEmbed = {
          "title": "🔔 ĐƠN ĐẶT TRƯỚC MỚI",
          "color": 1789246, // Màu xanh lá cây (#1b4d3e)
          "fields": [
            { "name": "🏢 Chi nhánh", "value": warehouse, "inline": true },
            { "name": "👤 Khách hàng", "value": String(data.seller).replace("Khách: ", ""), "inline": true },
            { "name": "📝 Ghi chú", "value": data.note || "Không", "inline": false },
            { "name": "🎫 Mã đơn hàng", "value": orderId, "inline": true },
            { "name": "💳 Thanh toán", "value": (data.payment || "Tiền mặt") + " (" + tVal.toLocaleString('vi-VN') + "đ)", "inline": true }
          ],
          "description": "**Chi tiết món:**\n" + discordItemsText,
          "timestamp": new Date().toISOString()
        };
        sendDiscordMessage([discordEmbed]);
      }
    }
    
    // Tải lại số dư ví mới nhất để trả về cho client
    var finalUserBalance = 0;
    if (userRowIdx !== -1) {
      finalUserBalance = Number(loginSheet.getRange(userRowIdx, balanceColIdx).getValue() || 0);
    }
    
    return ContentService.createTextOutput(JSON.stringify({"result": "success", "orderId": orderId, "newBalance": finalUserBalance, "earnedPoints": earnedPoints}))
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

// Hàm bổ trợ lấy dữ liệu thống kê từ Sheet cho Web POS
function getAnalyticsData(ss, warehouse, monthFilter, dateFilter) {
  var orderSheet = ss.getSheetByName("Thong_ke");
  var fixedCostSheet = ss.getSheetByName("Chi-phi-co-dinh");
  
  if (!orderSheet || !fixedCostSheet) {
    return {"result": "error", "message": "Không tìm thấy sheet dữ liệu!"};
  }
  
  var orderData = orderSheet.getDataRange().getValues();
  var fixedCostData = fixedCostSheet.getDataRange().getValues();
  
  var dailyStats = {};
  var totalRevenue = 0;
  var pendingRevenue = 0;
  var cancelledRevenue = 0;
  var totalIngredientCost = 0;
  var totalFixedCostAllocated = 0;
  var statusCounts = {
    "Thành công": 0,
    "Chờ nhận nước": 0,
    "Đã chuẩn bị": 0,
    "Đã huỷ": 0,
    "Khác": 0
  };
  var totalOrders = 0;
  var allMonths = [];
  
  // 1. Phân tích dữ liệu đơn hàng
  for (var i = 1; i < orderData.length; i++) {
    var row = orderData[i];
    var rowDateStr = String(row[0]).trim();
    if (!rowDateStr) continue;
    
    var rowWarehouse = String(row[1]).trim();
    if (rowWarehouse !== warehouse) continue;
    
    var dateObj = new Date(row[0]);
    if (isNaN(dateObj.getTime())) continue;
    
    // Trích xuất thông tin tháng/năm MM/YYYY
    var mm = String(dateObj.getMonth() + 1);
    if (mm.length < 2) mm = "0" + mm;
    var yyyy = dateObj.getFullYear();
    var mKey = mm + "/" + yyyy;
    
    if (allMonths.indexOf(mKey) === -1) {
      allMonths.push(mKey);
    }
    
    // Áp dụng bộ lọc tháng (nếu có)
    if (monthFilter && monthFilter !== "all" && mKey !== monthFilter) continue;
    
    // Áp dụng bộ lọc ngày (nếu có)
    var dateKey = Utilities.formatDate(dateObj, Session.getScriptTimeZone(), "yyyy-MM-dd");
    if (dateFilter && dateKey !== dateFilter) continue;
    
    // Đọc doanh thu (Cột I, chỉ số 8) và Chi phí cố định (Cột AD, chỉ số 29)
    var rowStatus = String(row[12] || "").trim();
    var revenue = Number(row[8] || 0);
    var fixedCostAlloc = Number(row[29] || 0);
    
    // Bỏ qua đếm các dòng Update (đơn đã bị chỉnh sửa)
    if (rowStatus.startsWith("Cập nhật") || rowStatus.startsWith("Update")) continue;
    
    totalOrders++;
    if (rowStatus === "Thành công") statusCounts["Thành công"]++;
    else if (rowStatus === "Chờ nhận nước") statusCounts["Chờ nhận nước"]++;
    else if (rowStatus === "Đã chuẩn bị") statusCounts["Đã chuẩn bị"]++;
    else if (rowStatus === "Đã huỷ") statusCounts["Đã huỷ"]++;
    else statusCounts["Khác"]++;
    
    // Tính tổng chi phí nguyên liệu (Cột O đến AC, chỉ số từ 14 đến 28)
    var ingredientCost = 0;
    for (var col = 14; col <= 28; col++) {
      ingredientCost += Number(row[col] || 0);
    }
    
    if (!dailyStats[dateKey]) {
      dailyStats[dateKey] = {
        date: dateKey,
        totalCount: 0,
        successCount: 0,
        cancelledCount: 0,
        revenue: 0,
        pendingRevenue: 0,
        ingredientCost: 0,
        fixedCostAllocated: 0
      };
    }
    
    dailyStats[dateKey].totalCount++;
    if (rowStatus === "Thành công") {
      dailyStats[dateKey].successCount++;
      dailyStats[dateKey].revenue += revenue;
      totalRevenue += revenue;
    } else if (rowStatus === "Đã huỷ") {
      dailyStats[dateKey].cancelledCount++;
      cancelledRevenue += revenue;
    } else {
      dailyStats[dateKey].pendingRevenue += revenue;
      pendingRevenue += revenue;
    }
    
    dailyStats[dateKey].ingredientCost += ingredientCost;
    dailyStats[dateKey].fixedCostAllocated += fixedCostAlloc;
    
    totalIngredientCost += ingredientCost;
    totalFixedCostAllocated += fixedCostAlloc;
  }
  
  // Chuyển sang danh sách mảng và sắp xếp ngày giảm dần
  var dailyList = [];
  for (var key in dailyStats) {
    var stat = dailyStats[key];
    stat.profitBeforeFixedCost = stat.revenue - stat.ingredientCost;
    stat.profitAfterFixedCost = stat.revenue - stat.ingredientCost - stat.fixedCostAllocated;
    dailyList.push(stat);
  }
  dailyList.sort(function(a, b) {
    return b.date.localeCompare(a.date);
  });
  
  // Sắp xếp các tháng giảm dần
  allMonths.sort(function(a, b) {
    var partsA = a.split("/");
    var partsB = b.split("/");
    return (partsB[1] + partsB[0]).localeCompare(partsA[1] + partsA[0]);
  });
  
  // 2. Tính tổng Chi phí cố định thực tế trong tháng của kho này
  var targetMonth = monthFilter && monthFilter !== "all" ? monthFilter : "";
  if (!targetMonth && dailyList.length > 0) {
    var latestDate = new Date(dailyList[0].date);
    var mm = String(latestDate.getMonth() + 1);
    if (mm.length < 2) mm = "0" + mm;
    var yyyy = latestDate.getFullYear();
    targetMonth = mm + "/" + yyyy;
  }
  
  var totalFixedCostMonthly = 0;
  var colIdx = -1;
  
  if (targetMonth && fixedCostData.length > 0) {
    var headers = fixedCostData[0];
    for (var c = 2; c < headers.length; c++) {
      var headerVal = String(headers[c]).trim();
      if (headerVal === targetMonth || headerVal.indexOf(targetMonth) !== -1) {
        colIdx = c;
        break;
      }
      if (headers[c] instanceof Date) {
        var hDate = headers[c];
        var hmm = String(hDate.getMonth() + 1);
        if (hmm.length < 2) hmm = "0" + hmm;
        var hyyyy = hDate.getFullYear();
        if ((hmm + "/" + hyyyy) === targetMonth) {
          colIdx = c;
          break;
        }
      }
    }
    
    if (colIdx !== -1) {
      for (var r = 1; r < fixedCostData.length; r++) {
        var rowWarehouse = String(fixedCostData[r][0]).trim();
        if (rowWarehouse === warehouse) {
          totalFixedCostMonthly += Number(fixedCostData[r][colIdx] || 0);
        }
      }
    }
  }
  
  // 3. Phân tích Hòa vốn
  var totalProfitBeforeFixedCost = totalRevenue - totalIngredientCost;
  var breakEvenProgress = 0;
  var breakEvenDaysEst = "Chưa có đủ dữ liệu";
  
  if (totalFixedCostMonthly > 0) {
    breakEvenProgress = Math.min(100, Math.round((totalProfitBeforeFixedCost / totalFixedCostMonthly) * 100));
    
    var numDays = Object.keys(dailyStats).length;
    if (numDays > 0 && totalProfitBeforeFixedCost > 0) {
      var avgDailyProfit = totalProfitBeforeFixedCost / numDays;
      var remainingCost = totalFixedCostMonthly - totalProfitBeforeFixedCost;
      if (remainingCost <= 0) {
        breakEvenDaysEst = "Đã hòa vốn tháng này!";
      } else {
        var remainingDays = Math.ceil(remainingCost / avgDailyProfit);
        breakEvenDaysEst = "Ước tính hòa vốn sau ~" + remainingDays + " ngày bán hàng nữa";
      }
    }
  }
  
  return {
    result: "success",
    summary: {
      totalRevenue: totalRevenue,
      pendingRevenue: pendingRevenue,
      cancelledRevenue: cancelledRevenue,
      totalOrders: totalOrders,
      statusCounts: statusCounts,
      totalProfitBeforeFixedCost: totalProfitBeforeFixedCost,
      totalProfitAfterFixedCost: totalRevenue - totalIngredientCost - totalFixedCostAllocated,
      totalFixedCostMonthly: totalFixedCostMonthly,
      breakEvenProgress: breakEvenProgress,
      breakEvenDaysEst: breakEvenDaysEst
    },
    dailyStats: dailyList,
    availableMonths: allMonths
  };
}

// Gửi thông báo qua Telegram Bot API (Tùy chọn cấu hình)
function sendTelegramMessage(text) {
  var botToken = ""; // Nhập Token của Telegram Bot tại đây để kích hoạt
  var chatId = "";   // Nhập Chat ID của group Telegram tại đây để kích hoạt
  
  if (botToken && chatId) {
    var url = "https://api.telegram.org/bot" + botToken + "/sendMessage";
    var payload = {
      "chat_id": chatId,
      "text": text,
      "parse_mode": "HTML"
    };
    var options = {
      "method": "post",
      "contentType": "application/json",
      "payload": JSON.stringify(payload),
      "muteHttpExceptions": true
    };
    try {
      UrlFetchApp.fetch(url, options);
    } catch(e) {
      Logger.log("Lỗi gửi tin nhắn Telegram: " + e.toString());
    }
  }
}

// Gửi thông báo qua Discord Webhook API (Tùy chọn cấu hình)
function sendDiscordMessage(embeds) {
  var webhookUrl = "https://discord.com/api/webhooks/1528818352422912184/TOkkQYs0WShyiE01MAHul65Xh6AU7yMWpH0Im8QHoQftHxG11uxtzPfdOPt6Rl70mzMl"; // Nhập URL Discord Webhook tại đây để kích hoạt
  
  if (webhookUrl) {
    var payload = {
      "embeds": embeds
    };
    var options = {
      "method": "post",
      "contentType": "application/json",
      "payload": JSON.stringify(payload),
      "muteHttpExceptions": true
    };
    try {
      UrlFetchApp.fetch(webhookUrl, options);
    } catch(e) {
      Logger.log("Lỗi gửi tin nhắn Discord: " + e.toString());
    }
  }
}

// ========================================================
// HỆ THỐNG VÍ TÍCH LŨY & PHÂN QUYỀN ADMIN - UTILS
// ========================================================

// 1. Tự động kiểm tra và khởi tạo cột "Số dư tích lũy" nếu chưa có
function getOrInitBalanceColumn(loginSheet, optionalHeaders) {
  var headers = optionalHeaders;
  if (!headers) {
    var lastCol = loginSheet.getLastColumn();
    headers = lastCol > 0 ? loginSheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
  }
  var idx = headers.indexOf("Số dư tích lũy");
  if (idx !== -1) {
    return idx + 1; // Trả về 1-indexed
  }
  // Chưa có cột, chèn thêm cột mới ở cuối cùng
  var newColIdx = headers.length + 1;
  loginSheet.getRange(1, newColIdx).setValue("Số dư tích lũy");
  var lastRow = loginSheet.getLastRow();
  if (lastRow > 1) {
    var fillValues = [];
    for (var i = 2; i <= lastRow; i++) {
      fillValues.push([0]); // Điền số dư mặc định = 0
    }
    loginSheet.getRange(2, newColIdx, lastRow - 1, 1).setValues(fillValues);
  }
  return newColIdx;
}

// 2. Tự động kiểm tra và khởi tạo sheet Audit Lịch sử Ví
function getOrInitAuditSheet(ss) {
  var sheet = ss.getSheetByName("Lich-su-vi");
  if (sheet) return sheet;
  // Tạo sheet mới
  sheet = ss.insertSheet("Lich-su-vi");
  sheet.getRange(1, 1, 1, 8).setValues([["Thời gian", "Người thực hiện", "Tài khoản nhận", "Loại giao dịch", "Mã đơn hàng", "Số tiền thay đổi", "Số dư mới", "Lý do / Ghi chú"]]);
  return sheet;
}

// 3. Ghi chép giao dịch ví tích lũy (Audit trail)
function logWalletTransaction(ss, actor, targetUser, type, orderId, amountChange, newBalance, reason) {
  try {
    var sheet = getOrInitAuditSheet(ss);
    var row = [new Date(), actor, targetUser, type, orderId || "", Number(amountChange), Number(newBalance), reason || ""];
    var lastRow = getLastDataRow(sheet);
    sheet.getRange(lastRow + 1, 1, 1, row.length).setValues([row]);
  } catch (e) {
    Logger.log("Lỗi ghi nhật ký giao dịch ví: " + e.toString());
  }
}

// 4. Cộng/trừ số dư ví cho một tài khoản cụ thể
function adjustUserWalletBalance(ss, username, changeAmount, optionalLoginSheet, optionalBalanceColIdx, optionalValues) {
  var loginSheet = optionalLoginSheet || ss.getSheetByName("Dang-nhap");
  var balanceColIdx = optionalBalanceColIdx || getOrInitBalanceColumn(loginSheet);
  var values = optionalValues || loginSheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim().toLowerCase() === String(username).trim().toLowerCase()) {
      var current = Number(values[i][balanceColIdx - 1] || 0);
      var newVal = Math.max(0, current + changeAmount); // Không để ví bị âm
      loginSheet.getRange(i + 1, balanceColIdx).setValue(newVal);
      
      // Đồng bộ giá trị trong mảng optionalValues nếu được truyền vào để các lượt gọi tiếp theo trong cùng phiên có dữ liệu mới
      if (optionalValues) {
        optionalValues[i][balanceColIdx - 1] = newVal;
      }
      return newVal;
    }
  }
  return 0;
}

// 5. Phân tích các thông tin tag trong ghi chú đơn hàng
function parseOrderNoteTags(noteStr) {
  var wallet = 0;
  var user = "";
  
  var walletMatch = noteStr.match(/\[VÍ_TRỪ:\s*(\d+)\]/);
  if (walletMatch) {
    wallet = Number(walletMatch[1]);
  }
  
  var regex = /\[([^\]]+)\]/g;
  var match;
  var tags = [];
  while ((match = regex.exec(noteStr)) !== null) {
    tags.push(match[1]);
  }
  
  for (var i = tags.length - 1; i >= 0; i--) {
    var tag = tags[i].trim();
    if (tag.indexOf("HẸN LẤY:") === -1 && tag.indexOf("GIAO TỚI:") === -1 && tag.indexOf("VÍ_TRỪ:") === -1) {
      user = tag;
      break;
    }
  }
  return { username: user, wallet: wallet };
}


// 6. Tự động kiểm tra và khởi tạo sheet "Roles" với quyền mặc định nếu chưa có
function getOrInitRolesSheet(ss) {
  var sheet = ss.getSheetByName("Roles");
  if (sheet) return sheet;
  
  sheet = ss.insertSheet("Roles");
  var headers = ["Vai trò", "Bán Hàng", "Nhập Kho", "Thống kê", "Đặt Trước", "Quản lý hẹn", "Admin"];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Dữ liệu vai trò mặc định
  var defaultRoles = [
    ["Admin", true, true, true, true, true, true],
    ["Thu ngân", true, false, false, true, true, false],
    ["Nhân viên kho", false, true, false, false, true, false],
    ["Khách đặt trước", false, false, false, true, false, false]
  ];
  sheet.getRange(2, 1, defaultRoles.length, headers.length).setValues(defaultRoles);
  return sheet;
}

// 7. Phân giải quyền (TRUE/FALSE) của vai trò thành chuỗi quyền cách nhau bằng khoảng trắng
function resolvePermissions(ss, roleName) {
  var cleanRoleName = String(roleName || "").trim();
  if (!cleanRoleName) return "";
  
  var rolesSheet = ss.getSheetByName("Roles");
  if (!rolesSheet) {
    rolesSheet = getOrInitRolesSheet(ss);
  }
  
  var values = rolesSheet.getDataRange().getValues();
  var headers = values[0];
  
  // Tìm kiếm vai trò trong sheet Roles
  var roleRowIdx = -1;
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim().toLowerCase() === cleanRoleName.toLowerCase()) {
      roleRowIdx = i;
      break;
    }
  }
  
  var headerToPermissionMap = {
    "QUẢN LÝ VÍ": "Admin",
    "THÔNG KÊ": "Thống kê",
    "THỐNG KÊ": "Thống kê",
    "NHẬP KHO": "Nhập Kho",
    "BÁN HÀNG": "Bán Hàng",
    "QUẢN LÝ PRE-ORDER": "Quản lý hẹn",
    "QUẢN LÝ PRE-O": "Quản lý hẹn",
    "ĐẶT TRƯỚC": "Đặt Trước"
  };
  
  // Nếu tìm thấy, tổng hợp các cột có giá trị true/TRUE/checkbox được tích
  if (roleRowIdx !== -1) {
    var permissions = [];
    var row = values[roleRowIdx];
    for (var col = 1; col < row.length; col++) {
      var isAllowed = row[col] === true || String(row[col]).trim().toUpperCase() === "TRUE";
      if (isAllowed) {
        var headerName = String(headers[col]).trim().toUpperCase();
        var posPermission = headerToPermissionMap[headerName] || headers[col];
        permissions.push(posPermission);
      }
    }
    return permissions.join(" ");
  }
  
  // FALLBACK: Nếu không tìm thấy vai trò trong sheet Roles (Ví dụ vẫn là chuỗi quyền cũ ở sheet Dang-nhap)
  // Trả về chính tên vai trò đó làm chuỗi quyền thô để tương thích ngược hoàn hảo!
  return cleanRoleName;
}
