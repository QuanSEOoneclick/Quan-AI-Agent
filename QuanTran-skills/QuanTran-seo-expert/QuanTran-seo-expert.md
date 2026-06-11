# QuanTran SEO Expert Skill
## Thiết lập lõi: Quy trình & Checklist SEO chuẩn

---
### Metadata
* **Name:** QuanTran SEO Expert
* **Description:** Quy trình & Checklist SEO chuẩn hóa, bao gồm theo dõi thứ hạng từ khóa tự động, tối ưu hóa onpage và kiểm tra cấu trúc y khoa/EEAT cho các dự án thương mại điện tử quy mô lớn.
* **Version:** 1.0.0
* **Author:** Trần Ngọc Hùng Quân (Founder & CEO SEOoneclick / TGDD SEO Leader)
* **Language:** Python
* **Dependencies:** `google-cloud-bigquery`, `openpyxl`, `google-api-python-client`
---

## Hướng dẫn & Quy trình thực hiện (Instructions & Workflows)

### 1. Quy trình đo lường thứ hạng từ khóa (Rank Tracking)
Để tự động theo dõi thứ hạng từ khóa trên Google Search và đồng bộ về BigQuery:
1. Nạp danh sách từ khóa đích từ tệp tin: [Quantran-assets/keyword_template.csv](file:///c:/Users/Quan%20Tran/Documents/GitHub/Nhathuocankhang/QuanTran-skills/QuanTran-seo-expert/Quantran-assets/keyword_template.csv).
2. Thực thi script đo rank: [Quantran-scripts/rank_tracker.py](file:///c:/Users/Quan%20Tran/Documents/GitHub/Nhathuocankhang/QuanTran-skills/QuanTran-seo-expert/Quantran-scripts/rank_tracker.py).
3. Script sẽ ghi lịch sử vị trí từ khóa tự động với độ chính xác 99%.

### 2. Checklist tối ưu SEO Onpage chuẩn
Khi xuất bản hoặc tối ưu hóa bài viết, đảm bảo tuân thủ checklist sau:
* **Heading Structure:** Sử dụng duy nhất một thẻ `<h1>` làm tiêu đề chính. Phân chia nội dung khoa học bằng các thẻ `<h2>`, `<h3>`, `<h4>` tương ứng.
* **Mật độ từ khóa (Keyword Density):** Duy trì mật độ từ khóa chính từ **1% đến 2%** trên toàn bộ văn bản để tránh bộ lọc spam của Google.
* **Thẻ Metadata:** Tự động tạo thẻ Title (dưới 65 ký tự) và Meta Description (dưới 160 ký tự) chứa từ khóa chính ở vị trí đầu.
* **Khắc phục lỗi index GSC:** Xem cẩm nang xử lý tại [Quantran-references/gsc_api_guide.md](file:///c:/Users/Quan%20Tran/Documents/GitHub/Nhathuocankhang/QuanTran-skills/QuanTran-seo-expert/Quantran-references/gsc_api_guide.md) khi phát hiện lỗi lập chỉ mục.
