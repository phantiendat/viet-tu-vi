# Bộ thuật ngữ Việt Tử Vi — bản nền V00

> Chỉ dùng cho **hiển thị**. Không đổi các giá trị mà `iztro`, cấu hình trường phái hay bộ máy an sao sử dụng để tính toán. Đây là danh sách khởi tạo; thuật ngữ có dị bản cần được đánh giá trước khi gộp.

## 12 cung

| Khóa gốc (zh-CN) | Nhãn vi-VN |
| --- | --- |
| 命宫 | Mệnh |
| 兄弟宫 | Huynh Đệ |
| 夫妻宫 | Phu Thê |
| 子女宫 | Tử Tức |
| 财帛宫 | Tài Bạch |
| 疾厄宫 | Tật Ách |
| 迁移宫 | Thiên Di |
| 交友宫 | Nô Bộc (Giao Hữu) |
| 官禄宫 | Quan Lộc |
| 田宅宫 | Điền Trạch |
| 福德宫 | Phúc Đức |
| 父母宫 | Phụ Mẫu |

**Ghi chú:** `仆役` và `交友` có thể cùng chỉ cung Nô Bộc/Giao Hữu trong các nguồn. Dùng khóa có chuẩn hóa và lưu alias, không dựa vào việc thay chuỗi tự do.

## Chính tinh

| zh-CN | vi-VN | zh-CN | vi-VN |
| --- | --- | --- | --- |
| 紫微 | Tử Vi | 天机 | Thiên Cơ |
| 太阳 | Thái Dương | 武曲 | Vũ Khúc |
| 天同 | Thiên Đồng | 廉贞 | Liêm Trinh |
| 天府 | Thiên Phủ | 太阴 | Thái Âm |
| 贪狼 | Tham Lang | 巨门 | Cự Môn |
| 天相 | Thiên Tướng | 天梁 | Thiên Lương |
| 七杀 | Thất Sát | 破军 | Phá Quân |

## Phụ tinh & thuật ngữ thường gặp

| zh-CN | vi-VN |
| --- | --- |
| 文昌 | Văn Xương |
| 文曲 | Văn Khúc |
| 左辅 | Tả Phụ |
| 右弼 | Hữu Bật |
| 天魁 | Thiên Khôi |
| 天钺 | Thiên Việt |
| 禄存 | Lộc Tồn |
| 天马 | Thiên Mã |
| 擎羊 | Kình Dương |
| 陀罗 | Đà La |
| 火星 | Hỏa Tinh |
| 铃星 | Linh Tinh |
| 地空 | Địa Không |
| 地劫 | Địa Kiếp |
| 红鸾 | Hồng Loan |
| 天喜 | Thiên Hỷ |
| 化禄 | Hóa Lộc |
| 化权 | Hóa Quyền |
| 化科 | Hóa Khoa |
| 化忌 | Hóa Kỵ |
| 大限 | Đại Hạn |
| 流年 | Lưu Niên |
| 命主 | Mệnh Chủ |
| 身主 | Thân Chủ |
| 五行局 | Cục Ngũ Hành |
| 真太阳时 | Giờ mặt trời thật |
| 农历 | Âm lịch |
| 公历 | Dương lịch |

## Thiên can, địa chi

- Thiên can: 甲 Giáp; 乙 Ất; 丙 Bính; 丁 Đinh; 戊 Mậu; 己 Kỷ; 庚 Canh; 辛 Tân; 壬 Nhâm; 癸 Quý.
- Địa chi: 子 Tý; 丑 Sửu; 寅 Dần; 卯 Mão; 辰 Thìn; 巳 Tỵ; 午 Ngọ; 未 Mùi; 申 Thân; 酉 Dậu; 戌 Tuất; 亥 Hợi.
- Trạng thái sao: 庙 Miếu; 旺 Vượng; 得 Đắc; 利 Lợi; 平 Bình; 陷 Hãm. Các trạng thái `不`, `闲`, `地` cần đối chiếu theo bảng độ sáng và quy ước trường phái trước khi chốt nhãn tiếng Việt.

## Quy tắc triển khai

1. Từ điển tách riêng theo loại: `palaces`, `stars`, `stems`, `branches`, `labels`, `brightness`.
2. Duy trì giá trị raw gốc trong mô hình dữ liệu; mọi chuỗi hiển thị được lấy qua formatter `toVietnameseLabel(raw, category)`.
3. Không tự động dịch nội dung luận giải bằng quy tắc `replaceAll`; dùng đơn vị dịch có ngữ cảnh và review.
4. Nếu thiếu khóa, hiển thị raw và ghi danh sách chưa dịch trong báo cáo; tuyệt đối không trả chuỗi rỗng làm mất sao/cung.
5. Việc chuyển đổi thuật ngữ **không được thay đổi** kết quả mệnh bàn JSON, an sao hoặc Tứ Hóa.
