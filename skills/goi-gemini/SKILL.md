---
name: goi-gemini
description: "Gửi prompt và file văn bản cần thiết tới Gemini API để nhận bản nháp hoặc góp ý, rồi kiểm tra lại."
---

# Gọi Gemini API

Chỉ dùng khi bạn cho phép gọi API và chi phí liên quan. Không gửi dữ liệu nhận diện, khoá hoặc tài liệu mật. Viết các quy tắc dự án vào prompt; Gemini không tự đọc `CLAUDE.md`.

```bash
python3 ~/.claude/skills/goi-gemini/scripts/gemini.py -f Output/ban-nhap.txt -o Output/gemini-ket-qua.txt - < Output/prompt.txt
```

`-f` lặp được, `-m` chọn model, `--models` liệt kê model được phép gọi bằng khoá. Script đọc khoá từ môi trường hoặc `.env` dự án và không in khoá. Chạy từ gốc dự án.

Kết quả là bản nháp. Kiểm nguồn bằng `kiem-chung-nguon`; không dùng phản hồi để chẩn đoán hay quyết định lâm sàng. Nội dung quảng cáo cần người có trách nhiệm duyệt trước đăng. Gọi Antigravity thì dùng `goi-antigravity`, chỉ dùng `agy` bằng khoá API, không bằng đăng nhập Google.
