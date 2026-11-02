---
name: goi-codex
description: "Giao brief có phạm vi cho Codex CLI để viết, sửa mã hoặc review, rồi kiểm tra kết quả."
---

# Gọi Codex

Chỉ giao việc trong phạm vi bạn đã cho phép. CLI `codex` cần có trong PATH; xác minh bằng `command -v codex`. Không gửi thông tin nhận diện, khoá hoặc tài liệu mật ngoài phạm vi được phép.

Viết prompt ra file, gồm quy tắc `AGENTS.md`, file được đọc/sửa và đầu ra. Review mặc định chỉ đọc:

```bash
codex exec --sandbox read-only --skip-git-repo-check -C . -o Output/codex-ket-qua.txt - < Output/codex-prompt.txt
```

Chỉ dùng `--sandbox workspace-write` khi brief yêu cầu sửa. Không bỏ sandbox. Có thể dùng `~/.claude/skills/video-minh-hoa-flow/scripts/giao.sh codex <brief.md> 8` cho tác vụ sửa giới hạn thời gian.

Đọc kết quả, xem thay đổi và chạy kiểm tra phù hợp. Không coi PMID/DOI do mô hình trả lời là đã xác minh; dùng `kiem-chung-nguon`. Không tự commit hoặc đăng. Kết quả cần duyệt y khoa/quảng cáo vẫn phải chuyển người có trách nhiệm.
