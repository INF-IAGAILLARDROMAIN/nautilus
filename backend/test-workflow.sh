#!/bin/bash
# Script de test du workflow métier complet Nautilus
# Usage : bash test-workflow.sh
# Pré-requis :
#   - NestJS tourne sur le port 4001 (npm run start:dev)
#   - 1Password CLI (op) installé et connecté au compte qui a accès au coffre "nautilus"
#   - Le compte test (romain@nautilus.test) existe dans Supabase Auth
#
# Le script :
#   1. Récupère URL Supabase + Publishable Key + identifiants du compte test depuis 1Password
#   2. Se connecte à Supabase pour obtenir un JWT
#   3. Utilise ce JWT comme Bearer token dans toutes les requêtes API NestJS
#   4. Exécute le workflow : Client → Bateau → Devis → validation → OR auto → facturation

set -e  # arrêt au premier erreur

API="http://localhost:4001/api"

echo "═══ 0. Authentification Supabase via 1Password ═══"

# Récupère les credentials Supabase depuis le coffre 1Password "nautilus"
SUPA_CREDS_ITEM="Supabase nautilus-auth — credentials"
TEST_ACCOUNT_ITEM="Nautilus — compte test (Supabase)"

SUPABASE_URL=$(op item get "$SUPA_CREDS_ITEM" --vault nautilus --format json 2>/dev/null | python3 -c "
import json, sys
for f in json.load(sys.stdin).get('fields', []):
    if f.get('label') in ('notesPlain', 'notes') or f.get('purpose') == 'NOTES':
        for line in f.get('value', '').split('\n'):
            if line.strip().startswith('URL'):
                print(line.split(':', 1)[1].strip())
                break
        break
")
SUPABASE_PUB_KEY=$(op item get "$SUPA_CREDS_ITEM" --vault nautilus --format json 2>/dev/null | python3 -c "
import json, sys
for f in json.load(sys.stdin).get('fields', []):
    if f.get('label') in ('notesPlain', 'notes') or f.get('purpose') == 'NOTES':
        for line in f.get('value', '').split('\n'):
            if line.strip().startswith('Publishable'):
                print(line.split(':', 1)[1].strip())
                break
        break
")
TEST_EMAIL=$(op item get "$TEST_ACCOUNT_ITEM" --vault nautilus --fields username --reveal 2>/dev/null)
TEST_PASSWORD=$(op item get "$TEST_ACCOUNT_ITEM" --vault nautilus --fields password --reveal 2>/dev/null)

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_PUB_KEY" ] || [ -z "$TEST_EMAIL" ] || [ -z "$TEST_PASSWORD" ]; then
  echo "❌ Impossible de récupérer les credentials depuis 1Password."
  echo "   Vérifie que les items existent dans le coffre 'nautilus' :"
  echo "     - $SUPA_CREDS_ITEM"
  echo "     - $TEST_ACCOUNT_ITEM"
  exit 1
fi

# Demande un JWT à Supabase Auth
TOKEN_RESPONSE=$(curl -s -X POST "$SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $SUPABASE_PUB_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

JWT=$(echo "$TOKEN_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('access_token', ''))")

if [ -z "$JWT" ]; then
  echo "❌ Échec de l'authentification Supabase :"
  echo "$TOKEN_RESPONSE"
  exit 1
fi

echo "→ JWT obtenu ($(echo $JWT | head -c 20)...)"
AUTH="Authorization: Bearer $JWT"

echo ""
echo "═══ 1. Récupération de Sophie Martin ═══"
SOPHIE_ID=$(curl -s -H "$AUTH" "$API/clients" | python3 -c "
import sys, json
clients = json.load(sys.stdin)['data']
for c in clients:
    if c['nom'] == 'Martin':
        print(c['id']); break
")
echo "→ Sophie : $SOPHIE_ID"

echo ""
echo "═══ 2. Création d'un bateau pour Sophie ═══"
BATEAU=$(curl -s -X POST $API/bateaux -H "$AUTH" -H "Content-Type: application/json" -d "{\"marque\":\"Beneteau\",\"modele\":\"Antares 7\",\"plaqueMoteur\":\"YAM-$(date +%s)\",\"annee\":2024,\"clientId\":\"$SOPHIE_ID\"}")
BATEAU_ID=$(echo "$BATEAU" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
echo "→ Bateau Beneteau Antares 7 (moteur Yamaha F250) créé : $BATEAU_ID"

echo ""
echo "═══ 3. Création d'un devis avec 3 lignes ═══"
DEVIS=$(curl -s -X POST $API/devis -H "$AUTH" -H "Content-Type: application/json" -d "{
  \"bateauId\":\"$BATEAU_ID\",
  \"description\":\"Entretien 100h\",
  \"lignes\":[
    {\"description\":\"Vidange moteur\",\"quantite\":1,\"prixUnitaireHT\":120},
    {\"description\":\"Filtres x3\",\"quantite\":3,\"prixUnitaireHT\":18},
    {\"description\":\"Main d oeuvre 2h\",\"quantite\":2,\"prixUnitaireHT\":65}
  ]
}")
DEVIS_ID=$(echo "$DEVIS" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
NUM_DEVIS=$(echo "$DEVIS" | python3 -c "import sys,json; print(json.load(sys.stdin)['numeroDevis'])")
TOTAL_TTC=$(echo "$DEVIS" | python3 -c "import sys,json; print(json.load(sys.stdin)['totalTTC'])")
echo "→ Devis $NUM_DEVIS créé, total TTC = $TOTAL_TTC EUR"

echo ""
echo "═══ 4. VALIDATION du devis → DÉCLENCHE CRÉATION AUTO DE L OR ═══"
curl -s -X PATCH $API/devis/$DEVIS_ID -H "$AUTH" -H "Content-Type: application/json" -d '{"statut":"VALIDE"}' > /dev/null
echo "→ Devis VALIDÉ"

echo ""
echo "═══ 5. Vérification : un OR a-t-il été créé automatiquement ? ═══"
OR_ID=$(curl -s -H "$AUTH" "$API/or" | python3 -c "import sys,json; ors=json.load(sys.stdin)['data']; print(ors[0]['id'] if ors else 'AUCUN')")
echo "→ OR créé automatiquement : $OR_ID"

echo ""
echo "═══ 6. Assignation à Pierre + EN_COURS puis TERMINÉ ═══"
curl -s -X PATCH $API/or/$OR_ID -H "$AUTH" -H "Content-Type: application/json" -d '{"mecano":"Pierre","statut":"EN_COURS"}' > /dev/null
curl -s -X PATCH $API/or/$OR_ID -H "$AUTH" -H "Content-Type: application/json" -d '{"statut":"TERMINE"}' > /dev/null
echo "→ Mécano = Pierre, statut = TERMINÉ"

echo ""
echo "═══ 7. FACTURATION → GÉNÈRE LE NUMÉRO DE FACTURE AUTOMATIQUEMENT ═══"
NUM_FAC=$(curl -s -X PATCH $API/or/$OR_ID -H "$AUTH" -H "Content-Type: application/json" -d '{"statut":"FACTURE"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['numeroFacture'])")
echo "→ FACTURÉ avec le numéro auto : $NUM_FAC"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  WORKFLOW MÉTIER COMPLET TESTÉ (avec auth JWT Supabase)"
echo "  Client Sophie → Bateau Beneteau Antares 7 → Devis $NUM_DEVIS"
echo "  → OR créé AUTO → Facture $NUM_FAC générée AUTO"
echo "═══════════════════════════════════════════════════════════"
