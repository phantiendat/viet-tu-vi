# Ma trận kiểm thử cho bản Việt hóa — V00

> Chỉ là **thiết kế ca thử**, chưa chạy kiểm thử, chưa xác nhận tính đúng của lịch âm Việt Nam hay lá số. Trước khi thay thuật toán phải tạo baseline cho upstream.

## A. Bất biến cần giữ

- Cùng một đầu vào và cùng cấu hình trường phái phải tạo ra cùng JSON mệnh bàn, không phụ thuộc ngôn ngữ hiển thị.
- Đổi ngôn ngữ không thay đổi 12 cung, chính tinh, phụ tinh, Tứ Hóa, đại hạn.
- Mọi chênh lệch giữa lịch âm Việt Nam và Trung Quốc được gắn nguồn đối chiếu và ghi rõ phương án xử lý.
- Không có chế độ nào tự động biến giờ sinh không rõ thành một lá số chắc chắn; nếu dùng giờ Tý làm giả định phải hiển thị cảnh báo.
- Quy tắc giờ Tý muộn và tháng nhuận phải được lựa chọn tường minh, có thể tái lập và kiểm thử.

## B. Bảng ca kiểm thử

| Mã | Đầu vào / điều kiện | Điều cần xác minh | Kết quả |
| --- | --- | --- | --- |
| VN-TZ-01 | Người sinh Việt Nam, múi giờ UTC+7, kinh độ 105°E | Thành phần hiệu chỉnh kinh độ là 0 phút; phần phương trình thời gian tính riêng | Chưa chạy |
| VN-TZ-02 | Cùng giờ đồng hồ, kinh độ Tây/Đông kinh tuyến 105°E | Dấu hiệu chỉnh kinh độ đúng và tính nhất quán giữa form/engine | Chưa chạy |
| VN-TZ-03 | Giờ 22:59, 23:00, 00:59, 01:00 | Chỉ số giờ chi đúng tại ranh giới theo chính sách đã chọn | Chưa chạy |
| VN-TZ-04 | Giờ hiệu chỉnh qua 00:00 hoặc 23:59 | Xác định ngày trước/sau, không mất ngày gốc, không sửa ngày âm thầm | Chưa chạy |
| VN-TZ-05 | Hai ngày liên tiếp quanh giao thừa, năm thường/năm nhuận | Không sai ngày do JS Date và chuyển múi giờ | Chưa chạy |
| VN-TZ-06 | Thời điểm sinh lịch sử có thay đổi UTC offset/giờ mùa hè | Không suy diễn UTC+7 cố định cho mọi thời kỳ; xử lý theo nguồn lịch sử | Chưa chạy |
| VN-LUN-01 | Tết Việt Nam 17/02/2007 và Tết Trung Quốc 18/02/2007 | Kiểm chứng trường hợp lịch hai nước khác ngày tại nguồn âm lịch tin cậy | Chưa chạy |
| VN-LUN-02 | Sinh trong tháng âm nhuận | Chính sách split/next-month/prev-month/origin-month có đầu vào và expected riêng | Chưa chạy |
| VN-LUN-03 | Cuối tháng 29 ngày, đầu tháng mới | Đảm bảo không sinh ngày âm không tồn tại | Chưa chạy |
| VN-LUN-04 | Ngày bắt đầu/kết thúc 1900 và 2026 | Ranh giới dữ liệu lịch và năm cho phép nhập | Chưa chạy |
| VN-I18N-01 | Đổi zh-CN ↔ vi-VN với cùng input | Hash JSON engine trước/sau giống hệt | Chưa chạy |
| VN-I18N-02 | Mỗi cung và sao có nhãn Việt | Không nhầm alias (交友/仆役), không mất sao khi thiếu bản dịch | Chưa chạy |
| VN-CHART-01 | Cặp lá số tham chiếu nam/nữ cùng ngày giờ | So 12 cung, chính tinh, phụ tinh, Tứ Hóa và đại hạn | Chưa chạy |
| VN-CHART-02 | Cặp lá số ở ranh giới tiết khí / giờ Tý / tháng nhuận | Ghi rõ khác biệt và quy tắc trước khi chọn expected | Chưa chạy |
| VN-BUILD-01 | CI trên nhánh Việt hóa | npm ci, npm run typecheck, npm test, npm run build | Chưa chạy |

## C. Mẫu evidence

Mỗi ca kiểm thử sau khi triển khai phải có:
- Tên ca, mã commit, trường phái/cấu hình, múi giờ, ngày/giờ/nơi sinh, kinh độ và nguồn đối chiếu.
- Input và output thô (JSON), expected độc lập, diff; không chỉ ảnh chụp UI.
- PASS / FAIL / BLOCKED với giải thích; không chuyển BLOCKED thành PASS.
- Với lá số nhạy cảm về giờ sinh, lưu tối thiểu dữ liệu cần kiểm thử và dùng dữ liệu giả lập khi có thể.

## D. Điều kiện Go/No-Go

- **Go cho bản UI tiếng Việt:** tất cả kiểm thử nguyên trạng engine + i18n bất biến PASS; không có nhãn tiếng Trung bị lọt trên luồng MVP.
- **Go cho tính lá số theo lịch Việt:** có golden cases độc lập cho lịch Việt, múi giờ, giờ Tý và tháng nhuận; diff rõ ràng với upstream.
- **No-Go:** mất cung/sao, đổi kết quả khi chỉ đổi ngôn ngữ, sai múi giờ/qua ngày, hoặc chưa xác minh nguồn lịch.
- **AI interpretation:** kiểm tra giấy phép từng bộ dữ liệu, nguồn dẫn và cách diễn đạt trước khi phát hành.
