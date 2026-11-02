# JEV-WEB — Chốt kiểm định trước khi xuất bản bản dịch

**Áp dụng bắt buộc** đối với văn bản dịch Trung → Việt trong Việt Tử Vi. Jev chỉ **chấm nhận định**; quy tắc cho qua/chặn nằm trong code/checklist, người duyệt quyết định release. Không dùng Weblate.

## Kết nối và điều kiện trước khi gọi

- Site/connector `Jev-web`: gọi `jev_status` (chỉ đọc) trước mỗi đợt; yêu cầu `ready=true`, skill chính thức `typesafe-ai` đã được đọc và áp dụng.
- Mô hình kiểm tra lúc thiết kế: `typesafe/jev-1.14`, sử dụng OpenRouter Decisions API; phiên bản triển khai tương lai phải xác minh lại.
- `jev_evaluate` là **lượt gọi có chi phí**. Không gọi nếu người dùng chưa phê duyệt rõ chi phí cho đợt thử/đợt phát hành. Dù site có `charges_enabled=true`, vẫn cần đồng ý của người dùng ở đợt đó. Khi có phép, chỉ dùng `charge_authorized=true`; nếu chưa có phép -> `BLOCKED: AWAITING_CHARGE_APPROVAL`.
- Phiên bản hiện tại giới hạn `state` là **dữ liệu công khai inline <= 8 KiB**, tối đa 8 câu hỏi độc lập; 6 request/phút, 60 request/ngày theo trạng thái site tại thời điểm kiểm tra. Không đưa URLs/path thay cho văn bản và không gửi các lá số cá nhân.

## Payload chuẩn cho mỗi đoạn

```json
{
  "segment_id": "TV-VI-001",
  "source_zh": "命宫紫微坐守",
  "translation_hv": "Cung Mệnh có sao Tử Vi tọa thủ.",
  "plain_vi": "Trong lá số Tử Vi, sao Tử Vi nằm ở cung Mệnh; cần xem thêm các sao và cung liên hệ để diễn giải.",
  "approved_terms": {
    "命宫": "cung Mệnh",
    "紫微": "sao Tử Vi",
    "坐守": "tọa thủ / nằm tại cung"
  },
  "context": "Lá số bản mệnh; nội dung tham khảo về hệ thống Tử Vi truyền thống"
}
```

**Không** gửi câu dịch của đoạn khác để tránh nhiễu. Các trường trên là ví dụ public phi cá nhân, **chưa chạy API**.

## 4 câu hỏi độc lập, mỗi lần gọi 1 đoạn

Dùng `score` cho 3 tiêu chí (5 mức có mô tả độc lập), và `noul` cho cờ thêm nội dung không có trong nguồn. Diễn đạt câu hỏi bằng tiếng Việt ngắn gọn; mỗi câu chỉ đánh giá một khía cạnh.

| Tên câu hỏi | Kiểu | Nội dung đánh giá |
| --- | --- | --- |
| `semantic_fidelity` | score | Bản `translation_hv` có chuyển đúng mệnh đề, quan hệ, điều kiện và phủ định trong `source_zh` không? |
| `glossary_alignment` | score | Thuật ngữ của `translation_hv` có phù hợp các khóa trong `approved_terms` không? |
| `plain_language` | score | `plain_vi` có dễ hiểu với người Việt chưa học tử vi không? |
| `unsupported_additions` | noul | Có nhận định cụ thể nào trong `translation_hv` / `plain_vi` được khẳng định thêm nhưng không có trong `source_zh`? |

**Mức score, độc lập cho từng tiêu chí:** 
0 — sai hẳn/không sử dụng được; 
1 — lỗi lớn hoặc rất khó hiểu; 
2 — có lỗi/độ mơ hồ đáng kể; 
3 — đạt cơ bản, lỗi nhỏ; 
4 — rõ ràng, chính xác trong phạm vi tiêu chí. 

Với `semantic_fidelity`, các mức 3/4 chỉ dùng nếu người kiểm tra có nguyên văn đủ ngữ cảnh; nếu nguyên văn không rõ nghĩa, bắt buộc chuyển xét tay thay vì tin điểm. Với `glossary_alignment`, code đã so khớp các khóa chính xác trước, Jev đánh giá phần tương đương nghĩa hoặc ngữ cảnh. Với `plain_language`, tránh đánh đồng ngắn gọn với dễ hiểu; vẫn phải đúng ý nguyên văn.

`unsupported_additions` trả xác suất cho phát biểu **có thêm kết luận**: cao = rủi ro, thấp = chưa thấy. Không viết câu hỏi dạng đảo phủ định.

## Bảng quyết định (gate policy: thí điểm, cần hiệu chỉnh sau 20 đoạn có nhãn review của người)

| Điều kiện | Quyết định |
| --- | --- |
| Thiếu nguồn/glossary, mismatch thuật toán, chuỗi rơi, thiếu giấy phép | **BLOCK** ngay, không gọi Jev thay thế |
| Gọi Jev thất bại, chưa cho phép phí, hết hạn mức, kết quả thiếu trường | **HOLD**, chưa xuất bản |
| Với 1 score, xác suất tổng của mức 0–2 >= 0,20 | **REVIEW**, không tự qua |
| Với 1 score, xác suất tổng mức 3–4 < 0,80 | **REVIEW**, không tự qua |
| Noul `unsupported_additions` > 0,70 | **BLOCK để sửa** |
| Noul `unsupported_additions` từ 0,30 đến 0,70 | **REVIEW** |
| Cả 3 score có xác suất mức 3–4 >= 0,80; rủi ro added claims < 0,30; rule checks PASS | **CANDIDATE_PASS**, còn cần human sign-off |
| Có bất kỳ nội dung nhạy cảm/sai lệch ý nghĩa ngay cả khi Jev tự tin | **BLOCK hoặc REVIEW**, người duyệt xác nhận |

**Ngưỡng chỉ là giả thuyết thí điểm, không coi là đã hiệu chuẩn.** Phải phân tích phân phối xác suất theo từng tiêu chí và so với nhãn của người đọc/người có kiến thức tử vi. Không dùng `confidence` đơn lẻ làm quyết định.

## Evidence bắt buộc trước phát hành

```text
segment_id:
source_path_and_commit:
glossary_commit:
translation_revision:
deterministic_checks: PASS / FAIL
jev_status: READY / ERROR / NOT_CHECKED
jev_model:
jev_charge_approval: GRANTED / NOT_GRANTED
jev_question_spec_version:
jev_evaluation_timestamp:
jev_result_summary: 3 distributions + noul probability
jev_decision: CANDIDATE_PASS / REVIEW / BLOCK / HOLD
human_reviewer:
human_decision: APPROVE / REWORK / REJECT
release_commit:
```

Chỉ đánh dấu **PUBLISHED** sau khi evidence đầy đủ. Trường hợp không thể gọi Jev: trạng thái phải là `HOLD`, không được tạo kết quả giả hoặc tuyên bố đã chấm.

## Bộ test chặn dịch sai

- Dịch đổi nghĩa phủ định, `hóa Kỵ` thành `hóa Lộc`, hoặc nhầm cung: FAIL.
- Dịch Hán–Việt đúng chữ nhưng khó hiểu: REVIEW nếu diễn giải phổ thông chưa giải thích.
- Câu khẳng định số mệnh chắc chắn, phán bệnh/đầu tư không có trong nguồn: BLOCK.
- Các dị bản từ điển (như `凤阁`, `子女`, `截空`) phải gắn nhãn `GLOSSARY_DISPUTE` và con người lựa chọn, không tự quyết theo điểm Jev.
- Nếu quá dài, chia theo câu/đoạn văn có đủ ngữ cảnh chứ không cắt cụt nguyên văn giữa mệnh đề.

## Phát hành đợt đầu

1. Xác thực nguyên văn và duyệt 50 thuật ngữ (bảng glossary).
2. Thử 20 đoạn có nhãn của 1–2 người; trong đó có mẫu cố ý sai để đo khả năng phát hiện lỗi.
3. Sau **đồng ý chi phí rõ ràng**, dùng Jev chấm pilot; đối chiếu lỗi bị bỏ sót, điều chỉnh ngưỡng ở PR riêng.
4. Đợt thật mới sử dụng gate; không công bố kết quả trước khi kiểm định hoàn tất.
