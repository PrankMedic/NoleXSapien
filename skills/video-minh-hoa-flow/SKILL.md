---
name: video-minh-hoa-flow
description: "Dựng video không lộ mặt từ giọng nói bằng ảnh Google Flow kết hợp slide số liệu và nguồn khoa học trong Remotion."
---

# Video ảnh Flow kèm slide

Đọc `CLAUDE.md`, skill `kiem-chung-nguon`, và [phân công](references/giao-viec.md). Luôn review, đề xuất một định dạng rồi đợi bạn chọn. Luồng này kết hợp ảnh minh hoạ với slide, nguồn và phụ đề.

1. Tạo thư mục `Output/video/<slug>/`. Với clip hoặc thu âm: `python3 scripts/chuan_bi_giong.py <nguồn> <thư-mục-dự-án>`. Lấy từ ở `words.json` dạng `{w,s,e}`; nghe `goc.wav` và đọc `loi-noi.txt`, không tin phụ đề đã rút gọn để phát hiện nói vấp.
2. Chọn đoạn giữ lại trong `cuts.json`: `{"source":"đường-dẫn-tương-đối","keep":[[0,3.5]],"removed":[]}`. Chạy script `flow_voice.py <thư-mục-dự-án>` cạnh skill để tạo `voice.mp3`. Chạy lại `scripts/chuan_bi_giong.py` trên giọng đã cắt vào thư mục tạm rồi dùng words của bản đã cắt; không lấy mốc bản gốc cho giọng mới.
3. Với văn bản: kiểm chứng trước, tạo giọng bằng `scripts/tts_gemini.py`, nghe lại, chuyển `voice.wav` sang `voice.mp3` bằng ffmpeg. Chuẩn bị giọng trên MP3 bằng `scripts/chuan_bi_giong.py` vào thư mục tạm để có words dạng `{w,s,e}`.
4. Chia cảnh theo câu đọc. Viết bảng cảnh: thời gian, câu đọc, ảnh hoặc slide, nội dung, nguồn, prompt. Giữ slide số liệu đã kiểm chứng. Đọc [Google Flow](references/google-flow.md) trước tạo ảnh.
5. Tạo ảnh minh hoạ màu nước trên giấy, không dùng hình bệnh nhân thật hoặc mô tả có thể nhận diện. Kiểm tra ảnh không ngụ ý kết quả xét nghiệm là chẩn đoán; không dùng hình gây sợ để bán hàng.
6. Tải ảnh, dùng `flow_collect.py <dự-án> --since "YYYY-MM-DD HH:MM" --count <số-ảnh> --order oldest-first` nếu đã tải theo thứ tự cảnh. Xem mapping, mở từng ảnh xác nhận. Script di chuyển ảnh nên chỉ trỏ vào thư mục tải dành riêng cho việc này.
7. Tạo `corrections.json` với `fix`, `merge`, `breaks`. `flow_captions.py <dự-án> <slug>` xuất mốc sang `remotion/src/studio/data/words/` và media vào `remotion/public/flow/<slug>/`.
8. Tạo composition trong `remotion/src/studio` kết hợp ảnh với slide theo dữ liệu cảnh; dùng `Img`, nguồn từng cảnh và phụ đề theo words đã sửa. Mẫu chung không tự sinh composition từ ảnh. Không nhập từ module ngoài bộ.
9. Kiểm `tsc`, render nháp, xem tờ duyệt, nghe chỗ nối và kiểm từ gốc với bản cuối bằng `scripts/tim_loi_noi.py`. Chuẩn âm bằng `flow_finish.sh in.mp4 out.mp4`, dùng hai tên khác nhau. Bàn giao MP4 và nguồn; chờ người có trách nhiệm duyệt quảng cáo trước đăng.

Các script cạnh skill chạy từ gốc dự án. Không tự gọi tác nhân khác khi chưa có phạm vi cho phép; nếu có, dùng các skill `goi-*` và brief giới hạn file.
