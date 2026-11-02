# Jev-web thực tế — Chấm thiết kế Translation Quality Loop V2.1
Ngày: 2026-11-02
Repo: `phantiendat/viet-tu-vi`
Đánh giá: **1 lần gọi Jev thật có tính phí, chỉ về THIẾT KẾ ĐƯỢC MÔ TẢ; không phải test chất lượng bản dịch và chưa chạy implementation.**
Nguồn: [V2 draft](../JEV_LOOP_V2_PROPOSAL.md) và [Matt Pocock architecture review](JEV_LOOP_V2_MATT_POCOCK_REVIEW_2026-11-02.md).

## Phương pháp / provenance

- Trước khi đánh giá đã đọc chính thức installed skill `skills://plugins/jev-web/typesafe-ai` và kiểm tra `jev_status`: `ready=true`.
- Dữ liệu được gửi: **bản mô tả công khai tóm tắt thiết kế V2.1**, dựa trên V2 và blueprint khuyến nghị trong review; không tải nội dung GitHub trực tiếp từ Jev; không gửi PII hay secret.
- Model trả về: `typesafe/jev-1.14-20261014`; provider TypeSafe; endpoint qua Jev-web/OpenRouter Decisions API.
- `request_id`: `gen-dec-1793581002-MG1zRHFJ6JT45i8XPGum`.
- `diagnostic_id`: `2a1d79a9-fbfc-4900-9a5e-152bb16d77d8`.
- `latency_ms`: 1012.
- `usage.input_tokens`: 1933; `usage.output_tokens`: 136.
- `usage.cost`: **$0.000081186 USD** do API báo cáo cho lần gọi này; không phải hóa đơn/chi phí chung của dự án.
- Tổng **8 câu hỏi typed độc lập**: 7 `score` (thang 0..4) + 1 `noul`. Jev đánh giá từng khía cạnh; policy và hành động nằm trong code.
- Link official docs live không mở được từ công cụ web ở lần thử này; dùng skill tích hợp đã xác thực và schema của công cụ Jev-web.
- **Giới hạn:** model đọc tóm tắt do assistant biên soạn, chưa kiểm chứng code/CI, chưa kiểm chứng độ đúng thuật ngữ bằng người có chuyên môn, chưa chấm một đoạn dịch thật. Bản tóm tắt có thể ảnh hưởng phán đoán.

## Kết quả mô hình — nguyên điểm và xác suất phân phối

| Tiêu chí | Score /4 | Quy đổi /10 | confidence (không dùng làm gate) | P(level 0/1/2/3/4) |
| --- | ---: | ---: | ---: | --- |
| `role_separation` | 3.43 | 8.58 | 0.58 | 0.00 / 0.01 / 0.02 / 0.51 / 0.46 |
| `retry_routing` | 3.74 | 9.35 | 0.78 | 0.00 / 0.00 / 0.00 / 0.26 / 0.74 |
| `version_safety` | 3.38 | 8.45 | 0.68 | 0.00 / 0.00 / 0.00 / 0.62 / 0.38 |
| `term_model` | 3.19 | 7.97 | 0.81 | 0.00 / 0.00 / 0.02 / 0.77 / 0.21 |
| `release_barrier` | 3.14 | 7.85 | 0.88 | 0.00 / 0.00 / 0.00 / 0.86 / 0.14 |
| `budget_protection` | 2.48 | 6.20 | 0.61 | 0.00 / 0.00 / 0.53 / 0.47 / 0.00 |
| `validation_plan` | 2.59 | 6.47 | 0.68 | 0.00 / 0.00 / 0.39 / 0.61 / 0.00 |

**Trung bình cộng 7 score** = `3.1357/4` = **`7.84/10`**. Đây là phép tổng hợp số học của người biên soạn, **không phải một score tổng hợp do Jev trả riêng**, không mang ý nghĩa độ chính xác thật.

- `residual_hallucination_risk` (`noul`): **0.81**. Câu hỏi là: “Could the described checking process still accept an invented fortune-telling assertion in plain_vi when the source_zh never said it?”
  - criterion true: “An invented claim could escape the current checking process despite the proposed gates.”
  - criterion false: “The described checking process demonstrably prevents invented claims from reaching approval under all specified conditions.”
  - **Diễn giải đúng:** 0.81 là mức đánh giá mô hình về tính khả dĩ của lỗ hổng trong *bản thiết kế*, **không phải** quan sát cho thấy 81% đoạn dịch sai hoặc xác suất lỗi thực nghiệm.

### 7 câu hỏi được gửi

- `role_separation`: Does the proposed architecture keep the translator's generation role separate from Jev's evaluation role and the deterministic release decision?
- `retry_routing`: How well does the described rework routing target the stage responsible for a detected error?
- `version_safety`: How well do version fingerprints prevent a stale approval from being reused after related content changes?
- `term_model`: How well is domain terminology handled when Chinese star names have multiple Vietnamese variants or school-specific senses?
- `release_barrier`: How well can the described release checks prevent a failed or unevaluated segment from being published?
- `budget_protection`: How mature is the design's handling of repeat costs, concurrency and service quota failures?
- `validation_plan`: How well does the proposed pilot test whether Jev actually detects serious mistranslations rather than just producing high scores?

### Bản state công khai gửi cho Jev (verbatim về nội dung)

```json
{
  "design": "V2.1 proposed for open-source Viet Tu Vi Chinese->Vietnamese astrology translation; evaluation is of design SPEC only, not deployed code or tested translation quality.",
  "goal": "Avoid mistranslation of Chinese Zi Wei Dou Shu, preserve specialist Han-Viet terminology, make explanations accessible to Vietnamese lay readers; no Weblate or large translation team.",
  "artifacts": "source_zh immutable with public source provenance/license; approved concept glossary with aliases and school context; translation_hv strict faithful rendition; plain_vi accessible explanation; separate notes for source-external interpretation; per-segment revision fingerprints.",
  "gates": "G1 Jev checks changed glossary terms once per version with human resolution of genuine school disputes; deterministic term-code checks per segment. G2 Jev compares source_zh to translation_hv for meaning, conditions, omissions, contradictions. G3 Jev compares source + approved hv + plain_vi for readability and unsupported claims. Each gate uses independent typed score/noul judgments; code, not Jev, decides actions.",
  "error_routing": "Deterministic checks first. G2 grounded translation error -> critique with source quote -> retranslate only failing segment -> rejudge G2. G3 plain_vi wording or newly invented claim -> rewrite only plain_vi -> rejudge G3; only if hv itself incorrect invalidate G2 and retest G2+G3. Unclear classical syntax, missing evidence or glossary dispute -> HOLD and human review, no blind retry.",
  "cache": "g1 fingerprint=(glossary_sha, g1_spec, model); g2=(source/context_sha, hv_sha, glossary_sha, g2_spec, model); g3=(source/context_sha, hv_sha, plain_sha, glossary_sha, g3_spec, model). Changed plain_vi alone keeps G2; affected glossary terms invalidate related downstream segments.",
  "control": "At most 3 attempts per gate per segment, proposed global retry/judgment cap and batch spending cap; stop if unchanged result twice, quota exceeded, malformed Jev response, API failed, or unresolved semantic ambiguity; queue in HOLD. Call Jev only with public data <=8KiB, <=8 questions/request; current Jev connector 6/min 60/day. Charged calls require user consent per batch.",
  "release": "Release eligibility requires exact immutable approved revision, passed deterministic structural/license/term checks, G1/G2/G3 evidence and version alignment, manual reviewer sign-off; Jev scores never auto-publish or claim astrology has scientific validity.",
  "test_plan": "20 public examples with several deliberately wrong translations as smoke pilot; recommend >=60 varied cases with source-anchored human labels and lay readers before calibrating false-negative rate, critical miss rate, threshold selection and per-segment cost. None yet executed, translation loop code not implemented.",
  "known_open_questions": "No validated thresholds; current V2 draft thresholds (p_good >=0.95 G1, >=0.9 G2, >=0.85 G3) provisional. Typed interfaces, persisted queue, full global budget and pipeline CI not implemented. Automated Jev scoring cannot guarantee scholarly correctness."
}
```

**Mức score:** 0..4; mỗi câu hỏi có 5 `criteria` mô tả từ “không đáp ứng” tới “đáp ứng đầy đủ”. Các mô tả đầy đủ của từng level nằm trong request đã gửi; bảng P(level) phía trên là phân phối nguyên giá trị model trả.

## Matt Pocock × Jev — nhận định tổng hợp

- **Điểm mạnh:** router quay về đúng công đoạn `retry_routing=3.74/4`, và phân vai `role_separation=3.43/4`.
- **Ổn nhưng chưa đủ:** phiên bản/cache `3.38`, thuật ngữ `3.19`, release `3.14`. Những yếu tố này *mới là thiết kế*, chưa có code/tự động hóa và chứng cứ tính đúng.
- **Điểm yếu ưu tiên #1:** `budget_protection=2.48`: cần hạn mức tất cả vòng G1/G2/G3 cộng lại, quản lý retry idempotent, theo dõi quota và dự toán thực.
- **Điểm yếu ưu tiên #2:** `validation_plan=2.59`: 20 case chỉ đủ smoke; cần ground-truth do người review, bài kiểm thử adversarial và tỷ lệ bỏ sót lỗi nghiêm trọng.
- **Rủi ro xuyên suốt:** khả năng lọt `plain_vi` chứa khẳng định không có nguồn được model gắn cờ 0.81. Cần đổi G3 thành *claim-by-claim source alignment* và tách `definitions` khỏi `predictions`.

## Quyết định khuyến nghị

**GO cho pilot V2.1 / NO-GO cho release production**. Tránh điều chỉnh prompt để nâng điểm mô hình mà không thay cấu trúc thật. Không nâng điểm này thành “đã kiểm tra đúng bản dịch”.

### Ưu tiên sửa (V2.2)

1. **P0 — Claim-level hard gate**: extract claims từ `plain_vi`, gắn `supporting_source_span`, `claim_type` (source fact / glossary explanation / editor commentary / prediction). Thiếu chứng cứ hay nguồn không cùng nghĩa => HOLD; G3 phải nhận cả `source_zh`, `translation_hv`, `plain_vi`.
2. **P0 — Circuit breaker / budget**: tổng số đánh giá / đoạn, giới hạn batch tokens/cost, bền vững sau restart, retry idempotency theo SHA, quota/resume; hết budget => HOLD, không bypass.
3. **P0 — CI fail closed / publish invariants**: duy nhất bản `source+hv+plain+glossary+judge_spec` đã duyệt mới được xuất bản; thiếu evidence, tool lỗi, sửa sau duyệt => BLOCK.
4. **P1 — Benchmark phản chứng**: 20 mẫu smoke và ≥60 mẫu ở giai đoạn tiếp theo gồm đủ biến thể đúng/sai có nhãn reviewer; tính **critical-error false-negative rate**, inter-rater agreement, chi phí/đoạn và câu khó hiểu chưa được phát hiện. Ngưỡng 0.95/0.90/0.85 chỉ chốt sau đó.
5. **P1 — Router with evidence**: mỗi lỗi phải có loại lỗi + quote source, không có quote/độ chắc đủ => HUMAN HOLD; sửa riêng `plain_vi` không làm invalid G2.
6. **P1 — Glossary canonical IDs**: `term_id`, source, school/variant, aliases, reviewer, status; tránh tự động áp một hệ nghĩa duy nhất giữa các trường phái.

## Điều không được nói

- Không gọi kết quả này là **điểm chính thức Jev cho chất lượng dịch**; chỉ là review kiến trúc được mô tả.
- Không nói V2.1 đã chạy hoặc đã pass pilot.
- Không tự sửa thuật toán an sao, merge PR hay xuất bản nội dung dựa vào review này.

**Mốc cuối:** `jev_evaluate` thực sự thành công; 7 score, 1 noul và usage đã được ghi. Bản report này là artifact review, không phải thay đổi release policy trong `main`.
