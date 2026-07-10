# Workspace Rules: Quy trình tạo tài liệu mô tả Task gửi IT từ Figma

Tài liệu này định nghĩa quy trình chuẩn hóa để AI tự động tạo file Word mô tả tính năng gửi phòng IT dựa trên file mẫu và thiết kế Figma của PO/SEOer.

## Quy trình các bước thực hiện:

### 1. Chuẩn bị dữ liệu đầu vào (Phía người dùng)
* **Hình ảnh mockup**: Người dùng chụp/cắt nhỏ các thành phần giao diện cần mô tả trên Figma và lưu vào thư mục dự án (ví dụ `Nhathuocankhang-assets/`).
* **Thông tin cơ bản**:
  * Tên Task.
  * Lead task (Quân - 33397) & Người duyệt (Hưng - 59335).
  * Mục đích task.
  * Phạm vi áp dụng (ID Category, Site ID...).
  * Link thiết kế Figma.

### 2. Prompt kích hoạt AI
Khi người dùng yêu cầu tạo tài liệu mới, AI sẽ dựa trên cấu trúc prompt sau để xử lý:
```markdown
Dựa theo format [File mẫu yêu cầu task.docx] tạo file mô tả task mới:
- Tên Task: [Tên Task]
- Lead task: Quân - 33397
- Người xác nhận: Hưng - 59335
- Mục đích task (3.1): [Mô tả mục đích]
- Phạm vi áp dụng (3.2): [Ngành hàng ID, Site ID]
- Link thiết kế Figma: [Dán link Figma]
- Chi tiết mô tả (3.3): [Mô tả nhanh hoặc cung cấp ảnh chụp từ Figma]
```

### 3. Quy trình xử lý của AI (Chạy ngầm tự động)
1. **Khởi tạo**: Copy file mẫu `.docx` thành một file mới có tên trùng với tên Task.
2. **Điền Metadata**: 
   * Cập nhật Tên Task làm tiêu đề lớn (căn giữa, font to, màu xanh đậm).
   * Điền thông tin Người thực hiện, Người duyệt, Ngày khởi tạo/xác nhận (lấy ngày hiện tại).
   * Cập nhật bảng Lịch sử thay đổi (ghi nhận ngày, tên người thay đổi, mô tả là "Khởi tạo tài liệu").
3. **Mục đích & Phạm vi**: Điền nội dung tương ứng vào mục 3.1 và 3.2.
4. **Phân tích thiết kế & Tạo bảng Rule kỹ thuật (3.3)**:
   * Loại bỏ các đoạn văn bản hướng dẫn mặc định của file mẫu dưới mục 3.3.
   * Tạo một bảng 2 cột (`Hình minh họa` và `Rule kỹ thuật / Mô tả logic`) kế thừa style từ bảng mẫu.
   * **Cột trái**: Điền mô tả chi tiết vị trí cần chèn ảnh Figma tương ứng.
   * **Cột phải**: Tự động phân tích và sinh ra các rule kỹ thuật dạng gạch đầu dòng ngắn gọn (gồm: vị trí hiển thị, logic hiển thị/ẩn, hoạt động tương tác click/hover, responsive trên Desktop và Mobile).
5. **Hoàn tất**: Lưu file `.docx` và cung cấp đường dẫn tải file trực quan cho người dùng.
