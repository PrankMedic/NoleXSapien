# Studio video độc lập

Từ thư mục `remotion`: `npm install`, `npx tsc --noEmit`, `npm run dev`. Root chỉ đăng ký các composition của Studio. Mẫu trong `data/mau.ts` và `data/words/mau.json` là **dữ liệu mẫu phi y khoa**, không phải bằng chứng hoặc nội dung sản phẩm. Mở `MauKineticType`, `MauBanTin` hoặc ảnh `MauCarouselSlide` để thử; mẫu không cần âm thanh thật.

Các format và props nằm ở `Formats.tsx`, `types.ts`; bản tin ở `BanTin.tsx`. `BanTinProps.brand` là nhãn đơn vị do người dùng cung cấp. Module `registry.tsx` tự đăng ký default export kiểu `StudioEntry` từ `data/*.ts`; ID phải duy nhất, chỉ chữ/số/dấu gạch, không bắt đầu `Mau`. Bản tin dùng props khác nên đăng ký rõ trong `Compositions.tsx`.

Video nhận `audio` (đường dẫn trong `public/` hoặc URL; chuỗi rỗng để xem mẫu im lặng), `words` dạng `{text,startMs,endMs}`, `segments` dạng `{fromMs,toMs}` theo âm thanh gốc. Hệ thống tự retime theo đoạn giữ lại; không retime hai lần. `atPhrase` phải khớp từ, `nth` đếm lần xuất hiện từ 0. Đặt duration bằng `framesOf(segments)`.

Thêm dữ liệu mới bằng cách sao chép một props mẫu, thay bằng words và nguồn đã kiểm chứng. Đặt media ở `public/`, không dùng đường dẫn máy. Ảnh Flow ở `public/flow/<slug>/`; cần composition kết hợp ảnh và slide theo bảng cảnh. Bộ không kèm clip riêng. Nhạc và hiệu ứng không bật mặc định; chỉ thêm file bạn có quyền dùng.

Kiểm TypeScript, render nháp, xem cả chuyển cảnh/nguồn/phụ đề và nghe bản cuối trước bàn giao. Trước khi dựng phải chọn định dạng; trước khi đăng quảng cáo cần người có trách nhiệm duyệt.
