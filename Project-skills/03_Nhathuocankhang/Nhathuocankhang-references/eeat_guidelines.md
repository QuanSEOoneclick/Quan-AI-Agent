# Checklist quy chuẩn chất lượng Google E-E-A-T cho nội dung Y khoa
## Áp dụng cho website: nhathuocankhang.com
## Người thực hiện: Trần Ngọc Hùng Quân (SEO Leader)

Để duy trì vị thế dẫn đầu trên kết quả tìm kiếm của Google đối với các truy vấn liên quan đến sức khỏe và dược phẩm (YMYL - Your Money Your Life), toàn bộ nội dung xuất bản phải tuân thủ nghiêm ngặt checklist E-E-A-T dưới đây.

---

### 1. Experience (Kinh nghiệm thực tế)
* **Quy tắc:** Nội dung bài viết cần thể hiện các góc nhìn thực tế, hướng dẫn sử dụng thuốc hoặc lời khuyên lâm sàng trực quan, tránh các bài viết lý thuyết suông được xào nấu lại từ mạng.
* **Cách triển khai:**
  * Tự động thêm các hộp thông tin nổi bật "Lời khuyên của Dược sĩ" (Pharmacist's Advice) trong bài viết.
  * Tích hợp trình phát âm thanh (Audio Player - AI Voice) để người dùng có thể nghe bài viết trong lúc làm việc khác, tối ưu hóa trải nghiệm người dùng đa kênh.

### 2. Expertise (Tính chuyên môn)
* **Quy tắc:** Mỗi bài viết giới thiệu thuốc hoặc bệnh lý bắt buộc phải được biên soạn hoặc kiểm duyệt bởi chuyên gia y tế (bác sĩ, dược sĩ) có chứng chỉ hành nghề rõ ràng.
* **Cách triển khai:**
  * Tự động khai báo cấu trúc dữ liệu tác giả kiểm duyệt (`Author Schema`) bằng JSON-LD trong mã nguồn.
  * Hiển thị khối thông tin (Bio) giới thiệu về Bác sĩ/Dược sĩ kiểm duyệt ở đầu hoặc cuối bài viết kèm liên kết đến chứng chỉ ngành.

### 3. Authoritativeness (Tính thẩm quyền)
* **Quy tắc:** Nội dung y khoa phải trích dẫn nguồn từ các cơ quan y tế chính thống để đảm bảo độ tin cậy của thông tin.
* **Cách triển khai:**
  * Thiết lập liên kết ngoài (External Link) trích dẫn nguồn từ Bộ Y Tế Việt Nam (moh.gov.vn) hoặc Tổ chức Y tế Thế giới (who.int) hoặc Cục quản lý Thực phẩm và Dược phẩm Hoa Kỳ (fda.gov) bằng các thẻ cấu hình chuẩn SEO.

### 4. Trustworthiness (Tính đáng tin cậy) - Cốt lõi của E-E-A-T
* **Quy tắc:** Mọi thông tin y khoa phải chính xác 100%. Bất kỳ lỗi sai lệch thông tin hoặc hiện tượng AI tự bịa đặt (hallucination) nào cũng sẽ dẫn đến việc website bị phạt rớt hạng ngay lập tức.
* **Cách triển khai:**
  * Áp dụng quy trình kiểm duyệt bắt buộc (Human-in-the-loop): Bác sĩ hoặc Dược sĩ duyệt trực tiếp trên Dashboard tập trung trước khi xuất bản bài viết lên trang web.
  * Tự động gắn thuộc tính `dateLastReviewed` (Ngày kiểm duyệt cuối cùng) vào mã nguồn Schema để báo hiệu cho Google biết thông tin luôn được cập nhật mới nhất.
