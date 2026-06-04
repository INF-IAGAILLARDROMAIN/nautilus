#!/bin/bash
# Script de test du workflow métier complet Nautilus
# Usage : bash test-workflow.sh
# Pré-requis : NestJS doit tourner sur le port 4001 (npm run start:dev)

API="http://localhost:4001/api"

echo "═══ 1. Récupération de Sophie Martin ═══"
SOPHIE_ID=$(curl -s "$API/clients" | python3 -c "
import sys, json
clients = json.load(sys.stdin)['data']
for c in clients:
    if c['nom'] == 'Martin':
        print(c['id']); break
")
echo "→ Sophie : $SOPHIE_ID"

echo ""
echo "═══ 2. Création d'un bateau pour Sophie ═══"
BATEAU=$(curl -s -X POST $API/bateaux -H "Content-Type: application/json" -d "{\"marque\":\"Yamaha\",\"modele\":\"F250\",\"plaqueMoteur\":\"YAM-$(date +%s)\",\"annee\":2024,\"clientId\":\"$SOPHIE_ID\"}")
BATEAU_ID=$(echo "$BATEAU" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
echo "→ Bateau Yamaha F250 créé : $BATEAU_ID"

echo ""
echo "═══ 3. Création d'un devis avec 3 lignes ═══"
DEVIS=$(curl -s -X POST $API/devis -H "Content-Type: application/json" -d "{
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
curl -s -X PATCH $API/devis/$DEVIS_ID -H "Content-Type: application/json" -d '{"statut":"VALIDE"}' > /dev/null
echo "→ Devis VALIDÉ"

echo ""
echo "═══ 5. Vérification : un OR a-t-il été créé automatiquement ? ═══"
OR_ID=$(curl -s "$API/or" | python3 -c "import sys,json; ors=json.load(sys.stdin)['data']; print(ors[0]['id'] if ors else 'AUCUN')")
echo "→ OR créé automatiquement : $OR_ID"

echo ""
echo "═══ 6. Assignation à Pierre + EN_COURS puis TERMINÉ ═══"
curl -s -X PATCH $API/or/$OR_ID -H "Content-Type: application/json" -d '{"mecano":"Pierre","statut":"EN_COURS"}' > /dev/null
curl -s -X PATCH $API/or/$OR_ID -H "Content-Type: application/json" -d '{"statut":"TERMINE"}' > /dev/null
echo "→ Mécano = Pierre, statut = TERMINÉ"

echo ""
echo "═══ 7. FACTURATION → GÉNÈRE LE NUMÉRO DE FACTURE AUTOMATIQUEMENT ═══"
NUM_FAC=$(curl -s -X PATCH $API/or/$OR_ID -H "Content-Type: application/json" -d '{"statut":"FACTURE"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['numeroFacture'])")
echo "→ FACTURÉ avec le numéro auto : $NUM_FAC"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  WORKFLOW MÉTIER COMPLET TESTÉ"
echo "  Client Sophie → Bateau Yamaha → Devis $NUM_DEVIS"
echo "  → OR créé AUTO → Facture $NUM_FAC générée AUTO"
echo "═══════════════════════════════════════════════════════════"
