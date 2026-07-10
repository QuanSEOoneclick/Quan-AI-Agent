# QuanTran SEO Expert Skill
## Thiết lập lõi: Quy trình & Checklist SEO chuẩn

---
### Metadata
* **Name:** QuanTran SEO Expert
* **Description:** Quy trình & Checklist SEO chuẩn hóa, bao gồm theo dõi thứ hạng từ khóa tự động, tối ưu hóa onpage, quản lý cấu trúc sản phẩm và giải quyết lỗi lập chỉ mục.
* **Version:** 1.1.0
* **Author:** Trần Ngọc Hùng Quân (Founder & CEO SEOoneclick / TGDD SEO Leader)
* **Language:** Python
* **Dependencies:** `google-cloud-bigquery`, `openpyxl`, `google-api-python-client`
---

## Hướng dẫn & Quy trình thực hiện (Instructions & Workflows)

### 1. Quy trình đo lường thứ hạng từ khóa (Rank Tracking)
Để tự động theo dõi thứ hạng từ khóa trên Google Search và đồng bộ về BigQuery:
1. Nạp danh sách từ khóa đích từ tệp tin: [Quantran-assets/keyword_template.csv](file:///c:/Users/Quan%20Tran/Documents/GitHub/Quan-AI-Agent/QuanTran-skills/QuanTran-seo-expert/Quantran-assets/keyword_template.csv).
2. Thực thi script đo rank: [Quantran-scripts/rank_tracker.py](file:///c:/Users/Quan%20Tran/Documents/GitHub/Quan-AI-Agent/QuanTran-skills/QuanTran-seo-expert/Quantran-scripts/rank_tracker.py).
3. Script sẽ ghi lịch sử vị trí từ khóa tự động với độ chính xác 99%.

### 2. Checklist tối ưu SEO Onpage chuẩn
Khi xuất bản hoặc tối ưu hóa bài viết, đảm bảo tuân thủ checklist sau:
* **Heading Structure:** Sử dụng duy nhất một thẻ `<h1>` làm tiêu đề chính. Phân chia nội dung khoa học bằng các thẻ `<h2>`, `<h3>`, `<h4>` tương ứng.
* **Mật độ từ khóa (Keyword Density):** Duy trì mật độ từ khóa chính từ **1% đến 2%** trên toàn bộ văn bản để tránh bộ lọc spam của Google.
* **Thẻ Metadata:** Tự động tạo thẻ Title (dưới 65 ký tự) và Meta Description (dưới 160 ký tự) chứa từ khóa chính ở vị trí đầu.
* **Khắc phục lỗi index GSC:** Xem cẩm nang xử lý tại [Quantran-references/gsc_api_guide.md](file:///c:/Users/Quan%20Tran/Documents/GitHub/Quan-AI-Agent/QuanTran-skills/QuanTran-seo-expert/Quantran-references/gsc_api_guide.md) khi phát hiện lỗi lập chỉ mục.

### 3. Thông tin Năng lực & Kinh nghiệm SEO (SEO Competencies & Background)
Thông tin hồ sơ chuyên môn của tác giả Trần Ngọc Hùng Quân (Xem chi tiết bản lưu tại [Quantran-references/tran_ngoc_hung_quan_bio.md](file:///c:/Users/Quan%20Tran/Documents/GitHub/Quan-AI-Agent/QuanTran-skills/QuanTran-seo-expert/Quantran-references/tran_ngoc_hung_quan_bio.md)):
* **Kinh nghiệm thực chiến:** Hơn 10 năm kinh nghiệm trong ngành SEO. Đảm nhiệm vị trí **SEO Leader tại Tập đoàn Thế Giới Di Động (TGDD)**, trực tiếp quản lý và tối ưu hóa SEO thành công cho các website TMĐT hàng đầu: `thegioididong.com`, `dienmayxanh.com`, `avakids.com`, `nhathuocankhang.com`, `topzone.vn`.
* **Kỹ năng chuyên môn:**
  * Khai thác chuyên sâu các công cụ SEO hàng đầu: `Ahrefs`, `SEMrush`, `KeywordTool`, `Google Analytics`, `Google Search Console`.
  * Phân tích dữ liệu logic từ GA/GSC để thiết kế chiến lược SEO traffic lớn.
  * Xây dựng quy trình, đào tạo nhân sự và dẫn dắt đội ngũ SEO chuyên nghiệp.
* **Giải pháp độc quyền:**
  * **Hệ thống đo Rank tự động:** Tool/script đo rank từ khóa tự động quy mô lớn (>10.000 từ khóa), độ chính xác 99%.
  * **Mô hình quản lý sản phẩm 3 cấp:** Giải pháp cấu trúc danh mục sản phẩm thông minh chuẩn SEO, giúp tiết kiệm thời gian vận hành và tối ưu hóa thu thập dữ liệu (crawlability).

