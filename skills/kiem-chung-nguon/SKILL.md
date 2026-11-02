---
name: kiem-chung-nguon
description: "Kiểm chứng câu khẳng định y khoa trong kịch bản, phụ đề và slide; tra PubMed, đọc toàn văn và ghi nguồn để người phụ trách duyệt."
---

# Kiểm chứng nguồn

Chạy từ gốc dự án. Script nằm cạnh skill: `~/.claude/skills/kiem-chung-nguon/scripts/pubmed.py`.

1. Đọc `CLAUDE.md`. Tách từng câu khẳng định thành bảng: câu, dân số, xét nghiệm/can thiệp, đối chứng, kết cục, nguồn, mức ủng hộ, cách sửa.
2. Nếu có `kho-bang-chung/INDEX.md`, tra kho trước. Kho là tuỳ chọn, không phải điều kiện chạy.
3. Tìm nguồn bằng `python3 <đường-dẫn-script> search "<truy vấn>" --max 10`. Ưu tiên hướng dẫn hiện hành, tổng quan hệ thống và nghiên cứu phù hợp với câu hỏi; không dùng thứ bậc này để bỏ qua khác biệt dân số.
4. `fetch <PMID đã tìm được> --abstract --json` để xem chi tiết. `fulltext <PMID> --out Output/nghien-cuu/fulltext.md` đọc bản PMC nếu có. Tạo thư mục đích trước. Không có toàn văn thì ghi hạn chế, không suy đoán bảng kết quả.
5. Đối chiếu abstract, Methods, Results, bảng và chú thích. Ví dụ: abstract ghi X nhưng bảng cho Y — ghi cả hai, chưa chọn số đến khi giải thích được khác biệt.
6. Chấm: ủng hộ trực tiếp / một phần / không ủng hộ / chưa đủ dữ liệu. Kiểm tra sai lệch, tài trợ, xung đột lợi ích và khả năng áp dụng.
7. Ghi `Output/nghien-cuu/nguon.md`: tác giả/tổ chức, năm, tiêu đề, link, PMID/DOI đã tra, ngày truy cập, vị trí bằng chứng và câu được hỗ trợ. Nếu lưu kho, dùng `kho-bang-chung/` và cập nhật chỉ mục.
8. Thêm dòng nguồn ngắn đọc được lên slide; danh mục đầy đủ đi kèm bản bàn giao. Câu thiếu nguồn đánh dấu để người phụ trách duyệt.

Với tầm soát: không biến độ nhạy thành xác suất người có kết quả dương tính mắc bệnh; giữ dân số, ngưỡng và phương pháp xác nhận. Nêu dương tính giả, âm tính giả, bước xác nhận nếu nguồn có. Dữ kiện sản phẩm phải từ tài liệu chính thức hoặc nghiên cứu công bố. Không tự tạo dữ kiện sản phẩm.

Script dùng thư viện chuẩn Python, kho ở `kho-bang-chung/` tính từ thư mục hiện tại; cache có thể được tạo tại đó. Khoá `PUBMED_API_KEY`, `NCBI_EMAIL` lấy từ môi trường hoặc `.env` của dự án, không in ra.
