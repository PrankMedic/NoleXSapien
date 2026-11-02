---
name: goi-antigravity
description: "Giao brief review hình cho Antigravity CLI bằng khoá API qua giao.sh, đọc log và đối chiếu từng góp ý."
---

# Gọi Antigravity

Chỉ dùng `agy` bằng khoá `GEMINI_API_KEY`, ép provider Gemini cho từng phiên; không dùng đăng nhập Google từ tác nhân bên thứ ba. API có thể phát sinh phí; chỉ gọi trong phạm vi bạn đã cho phép dùng dịch vụ này.

Tạo thư mục review riêng, chỉ chép ảnh tờ duyệt và brief cần thiết. Brief ghi: chỉ đọc, không tạo kế hoạch hoặc file, trả lời trực tiếp bằng tiếng Việt; không chạy terminal; dùng công cụ đọc ảnh; không mở được ảnh thì nói rõ và dừng. Không chứa khoá, dữ liệu nhận diện hoặc tài liệu mật.

Chạy từ gốc dự án:

```bash
~/.claude/skills/video-minh-hoa-flow/scripts/giao.sh agy Output/review/brief.md 5
```

Log cạnh brief. `tiep` là đối số thứ tư để nối hội thoại gần nhất, chỉ dùng cùng việc và không có phiên xen giữa. Script có timeout và tối đa ba lần khi không có đầu ra. `no output produced` không phải duyệt đạt; sửa brief yêu cầu không chạy terminal rồi thử trong giới hạn. Hết giới hạn thì báo chưa duyệt, không chuyển sang đăng nhập Google hoặc bỏ quyền bảo vệ.

Đọc log, kiểm tra file có thay đổi và đối chiếu từng góp ý với hình. Từ karaoke đang được tô có thể bị hiểu nhầm là chữ thừa. Lọc góp ý đúng trước khi giao sửa. Duyệt hình không thay thế duyệt y khoa/quảng cáo. Hai vòng cùng lỗi chưa giải quyết thì dừng và báo bạn.
