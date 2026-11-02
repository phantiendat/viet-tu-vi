# Quy trình Việt hóa gọn cho nhóm nhỏ — bắt buộc kiểm định Jev-web

Trạng thái: **quy trình đề xuất**, chưa có dữ liệu dịch mẫu được chấm Jev và chưa phát hành bản dịch. Định hướng: **không dùng Weblate**, dùng GitHub + bảng thuật ngữ + duyệt từng đợt.

## Người tham gia

- **Người dịch/AI dịch:** tạo bản dịch ba phần (nguyên văn Trung; bản Việt sát nghĩa; diễn giải dễ hiểu), không tự sửa thuật toán.
- **Người soát thuật ngữ:** so khớp thuật ngữ dự án và chỉ rõ dị bản; một người có thể kiêm người dịch nhưng phải xem lại bản đối chiếu.
- **ChatGPT + Jev-web:** làm kiểm định độc lập trước phát hành, với dữ liệu và các câu hỏi độc lập.
- **Người phụ trách phát hành:** duyệt các trường hợp bị treo và kết luận phát hành; Jev không được tự merge/publish.

## Quy trình 7 bước

1. **Nhận mẫu nguyên bản**: chọn 50 thuật ngữ + 20 đoạn luận giải đại diện; ghi chính xác đường dẫn, commit SHA, định danh đoạn. Chỉ dùng nội dung được phép khai thác theo giấy phép.
2. **Chuẩn hóa thuật ngữ**: lấy `iztro/src/i18n/locales/vi-VN` làm nguồn tham khảo ban đầu; so với `HAHVAC/CEStu-vi-ai/lib/ziwei/han-viet.ts`. Bất đồng (vd: 子女 = Tử Nữ/Tử Tức; 凤阁 = Phụng/Phượng Các) phải được người duyệt chọn, giữ alias và nguồn. Không xem bất kỳ từ điển nào là chân lý tuyệt đối.
3. **Dịch hai lớp**: (A) bản dịch sát nghĩa/chuyên môn; (B) diễn giải ngắn gọn cho độc giả phổ thông, giải thích thuật ngữ ở lần đầu. Không biến suy luận cổ truyền thành khẳng định thực tế.
4. **Kiểm tra xác định bằng code**: thiếu khóa dịch, chuỗi nguồn không truy được, thuật ngữ không thống nhất, ký tự tiếng Trung còn sót trong trường Việt, thay đổi JSON thuật toán, đoạn khác input -> BLOCK/RETURN. Không giao cho Jev kiểm chứng các điều kiện có thể so khớp tuyệt đối.
5. **Checkpoint Jev-web (BẮT BUỘC)**: gửi nguyên văn + hai lớp dịch + glossary khóa (không gửi thông tin cá nhân) cho `jev_evaluate` theo [JEV_TRANSLATION_GATE.md](JEV_TRANSLATION_GATE.md). Cần **sự đồng ý riêng cho từng đợt phát sinh phí**, kiểm tra service trước. Kết quả lưu như evidence, không tự cho PASS nếu kết nối lỗi, hết hạn mức, thiếu ngữ cảnh hoặc chưa được phép tính phí.
6. **Review cuối và sửa**: so chéo đoạn Jev gắn cờ, câu nhạy cảm, các thuật ngữ tranh luận, câu khó hiểu. Sửa xong phải chạy lại các kiểm tra chịu ảnh hưởng và checkpoint Jev trước khi xuất bản.
7. **Xuất bản có dấu vết**: chỉ khi tất cả điều kiện cứng PASS, Jev theo luật gate PASS, người phụ trách duyệt, có bản ghi nguồn + thuật ngữ + evidence + commit. Đầu ra gồm nguyên văn Trung, Hán–Việt, nghĩa dễ hiểu (chỉ hiển thị nguyên văn cho người dùng khi họ yêu cầu/xem chi tiết). Ghi công và nêu tính chất tham khảo truyền thống.

## Bảng công việc tối giản (Markdown hoặc CSV trong repo)

Mỗi dòng một đoạn hoặc thuật ngữ:
`id | source_ref | source_sha | source_zh | translation_hv | plain_vi | glossary_version | rule_check | jev_review | human_review | reviewer | status`

Trạng thái: `DRAFT` → `TERM_REVIEW` → `RULE_CHECK` → `JEV_REVIEW` → `HUMAN_REVIEW` → `APPROVED` → `PUBLISHED`, hoặc `BLOCKED`.

Nhóm ít người chỉ cần chỉnh file Markdown/CSV hoặc trả lời trong PR. Không cần cài Weblate, TMS hay dịch vụ SaaS khác.

## Phạm vi, quyền và riêng tư

- Giữ raw tiếng Trung làm **khóa tính toán**; lớp dịch chỉ phục vụ hiển thị. Không copy-paste nguyên engine cũ từ CEStu-vi-ai vì lệch phiên bản mã nguồn.
- Không tự dịch hàng loạt bộ dataset trước khi phân loại giấy phép; các trích dẫn từ bài giảng có quyền sử dụng riêng.
- Chỉ gửi **đoạn văn công khai hoặc dữ liệu đã ẩn danh** qua Jev. Không gửi tên thật, ngày giờ sinh cá nhân, khóa API hoặc repo tư nhân.
- Jev là **phép đánh giá mô hình**, không phải kiểm chứng học thuật. Các điểm cao không chứng minh một nhận định tử vi là đúng.
- Mọi sửa đổi bên ngoài nhánh tài liệu đều cần PR riêng, chạy test và so sánh mệnh bàn trước/sau.

## Tài liệu liên quan

- [Thuật ngữ](TERMINOLOGY.md)
- [Ma trận kiểm thử](TEST_MATRIX.md)
- [Quy định checkpoint Jev](JEV_TRANSLATION_GATE.md)
