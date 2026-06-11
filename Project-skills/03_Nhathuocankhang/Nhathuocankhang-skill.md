# Nhathuocankhang Project Skill
## Tri thức sản phẩm dược & Quy định kiểm duyệt nội dung y tế

---
### Metadata
* **Name:** Nhathuocankhang Project Skill
* **Description:** Quy chuẩn nội dung Y khoa (YMYL) dành riêng cho website nhathuocankhang.com, bao gồm tự động quét lỗi chính tả biệt dược và kiểm tra tuân thủ thuật toán Google E-E-A-T.
* **Version:** 1.0.0
* **Author:** Trần Ngọc Hùng Quân (TGDD SEO Leader)
* **Language:** Python
* **Dependencies:** `re`, `json`
---

## Hướng dẫn & Quy trình thực hiện (Instructions & Workflows)

### 1. Quy định kiểm duyệt nội dung y tế (YMYL & E-E-A-T)
Mọi nội dung liên quan đến thuốc, điều trị và bệnh lý phải tuân thủ nghiêm ngặt quy định pháp luật ngành dược và tiêu chí E-E-A-T:
* **Tác giả chuyên môn:** Bắt buộc có thông tin và mã số chứng chỉ của Dược sĩ/Bác sĩ duyệt bài.
* **Tài liệu kiểm chứng:** Trích dẫn liên kết ngoài tới các website chính thống của Bộ Y Tế Việt Nam (moh.gov.vn) hoặc Tổ chức Y tế Thế giới (who.int).
* Xem checklist chi tiết tại [Nhathuocankhang-references/eeat_guidelines.md](file:///c:/Users/Quan%20Tran/Documents/GitHub/Nhathuocankhang/project-skills/03_Nhathuocankhang/Nhathuocankhang-references/eeat_guidelines.md).

### 2. Tự động kiểm tra chính tả biệt dược
Để giảm thiểu sai sót kỹ thuật trong tên thuốc khi viết bài:
1. Đọc danh mục biệt dược chuẩn tại [Nhathuocankhang-assets/med_groups_sample.json](file:///c:/Users/Quan%20Tran/Documents/GitHub/Nhathuocankhang/project-skills/03_Nhathuocankhang/Nhathuocankhang-assets/med_groups_sample.json).
2. Thực thi script quét chính tả: [Nhathuocankhang-scripts/spell_check_meds.py](file:///c:/Users/Quan%20Tran/Documents/GitHub/Nhathuocankhang/project-skills/03_Nhathuocankhang/Nhathuocankhang-scripts/spell_check_meds.py).
3. Script sẽ phân tích văn bản bài viết thô và cảnh báo các từ viết sai lệch so với danh mục chuẩn của Bộ Y Tế.
4. Đảm bảo tỷ lệ chính xác y khoa đạt **100%** trước khi trình Bác sĩ duyệt chốt trên Dashboard.
