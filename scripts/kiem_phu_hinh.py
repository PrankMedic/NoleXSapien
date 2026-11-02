"""Kiểm dữ liệu PhuHinh: python3 scripts/kiem_phu_hinh.py du-lieu.json.

words dùng {text,startMs,endMs} hoặc {w,s,e} (giây). face chuẩn hoá 0–1
trên nguồn dọc 9:16. box tính bằng px trong composition 1080×1920.
Chỉ kiểm cấu trúc và mốc; không thay duyệt hình hoặc duyệt y khoa.
"""
import json
import math
import re
import sys
import unicodedata


def norm(text):
    return ''.join(c for c in unicodedata.normalize('NFC', str(text)).lower() if c.isalnum() or c == '%')


def rect_for(mode):
    if mode == 'card':
        return (80, 100, 360, 470)
    if mode == 'cover':
        return (80, 100, 0, 0)
    return (80, 100, 920, 1160)


def moving_rect(events, ms):
    origin = target = rect_for('card')
    changed = 0

    def between(at):
        t = max(0, min(1, (at-changed)/650))
        t = t*t*(3-2*t)
        return tuple(a+(b-a)*t for a, b in zip(origin, target))

    for at, order, mode in sorted(events):
        if at > ms:
            break
        origin = between(at)
        target = rect_for(mode)
        changed = at
    return between(ms)


def check(data):
    errors = []
    if not isinstance(data, dict):
        raise ValueError('Gốc JSON phải là object props.')
    if not data.get('words') or not data.get('segments') or not data.get('beats'):
        raise ValueError('words, segments và beats không được rỗng.')
    original = [dict(text=w.get('text', w.get('w')), startMs=w['startMs'] if 'startMs' in w else w['s'] * 1000,
                     endMs=w['endMs'] if 'endMs' in w else w['e'] * 1000) for w in data['words']]
    for w in original:
        if not isinstance(w['text'], str) or not all(isinstance(w[k], (int, float)) and math.isfinite(w[k]) for k in ('startMs', 'endMs')) or not 0 <= w['startMs'] < w['endMs']:
            raise ValueError('Từ cần text và mốc thời gian hữu hạn, tăng dần.')
    words, offset = [], 0
    for s in data['segments']:
        if not all(isinstance(s[k], (int, float)) and math.isfinite(s[k]) for k in ('fromMs', 'toMs')) or s['fromMs'] < 0:
            raise ValueError('Segment cần mốc hữu hạn, không âm.')
        if s['toMs'] <= s['fromMs']:
            errors.append('Đoạn giữ lại không có độ dài dương.')
        for w in original:
            if s['fromMs'] <= w['startMs'] < s['toMs']:
                words.append(dict(text=w['text'], startMs=w['startMs']-s['fromMs']+offset,
                                  endMs=min(w['endMs'], s['toMs'])-s['fromMs']+offset))
        offset += s['toMs']-s['fromMs']

    def phrase(text, nth=0, end=False, scope=None):
        selected = words if scope is None else scope
        target = [norm(t) for t in text.split() if norm(t)]
        matches = [i for i in range(len(selected)-len(target)+1) if target and
                   [norm(w['text']) for w in selected[i:i+len(target)]] == target]
        if nth < 0 or nth >= len(matches):
            raise ValueError(f'Không tìm thấy mốc: {text!r}, lần {nth+1}')
        return selected[matches[nth]+(len(target)-1 if end else 0)]['endMs' if end else 'startMs']

    face = data['face']
    if not all(isinstance(face.get(k), (int, float)) and 0 <= face[k] <= 1 for k in ('x', 'y')):
        errors.append('face phải là toạ độ chuẩn hoá 0–1.')
    if not 0 < face.get('radius', .14) <= 1:
        errors.append('Bán kính mặt phải lớn hơn 0 và không quá 1.')
    resolved, events = [], []
    previous = 0
    previous_mode = None
    full_start = 0
    for i, b in enumerate(data['beats']):
        try:
            start = phrase(b['atPhrase'], b.get('nth', 0))
            end = phrase(b['untilPhrase'], b.get('untilNth', 0), True)
            if end <= start or start < previous:
                errors.append(f'Đoạn {i}: đảo mốc hoặc chồng đoạn.')
            if b['mode'] == 'full':
                if previous_mode != 'full' or start > previous:
                    full_start = start
                if end - full_start > 8000:
                    errors.append(f'Đoạn {i}: chuỗi full liên tiếp quá 8 giây.')
            previous_mode = b['mode']
            previous = end
            if b['mode'] not in ('full', 'card', 'over', 'cover'):
                errors.append(f'Đoạn {i}: mode không hợp lệ.')
            if b['mode'] == 'full' and end-start > 8000:
                errors.append(f'Đoạn {i}: full dài {(end-start)/1000:g} giây, quá 8 giây.')
            box = b.get('box', dict(x=80, y=900, width=920, height=340) if b['mode'] == 'over' else
                        dict(x=80, y=620, width=920, height=620) if b['mode'] == 'card' else dict(x=80,y=250,width=920,height=990))
            if not all(isinstance(v, (int, float)) and math.isfinite(v) for v in box.values()) or box['width'] <= 0 or box['height'] <= 0 or box['x'] < 64 or box['y'] < 100 or box['x']+box['width'] > 1016 or box['y']+box['height'] > 1260:
                errors.append(f'Đoạn {i}: đồ hoạ ngoài vùng an toàn.')
            resolved.append((i, start, end, b, box))
            events.extend([(start, 1, b['mode']), (end, 0, 'card')])
            if b['mode'] == 'over':
                f = data['face']; width = min(920, 1160*9/16); height = width*16/9
                fx = 80+(920-width)/2+f['x']*width; fy = 100+(1160-height)/2+f['y']*height
                radius = f.get('radius', .14)*width
                if fx+radius > box['x'] and fx-radius < box['x']+box['width'] and fy+radius > box['y'] and fy-radius < box['y']+box['height']:
                    errors.append(f'Đoạn {i}: over đè vùng mặt (khung ổn định); kiểm thêm lúc chuyển khung.')
            g = b['content']
            if g['kind'] not in ('word','number','list','compare','steps','bars'):
                errors.append(f'Đoạn {i}: kiểu đồ hoạ không hợp lệ.')
            nodes = [g, *g.get('items', [])]
            local_words = [w for w in words if start <= w['startMs'] < end]
            spoken_text = ' '.join(w['text'] for w in words if start <= w['startMs'] < end)
            spoken_numbers = set(re.findall(r'\d+(?:[.,]\d+)?%?', spoken_text))
            for node in nodes:
                at = phrase(node['atPhrase'], node.get('nth', 0)) if 'atPhrase' in node else start
                if not start <= at < end:
                    errors.append(f'Đoạn {i}: mốc mục nằm ngoài đoạn.')
                for n in re.findall(r'\d+(?:[.,]\d+)?%?', node.get('text', '')):
                    if n not in spoken_numbers:
                        errors.append(f'Đoạn {i}: chữ số {n} trên hình không có trong lời đoạn này.')
                if 'value' in node:
                    if not isinstance(node['value'], (int, float)) or not math.isfinite(node['value']):
                        errors.append(f'Đoạn {i}: value phải là số hữu hạn.')
                        continue
                    alias = node.get('spoken', str(node['value']))
                    number_start = phrase(alias, node.get('spokenNth', 0), scope=local_words)
                    number_end = phrase(alias, node.get('spokenNth', 0), end=True, scope=local_words)
                    if not at <= number_start < number_end <= end:
                        errors.append(f'Đoạn {i}: số {node["value"]} không được nói trong thời gian hiện mục.')
        except (KeyError, ValueError, TypeError) as exc:
            errors.append(f'Đoạn {i}: {exc}')
    # Cùng phép nội suy với component; kiểm từng frame 30 fps trong 650 ms
    # sau mọi thay đổi khung, cùng thời điểm bắt đầu beat và khung ổn định.
    if not errors:
        for i, start, end, beat, box in resolved:
            if beat['mode'] != 'over':
                continue
            probes = {start, max(start, end-0.001)}
            for at, _, _ in events:
                probes.update(at + frame*1000/30 for frame in range(21)
                              if start <= at + frame*1000/30 < end)
            for ms in sorted(probes):
                x, y, rw, rh = moving_rect(events, ms)
                width = min(rw, rh*9/16)
                height = width*16/9
                fx = x+(rw-width)/2+face['x']*width
                fy = y+(rh-height)/2+face['y']*height
                radius = face.get('radius', .14)*width
                if width > 0 and fx+radius > box['x'] and fx-radius < box['x']+box['width'] and fy+radius > box['y'] and fy-radius < box['y']+box['height']:
                    errors.append(f'Đoạn {i}: over đè vùng mặt khi chuyển khung tại {ms:.0f} ms.')
                    break
    return errors


def main():
    try:
        with open(sys.argv[1], encoding='utf-8') as file:
            errors = check(json.load(file))
    except (IndexError, OSError, ValueError, KeyError, TypeError, AttributeError, OverflowError) as exc:
        print(f'Lỗi dữ liệu: {exc}'); return 2
    print('\n'.join(errors) if errors else 'Đạt kiểm tra dữ liệu; vẫn cần xem hình, nghe và duyệt nội dung.')
    return 1 if errors else 0


if __name__ == '__main__':
    sys.exit(main())
