import sample from './mau-phu-hinh.json';
import type { ThuyMacProps, PhuHinhProps } from '../InkAndOverlay';
// Mẫu phi y khoa, lời và thời gian giả lập; không có giọng hay người thật.
export const phuHinh = sample as PhuHinhProps;
export const thuyMac: ThuyMacProps = {
  audio: sample.audio, words: sample.words, segments: sample.segments,
  brand: sample.brand, notice: sample.notice,
  scenes: [
    { image: 'samples/muc-mau.svg', atPhrase: 'Đây', accent: 'Mẫu', source: 'Hình và nội dung mẫu · Không phải nguồn khoa học' },
    { image: 'samples/muc-mau.svg', atPhrase: 'Danh sách', source: 'Cảnh mẫu thứ hai · Kiểm chuyển mực' },
    { image: 'samples/muc-mau.svg', atPhrase: 'Các bước', accent: 'Mực', source: 'Cảnh mẫu thứ ba · Phi y khoa' },
  ],
};
