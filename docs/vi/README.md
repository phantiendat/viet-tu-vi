# Việt Tử Vi — Kế hoạch khởi tạo bản Việt hóa

> Trạng thái: **ĐỀ XUẤT / CHƯA TRIỂN KHAI**. Tài liệu này không khẳng định hệ thống hiện tại đã lập lá số chuẩn Việt Nam. Repo là fork của [Renhuai123/ziwei-doushu](https://github.com/Renhuai123/ziwei-doushu).

## Mục tiêu

Xây dựng ứng dụng Tử Vi Đẩu Số tiếng Việt trên mã nguồn hiện có, ưu tiên **tính đúng và kiểm chứng được** trước khi mở rộng giao diện hoặc luận giải AI.

## Nguyên tắc không thay đổi

1. **Không dịch, thay tên hay sửa dữ liệu khóa nội bộ** trong `lib/ziwei/*` chỉ để Việt hóa; sử dụng lớp chuyển đổi dữ liệu hiển thị.
2. **Không tự động coi hệ lịch Việt Nam và Trung Quốc là hoàn toàn giống nhau.** Cần adapter lịch âm Việt Nam, nguồn đối chiếu và kiểm thử các năm có khác biệt.
3. **Không dùng kinh tuyến 120°E / UTC+8 cho giờ sinh tại Việt Nam.** Với giờ chuẩn Việt Nam hiện hành dùng UTC+7 (420 phút), kinh tuyến múi giờ 105°E; nhưng phải tách trường hợp lịch sử và nơi sinh ở nước ngoài.
4. **Không tự ý áp dụng giờ mặt trời thật cho mọi người dùng.** Cho phép tùy chọn, hiển thị giờ gốc, thời gian hiệu chỉnh, quy tắc giờ Tý và thay đổi ngày.
5. **Không thay đổi quy tắc an sao / trường phái mà chưa có đối chiếu lá số chuẩn.** Giữ cấu hình mặc định của upstream cho đến khi có quyết định có căn cứ.
6. **Bảo toàn giấy phép và ghi công upstream.** Mã nguồn theo LICENSE; dữ liệu theo DATASET-LICENSE; trích dẫn bài giảng có giới hạn quyền riêng.
7. **Tử vi là hệ thống diễn giải truyền thống**, không trình bày luận giải như dự đoán khoa học, chẩn đoán y tế hoặc tư vấn tài chính.

## Phạm vi kỹ thuật theo từng đợt

| Đợt | Hạng mục | Tiêu chí hoàn tất |
| --- | --- | --- |
| V01 — Audit | Khóa baseline, chạy typecheck/test/build, ghi lại commit và lỗi sẵn có | Có bằng chứng CI và danh mục lỗi |
| V02 — i18n | Thiết kế `vi-VN` + thuật ngữ Hán–Việt + giao diện biểu mẫu | Không còn tiếng Trung trong các màn hình MVP; thuật toán giữ nguyên |
| V03 — Địa điểm & múi giờ | Dữ liệu tỉnh/thành Việt Nam, kinh độ; nguồn đồng hồ giờ sinh; xử lý UTC+7 và trường hợp lịch sử | Kiểm thử trường hợp giờ sát ranh giới, qua ngày |
| V04 — Lịch Việt | Thêm adapter âm lịch Việt Nam; đối chiếu ngày/tháng nhuận và sai khác lịch Trung Quốc | Có golden cases và báo cáo sai khác |
| V05 — Đối chiếu an sao | So với lá số tham chiếu theo trường phái Việt Nam được chọn | Bảng kiểm chứng 12 cung, chính tinh, tứ hóa, đại hạn |
| V06 — Giải đoán | Dịch nội dung có kiểm soát và ghi nguồn; đánh giá AI riêng | Không đưa luận giải thiếu nguồn/không được cấp phép vào sản phẩm |

## Các điểm mã nguồn cần kiểm tra trước khi sửa

- `components/BirthForm.tsx`: biểu mẫu còn tiếng Trung; tính giờ hiển thị bằng `(longitude - 120) * 4`, danh sách tỉnh Trung Quốc, tiêu đề giờ Bắc Kinh.
- `lib/ziwei/true-solar-time.ts`: đã có `utcOffsetMinutes`; nên tái sử dụng thay vì viết lại thuật toán.
- `lib/ziwei/clock-adjust.ts`: chuyển giờ đồng hồ sang giờ chuẩn; không tự động sửa ngày.
- `lib/ziwei/lunar-solar.ts` và `lib/ziwei/algorithm.ts`: phụ thuộc `lunar-javascript`, `iztro`, xử lý tháng nhuận/trường phái; cần adapter và golden tests thay vì sửa trực tiếp theo suy đoán.
- `lib/ziwei/constants.ts`, `components/ChartBoard.tsx`, `components/PalaceCell.tsx`: tạo lớp từ điển thuật ngữ hiển thị.
- `app/layout.tsx`: hiện là `lang="zh-CN"`, cần thay đổi khi có `vi-VN`.
- `package.json`: tên gói hiện là `ziwei-master`; đổi tên ở một PR riêng và kiểm tra lockfile.

## Cửa kiểm soát

**Không gộp thay đổi thuật toán chỉ vì giao diện đã hiển thị tiếng Việt.** PR có sửa kết quả lá số phải kèm ca kiểm thử, baseline trước/sau và giải thích quy tắc. Mọi khác biệt giữa các trường phái phải được ghi nhận, không tự tuyên bố trường phái nào đúng.

Tài liệu kèm theo: [Thuật ngữ](TERMINOLOGY.md) · [Ma trận kiểm thử](TEST_MATRIX.md).
