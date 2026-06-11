# QuanTran Data Automation Skill
## Thiết lập lõi: Cú pháp hàm & Tư duy cấu trúc Database

---
### Metadata
* **Name:** QuanTran Data Automation
* **Description:** Đồng bộ dữ liệu tự động qua API, quản trị và khai thác Google BigQuery ở quy mô doanh nghiệp, và hướng dẫn thiết lập hàm AppSheet/Google Apps Script tối ưu hóa cơ sở dữ liệu.
* **Version:** 1.0.0
* **Author:** Trần Ngọc Hùng Quân (Founder & CEO SEOoneclick / TGDD SEO Leader)
* **Language:** Python, JavaScript
* **Dependencies:** `google-cloud-bigquery`, `google-api-python-client`
---

## Hướng dẫn & Quy trình thực hiện (Instructions & Workflows)

### 1. Đồng bộ dữ liệu GSC lên BigQuery (GSC API Sync)
Để đồng bộ dữ liệu trạng thái chỉ mục từ Search Console về kho dữ liệu BigQuery:
1. Đảm bảo cấu hình file key bảo mật BigQuery tại dự án. Xem tài liệu tham khảo: [Quantran-references/bigquery_setup_guide.md](file:///c:/Users/Quan%20Tran/Documents/GitHub/Nhathuocankhang/QuanTran-skills/QuanTran-data-automation/Quantran-references/bigquery_setup_guide.md).
2. Thực thi script đồng bộ: [Quantran-scripts/gsc_bq_sync.py](file:///c:/Users/Quan%20Tran/Documents/GitHub/Nhathuocankhang/QuanTran-skills/QuanTran-data-automation/Quantran-scripts/gsc_bq_sync.py).
3. Script sẽ tự động gọi GSC URL Inspection API và nạp dữ liệu vào bảng `seo_data.gsc_index_status`.

### 2. Tư duy cấu trúc Database và hàm AppSheet
Khi thiết lập hoặc tối ưu hóa AppSheet Database cho dự án:
* **Mô hình Quản lý Sản phẩm 3 cấp:** 
  1. *Cấp 1 (Ngành hàng/Category):* Lưu thông tin phân loại lớn.
  2. *Cấp 2 (Nhóm hàng/Sub-category):* Chia nhỏ theo đặc tính kỹ thuật.
  3. *Cấp 3 (Sản phẩm/SKU):* Chi tiết sản phẩm cụ thể.
* **Tối ưu hóa hàm AppSheet:** Sử dụng các biểu thức tối ưu như `SELECT()`, `FILTER()`, `LOOKUP()` thay vì viết lồng quá nhiều lớp `IFS()` để giảm thời gian đồng bộ dữ liệu.
