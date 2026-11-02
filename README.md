# NoleXSapien

*Nô lệ suy tư.* Bộ skill Claude Code làm nội dung sức khoẻ, từ tra cứu PubMed đến video.

Bộ này gồm 7 skill: bản tin y khoa từ toàn văn, kiểm chứng nguồn, chọn định dạng, ảnh Flow kèm slide, gọi Codex, gọi Antigravity và gọi Gemini. Kèm script chuẩn bị giọng, dò nói vấp, TTS, kiểm số và dự án Remotion độc lập. Không có dữ kiện sản phẩm điền sẵn.

## Cần cài

- Claude Code; Python 3.10 trở lên (các script dùng thư viện chuẩn); Node.js 22.13 trở lên cùng npm.
- `ffmpeg`, `ffprobe`, `whisper-cli` có trong PATH. Tải model Whisper phù hợp với bản CLI; mặc định `~/whisper-models/ggml-large-v3-turbo-q5_0.bin` hoặc đặt biến môi trường `WHISPER_MODEL`.
- Khoá PubMed (NCBI E-utilities) và Gemini API trong `.env` riêng của dự án. `.env.example` chỉ có tên biến và giá trị trống. Không gửi `.env` cho AI, không đưa vào git. PubMed vẫn gọi được không khoá với giới hạn tốc độ thấp hơn.
- Trình duyệt và tài khoản Google Flow nếu tạo ảnh; công cụ điều khiển trình duyệt phụ thuộc môi trường. Nếu thiếu, tạo ảnh thủ công theo prompt đã chuẩn bị.
- Codex CLI, Antigravity CLI (`agy`) là tuỳ chọn. `agy` chỉ dùng bằng khoá API, ép provider Gemini; không dùng đăng nhập Google qua tác nhân khác. API có thể phát sinh phí.

## Cài vào dự án mới

Từ thư mục bộ này, thay `DU_AN` bằng thư mục bạn chọn:

```bash
mkdir -p ~/.claude/skills
cp -R skills/* ~/.claude/skills/
mkdir -p DU_AN
cp CLAUDE.md AGENTS.md .env.example DU_AN/
cp -R scripts remotion DU_AN/
cd DU_AN
mkdir -p Output/nghien-cuu
cp .env.example .env
```

Bạn tự điền khoá vào `.env` bằng trình soạn thảo; không dán vào hội thoại. Thêm `.env`, `remotion/node_modules/`, `Output/` vào `.gitignore` của dự án nếu dùng git. Các lệnh sau chạy từ gốc dự án. Biến công cụ `WHISPER_MODEL`, `WHISPER`, `FFMPEG`, `FFPROBE` được đọc từ môi trường shell; đặt đường dẫn model bằng `export WHISPER_MODEL=...`, không dựa vào `.env` cho cấu hình Whisper.

```bash
cd remotion
npm install
npx --no-install tsc --noEmit
npm run dev
```

Mở một composition bắt đầu `Mau`; tất cả chỉ là dữ liệu mẫu phi y khoa. Mẫu không cần file âm thanh. Xem `remotion/src/studio/README.md` để tạo dữ liệu riêng.

## Thử nhanh với PubMed

Tại gốc dự án:

```bash
python3 ~/.claude/skills/kiem-chung-nguon/scripts/pubmed.py search 'cancer screening' --max 5
```

Chọn **một PMID từ kết quả thực tế**, không chép số từ ví dụ hoặc trí nhớ. Thay `PMID_DA_CHON` dưới đây bằng mã vừa tra:

```bash
python3 ~/.claude/skills/kiem-chung-nguon/scripts/pubmed.py fetch PMID_DA_CHON --abstract --json
python3 ~/.claude/skills/kiem-chung-nguon/scripts/pubmed.py fulltext PMID_DA_CHON --out Output/nghien-cuu/fulltext.md
```

Nếu không có toàn văn PMC, chọn bài khác có toàn văn hoặc cung cấp tài liệu được phép dùng; không dựng bản tin chỉ từ abstract. Yêu cầu Claude dùng `ban-tin-y-khoa`, đọc toàn văn và ghi nguồn; review rồi đề xuất một định dạng để bạn chọn. Sau khi chọn mới tạo giọng/hình và dựng. Không tự dùng bài nghiên cứu để quảng cáo sản phẩm chưa có dữ kiện chính thức. Mẫu `CLAUDE.md` nêu quy tắc riêng cho nội dung tầm soát và duyệt quảng cáo trước đăng.

## Script và đầu vào

- `scripts/chuan_bi_giong.py <nguồn> <thư-mục>`: tạo WAV, words `{w,s,e}`, báo cáo nói vấp; gọi script dò lỗi bằng đường dẫn cạnh nó.
- `scripts/tim_loi_noi.py <nguồn>`: dò trực tiếp âm thanh từng đoạn chồng lấn, vẫn cần nghe lại.
- `scripts/tts_gemini.py <voice.txt> <thư-mục> [giọng] [model]`: tạo `voice.wav`, words `{text,startMs,endMs}`. Tên model có thể đổi; chọn model TTS được tài khoản hỗ trợ, truyền ở đối số cuối. Không xem mốc nội suy là xác nhận giọng đọc đúng.
- `scripts/kiem_so.py <thư-mục-tập> [file-dữ-liệu]`: xem schema `bang-so.json` ở đầu script; kiểm số giúp tìm sai lệch, không thay thế đọc toàn văn.
- `scripts/ban_tin_duyet.sh <slug> <composition-id>`: vòng góp ý hình tuỳ chọn, cần Codex và agy; không đăng bài, không thay duyệt nội dung. Xem trợ giúp đầu file trước dùng.
- Các `flow_*.py`, `flow_finish.sh`, `giao.sh` nằm trong `~/.claude/skills/video-minh-hoa-flow/scripts/`; chạy từ gốc dự án. Luồng Flow tạo ảnh kết hợp slide và cần viết composition theo bảng cảnh.

Không chạy API hoặc gửi tài liệu chỉ để thử cài đặt khi chưa có phạm vi cho phép. Dùng `--help` của script PubMed/Gemini, kiểm cú pháp và mẫu Remotion trước.

## Lỗi thường gặp

- TTS đọc thêm chữ chỉ dẫn: chỉ gửi kịch bản để đọc, không ghép hướng dẫn vào nội dung; nghe toàn bộ, xoá bản giọng lỗi trước tạo lại. Mốc từ đầu quá muộn là dấu hiệu cần nghe, không phải bằng chứng duy nhất.
- Whisper bỏ câu lặp: dò trên giọng gốc bằng `tim_loi_noi.py`, nghe các đoạn chồng lấn và chỗ nối; không dựa riêng vào SRT đã rút gọn.
- `agy` không trả lời hoặc log `no output produced`: yêu cầu chỉ đọc ảnh, không terminal, kiểm log; script giới hạn thời gian và tối đa ba lần. Hết giới hạn thì ghi chưa duyệt, không bỏ bảo vệ hoặc chuyển sang đăng nhập Google.
- Thiếu model Whisper/công cụ: kiểm PATH và `WHISPER_MODEL`; không dùng đường dẫn của máy khác.
- Không lấy được fulltext: không xem là đã đọc nghiên cứu. Ghi hạn chế và đổi bài hoặc chờ tài liệu hợp lệ.
