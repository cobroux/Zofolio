#!/usr/bin/env bash
# Usage : encode.sh <entrée.webm> <nom-sortie, ex. oltre-1> [t_affiche en s, défaut 3]
# ADR 0003 : MP4 H.264 + WebM VP9, 24 i/s, sans audio ni métadonnées, <= 2,5 Mo, affiche WebP.
set -euo pipefail
in=$1; name=$2; t=${3:-3}; trim=${TRIM:-0}  # TRIM : secondes à couper au début (chargement)
out="$(cd "$(dirname "$0")/../../frontend/public/media" && pwd)"
v="-an -map_metadata -1 -map_chapters -1 -r 24 -vf scale=1280:-2"
ffmpeg -y -loglevel error -ss "$trim" -i "$in" $v -c:v libx264 -crf 28 -pix_fmt yuv420p -movflags +faststart -fflags +bitexact "$out/$name.mp4"
ffmpeg -y -loglevel error -ss "$trim" -i "$in" $v -c:v libvpx-vp9 -crf 38 -b:v 0 -fflags +bitexact "$out/$name.webm"
ffmpeg -y -loglevel error -ss "$((t + trim))" -i "$in" -frames:v 1 -vf scale=1280:-2 -map_metadata -1 "${TMPDIR:-/tmp}/$name.png"
cwebp -quiet -q 80 -metadata none "${TMPDIR:-/tmp}/$name.png" -o "$out/$name.webp"
rm -f "${TMPDIR:-/tmp}/$name.png"
for f in "$out/$name".{mp4,webm,webp}; do
  size=$(wc -c < "$f")
  echo "$f $((size / 1024)) Ko"
  [ "$size" -le 2621440 ] || { echo "ERREUR : $f dépasse 2,5 Mo" >&2; exit 1; }
done
