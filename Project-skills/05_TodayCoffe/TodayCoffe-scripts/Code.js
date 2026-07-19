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
          var role = String(loginData[i][2] || "").trim();
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

    // 2.7. XỬ LÝ LẤY DỮ LIỆU THỐNG KÊ (Cho Web POS)
    if (data.action === "getAnalytics") {
      var warehouse = data.warehouse || "TC01";
      var monthFilter = data.month || "";
      var dateFilter = data.date || "";
      var analyticsResult = getAnalyticsData(ss, warehouse, monthFilter, dateFilter);
      return ContentService.createTextOutput(JSON.stringify(analyticsResult))
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
  var totalIngredientCost = 0;
  var totalFixedCostAllocated = 0;
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
    
    // Đọc doanh thu (Cột I, chỉ số 8) và Chi phí cố định (Cột AC, chỉ số 28)
    var revenue = Number(row[8] || 0);
    var fixedCostAlloc = Number(row[28] || 0);
    
    // Tính tổng chi phí nguyên liệu (Cột N đến X, chỉ số từ 13 đến 23)
    var ingredientCost = 0;
    for (var col = 13; col <= 23; col++) {
      ingredientCost += Number(row[col] || 0);
    }
    
    if (!dailyStats[dateKey]) {
      dailyStats[dateKey] = {
        date: dateKey,
        revenue: 0,
        ingredientCost: 0,
        fixedCostAllocated: 0
      };
    }
    
    dailyStats[dateKey].revenue += revenue;
    dailyStats[dateKey].ingredientCost += ingredientCost;
    dailyStats[dateKey].fixedCostAllocated += fixedCostAlloc;
    
    totalRevenue += revenue;
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
