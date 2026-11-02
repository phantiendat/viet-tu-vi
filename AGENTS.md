# AGENTS.md — Việt Tử Vi

## Mục tiêu
Việt hóa ứng dụng Tử Vi Đẩu Số để thuật ngữ đúng ngữ cảnh và người Việt phổ thông hiểu được, không làm thay đổi engine an sao chỉ vì đổi ngôn ngữ.

## Quy định bắt buộc cho mọi agent
- Đọc `docs/vi/TRANSLATION_WORKFLOW.md`, `docs/vi/JEV_TRANSLATION_GATE.md`, `docs/vi/TERMINOLOGY.md` trước mọi công việc Việt hóa.
- **Không dùng Weblate**; nhóm dịch nhỏ dùng GitHub Markdown/CSV và PR.
- Không thay `lib/ziwei` raw data / can chi / hệ quy tắc bằng nhãn Việt; dịch chỉ ở presentation/formatting layer; giữ bảng so sánh nguyên bản.
- Không nhập đè `HAHVAC/CEStu-vi-ai` lên engine hiện tại; chỉ tham khảo bản dịch đã đối chiếu.
- Trước khi phát hành **mọi đợt dịch** phải chạy deterministic checks, checkpoint **Jev-web** và có kết luận người duyệt. Jev không tự quyết merge/release.
- Kiểm tra `jev_status` và skill `typesafe-ai`; `jev_evaluate` là cuộc gọi trả phí, **không gọi khi người dùng chưa cho phép rõ ràng cho đợt đó**, không gửi PII, secrets. Nếu chưa thể gọi, ghi HOLD/NOT_RUN, tuyệt đối không tự báo PASS.
- Không công bố nội dung có bản quyền chưa được cấp phép; bảo toàn credit, LICENSE và DATASET-LICENSE.
- Chạy test và đối chiếu golden cases cho mọi sửa đổi lịch âm, giờ sinh, an sao. Kết quả AI không thay thế bằng chứng.
- Báo cáo rõ DONE / PARTIAL / BLOCKED và tách bằng chứng thực tế với đề xuất.
