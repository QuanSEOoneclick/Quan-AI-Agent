# Nhathuocankhang Project Skill
## Tri thức sản phẩm dược & Quy định kiểm duyệt nội dung y tế

---
### Metadata
* **Name:** Nhathuocankhang Project Skill
* **Description:** Quy chuẩn nội dung Y khoa (YMYL) dành riêng cho website nhathuocankhang.com, bao gồm tự động quét lỗi chính tả biệt dược, kiểm tra tuân thủ thuật toán Google E-E-A-T và cấu trúc danh mục ngành hàng y khoa.
* **Version:** 1.1.0
* **Author:** Trần Ngọc Hùng Quân (TGDD SEO Leader)
* **Language:** Python
* **Dependencies:** `re`, `json`
---

## Hướng dẫn & Quy trình thực hiện (Instructions & Workflows)

### 1. Quy định kiểm duyệt nội dung y tế (YMYL & E-E-A-T)
Mọi nội dung liên quan đến thuốc, điều trị và bệnh lý phải tuân thủ nghiêm ngặt quy định pháp luật ngành dược và tiêu chí E-E-A-T:
* **Tác giả chuyên môn:** Bắt buộc có thông tin và mã số chứng chỉ của Dược sĩ/Bác sĩ duyệt bài.
* **Tài liệu kiểm chứng:** Trích dẫn liên kết ngoài tới các website chính thống của Bộ Y Tế Việt Nam (moh.gov.vn) hoặc Tổ chức Y tế Thế giới (who.int).
* Xem checklist chi tiết tại [Nhathuocankhang-references/eeat_guidelines.md](file:///c:/Users/Quan%20Tran/Documents/GitHub/Quan-AI-Agent/Project-skills/03_Nhathuocankhang/Nhathuocankhang-references/eeat_guidelines.md).

### 2. Tự động kiểm tra chính tả biệt dược
Để giảm thiểu sai sót kỹ thuật trong tên thuốc khi viết bài:
1. Đọc danh mục biệt dược chuẩn tại [Nhathuocankhang-assets/med_groups_sample.json](file:///c:/Users/Quan%20Tran/Documents/GitHub/Quan-AI-Agent/Project-skills/03_Nhathuocankhang/Nhathuocankhang-assets/med_groups_sample.json).
2. Thực thi script quét chính tả: [Nhathuocankhang-scripts/spell_check_meds.py](file:///c:/Users/Quan%20Tran/Documents/GitHub/Quan-AI-Agent/Project-skills/03_Nhathuocankhang/Nhathuocankhang-scripts/spell_check_meds.py).
3. Script sẽ phân tích văn bản bài viết thô và cảnh báo các từ viết sai lệch so với danh mục chuẩn của Bộ Y Tế.
4. Đảm bảo tỷ lệ chính xác y khoa đạt **100%** trước khi trình Bác sĩ duyệt chốt trên Dashboard.

### 3. Bản đồ Tri thức Ngành hàng & Y khoa (Medical & Product Domain Map)
Để đảm bảo tính chính xác và chiều sâu kiến thức chuyên môn khi triển khai nội dung SEO hoặc tối ưu hóa trải nghiệm người dùng, nhóm phát triển cần nắm vững bản đồ ngành hàng và sản phẩm đang kinh doanh tại An Khang.
* **Các ngành hàng gốc chính:**
  * **Thuốc (ETC & OTC):** Gồm 61 phân nhóm điều trị. Chú ý các nhóm thuốc về Ung thư/miễn dịch (`Xtandi`, `Advagraf`), Tim mạch/huyết áp (`Actelsar`, `Aceronko`), Trĩ/giãn tĩnh mạch (`Phlebodia 600mg`, `Daflon`), Kháng sinh (`Agicipro`), và Dạ dày (`Agimepzol`).
  * **Thực phẩm chức năng (TPCN):** Hỗ trợ gan (`Blackmores Milk Thistle`), Hỗ trợ xương khớp (`Bách Niên Kiện`), Hỗ trợ tim mạch (`Nattoenzym`), Bổ não, Tăng sinh lý, Nội tiết và Vitamin & khoáng chất.
  * **Thiết bị & Dụng cụ y tế:** Các thiết bị theo dõi sức khỏe như Máy đo huyết áp (`AND`, `Omron`), Máy đo/que thử đường huyết (`Accu-Chek Instant`), Nhiệt kế hồng ngoại (`Microlife`, `Jumper`), Máy đo SpO2, Máy xông khí dung và các dụng cụ bông băng y tế.
  * **Mỹ phẩm & Chăm sóc cá nhân:** Chăm sóc răng miệng (`Sensodyne Repair & Protect`), Kem chống nắng (`Sunplay Skin Aqua`), v.v.
  * **Chăm sóc trẻ em:** Sữa tắm, phấn thơm, kem chống hăm cho bé.
* **Chi tiết toàn bộ danh mục, thương hiệu đối tác lớn và bảng hoạt chất cốt lõi:**
  * Xem tài liệu phân tích hệ thống tại [Nhathuocankhang-references/nhathuocankhang_categories_map.md](file:///c:/Users/Quan%20Tran/Documents/GitHub/Quan-AI-Agent/Project-skills/03_Nhathuocankhang/Nhathuocankhang-references/nhathuocankhang_categories_map.md).

