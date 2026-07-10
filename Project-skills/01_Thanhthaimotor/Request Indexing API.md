# Hướng Dẫn Chạy Google Indexing API Gửi Yêu Cầu Lập Chỉ Mục Hàng Loạt

Tài liệu này hướng dẫn chi tiết cách chạy script [gsc_indexing_api_submit.py](file:///c:/Users/Quan%20Tran/Documents/GitHub/Quan-AI-Agent/Project-skills/01_Thanhthaimotor/Thanhthaimotor-references/gsc_indexing_api_submit.py) để tự động gửi yêu cầu lập chỉ mục hàng loạt thông qua API chính thức của Google, áp dụng cho các URL đang bị lỗi `Noindex` trên website **Thanhthaimotor**.

---

## 1. Cơ Chế Hoạt Động & Quản Lý Trạng Thái (CSV)

Script sử dụng thuật toán thông minh để đọc, lọc và cập nhật file dữ liệu [Thanhthaimotor_checkindex.csv](file:///c:/Users/Quan%20Tran/Documents/GitHub/Quan-AI-Agent/Project-skills/01_Thanhthaimotor/Thanhthaimotor-references/Thanhthaimotor_checkindex.csv) với cấu trúc 5 cột:

*   **Cột A: `URLs check`** – URL trang web.
*   **Cột B: `trạng thái`** – Giữ nguyên trạng thái (`Index` hoặc `Noindex` - không tự ý thay đổi).
*   **Cột C: `Tên Property`** – GSC property tương ứng.
*   **Cột D: `Thời gian cào`** – Giữ nguyên thời gian cào thực tế từ GSC (không bị ghi đè).
*   **Cột E: `Google Indexing`** – Trạng thái gửi API (`Đã chạy Google Indexing API` hoặc `Chưa chạy Google Indexing API`).

Chi tiết xử lý:
1.  **Lọc dữ liệu thông minh**: Script chỉ chọn các URL thỏa mãn đồng thời 2 điều kiện:
    *   **Cột B (`trạng thái`)** có giá trị là `Noindex`.
    *   **Cột E (`Google Indexing`)** chưa có giá trị là `Đã chạy Google Indexing API` (giúp tránh gửi trùng lặp).
2.  **Cập nhật trạng thái an toàn**:
    *   Khi gửi thành công một URL, script chỉ cập nhật cột E thành **`Đã chạy Google Indexing API`**. Các cột A, B, C, D hoàn toàn không bị ảnh hưởng.
    *   Script lưu file CSV tăng tiến (Incremental save) ngay sau mỗi lần gửi thành công để đảm bảo không bị mất tiến trình nếu bị gián đoạn.

---

## 2. Các Bước Chuẩn Bị & Thực Thi

### Bước 1: Kiểm tra tài khoản Service Account
Đảm bảo file key JSON của Google Service Account được đặt tại:
*   [bigquery_key.json](file:///c:/Users/Quan%20Tran/Documents/GitHub/Quan-AI-Agent/Project-skills/01_Thanhthaimotor/Thanhthaimotor-references/bigquery_key.json)
*   *Lưu ý quan trọng:* Email Service Account (`quantran24211@trim-odyssey-326012.iam.gserviceaccount.com`) phải được phân quyền là **Chủ sở hữu (Owner)** hoặc **Chủ sở hữu được ủy quyền (Delegated Owner)** của các property tương ứng trong GSC Console.

### Bước 2: Chạy Script
Mở PowerShell hoặc Command Prompt và chạy lệnh dưới đây:
```bash
py -u "c:\Users\Quan Tran\Documents\GitHub\Quan-AI-Agent\Project-skills\01_Thanhthaimotor\Thanhthaimotor-references\gsc_indexing_api_submit.py"
```

### Bước 3: Nhập số lượng giới hạn chạy (Batch limit)
Khi terminal xuất hiện dòng yêu cầu:
`Enter max number of URLs to submit in this run (default 200, max 200 for daily quota limit):`
*   Hãy nhập số lượng URL bạn muốn chạy cho lượt này (ví dụ: `200`).
*   Nhấn **Enter** để bắt đầu chạy tự động.

---

## 3. Quản Lý Hạn Ngạch (Quota) Mỗi Ngày
*   Hạn ngạch mặc định của Google Indexing API là **200 URL/ngày** cho một Service Account.
*   Hạn ngạch này sẽ được Google đặt lại tự động sau mỗi **24 giờ**.
*   Khi chạy hết hạn ngạch ngày, script sẽ nhận dạng lỗi `429 Quota Exceeded` từ Google, thông báo kết quả và tự động dừng lại một cách an toàn. Bạn có thể tiếp tục chạy phần URL còn lại vào ngày hôm sau.
