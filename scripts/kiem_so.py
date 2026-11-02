"""Kiểm số trước dựng; chạy từ gốc dự án.

python3 scripts/kiem_so.py THU_MUC [FILE_DU_LIEU ...]
Cần fulltext.md, voice.txt và bang-so.json dạng:
[{"display":"2", "excerpt":"Câu trích có số 2 trong toàn văn", "location":"Bảng mẫu"}]
Số suy ra thêm "formula":"4/2", excerpt chứa các số gốc và phải có trong toàn văn.
Chỉ xác nhận số và trích đoạn tồn tại; vẫn phải đọc ngữ cảnh, đơn vị, nhóm và thời điểm.
"""
import ast
import json
import math
import operator
import re
import sys
from pathlib import Path

NUMBER = re.compile(r"(?<![\w.,])\d+(?:[.,]\d+)?(?![\w])")
OPS = {ast.Add: operator.add, ast.Sub: operator.sub, ast.Mult: operator.mul, ast.Div: operator.truediv}

def numbers(text):
    return {m.group().replace(',', '.') for m in NUMBER.finditer(text)}

def calculate(formula):
    def visit(node):
        if isinstance(node, ast.Constant) and type(node.value) in (int, float):
            return node.value
        if isinstance(node, ast.BinOp) and type(node.op) in OPS:
            return OPS[type(node.op)](visit(node.left), visit(node.right))
        if isinstance(node, ast.UnaryOp) and isinstance(node.op, (ast.UAdd, ast.USub)):
            return visit(node.operand) * (-1 if isinstance(node.op, ast.USub) else 1)
        raise ValueError('Chỉ nhận số và phép + - * /, không nhận mã thực thi')
    value = visit(ast.parse(formula, mode='eval').body)
    if not math.isfinite(value):
        raise ValueError('Kết quả không hữu hạn')
    return value

def main(folder, *extra):
    d = Path(folder)
    full = (d / 'fulltext.md').read_text(encoding='utf-8')
    squash = lambda s: ' '.join(s.split())
    rows = json.loads((d / 'bang-so.json').read_text(encoding='utf-8'))
    allowed, errors = set(), []
    for row in rows:
        display = str(row['display']).replace(',', '.')
        excerpt = row.get('excerpt', '')
        if not excerpt or squash(excerpt) not in squash(full) or not row.get('location'):
            errors.append(f'Thiếu trích đoạn hoặc vị trí: {display}')
            continue
        if 'formula' in row:
            formula = row['formula']
            missing = numbers(formula) - numbers(excerpt) - {'100'}
            try:
                result = calculate(formula)
                digits = len(display.split('.')[1]) if '.' in display else 0
                valid = not missing and abs(result - float(display)) <= .5 * 10 ** (-digits) + 1e-9
            except (ValueError, SyntaxError, ZeroDivisionError, OverflowError):
                valid = False
            if not valid:
                errors.append(f'Công thức không khớp hoặc thiếu số gốc: {display}')
                continue
        elif display not in numbers(excerpt):
            errors.append(f'Số không có trong trích đoạn: {display}')
            continue
        allowed.add(display)
    sources = [d / 'voice.txt'] + [Path(x) for x in extra]
    # TS là mã: chỉ kiểm chữ trong trường hiển thị, tránh coi mốc từ/mã màu là số nghiên cứu.
    fields = r'(?:text|label|headline|sampleSize|source|value|from|to|suffix)\s*:\s*(?:[\'\"]([^\'\"]*)[\'\"]|(-?\d+(?:\.\d+)?))'
    for src in sources:
        content = src.read_text(encoding='utf-8')
        if src.suffix in {'.ts', '.tsx'}:
            content = '\n'.join(a or c for a, c in re.findall(fields, content))
        for n in sorted(numbers(content) - allowed):
            errors.append(f'Số chưa có trong bảng đã kiểm chứng: {n} ({src.name})')
    for error in errors:
        print(error)
    print(f"{d.name}: {'ĐẠT kiểm số; vẫn cần duyệt ngữ cảnh' if not errors else str(len(errors)) + ' lỗi'}")
    return bool(errors)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    try:
        sys.exit(main(*sys.argv[1:]))
    except (OSError, KeyError, TypeError, json.JSONDecodeError) as exc:
        sys.exit(f'Đầu vào kiểm số chưa hợp lệ: {exc}')
