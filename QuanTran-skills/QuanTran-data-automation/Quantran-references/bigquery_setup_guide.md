# Hướng dẫn thiết lập và kết nối Google BigQuery & GSC API
## Người thực hiện: Trần Ngọc Hùng Quân

Tài liệu này hướng dẫn cách kết nối và khai thác dữ liệu từ Google Search Console API và Google BigQuery phục vụ cho việc lưu trữ dữ liệu SEO tập trung.

---

### 1. Tạo và cấu hình Google Cloud Project (GCP)
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/).
2. Tạo một Project mới hoặc chọn Project hiện có (Ví dụ: `trim-odyssey-326012`).
3. Kích hoạt (Enable) các API sau:
   * **BigQuery API**
   * **Google Search Console API**
   * **Google Search Console URL Inspection API**

### 2. Tạo Service Account & Tải Key JSON
1. Truy cập **IAM & Admin > Service Accounts**.
2. Bấm **Create Service Account**, đặt tên (Ví dụ: `bigquery-seo-sync`).
3. Cấp quyền: **BigQuery Admin** (hoặc BigQuery Data Editor & Job User).
4. Vào mục **Keys > Add Key > Create new key**, chọn định dạng **JSON** và tải về.
5. Đổi tên file key thành `bigquery_key.json` và lưu trữ an toàn trong dự án (Đừng đẩy file key thực tế lên Github công khai!).

### 3. Phân quyền trong Google Search Console
1. Truy cập Google Search Console của website cần theo dõi.
2. Vào **Settings > Users and permissions**.
3. Bấm **Add User**, nhập email của Service Account vừa tạo ở bước 2.
4. Cấp quyền **Full** hoặc **Owner** để Service Account có quyền gọi URL Inspection API.

### 4. Cấu hình bảng dữ liệu BigQuery
Tạo dataset `seo_data` và bảng `gsc_index_status` với cấu trúc (Schema) mẫu:
* `check_time` (TIMESTAMP): Thời gian chạy kiểm tra.
* `url` (STRING): Đường dẫn URL được kiểm tra.
* `indexing_verdict` (STRING): Kết luận lập chỉ mục (PASS/FAIL).
* `coverage_state` (STRING): Chi tiết lỗi (Ví dụ: *Crawled - currently not indexed*).
