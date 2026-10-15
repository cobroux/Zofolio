#!/bin/sh
# Exports responsives sans aucune métadonnée (EXIF/GPS) : sips (rotation, taille) -> cwebp/avifenc (n'écrivent pas d'EXIF).
# Le JPEG repasse par un PNG décodé du WebP : sips ne voit alors aucune métadonnée à recopier.
# Usage : scripts/make-images.sh   (originaux lus sur ~/Desktop, jamais commités)
set -e
SRC=$HOME/Desktop
OUT=$(dirname "$0")/../public/img
T=$(mktemp -d); mkdir -p "$OUT"
# nom|fichier|rotation(° horaire, pour l'EXIF non appliqué par les pixels)|largeurs|recadrage "hauteur largeur y x" après rotation (optionnel)
for spec in "portrait|fc5f4402-9f14-4054-9de8-16dd95d2c39c.jpg|0|480 800 1200" \
            "finisher-cote-d-opale|IMG_0124.jpeg|90|640 1280|3765 3012 1506 669" \
            "en-course|IMG_7732.JPG|0|640 1024"; do
  IFS='|' read -r name file rot widths crop <<EOF2
$spec
EOF2
  for w in $widths; do
    sips -r "$rot" "$SRC/$file" --out "$T/r.jpg" >/dev/null
    # Recadrage 4:5 (T34-C) : 900x1125 sur la version 1280 px de large = 3012x3765 sur l'original.
    [ -n "$crop" ] && { set -- $crop; sips --cropToHeightWidth "$1" "$2" --cropOffset "$3" "$4" "$T/r.jpg" --out "$T/r.jpg" >/dev/null; }
    sips --resampleWidth "$w" "$T/r.jpg" --out "$T/a.jpg" >/dev/null   # largeurs <= source : jamais d agrandissement
    n=$(sips -g pixelWidth "$T/a.jpg" | awk '/pixelWidth/{print $2}')   # nom = largeur réelle
    sips -s format png "$T/a.jpg" --out "$T/a.png" >/dev/null
    cwebp -quiet -q 78 -metadata none "$T/a.png" -o "$OUT/$name-$n.webp"
    dwebp -quiet "$OUT/$name-$n.webp" -o "$T/b.png"
    avifenc --ignore-exif --ignore-xmp -q 55 -s 6 "$T/b.png" "$OUT/$name-$n.avif" >/dev/null
    sips -s format jpeg -s formatOptions 78 "$T/b.png" --out "$OUT/$name-$n.jpg" >/dev/null
  done
done
rm -rf "$T"
