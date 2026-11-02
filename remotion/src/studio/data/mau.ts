import words from './words/mau.json';
import type * as T from '../types';
import type { BanTinProps } from '../BanTin';
// Dữ liệu mẫu phi y khoa, chỉ để thử bố cục; không phải bằng chứng.
export const base: T.BaseProps = { audio: '', words, segments: [{fromMs: 0, toMs: 4000}], notice: 'Dữ liệu mẫu' };
const beat = {atPhrase: 'Đây', label: 'Dữ liệu mẫu'};
export const kinetic: T.KineticTypeProps = {...base, phrases: [beat]};
export const mechanism: T.MechanismProps = {...base, scenes: [{...beat, focus: 'overview', items: ['Bước mẫu A', 'Bước mẫu B']}]};
export const chart: T.ChartStoryProps = {...base, scenes: [{...beat, charts: [{kind: 'bar', title: 'Dữ liệu mẫu', unit: 'đơn vị mẫu', values: [{label: 'A', value: 2}, {label: 'B', value: 3}]}]}]};
export const versus: T.VersusProps = {...base, left: 'Mẫu A', right: 'Mẫu B', criteria: [{...beat, leftText: 'Chữ A', rightText: 'Chữ B'}]};
export const myth: T.MythFactProps = {...base, rounds: [{...beat, revealPhrase: 'mẫu', verdict: 'CHƯA ĐỦ', explanation: 'Chỉ thử bố cục'}]};
export const chat: T.ChatQAProps = {...base, messages: [{...beat, role: 'question'}]};
export const journey: T.JourneyProps = {...base, milestones: [{...beat, week: 'Bước mẫu', note: 'Nội dung minh hoạ'}]};
export const news: T.NewsDeskProps = {...base, stories: [{...beat, headline: 'Dữ liệu mẫu', studyType: 'Không phải nghiên cứu', sampleSize: 'Không áp dụng'}]};
export const podcast: T.PodcastWaveProps = {...base, chapters: [{...beat, quote: 'Đây là dữ liệu mẫu'}]};
export const carousel: T.CarouselSlideProps = {page: 1, pages: 1, title: 'Dữ liệu mẫu', content: ['Nội dung phi y khoa để thử bố cục'], source: 'Không phải tài liệu khoa học'};
export const bulletin: BanTinProps = {...base, brand: 'Dữ liệu mẫu', episode: 1, source: 'Dữ liệu mẫu — không phải nguồn khoa học', scenes: [{...beat, kind: 'hook', items: [{atPhrase: 'Đây', text: 'Đây là dữ liệu mẫu'}]}]};
