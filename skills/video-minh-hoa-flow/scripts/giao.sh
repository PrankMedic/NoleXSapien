#!/bin/zsh
# Hand a brief to another agent with a time limit; both hung for hours when left unbounded.
# Usage: giao.sh codex|agy BRIEF.md [minutes] [tiep]   (chạy từ gốc dự án; log goes next to the brief)
# "tiep" (agy only) continues the latest conversation for a follow-up brief on the same task.
set -uo pipefail

(( $# >= 2 )) || { print -u2 "Cách dùng: giao.sh codex|agy BRIEF.md [phút]"; exit 2 }

agent=$1
brief=$2
minutes=${3:-8}
[[ $minutes == <-> && $minutes -gt 0 ]] || { print -u2 'Số phút phải là số nguyên dương.'; exit 2; }
[[ -f $brief ]] || { print -u2 'Không tìm thấy brief.'; exit 2; }
log=${brief:r}.$agent.log
prompt="Đọc và làm theo file $brief. Tuân thủ AGENTS.md."

# Codex CLI cần có trong PATH.
codex_bin=$(command -v codex || true)

case $agent in
  codex) [[ -n $codex_bin ]] || { print -u2 "Chưa cài codex trong PATH."; exit 2; }; cmd=("$codex_bin" exec --skip-git-repo-check --sandbox workspace-write "$prompt") ;;
  agy)
    # API key for this process only, read from .env without printing it.
    repo=$PWD
    key=${GEMINI_API_KEY:-$(sed -n 's/^GEMINI_API_KEY=//p' "$repo/.env" 2>/dev/null | head -1 | tr -d "\"'")}
    [[ -n $key ]] || { print -u2 "Chưa có GEMINI_API_KEY trong .env."; exit 2 }
    export GEMINI_API_KEY=$key
    # Chạy ở thư mục review chỉ chứa file cần thiết; brief phải cấm đọc khoá.
    log=${brief:A:r}.agy.log
    cd "${brief:h}" || exit 2
    # modelProvider is set per session so agy can never fall back to the Google login.
    agy_settings='{"modelProvider":"gemini","permissions":{"allow":["command(ls)","command(pwd)","command(ls *)","command(cat *)","command(find *)","command(grep *)","command(head *)","command(sed -n *)","command(wc *)"]}}'
    cmd=(agy -p "Đọc và làm theo file ${brief:t}." --mode plan --print-timeout "${minutes}m" --settings "$agy_settings")
    [[ ${4:-} == tiep ]] && cmd+=(--continue)
    # agy is only meant to read; anything newer than this marker gets reported after the run.
    brief_dir=$PWD
    marker=$(mktemp)
    trap 'rm -f "$marker"' EXIT ;;
  *) print -u2 "Tác nhân không hợp lệ: $agent"; exit 2 ;;
esac

# agy sometimes asks for a command headless mode must deny and exits 0 with no answer, so it gets three tries.
for attempt in 1 2 3; do
  "${cmd[@]}" </dev/null >"$log" 2>&1 &
  pid=$!
  n=0
  while kill -0 $pid 2>/dev/null && (( n < minutes * 10 )); do
    /bin/sleep 6
    n=$((n + 1))
  done
  if kill -0 $pid 2>/dev/null; then
    kill $pid
    print -u2 "Quá $minutes phút, đã dừng. Log: $log"
    exit 124
  fi
  wait $pid
  code=$?
  grep -q 'no output produced' "$log" || break
  print -u2 "$agent không trả lời, lần $attempt."
done
if grep -q 'no output produced' "$log"; then
  print -u2 "$agent không trả lời sau 3 lần. Log: $log"
  exit 3
fi
if [[ $agent == agy ]]; then
  changed=$(
    find "$brief_dir" -type f -newer "$marker" ! -name '*.agy.log'
    if git -C "$repo" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    git -C "$repo" ls-files -m -o --exclude-standard | while IFS= read -r f; do
      [[ "$repo/$f" -nt "$marker" ]] && print -r -- "$f"
    done
    fi
  )
  if [[ -n $changed ]]; then
    print -u2 "File đổi trong lúc agy chạy (do agy hoặc phiên khác), kiểm tra trước khi dùng kết quả:"
    print -u2 -r -- "$changed"
    print "$agent xong, mã $code, có file đổi. Log: $log"
    exit 4
  fi
fi
print "$agent xong, mã $code. Log: $log"
exit $code
