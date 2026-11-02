---
name: dinh-dang-video
description: "Review nội dung và chọn định dạng video sức khoẻ trước khi dựng bằng Remotion; dùng khi muốn đổi bố cục hoặc làm video từ giọng đọc."
---

# Chọn định dạng trước khi dựng

Đọc quy tắc dự án. Review nội dung, nguồn, số liệu và mục đích; đề xuất **một** định dạng kèm lý do. Đợi bạn chọn trước khi dựng. Nếu bạn đã nêu rõ định dạng thì làm theo.

Các định dạng trong `remotion/src/studio`: chữ động (`KineticType`), sơ đồ (`Mechanism`), biểu đồ (`ChartStory`), so sánh (`Versus`), nhận định và bằng chứng (`MythFact`), hỏi đáp (`ChatQA`), hành trình (`Journey`), bản tin (`NewsDesk`, `BanTinNghienCuu`), sóng âm (`PodcastWave`), ảnh nhiều trang (`CarouselSlide`). Sơ đồ có sẵn là minh hoạ cấu trúc; sửa hình cho đúng chủ đề và nguồn trước khi dùng y khoa.

Không dùng bố cục so sánh để hạ thấp sản phẩm. Chọn biểu đồ khi có số đã kiểm chứng; dùng ảnh Flow kèm slide theo `video-minh-hoa-flow` nếu cần minh hoạ không lộ mặt.

Đọc `remotion/src/studio/README.md` để thêm dữ liệu. Mẫu `data/mau.ts` chỉ là dữ liệu mẫu phi y khoa. Đường dẫn media tương đối với `remotion/public/`; không dùng đường dẫn máy. Tạo từ giọng thật bằng `scripts/chuan_bi_giong.py`; giọng AI bằng `scripts/tts_gemini.py` và có nhãn.

Mỗi cảnh theo mốc từ thật, có nguồn đọc được. Kiểm `tsc`, render nháp và xem hình/âm thanh trước bàn giao. Nội dung quảng cáo y tế cần người có trách nhiệm duyệt trước đăng.
