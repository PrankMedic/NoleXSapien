"""Chuẩn bị giọng từ video hoặc file ghi âm: tách âm thanh, gỡ băng từng từ, dò nói vấp.

Chạy từ gốc dự án: python3 scripts/chuan_bi_giong.py <nguồn> <thư mục dự án>
Kết quả trong thư mục dự án: goc.wav (48 kHz), words.json dạng [{"w","s","e"}], loi-noi.txt.
"""
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

WHISPER = os.environ.get("WHISPER", "whisper-cli")
MODEL = os.environ.get("WHISPER_MODEL", str(Path.home() / "whisper-models/ggml-large-v3-turbo-q5_0.bin"))
FFMPEG = os.environ.get("FFMPEG", "ffmpeg")


def main(source, project):
    p = Path(project)
    p.mkdir(parents=True, exist_ok=True)
    subprocess.run([FFMPEG, "-v", "error", "-y", "-i", source, "-vn", "-ar", "48000", "-ac", "1", str(p / "goc.wav")], check=True)
    with tempfile.TemporaryDirectory() as d:
        subprocess.run([FFMPEG, "-v", "error", "-y", "-i", str(p / "goc.wav"), "-ar", "16000", f"{d}/a.wav"], check=True)
        subprocess.run([WHISPER, "-m", MODEL, "-f", f"{d}/a.wav", "-l", "vi", "-ml", "1", "-sow", "-mc", "0", "-nf", "-oj", "-of", f"{d}/o", "-np"], check=True, capture_output=True)
        data = json.load(open(f"{d}/o.json"))
    words = [{"w": s["text"].strip(), "s": s["offsets"]["from"] / 1000, "e": s["offsets"]["to"] / 1000} for s in data["transcription"] if s["text"].strip()]
    json.dump(words, open(p / "words.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    report = subprocess.run([sys.executable, "-I", str(Path(__file__).with_name("tim_loi_noi.py")), str(p / "goc.wav")], capture_output=True, text=True, check=True).stdout
    (p / "loi-noi.txt").write_text(report, encoding="utf-8")
    print(p.name, len(words), "từ", words[-1]["e"] if words else 0, "giây")


main(*sys.argv[1:])
