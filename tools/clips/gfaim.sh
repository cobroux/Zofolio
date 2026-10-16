#!/usr/bin/env bash
# GFaim (Android, portrait) : pilote l'émulateur déjà démarré (AVD zofolio-demo, 1080x2340) avec l'APK installé et l'API factice
# VIERGE (base neuve, rien de seedé : l'inscription se fait dans l'appli). Enregistre le parcours à vitesse normale, coupe les
# temps morts (freezedetect : 1,8 s max par segment figé), encode (gfaim-1.{mp4,webm,webp}) et extrait gfaim-shot-1..3.png.
# Usage : gfaim.sh <dossier-temp>   (API : $API, défaut http://127.0.0.1:8087)
set -euo pipefail
T=${1:?dossier temporaire}; mkdir -p "$T"; ADB=${ADB:-$HOME/Library/Android/sdk/platform-tools/adb}; API=${API:-http://127.0.0.1:8087}
HERE="$(cd "$(dirname "$0")" && pwd)"; OUT="$HERE/../../frontend/public/media"
tap() { $ADB shell input tap "$1" "$2"; }
type() { sleep .3; $ADB shell input text "$1"; }   # saisie (le clavier reste ouvert entre deux champs)
hide() { sleep .3; $ADB shell input keyevent 4; }   # ferme le clavier (jamais sans clavier : sinon retour arrière)
shot() { $ADB exec-out screencap -p > "$T/s$1.png"; }
s() { sleep "${1:-1.8}"; }   # pause par écran ; les saisies enchaînent à 0,6 s
$ADB shell settings put secure immersive_mode_confirmations confirmed
$ADB shell pm clear com.gfaim >/dev/null; $ADB shell am start -n com.gfaim/.activities.LoadingActivity >/dev/null
for _ in $(seq 40); do $ADB shell dumpsys activity activities | grep -q 'topResumedActivity.*LoginActivity' && break; sleep 2; done; sleep 2
$ADB shell screenrecord --size 1080x2340 --bit-rate 6000000 --time-limit 180 /sdcard/gfaim.mp4 & rec=$!
sleep 1; s
u() { t=$1; shift; for _ in 1 2 3 4 5 6; do $ADB shell "uiautomator dump /sdcard/u.xml >/dev/null; cat /sdcard/u.xml" | grep -q "$t" && return; "$@"; sleep .7; done; echo "bloqué avant « $t »" >&2; exit 1; }  # retape jusqu'à voir le texte
u 'Hey, Hello' tap 675 1264; s                                   # inscription
tap 540 560; type demo@example.test; tap 540 800; type Utilisateur; tap 540 1040; type Demo; tap 500 1277; type 'Demo123!pass'; hide; s .6; tap 130 1403; s .6; shot 1; s; tap 540 1545; sleep 3   # champs, CGU, valider
u 'Join your family' tap 925 2160; s                              # onboarding : pages puis famille
tap 540 1323; s .6; tap 540 1826; type FamilleDemo; hide; s .6; u 'has been created' tap 540 2025; s   # nouvelle famille
"$HERE/gfaim-seed.sh" "$API" data >/dev/null                      # recettes et repas, pendant l'écran figé
$ADB shell input keyevent 4; s .6; u 'Salut' tap 925 2160; s      # fin de l'onboarding, accueil
u 'Family Group' tap 882 195; s; u 'Changer de famille' tap 540 880; s   # profil, groupe familial
for n in Alex Sam; do                                             # deux membres fictifs
  [ $n = Alex ] && u 'Données' tap 713 1360 || u 'Données' tap 365 1815; s .8; tap 540 898; type $n; hide; s .5
  u 'Changer de famille' tap 925 2160; s 1.2
done
shot 2; u 'Family Group' tap 95 220; s .8; u 'Salut' tap 70 195; s .8   # retour profil, accueil
u 'October' tap 928 2245; s; u 'participant' tap 540 1650; s 3; shot 3   # calendrier, fiche recette
$ADB shell pkill -2 screenrecord || true; wait $rec || true; sleep 2
$ADB pull /sdcard/gfaim.mp4 "$T/gfaim.mp4" >/dev/null; $ADB shell rm /sdcard/gfaim.mp4
# temps morts : on garde 1,8 s max de chaque segment figé (>= 1,5 s), 30 i/s constants, 540 px de large
ffmpeg -i "$T/gfaim.mp4" -vf freezedetect=n=0.003:d=1.5 -map 0:v -f null - 2> "$T/freeze.log" || true
python3 - "$T" <<'PY'
import re, sys
t = sys.argv[1]; log = open(f"{t}/freeze.log").read()
st = [float(x) for x in re.findall(r"freeze_start: ([\d.]+)", log)]; en = [float(x) for x in re.findall(r"freeze_end: ([\d.]+)", log)]
cuts = [f"between(t,{a + 1.8:.3f},{b:.3f})" for a, b in zip(st, en) if b - a > 1.8]
sel = "not(" + "+".join(cuts) + ")" if cuts else "1"
open(f"{t}/filter.txt", "w").write(f"[0:v]fps=30,select='{sel}',setpts=N/(30*TB)[v]\n")
PY
ffmpeg -y -loglevel error -i "$T/gfaim.mp4" -/filter_complex "$T/filter.txt" -map "[v]" -an -c:v libx264 -crf 12 -pix_fmt yuv420p "$T/cut.mp4"
FPS=30 SCALE=540:-2 "$HERE/encode.sh" "$T/cut.mp4" gfaim-1 "${POSTER:-12}"
for i in 1 2 3; do  # PNG 720 px, palette 8 bits, sans métadonnées
  ffmpeg -y -loglevel error -i "$T/s$i.png" -vf "scale=720:-2,split[a][b];[a]palettegen[p];[b][p]paletteuse" -map_metadata -1 "$OUT/gfaim-shot-$i.png"
done
