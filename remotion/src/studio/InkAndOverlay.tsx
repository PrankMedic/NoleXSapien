import { AbsoluteFill, Img, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { Video, Audio } from '@remotion/media';
import { useAudioData, visualizeAudio } from '@remotion/media-utils';
import { PunchCaption, SourceLine } from '../formats/parts';
import { retime, saidAt, saidEnd } from '../formats/timeline';
import { asset, clamp, palette } from './shared';
import type { BaseProps, Anchor } from './types';

export type MediaBase = BaseProps & { brand: string; music?: string; musicVolume?: number };
export type ThuyMacProps = MediaBase & { seed?: number; scenes: readonly (Anchor & { image: string; accent?: string; source?: string })[] };
export type GraphicItem = Anchor & { text: string; value?: number; spoken?: string; spokenNth?: number };
export type Graphic = { kind: 'word' | 'number' | 'list' | 'compare' | 'steps' | 'bars'; text: string; value?: number; spoken?: string; spokenNth?: number; items?: readonly GraphicItem[] };
export type PhuBeat = Anchor & { untilPhrase: string; untilNth?: number; mode: 'full' | 'card' | 'over' | 'cover'; content: Graphic; source?: string; box?: { x: number; y: number; width: number; height: number } };
export type PhuHinhProps = MediaBase & { video: string; face: { x: number; y: number; radius?: number }; beats: readonly PhuBeat[] };
const ink = { ...palette('#F2EBDD', '#AC382B'), onAccent: '#AC382B' };
const captionTheme = { ...ink, accent: 'transparent' };
export const sourceTime = (ms: number, props: BaseProps) => {
  let cursor = 0;
  for (const s of props.segments) { const length = s.toMs - s.fromMs; if (ms < cursor + length) return s.fromMs + ms - cursor; cursor += length; }
  return props.segments[props.segments.length - 1]?.toMs ?? 0;
};
const MediaTrack = ({ props, video = false }: { props: MediaBase & { video?: string }; video?: boolean }) => {
  const { fps } = useVideoConfig(); let cursor = 0;
  return <>{props.segments.map((s, i) => { const from = Math.round(cursor * fps / 1000); cursor += s.toMs - s.fromMs;
    return <Sequence key={i} from={from} durationInFrames={Math.round(cursor * fps / 1000) - from} layout="none">{video && props.video ? <Video src={asset(props.video)} trimBefore={Math.round(s.fromMs * fps / 1000)} trimAfter={Math.round(s.toMs * fps / 1000)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : props.audio ? <Audio src={asset(props.audio)} trimBefore={Math.round(s.fromMs * fps / 1000)} trimAfter={Math.round(s.toMs * fps / 1000)} /> : null}</Sequence>;
  })}{!video && props.music && <Audio src={asset(props.music)} loop volume={props.musicVolume ?? 0.08} />}</>;
};
const Footer = ({ props, source, dark = false, karaoke = false }: { props: MediaBase; source?: string; dark?: boolean; karaoke?: boolean }) => <>
  <PunchCaption words={retime(props.words, props.segments)} theme={dark ? { ...captionTheme, ink: '#FFF8EA', accent: '#E9AE65', onAccent: '#252B29' } : karaoke ? { ...captionTheme, accent: '#AC382B', onAccent: '#FFFFFF' } : captionTheme} top={1330} fontSize={72} maxWords={3} maxChars={19} plain={!karaoke} style={{ left: 80, right: 80, maxHeight: 190, overflow: 'hidden' }} />
  {source && <SourceLine text={source} theme={ink} style={{ left: 80, top: 1570, width: 920, fontSize: 30 }} />}
  <div style={{ position: 'absolute', left: 80, top: 1740, fontSize: 30 }}>{props.brand} {props.notice && ` · ${props.notice}`} {props.aiVoice && ' · Giọng đọc AI'}</div>
</>;
const Wave = ({ props, dark = false }: { props: MediaBase; dark?: boolean }) => {
  const data = useAudioData(asset(props.audio)); const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const samples = data ? visualizeAudio({ audioData: data, frame: Math.round(sourceTime(f / fps * 1000, props) * fps / 1000), fps, numberOfSamples: 64, smoothing: true }) : [];
  return <svg width="920" height="40" style={{ position: 'absolute', left: 80, top: 1270 }}><path d={samples.map((s, i) => `${i ? 'L' : 'M'}${i * 920 / 63},${20 - s * 18}`).join(' ')} fill="none" stroke={dark ? '#FFF8EA' : '#514B40'} strokeWidth={dark ? 4 : 2.5} /></svg>;
};
export const ThuyMac = (props: ThuyMacProps) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig(); const ms = frame * 1000 / fps; const words = retime(props.words, props.segments);
  const starts = props.scenes.map(s => saidAt(words, s.atPhrase, s.nth));
  if (!starts.length || starts.some((s, i) => i > 0 && s <= starts[i - 1])) throw new Error('Cảnh phải có mốc tăng dần.');
  const accents = starts.filter((_, i) => props.scenes[i].accent);
  if (accents.some((s, i) => i > 0 && s - accents[i - 1] < 15000)) throw new Error('Chữ nhấn phải cách nhau ít nhất 15 giây.');
  const index = Math.max(0, starts.reduce((last, s, i) => s <= ms ? i : last, 0)); const scene = props.scenes[index]; const age = ms - starts[index]; const p = clamp((age - (index > 0 ? 550 : 0)) / 1600);
  return <AbsoluteFill style={{ background: ink.bg, color: ink.ink, overflow: 'hidden' }}>

    <svg width="1080" height="1920" style={{ position: 'absolute' }}><defs>
      <filter id="paper"><feTurbulence type="fractalNoise" baseFrequency=".65" numOctaves="3" seed={props.seed ?? 17} /><feColorMatrix type="saturate" values="0" /></filter>
      <filter id="bleed" x="-50%" y="-50%" width="200%" height="200%"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="3" seed={props.seed ?? 17} /><feDisplacementMap in="SourceGraphic" scale="62" xChannelSelector="R" yChannelSelector="G" /></filter>
      <mask id="edge"><rect width="1080" height="1920" fill="black" /><rect x="95" y="515" width="890" height="690" rx="110" fill="white" filter="url(#bleed)" /></mask>
      <mask id="inkReveal"><rect width="1080" height="1920" fill="black" />{[0,1,2,3,4,5].map(i => <ellipse key={i} cx={180 + i % 3 * 340} cy={590 + Math.floor(i / 3) * 350} rx={Math.max(0, p * 900 - i * 18)} ry={Math.max(0, p * 690 - i * 12)} fill="white" filter="url(#bleed)" />)}</mask>
      <mask id="inkWipe"><rect width="1080" height="1920" fill="black" /><ellipse cx="540" cy="840" rx={Math.sin(Math.PI * clamp(age / 1100)) * 1700} ry={Math.sin(Math.PI * clamp(age / 1100)) * 2000} fill="white" filter="url(#bleed)" /></mask>
      <mask id="writing"><path d="M90 260 L990 260 M90 330 L990 330 M90 400 L990 400" stroke="white" strokeWidth="90" strokeDasharray="2700" strokeDashoffset={2700 * (1 - clamp(age / 2000))} /></mask>
    </defs>{index > 0 && age < 550 && <g mask="url(#edge)"><foreignObject x="50" y="470" width="980" height="780"><Img src={asset(props.scenes[index - 1].image)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `translate(${Math.sin(frame / 150) * 8}px, ${Math.cos(frame / 190) * 7}px) scale(${1.04 + frame * .000025})` }} /></foreignObject></g>}<g mask="url(#edge)"><g mask="url(#inkReveal)"><foreignObject x="50" y="470" width="980" height="780"><div style={{ width: '100%', height: '100%', transform: `translate(${Math.sin(frame / 150) * 8}px, ${Math.cos(frame / 190) * 7}px) scale(${1.04 + frame * 0.000025})` }}><Img src={asset(scene.image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div></foreignObject></g></g>
    <rect width="1080" height="1920" filter="url(#paper)" opacity=".11" transform={`translate(${Math.sin(frame / 130) * 4} ${Math.cos(frame / 170) * 4})`} />
    {index > 0 && age < 1100 && <rect width="1080" height="1920" fill="#252B29" mask="url(#inkWipe)" />}
    {scene.accent && <text x="100" y="350" fontSize="108" fontFamily="serif" fontStyle="italic" fill="#AC382B" mask="url(#writing)">{scene.accent}</text>}
    </svg>
    <AbsoluteFill style={{ pointerEvents: 'none', background: `radial-gradient(ellipse at ${40 + Math.sin(frame / 170) * 20}% 35%, #fff5 0%, transparent 65%)` }} />
    <div style={{ position: 'absolute', left: 80, top: 1200, fontSize: 28 }}>Hình minh hoạ</div>
    {props.audio && <Wave props={props} dark={index > 0 && age < 1100} />}<Footer props={props} source={scene.source} dark={index > 0 && age < 1100} /><MediaTrack props={props} />
  </AbsoluteFill>;
};
const rectFor = (mode: PhuBeat['mode']) => mode === 'card' ? { x: 280, y: 100, width: 520, height: 570 } : mode === 'cover' ? { x: 80, y: 100, width: 0, height: 0 } : { x: 80, y: 100, width: 920, height: 1160 };
export const graphicBox = (beat: PhuBeat) => beat.box ?? (beat.mode === 'card' ? { x: 80, y: 710, width: 920, height: 570 } : beat.mode === 'over' ? { x: 80, y: 820, width: 920, height: 460 } : { x: 80, y: 200, width: 920, height: 1080 });
export const PhuHinh = (props: PhuHinhProps) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig(); const ms = frame / fps * 1000; const words = retime(props.words, props.segments);
  const times = props.beats.map(b => ({ start: saidAt(words, b.atPhrase, b.nth), end: saidEnd(words, b.untilPhrase, b.untilNth) }));
  let fullStart = 0;
  times.forEach((t, i) => {
    if (props.beats[i].mode === 'full') {
      if (!i || props.beats[i - 1].mode !== 'full' || t.start > times[i - 1].end) fullStart = t.start;
      if (t.end - fullStart > 8000) throw new Error('Chuỗi full liên tiếp quá 8 giây.');
    }
    if (t.end <= t.start || (i && t.start < times[i - 1].end)) throw new Error('Đoạn phủ hình đảo mốc hoặc chồng nhau.'); });
  const index = times.findIndex(t => ms >= t.start && ms < t.end); const beat = props.beats[index];
  const hasGraphic = (b: PhuBeat) => Boolean(b.content.text.trim() || b.content.value !== undefined || b.content.items?.length);
  const modeFor = (b: PhuBeat): PhuBeat['mode'] => hasGraphic(b) ? b.mode : 'full';
  const mode = beat ? modeFor(beat) : 'full';
  if (beat?.mode === 'full' && times[index].end - times[index].start > 8000) throw new Error('Đoạn full quá 8 giây.');
  const events = times.flatMap((time, i) => [{at: time.start, mode: modeFor(props.beats[i]), order: 1}, {at: time.end, mode: 'full' as const, order: 0}]).sort((a,b) => a.at-b.at || a.order-b.order);
  let fromRect = rectFor('full'); let target = fromRect; let changed = 0;
  const between = (at: number) => {
    const p = clamp((at-changed)/650); const eased = p*p*(3-2*p);
    return {x: fromRect.x+(target.x-fromRect.x)*eased, y: fromRect.y+(target.y-fromRect.y)*eased, width: fromRect.width+(target.width-fromRect.width)*eased, height: fromRect.height+(target.height-fromRect.height)*eased};
  };
  for (const event of events) {
    if (event.at > ms) break;
    fromRect = between(event.at); target = rectFor(event.mode); changed = event.at;
  }
  const r = between(ms);
  const box = beat ? graphicBox(beat) : {x:80,y:620,width:920,height:620};
  if (box.width <= 0 || box.height <= 0 || box.x < 64 || box.y < 100 || box.x + box.width > 1016 || box.y + box.height > 1280) throw new Error('Đồ hoạ ngoài vùng an toàn.');
  if (![props.face.x, props.face.y].every(v => Number.isFinite(v) && v >= 0 && v <= 1) || !((props.face.radius ?? .14) > 0 && (props.face.radius ?? .14) <= 1)) throw new Error('face phải là toạ độ chuẩn hoá 0–1.');
  // face là toạ độ chuẩn hoá trong video dọc 9:16, radius tính theo bề rộng.
  const mediaWidth = Math.min(r.width, r.height * 9 / 16); const mediaHeight = mediaWidth * 16 / 9; const fx = r.x + (r.width-mediaWidth)/2 + props.face.x * mediaWidth; const fy = r.y + (r.height-mediaHeight)/2 + props.face.y * mediaHeight; const radius = (props.face.radius ?? .14) * mediaWidth;
  if (mode === 'over' && fx + radius > box.x && fx - radius < box.x+box.width && fy+radius > box.y && fy-radius < box.y+box.height) throw new Error('Đồ hoạ over chạm vùng mặt; đổi box hoặc dùng card.');
  const beatColor = ['#DCE9DF', '#F1D8BE', '#DDE4F1', '#EADDEB'][Math.max(0, index) % 4];
  return <AbsoluteFill style={{ background: ink.bg, color: ink.ink, fontFamily: 'sans-serif', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', left: 540 + Math.sin(frame / 85) * 36, top: 650 + Math.cos(frame / 100) * 28, width: 650, height: 650, borderRadius: '45%', background: beatColor, transform: `rotate(${frame / 9}deg)`, opacity: .65 }} />
    <div style={{ position: 'absolute', left: r.x, top: r.y, width: r.width, height: r.height, borderRadius: 36, overflow: 'hidden', background: '#252B29' }}>{props.video ? <MediaTrack props={props} video /> : <div style={{ padding: 30, fontSize: 40 }}>Khung video mẫu</div>}</div>
    {mode === 'cover' && <div style={{ position: 'absolute', left: 0, top: 200, width: 1080, height: 1080, background: beatColor, overflow: 'hidden' }}><div style={{ position: 'absolute', width: 760, height: 760, border: '90px solid #ffffff55', borderRadius: '50%', left: 480 + Math.sin(frame / 75) * 40, top: 280 + Math.cos(frame / 90) * 30, transform: `rotate(${frame / 8}deg)` }} /></div>}
    {beat && mode !== 'full' && <div style={{ position: 'absolute', left: box.x, top: box.y, width: box.width, height: box.height, overflow: 'hidden', overflowWrap: 'anywhere', fontSize: 72, lineHeight: 1.15, fontWeight: 700 }}><GraphicView graphic={beat.content} words={words} ms={ms} start={times[index].start} end={times[index].end} /></div>}
    <Footer props={props} source={beat?.source} karaoke />
    {!props.video && props.audio && <MediaTrack props={{ ...props, music: undefined }} />}
    {props.music && <Audio src={asset(props.music)} loop volume={props.musicVolume ?? .08} />}
  </AbsoluteFill>;
};
const GraphicView = ({ graphic: g, words, ms, start, end }: { graphic: Graphic; words: ReturnType<typeof retime>; ms: number; start: number; end: number }) => {
  const localWords = words.filter(w => w.startMs >= start && w.startMs < end);
  const count = (value: number, end: number, began: number) => {
    if (ms >= end || end <= began) return value;
    const unit = Number.isInteger(value) ? 1 : 10 ** -(String(value).split('.')[1]?.length ?? 0);
    return Math.trunc(value * clamp((ms - began) / (end - began)) / unit) * unit;
  };
  const numberEnd = g.kind === 'number' ? saidEnd(localWords, g.spoken ?? String(g.value), g.spokenNth) : start;
  const progress = (at: number) => { const p = clamp((ms - at) / 420); return 1 - (1 - p) ** 3; };
  const colors = ['#AC382B', '#28594D', '#345485', '#805035'];
  return <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
    {g.text && <div style={{ fontSize: 96, fontWeight: 900, lineHeight: 1.02, letterSpacing: -3, opacity: progress(start), transform: `translateY(${(1 - progress(start)) * 45}px)` }}>{g.text}</div>}
    {g.kind === 'number' && <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 240, fontWeight: 900, lineHeight: 1, color: ink.accent, fontVariantNumeric: 'tabular-nums' }}>{count(g.value ?? 0, numberEnd, start)}</div>}
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: g.kind === 'compare' ? 'row' : 'column', gap: g.kind === 'compare' ? 48 : 18, position: 'relative' }}>
      {g.kind === 'steps' && <div style={{ position: 'absolute', left: 44, top: 25, bottom: 25, width: 8, background: '#AC382B55' }} />}
      {g.kind === 'compare' && <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 2, borderRadius: 50, background: ink.ink, color: '#FFFFFF', fontSize: 40, fontWeight: 900, padding: '18px 10px', border: '5px solid #F2EBDD' }}>VS</div>}
      {g.items?.map((item, i) => {
        const at = saidAt(words, item.atPhrase, item.nth); if (ms < at) return null;
        const end = item.value !== undefined ? saidEnd(localWords, item.spoken ?? String(item.value), item.spokenNth) : at;
        const max = Math.max(1, ...g.items!.map(x => Math.abs(x.value ?? 0)));
        const p = progress(at); const color = colors[i % colors.length];
        return <div key={i} style={{ position: 'relative', flex: 1, minHeight: g.kind === 'bars' ? 110 : 100, display: 'flex', flexDirection: g.kind === 'compare' ? 'column' : 'row', alignItems: g.kind === 'compare' ? 'center' : 'flex-start', justifyContent: g.kind === 'compare' ? 'center' : 'flex-start', gap: 18, padding: g.kind === 'compare' ? '32px 24px' : '18px 24px', borderRadius: 28, background: g.kind === 'bars' ? '#FFFFFFCC' : color, color: g.kind === 'bars' ? ink.ink : '#FFFFFF', opacity: p, transform: `translateX(${(1-p) * (i % 2 ? 90 : -90)}px)`, boxSizing: 'border-box' }}>
          {g.kind === 'steps' && <div style={{ flexShrink: 0, width: 64, height: 80, borderRadius: 18, background: '#FFFFFF', color, fontSize: 72, fontWeight: 900, textAlign: 'center', lineHeight: '80px' }}>{i + 1}</div>}
          <div style={{ width: g.kind === 'bars' ? '100%' : undefined, minWidth: 0, fontSize: 72, fontWeight: 800, lineHeight: 1.08 }}>
            {item.text}
            {item.value !== undefined && <span style={{ display: g.kind === 'compare' ? 'block' : 'inline', fontSize: g.kind === 'compare' ? 100 : 72, fontVariantNumeric: 'tabular-nums' }}> {count(item.value, end, at)}</span>}
            {g.kind === 'bars' && <div style={{ marginTop: 14, height: 70, borderRadius: 16, background: '#252B2914', overflow: 'hidden' }}><div style={{ height: '100%', width: `${Math.abs(item.value ?? 0) / max * 100 * clamp((ms-at)/Math.max(420,end-at))}%`, borderRadius: 16, background: color }} /></div>}
          </div>
        </div>;
      })}
    </div>
  </div>;
};
