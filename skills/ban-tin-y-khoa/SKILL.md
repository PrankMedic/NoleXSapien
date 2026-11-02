---
name: ban-tin-y-khoa
description: "Làm bản tin sức khoẻ từ fulltext PubMed và PMC: đọc nghiên cứu, kiểm chứng số, viết kịch bản, tạo giọng và dựng video có nguồn."
---

# Bản tin y khoa từ toàn văn

Đọc `CLAUDE.md` và dùng skill `kiem-chung-nguon`. Chạy các lệnh từ gốc dự án.

1. Tìm bài theo câu hỏi và đối tượng người xem. Dùng `search`, `fetch`, `fulltext` của script PubMed. Chỉ chọn bài đọc được toàn văn; nếu chưa lấy được thì báo thiếu và đề xuất bài khác, không giả vờ đã đọc.
2. Ghi `Output/ban-tin/<slug>/fulltext.md`, `nguon.md` và `bang-so.json`. Mỗi số trong bảng có `display` dạng chuỗi, `excerpt` trích nguyên văn, `location` vị trí; bổ sung đơn vị, nhóm, thời điểm. Số suy ra có `formula`. Xem schema đầu `scripts/kiem_so.py`. Bộ kiểm số chỉ dò sự hiện diện, vẫn phải đọc ngữ cảnh và kiểm đơn vị.
3. Review và đề xuất một định dạng trong skill `dinh-dang-video`. Đợi bạn chọn trước khi tạo hình hoặc dựng.
4. Viết `voice.txt`: câu hỏi, thiết kế nghiên cứu, kết quả, giới hạn và ý nghĩa với người xem. Không chỉ đọc abstract. Nếu abstract ghi X nhưng bảng cho Y, giải thích được khác biệt trước khi dùng số; nếu chưa rõ thì đánh dấu để duyệt.
5. Đối chiếu từng câu với nguồn. Không suy từ một nghiên cứu thành cam kết hiệu quả. Với tầm soát, giữ rõ đây không phải chẩn đoán và nêu giới hạn xét nghiệm theo nguồn.
6. Tạo giọng: `python3 scripts/tts_gemini.py Output/ban-tin/<slug>/voice.txt Output/ban-tin/<slug>`. Nghe toàn bộ, kiểm tra chữ ngoài kịch bản. Mốc từ tự nội suy chỉ là bản nháp, phải nghe đối chiếu.
7. Tạo dữ liệu TypeScript trong `remotion/src/studio/data/`; dùng `BanTinProps`, prop `brand`, `words`, `segments`, `source`, `scenes`. Đăng ký composition trong `Compositions.tsx` với thời lượng đúng. Không đặt tên riêng hoặc dữ liệu y khoa vào mẫu chung.
8. Chạy `python3 scripts/kiem_so.py <thư-mục-tập> <file-dữ-liệu.ts>` và `cd remotion && npx --no-install tsc --noEmit`. Không sửa số cho qua kiểm tra khi chưa đối chiếu nguồn. Render bản nháp, xem các khung chuyển cảnh, nguồn, phụ đề, nghe đầu/cuối và chỗ nối.
9. Có thể dùng `scripts/ban_tin_duyet.sh <slug> <composition-id>` cho vòng góp ý hình nếu đã cho phép dùng các tác nhân phụ. Duyệt hình không thay thế duyệt y khoa/quảng cáo. Bàn giao MP4, danh mục nguồn, bảng kiểm và những điểm cần người phụ trách duyệt; không tự đăng.
