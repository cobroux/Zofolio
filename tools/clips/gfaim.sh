#!/usr/bin/env bash
# GFaim (Android, portrait) : pilote l'émulateur déjà démarré (AVD zofolio-demo, 1080x2340) avec l'APK installé et l'API factice
# seedée (gfaim-seed.sh), enregistre le parcours, produit gfaim-1.{mp4,webm,webp} et gfaim-shot-1..3.png. Usage : gfaim.sh <dossier-temp>
set -euo pipefail
T=${1:?dossier temporaire}; mkdir -p "$T"; ADB=${ADB:-$HOME/Library/Android/sdk/platform-tools/adb}
OUT="$(cd "$(dirname "$0")/../../frontend/public/media" && pwd)"
tap() { $ADB shell input tap "$1" "$2"; }
shot() { $ADB exec-out screencap -p > "$T/s$1.png"; }
$ADB shell pm clear com.gfaim >/dev/null; $ADB shell am start -n com.gfaim/.activities.LoadingActivity >/dev/null
for _ in $(seq 40); do $ADB shell dumpsys activity activities | grep -q 'topResumedActivity.*LoginActivity' && break; sleep 2; done; sleep 3  # attend l'écran de connexion
$ADB shell screenrecord --size 1080x2340 --bit-rate 6000000 --time-limit 60 /sdcard/gfaim.mp4 & rec=$!
sleep 1; tap 540 720; sleep 1; $ADB shell input text demo@example.test; sleep 1; tap 440 896; sleep 1; $ADB shell input text 'Demo-pass-123'; sleep 1
$ADB shell input keyevent 4; sleep 1; tap 540 1136; sleep 8; tap 926 624; sleep 2; shot 1       # connexion, accueil
tap 928 2245; sleep 3; tap 1020 770; sleep 2;  shot 2                      # calendrier, repas du jour
tap 540 1650; sleep 4; shot 3; $ADB shell input swipe 540 1800 540 900 300; sleep 2             # fiche recette
$ADB shell input keyevent 4; sleep 2; tap 408 2245; sleep 2; tap 786 738; sleep 3; $ADB shell input swipe 540 1800 540 900 300; sleep 3  # courses
$ADB shell pkill -2 screenrecord || true; wait $rec || true; sleep 2
$ADB pull /sdcard/gfaim.mp4 "$T/gfaim.mp4" >/dev/null; $ADB shell rm /sdcard/gfaim.mp4
SCALE=540:-2,setpts=PTS/1.9 TRIM=${TRIM:-2} "$(dirname "$0")/encode.sh" "$T/gfaim.mp4" gfaim-1 7
for i in 1 2 3; do  # PNG 720 px, palette 8 bits, sans métadonnées
  ffmpeg -y -loglevel error -i "$T/s$i.png" -vf "scale=720:-2,split[a][b];[a]palettegen[p];[b][p]paletteuse" -map_metadata -1 "$OUT/gfaim-shot-$i.png"
done
