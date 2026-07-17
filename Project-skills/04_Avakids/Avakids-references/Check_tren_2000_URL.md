# Hướng Dẫn Kiểm Tra Index Danh Sách URL Lớn Hơn 2000 Bằng GSC Multi-Property (Avakids)

Tài liệu này hướng dẫn chi tiết cách chạy script [Allsite-inspect_gsc_urls.py](file:///c:/Users/Quan%20Tran/Documents/GitHub/Quan-AI-Agent/Project-skills/04_Avakids/Avakids-references/Allsite-inspect_gsc_urls.py) để kiểm tra trạng thái lập chỉ mục (index/noindex) của danh sách URL lớn hơn 2000 từ website Avakids mà không bị giới hạn hạn ngạch (quota 2,000 lượt/ngày của một property đơn lẻ) bằng kỹ thuật phân luồng GSC property và quản lý quota thông minh.

---

## 1. Cơ Chế Đồng Bộ & Cập Nhật Dữ Liệu Tự Động
Sau khi chạy hoàn tất hoặc khi chạm hạn ngạch (quota limit) trong ngày, script sẽ tự động ghi đè/cập nhật dữ liệu vào các file sau:

*   **File Excel Gốc: [All_URL_Kids.xlsx](file:///c:/Users/Quan%20Tran/Documents/GitHub/Quan-AI-Agent/Project-skills/04_Avakids/Avakids-references/All_URL_Kids.xlsx)** – Cột B, C, D của cả 2 sheet `Sheet1` và `Sheet2` sẽ được tự động điền thông tin:
    *   **Cột B (`trạng thái`):** Trạng thái lập chỉ mục của URL (`Index`, `Noindex`, hoặc `Chưa check` nếu chưa quét).
    *   **Cột C (`Tên Property`):** Phân loại property đã thực thi kiểm tra cho URL đó (`Blog` hoặc `Sản Phẩm`).
    *   **Cột D (`Thời gian cào`):** Thời gian gần nhất mà Google bot đã cào (crawl) URL này, lấy từ trường `lastCrawlTime` của GSC API (định dạng: `YYYY-MM-DD HH:MM:SS`).
*   **File CSV Báo Cáo Tổng Hợp: [Avakids_checkindex.csv](file:///c:/Users/Quan%20Tran/Documents/GitHub/Quan-AI-Agent/Project-skills/04_Avakids/Avakids-references/Avakids_checkindex.csv)** – Chứa danh sách tổng hợp tất cả các URL đã gộp trùng từ Excel kèm trạng thái quét chi tiết dưới dạng 4 cột tương tự.
*   **Báo Cáo URL Lỗi Noindex: [\[AVAKIDS\]ALL-KW-Status.xlsx](file:///c:/Users/Quan%20Tran/Documents/GitHub/Quan-AI-Agent/Project-skills/04_Avakids/Avakids-references/%5BAVAKIDS%5DALL-KW-Status.xlsx)** – File Excel chứa riêng danh sách các URL bị lỗi `Noindex` kèm cột lý do chi tiết (`coverageState`) để gửi cho đội kỹ thuật xử lý.
*   **File Cache Lịch Sử: [inspect_cache.json](file:///c:/Users/Quan%20Tran/Documents/GitHub/Quan-AI-Agent/Project-skills/04_Avakids/Avakids-references/inspect_cache.json)** – Lưu trữ lịch sử quét để các lần chạy sau bỏ qua các URL đã kiểm tra thành công, tránh lãng phí hạn ngạch API.

---

## 2. Quy Tắc Phân Luồng & Ưu Tiên Quota (Load Balancing)

Để tránh vượt quá hạn mức 2,000 URL/ngày cho mỗi property, script thực hiện phân phối danh sách URL cần kiểm tra theo thuật toán:

1.  **Phân nhóm tự nhiên:**
    *   URL chứa `/me-va-be` $\rightarrow$ Luồng **Blog** (GSC Property: `https://www.avakids.com/me-va-be/`)
    *   URL còn lại $\rightarrow$ Luồng **Sản Phẩm** (GSC Property mặc định: `https://www.avakids.com/`)
2.  **Giới hạn & Lập lịch Ưu tiên:**
    *   Property **Blog** được chạy tối đa **2,000 URL** trong ngày.
    *   Nếu danh sách cần check của Blog vượt quá 2,000:
        *   **Ưu tiên 1:** Phần URL dư thừa (từ index 2000 trở đi) sẽ được chuyển sang định tuyến chạy trên property **Sản Phẩm** (Main).
        *   **Ưu tiên 2:** Sau khi xử lý xong Ưu tiên 1, nếu property **Sản Phẩm** vẫn còn dư hạn ngạch (dưới 2,000), hệ thống sẽ tiếp tục chạy nốt danh sách các URL Sản phẩm mặc định còn lại.
3.  **Lưu Property thực tế chạy:**
    *   Khi URL Blog bị đẩy sang chạy ở property Sản phẩm, thuộc tính `"inspected_under_property"` trong cache sẽ được cập nhật là cổng Sản phẩm, và file CSV cột C sẽ hiển thị chính xác là `Sản Phẩm`.

---

## 3. Quy Trình Chạy Kiểm Tra Chi Tiết (Từng Bước)

Để chạy kiểm tra index cho các lần sau, bạn chỉ cần thực hiện theo các bước đơn giản dưới đây:

### Bước 1: Chuẩn bị tệp tin đầu vào
*   Cập nhật danh sách các URL cần quét vào file Excel: [All_URL_Kids.xlsx](file:///c:/Users/Quan%20Tran/Documents/GitHub/Quan-AI-Agent/Project-skills/04_Avakids/Avakids-references/All_URL_Kids.xlsx)
*   Bạn có thể nhập URL vào `Sheet1` (Sản phẩm hoặc tổng hợp) và `Sheet2` (Blog). Cột A phải chứa đường link URL (bắt đầu bằng `http` hoặc `https`).

### Bước 2: Đảm bảo thông tin xác thực tài khoản
*   Đảm bảo file key JSON của Google Service Account được đặt tại: [gsc_key.json](file:///c:/Users/Quan%20Tran/Documents/GitHub/Quan-AI-Agent/Project-skills/04_Avakids/Avakids-references/gsc_key.json)
*   *Lưu ý:* Service account email (`id-3397-avakids@electric-medium-300108.iam.gserviceaccount.com`) phải có quyền đọc (Viewer/Owner) đối với cả 2 property:
    1.  `https://www.avakids.com/`
    2.  `https://www.avakids.com/me-va-be/`

### Bước 3: Thực thi quét bằng file kích hoạt nhanh
Bạn có hai cách để chạy script:
*   **Cách 1 (Kích hoạt nhanh bằng 1 click - KHUYÊN DÙNG):** Double-click (nhấp đúp chuột) vào file [run_inspect.bat](file:///c:/Users/Quan%20Tran/Documents/GitHub/Quan-AI-Agent/Project-skills/04_Avakids/Avakids-references/run_inspect.bat). File này sẽ tự động mở màn hình dòng lệnh.
*   **Cách 2 (Chạy qua terminal/command line):** Mở terminal tại thư mục dự án và chạy dòng lệnh:
    ```bash
    py -u "c:\Users\Quan Tran\Documents\GitHub\Quan-AI-Agent\Project-skills\04_Avakids\Avakids-references\Allsite-inspect_gsc_urls.py"
    ```

Khi chạy, script sẽ hiển thị thông báo hỏi lựa chọn chế độ chạy:
`Bạn muốn chạy từ đầu hay tiếp tục? (tu dau / tiep tuc):`

*   **Trả lời "từ đầu"** (nhập `từ đầu`, `tu dau` hoặc `1`):
    *   Hệ thống sẽ tự động gán lại trạng thái ở cột B (`trạng thái`) của tất cả các URL trong file Excel đầu vào là `Chưa check` và xóa trắng các cột C, D.
    *   Đồng thời reset file cache lịch sử và chạy lại toàn bộ danh sách URL từ đầu.
*   **Trả lời "tiếp tục"** (nhập `tiếp tục`, `tiep tuc` hoặc `2`):
    *   Hệ thống giữ nguyên các kết quả đã check trước đó.
    *   Chỉ lọc và thực hiện kiểm tra cho các URL đang có trạng thái `Chưa check` (hoặc trống) ở cột B của file Excel.

> [!NOTE]
> **Theo dõi tiến độ trực quan:** Trong suốt quá trình quét, phần trăm (%) hoàn thành và số lượng URL đã xử lý (`[đã hoàn thành/tổng số URL]`) sẽ được cập nhật liên tục trực tiếp lên thanh tiêu đề cửa sổ dòng lệnh (title bar của CMD/PowerShell hoặc tiêu đề tab terminal trong VS Code) để theo dõi tiến độ dễ dàng mà không bị trôi thông tin.

### Bước 4: Xem kết quả báo cáo
*   Sau khi chạy xong hoặc khi hết hạn ngạch API, mở trực tiếp file [All_URL_Kids.xlsx](file:///c:/Users/Quan%20Tran/Documents/GitHub/Quan-AI-Agent/Project-skills/04_Avakids/Avakids-references/All_URL_Kids.xlsx) để kiểm tra các thông tin cập nhật ở cột B, C, D.
*   File báo cáo [\[AVAKIDS\]ALL-KW-Status.xlsx](file:///c:/Users/Quan%20Tran/Documents/GitHub/Quan-AI-Agent/Project-skills/04_Avakids/Avakids-references/%5BAVAKIDS%5DALL-KW-Status.xlsx) sẽ được cập nhật để chỉ chứa các URL bị lỗi `Noindex`.

---

## 4. Tích Hợp Báo Cáo Tự Động Qua LINE Messaging API
Script hỗ trợ gửi báo cáo kết quả quét tự động về chat LINE cá nhân hoặc nhóm của bạn sau khi kết thúc lượt chạy.

### Các bước cấu hình:
1. Mở file script [Allsite-inspect_gsc_urls.py](file:///c:/Users/Quan%20Tran/Documents/GitHub/Quan-AI-Agent/Project-skills/04_Avakids/Avakids-references/Allsite-inspect_gsc_urls.py).
2. Điền thông tin cấu hình thu thập được từ LINE Developers Console vào mục `Configurations` (dòng 27-28):
   - `LINE_CHANNEL_ACCESS_TOKEN`: Dán đoạn mã **Channel access token (long-lived)**.
   - `LINE_TARGET_ID`: Dán mã **User ID** (bắt đầu bằng `U...`) hoặc **Group ID** (bắt đầu bằng `C...`) của bạn.
3. Lưu file script lại. Ở lần chạy kế tiếp, kết quả tổng quan về số lượng URL Indexed, Noindex, quét mới... sẽ tự động được gửi qua LINE.
