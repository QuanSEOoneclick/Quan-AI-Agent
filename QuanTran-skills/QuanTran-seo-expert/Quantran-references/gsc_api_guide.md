# Cẩm nang khắc phục lỗi chỉ mục Google Search Console (GSC)
## Người thực hiện: Trần Ngọc Hùng Quân

Tài liệu này tổng hợp các lỗi lập chỉ mục phổ biến trong Google Search Console, kèm theo các bước và API dùng để khắc phục tự động trên hệ thống.

---

### 1. Discovered - currently not indexed (Đã phát hiện - hiện chưa lập chỉ mục)
* **Mô tả:** Google đã tìm thấy trang web nhưng chưa quét (crawl) nội dung, thường do máy chủ bị quá tải hoặc trang web vượt quá ngân sách thu thập dữ liệu (crawl budget).
* **Các bước khắc phục:**
  1. Kiểm tra cấu trúc liên kết nội bộ: Đảm bảo trang mới được liên kết từ các trang danh mục lớn có độ uy tín cao.
  2. Gửi tín hiệu cập nhật sitemap qua API: `https://www.google.com/ping?sitemap=<sitemap_url>`
  3. Sử dụng Google Search Console API để kiểm tra URL cụ thể và gửi yêu cầu lập chỉ mục tự động.

### 2. Crawled - currently not indexed (Đã thu thập dữ liệu - hiện chưa lập chỉ mục)
* **Mô tả:** Google đã quét qua trang nhưng quyết định không đưa vào chỉ mục tìm kiếm. Lỗi này thường do nội dung mỏng (thin content), trùng lặp thông tin hoặc chất lượng chưa đạt yêu cầu.
* **Các bước khắc phục:**
  1. Nâng cấp chất lượng nội dung: Đảm bảo thông tin y khoa chính xác, độc nhất (>90% độ độc nhất) và có cấu trúc rõ ràng.
  2. Bổ sung đa phương tiện: Tạo và nhúng thêm file Audio y khoa hoặc thiết kế Infographic tóm tắt ở đầu bài viết để tăng điểm chất lượng.
  3. Gửi yêu cầu lập chỉ mục lại sau khi nội dung đã được cập nhật.

### 3. Duplicate, Google chose different canonical than user (Trùng lặp, Google chọn canonical khác với người dùng)
* **Mô tả:** Google bỏ qua thẻ canonical do người dùng khai báo và tự chọn một URL khác mà họ cho là chuẩn hơn.
* **Các bước khắc phục:**
  1. Kiểm tra URL hiện tại và URL canonical mà Google tự chọn để tìm nguyên nhân trùng lặp.
  2. Điều chỉnh lại toàn bộ liên kết nội bộ hướng về đúng URL canonical mong muốn của doanh nghiệp.
  3. Sử dụng redirect 301 nếu các URL trùng lặp cũ không còn giá trị sử dụng.
