#!/bin/zsh
# Chạy từ gốc dự án: scripts/ban_tin_duyet.sh SLUG COMPOSITION_ID
# Cần bản nháp Output/ban-tin/SLUG/COMPOSITION_ID.mp4 và data/SLUG.ts.
# Chỉ chạy khi bạn cho phép gọi Codex và agy qua API; tối đa hai vòng duyệt hình.
set -euo pipefail
(( $# == 2 )) || { print -u2 'Cách dùng: ban_tin_duyet.sh SLUG COMPOSITION_ID'; exit 2; }
slug=$1
composition=$2
[[ $slug =~ '^[a-zA-Z0-9-]+$' && $composition =~ '^[a-zA-Z0-9-]+$' ]] || exit 2
project=$PWD
B=$project/Output/ban-tin/$slug
K=$HOME/.claude/skills/video-minh-hoa-flow/scripts
S=${0:A:h}
data=$project/remotion/src/studio/data/$slug.ts
TT=$B/TRANG-THAI.md
[[ -f $B/$composition.mp4 && -f $data ]] || { print -u2 'Thiếu video nháp hoặc dữ liệu tập.'; exit 2; }
tt() { print "$(date '+%H:%M') $*" | tee -a "$TT"; }
sheet() { ffmpeg -v error -y -i "$B/$composition.mp4" -vf 'fps=1/5,scale=216:-1,tile=5x4' -frames:v 1 "$B/sheet.jpg"; }
check() {
  python3 -I "$S/kiem_so.py" "$B" "$data"
  (cd "$project/remotion" && npx --no-install tsc --noEmit)
}
render() {
  (cd "$project/remotion" && npx --no-install remotion render src/index.ts "$composition" "$B/_raw.mp4" --codec=h264)
  "$K/flow_finish.sh" "$B/_raw.mp4" "$B/_next.mp4"
  mv "$B/_next.mp4" "$B/$composition.mp4"
  rm "$B/_raw.mp4"
}
: > "$TT"
check
sheet
for round in 1 2; do
  A=$project/Output/review/$slug-$round
  mkdir -p "$A"
  cp "$B/sheet.jpg" "$A/sheet.jpg"
  cat > "$A/brief.md" <<EOF
Bạn góp ý hình video sức khoẻ, chỉ đọc, không tạo kế hoạch hoặc file. Trả lời trực tiếp bằng tiếng Việt. Không chạy terminal; dùng công cụ đọc ảnh để xem sheet.jpg. Không mở được ảnh thì nói rõ và dừng. Không đoán nội dung ngoài ảnh. Tối đa 5 lỗi hình có tác động, ghi khung và cách sửa. Không góp ý y khoa. Chữ có thể đang hiện dần hoặc tô karaoke. Nếu không còn lỗi hình cần sửa, ghi KHÔNG CÒN LỖI.
EOF
  if ! "$K/giao.sh" agy "$A/brief.md" 6; then tt 'Duyệt hình chưa đạt: xem log, dừng.'; exit 1; fi
  if rg -q 'KHÔNG CÒN LỖI|KHONG CON LOI' "$A/brief.agy.log"; then tt 'Không còn góp ý hình cần sửa.'; break; fi
  cat > "$A/sua.md" <<EOF
Đọc AGENTS.md. Không đọc .env, không commit, không render. Chỉ sửa bố cục remotion/src/studio/BanTin.tsx và chữ trong remotion/src/studio/data/$slug.ts. Không đổi số, nguồn, PMID, words, segments. Đọc góp ý ở $A/brief.agy.log, đối chiếu ảnh $A/sheet.jpg; bỏ góp ý sai, sửa góp ý đúng. Ghi các ý đã làm/bỏ và lý do vào $A/da-loc.md. Không coi góp ý hình là duyệt y khoa hoặc quảng cáo. Chạy kiểm TypeScript.
EOF
  "$K/giao.sh" codex "$A/sua.md" 20 || { tt 'Sửa chưa đạt, dừng.'; exit 1; }
  check || { tt 'Kiểm số hoặc TypeScript chưa đạt, giữ video trước.'; exit 1; }
  render || { tt 'Render lỗi, giữ video trước.'; exit 1; }
  sheet
  tt "Đã sửa và render vòng $round."
done
tt 'Bản nháp đã kiểm hình; cần người có trách nhiệm duyệt nội dung và quảng cáo trước đăng.'
