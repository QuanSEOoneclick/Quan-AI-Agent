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
          var roleArr = [];
          for (var col = 2; col < loginData[i].length; col++) {
            if (loginData[i][col]) {
              roleArr.push(String(loginData[i][col]).trim());
            }
          }
          var role = roleArr.join(" ");
          return ContentService.createTextOutput(JSON.stringify({"result": "success", "username": displayName, "role": role}))
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
      
      for (var i = 1; i < values.length; i++) {
        var rowOrderId = String(values[i][11]).trim(); // Cột L - orderId
        if (rowOrderId === orderId) {
          sheet.getRange(i + 1, 13).setValue(newStatus); // Cột M - Trạng thái đơn hàng (Cột 13)
          if (newStatus === "Thành công") {
            sheet.getRange(i + 1, 1).setValue(new Date()); // Cập nhật thời gian ở cột A
          }
          updatedCount++;
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
    
    // 3. XỬ LÝ GHI NHẬN ĐƠN HÀNG (Vào sheet "Thong_ke")
    var orderSheet = ss.getSheetByName("Thong_ke");
    if (!orderSheet) {
      return ContentService.createTextOutput(JSON.stringify({"result": "error", "message": "Không tìm thấy sheet Thong_ke"}))
                           .setMimeType(ContentService.MimeType.JSON);
    }
    
    var orderId = "ORD-" + new Date().getTime();
    var orderMode = data.orderMode || "Đơn lẻ";
    var statusVal = (orderMode.indexOf("Đặt trước") !== -1) ? "Chờ nhận nước" : "Thành công";
    
    // Gắn currentUser vào Ghi chú để tiện lọc
    var finalNote = data.note || "";
    if (data.currentUser) {
      finalNote += " [" + data.currentUser + "]";
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
          data.payment, 
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
        data.payment, 
        finalNote,
        orderId,
        statusVal
      ]);
    }
    
    // Thực hiện chèn hàng loạt (Bulk Write) bằng setValues - Cực kỳ nhanh!
    if (rowsToInsert.length > 0) {
      var lastRow = getLastDataRow(orderSheet);
      orderSheet.getRange(lastRow + 1, 1, rowsToInsert.length, rowsToInsert[0].length).setValues(rowsToInsert);
      
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
      
      // Nếu là đặt trước, gửi thông báo Telegram
      if (orderMode.indexOf("Đặt trước") !== -1) {
        var msg = "🔔 <b>ĐƠN ĐẶT TRƯỚC MỚI</b>\n" +
                  "• <b>Chi nhánh:</b> " + warehouse + "\n" +
                  "• <b>Khách hàng:</b> " + String(data.seller).replace("Khách: ", "") + "\n" +
                  "• <b>Ghi chú:</b> " + (data.note || "Không") + "\n" +
                  "• <b>Mã đơn:</b> <code>" + orderId + "</code>\n" +
                  "• <b>Chi tiết món:</b>\n";
                  
        var totalVal = 0;
        if (data.items && data.items.length > 0) {
          data.items.forEach(function(item) {
            msg += "  + " + item.coffeeType + " (" + item.size + ") x " + item.quantity + "\n";
            totalVal += item.price * item.quantity;
          });
        } else {
          msg += "  + " + data.coffeeType + " (" + data.size + ") x " + data.quantity + "\n";
          totalVal = (data.price || 0) * (data.quantity || 1);
        }
        msg += "• <b>Tổng tiền:</b> " + totalVal.toLocaleString('vi-VN') + "đ (" + (data.payment || "Tiền mặt") + ")";
        sendTelegramMessage(msg);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({"result": "success", "orderId": orderId}))
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
