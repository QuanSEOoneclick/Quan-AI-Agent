# Hướng Dẫn Kiểm Tra Index Danh Sách URL Lớn Hơn 2000 Bằng GSC Multi-Property

Tài liệu này hướng dẫn chi tiết cách chạy script [Allsite-inspect_gsc_urls.py](file:///c:/Users/Quan%20Tran/Documents/GitHub/Quan-AI-Agent/Project-skills/01_Thanhthaimotor/Thanhthaimotor-references/Allsite-inspect_gsc_urls.py) để kiểm tra trạng thái lập chỉ mục (index/noindex) của danh sách URL lớn hơn 2000 mà không bị giới hạn hạn ngạch (quota 2,000 lượt/ngày của một property đơn lẻ) bằng kỹ thuật phân luồng GSC property và quản lý quota thông minh.

---

## 1. Cấu trúc File Dữ Liệu Đầu Ra (CSV)
Sau khi chạy, script sẽ tự động ghi đè và cập nhật kết quả vào file [Thanhthaimotor_checkindex.csv](file:///c:/Users/Quan%20Tran/Documents/GitHub/Quan-AI-Agent/Project-skills/01_Thanhthaimotor/Thanhthaimotor-references/Thanhthaimotor_checkindex.csv) với cấu trúc đúng 4 cột:

*   **Cột A: `URLs check`** – Danh sách URL trang web cần quét.
*   **Cột B: `trạng thái`** – Trạng thái lập chỉ mục của URL (`Index`, `Noindex`, hoặc `Chưa check` nếu chưa quét).
*   **Cột C: `Tên Property`** – Phân loại property đã thực thi kiểm tra cho URL đó (`Blog`, `Video`, hoặc `Sản Phẩm`).
*   **Cột D: `Thời gian cào`** – Thời gian gần nhất mà Google bot đã cào (crawl) URL này, lấy từ trường `lastCrawlTime` của GSC API (định dạng: `YYYY-MM-DD HH:MM:SS`).

---

## 2. Quy Tắc Phân Luồng & Ưu Tiên Quota (Load Balancing)

Để tránh vượt quá hạn mức 2,000 URL/ngày cho mỗi property, script thực hiện phân phối danh sách URL cần kiểm tra theo thuật toán:

1.  **Phân nhóm tự nhiên:**
    *   URL chứa `/kien-thuc-dien-co` $\rightarrow$ Luồng **Blog** (GSC Property: `https://thanhthaimotor.com/kien-thuc-dien-co/`)
    *   URL chứa `/video/` $\rightarrow$ Luồng **Video** (GSC Property: `https://thanhthaimotor.com/video/`)
    *   URL còn lại $\rightarrow$ Luồng **Sản Phẩm** (GSC Property mặc định: `https://thanhthaimotor.com/`)
2.  **Giới hạn & Lập lịch Ưu tiên:**
    *   Property **Blog** và **Video** được chạy tối đa **2,000 URL** mỗi bên.
    *   Nếu danh sách cần check của Blog hoặc Video vượt quá 2,000:
        *   **Ưu tiên 1:** Phần URL dư thừa (từ index 2000 trở đi) sẽ được chuyển sang định tuyến chạy trên property **Sản Phẩm** (Main).
        *   **Ưu tiên 2:** Sau khi xử lý xong Ưu tiên 1, nếu property **Sản Phẩm** vẫn còn dư hạn ngạch (dưới 2,000), hệ thống sẽ tiếp tục chạy nốt danh sách các URL Sản phẩm mặc định còn lại.
3.  **Lưu Property thực tế chạy:**
    *   Khi URL Blog bị đẩy sang chạy ở property Sản phẩm, thuộc tính `"inspected_under_property"` trong cache sẽ được cập nhật là cổng Sản phẩm, và file CSV cột C sẽ hiển thị chính xác là `Sản Phẩm`.

---

## 3. Các Bước Chuẩn Bị & Thực Thi Quét

### Bước 1: Kiểm tra cấu trúc File đầu vào
Đảm bảo file đầu vào được đặt tại:
*   [Thanhthaimotor_checkindex.csv](file:///c:/Users/Quan%20Tran/Documents/GitHub/Quan-AI-Agent/Project-skills/01_Thanhthaimotor/Thanhthaimotor-references/Thanhthaimotor_checkindex.csv)
*   *Lưu ý:* Cột đầu tiên (Cột A) phải là URL cần quét, dòng đầu tiên phải là tiêu đề.

### Bước 2: Đảm bảo thông tin xác thực tài khoản
Đảm bảo file key JSON của Google Service Account được đặt tại:
*   [bigquery_key.json](file:///c:/Users/Quan%20Tran/Documents/GitHub/Quan-AI-Agent/Project-skills/01_Thanhthaimotor/Thanhthaimotor-references/bigquery_key.json)
*   *Lưu ý:* Service account email (`quantran24211@trim-odyssey-326012.iam.gserviceaccount.com`) phải có quyền đọc/kiểm tra chỉ mục trên cả 3 properties tương ứng trong GSC console.

### Bước 3: Chạy Script
Chạy script kiểm tra ở chế độ unbuffered bằng Python:
```bash
py -u "c:\Users\Quan Tran\Documents\GitHub\Quan-AI-Agent\Project-skills\01_Thanhthaimotor\Thanhthaimotor-references\Allsite-inspect_gsc_urls.py"
```

### Bước 4: Chọn phương thức chạy (Tiếp tục hoặc Từ đầu)
Khi chạy, script sẽ hiển thị thông báo hỏi lựa chọn chế độ chạy:
`Bạn muốn chạy từ đầu hay tiếp tục? (tu dau / tiep tuc):`

*   **Trả lời "từ đầu"** (nhập `từ đầu`, `tu dau` hoặc `1`):
    *   Hệ thống sẽ tự động gán lại trạng thái ở cột B (`trạng thái`) của tất cả các URL trong file đầu vào là `Chưa check` và xóa trắng các cột C, D.
    *   Đồng thời reset file cache lịch sử và chạy lại toàn bộ danh sách URL từ đầu.
*   **Trả lời "tiếp tục"** (nhập `tiếp tục`, `tiep tuc` hoặc `2` hoặc nhấn Enter):
    *   Hệ thống giữ nguyên các kết quả đã check trước đó.
    *   Chỉ lọc và thực hiện kiểm tra cho các URL đang có trạng thái `Chưa check` (hoặc trống) ở cột B của file.

### Bước 5: Cách thức cập nhật dữ liệu tự động
*   Script tự động tải file cache [inspect_cache.json](file:///c:/Users/Quan%20Tran/Documents/GitHub/Quan-AI-Agent/Project-skills/01_Thanhthaimotor/Thanhthaimotor-references/inspect_cache.json).
*   Sau khi chạy xong, script tự động ghi đè kết quả cập nhật 4 cột vào file CSV và xuất danh sách các URL lỗi `Noindex` ra báo cáo Excel [\[TTMT\]ALL-KW-Status.xlsx](file:///c:/Users/Quan%20Tran/Documents/GitHub/Quan-AI-Agent/Project-skills/01_Thanhthaimotor/Thanhthaimotor-references/\[TTMT\]ALL-KW-Status.xlsx).
