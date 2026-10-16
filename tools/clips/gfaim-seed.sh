#!/usr/bin/env bash
# Données 100 % factices pour GFaim : utilisateur « Démo », 4 recettes, repas de la semaine, courses. Usage : gfaim-seed.sh [API] [data]
set -euo pipefail
A=${1:-http://127.0.0.1:8087}; J='Content-Type: application/json'
post() { curl -sf -XPOST "$A$1" -H "$J" ${T:+-H "Authorization: Bearer $T"} -d "$2"; }
# Sans arg 2 : crée l'utilisateur et sa famille. Avec « data » : l'utilisateur et la famille existent déjà (inscription faite dans l'appli), ne sème que recettes, repas et courses.
if [ "${2:-}" = data ]; then T=$(post /auth/login '{"email":"demo@example.test","password":"Demo123!pass"}' | python3 -c 'import sys,json;print(json.load(sys.stdin)["access_token"])')
else
post /auth/signup '{"email":"demo@example.test","password":"Demo123!pass","first_name":"Demo","last_name":"Utilisateur"}' >/dev/null
T=$(post /auth/login '{"email":"demo@example.test","password":"Demo123!pass"}' | python3 -c 'import sys,json;print(json.load(sys.stdin)["access_token"])')
code=$(post /families '{"family_name":"FamilleDemo"}' | python3 -c 'import sys,json;print(json.load(sys.stdin)["code"])')
post /members "{\"has_account\":true,\"first_name\":\"Demo\",\"last_name\":\"Utilisateur\",\"family_code\":\"$code\",\"user_email\":\"demo@example.test\"}" >/dev/null
fi
# recette : nom, préparation, cuisson, calories ; étapes avec ingrédients (catalogue FR : 1 poulet, 2 saumon, 5 avocat, 13 basilic, 15 riz basmati, 32 brocoli, 36 beurre, 286 tomates, 109 oeufs, 217 parmesan, 134 ail)
recipe() { post /recipes "{\"name\":\"$1\",\"preparation_minutes\":$2,\"cooking_minutes\":$3,\"ready_in_minutes\":$(($2+$3)),\"nb_servings\":4,\"price_per_serving\":3.2,\"calories\":$4,\"protein\":28,\"carbs\":42,\"fat\":14,\"steps\":[{\"description\":\"$5\",\"step_number\":1,\"ingredients\":[{\"quantity\":$6,\"ingredient_catalog_id\":$7,\"unit_id\":2}]},{\"description\":\"$8\",\"step_number\":2,\"ingredients\":[{\"quantity\":$9,\"ingredient_catalog_id\":${10},\"unit_id\":2}]}]}" | python3 -c 'import sys,json;print(json.load(sys.stdin)["id"])'; }
R1=$(recipe "Poulet basilic et riz" 15 25 520 "Faire dorer le poulet." 400 1 "Ajouter le basilic et servir avec le riz." 250 15)
R2=$(recipe "Saumon et brocolis" 10 20 430 "Cuire le saumon au four." 500 2 "Vapeur de brocolis." 400 32)
R3=$(recipe "Salade d'avocat et tomates" 10 0 310 "Couper les avocats." 300 5 "Ajouter les tomates et le basilic." 250 286)
R4=$(recipe "Gratin de pâtes au parmesan" 20 30 610 "Cuire les pâtes." 300 134 "Gratiner avec le parmesan." 100 217)
d() { date -v+"$1"d +%F 2>/dev/null || date -d "+$1 day" +%F; }
meal() { post "/families/1/meals" "{\"date\":\"$(d $1)\",\"meal_type\":\"$2\",\"recipe_id\":$3}" >/dev/null; }
meal 0 BREAKFAST $R3; meal 1 BREAKFAST $R3; meal 2 BREAKFAST $R3; meal 0 LUNCH $R1; meal 0 DINNER $R2; meal 1 LUNCH $R3; meal 1 DINNER $R4; meal 2 LUNCH $R2; meal 2 DINNER $R1; meal 3 DINNER $R3
for n in chicken salmon avocado broccoli milk eggs tomatoes; do post /families/1/shopping/ingredients "[{\"name\":\"$n\"}]" >/dev/null || echo "courses: $n ignoré" >&2; done
echo "seed ok"
