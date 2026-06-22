Goal: étendre EcoKin Smart avec les 9 modules de gouvernance + module IA avancé de détection automatique, sans casser l'existant. Travail principalement frontend (données simulées enrichies) + 2 server functions IA.

## Étapes

### 1. Enrichissement du modèle de données (`src/lib/data.ts`)
- Catégories de déchets étendues : `plastique | organique | menager | electronique | medical | construction | mixte`
- Helpers de scoring de priorité (densité, écoles, hôpitaux, marchés, risque sanitaire/inondation, nb signalements)
- Historique d'interventions, mur des décisions (`DECISIONS[]` : responsable, budget, état, KPI)
- Indicateurs : IPK, Indice Performance Communes, taux collecte, taux valorisation, évolution mensuelle
- Zones prédictives (hotspots récurrents, projections)

### 2. Module IA avancé (`src/lib/waste-ai.functions.ts`)
- Mise à jour du schéma `WasteAnalysis` : `category` (7 types), `surface_m2`, `volume_m3`, `risque_sanitaire`, `risque_environnemental`, `risque_obstruction`, `risque_inondation`, `priority_score`, `proximity_alerts[]`
- Prompt IA enrichi avec la nouvelle taxonomie
- Nouvelle server function `chatDecisionAssistant` (Q/R langage naturel pour décideurs, contexte = stats agrégées passées en input)

### 3. Signalement automatique amélioré (`src/routes/signaler.tsx`)
- Géoloc automatique (déjà partielle) + auto-détection commune via reverse mapping local
- Génération automatique du rapport (ID unique, classement priorité, payload prêt à transmettre)
- Affichage des nouveaux champs IA (surface, volume, risques multiples, alertes proximité)
- Flag `iaValidated` / `communeValidated` (workflow validation duale)

### 4. Espace Admin / Bourgmestre — validation communale (`src/routes/admin.tsx`)
- Liste des signalements en attente de validation
- Boutons "Valider classification IA" / "Corriger" (choisir bonne catégorie)
- Les corrections sont stockées (`localStorage`) pour simuler l'apprentissage progressif
- Compteur "précision IA" qui évolue avec les corrections

### 5. Nouvelles routes
- `/situation` — Centre de Situation Urbaine temps réel : carte heatmap + flux d'incidents live + niveau urgence par zone + historique interventions
- `/predictif` — Analyse prédictive : hotspots récurrents, zones à risque futur, prévision inondations
- `/crise` — Salle de Crise Environnementale : s'active auto si pluie forte/risque critique, propose zones prioritaires + ressources + itinéraires
- `/assistant-ia` — Chat assistant IA décideurs (langage naturel) avec questions suggérées et génération rapports/notes
- `/decisions` — Mur des Décisions (table : responsable, date, budget, avancement, KPI)
- `/observatoire` — Observatoire propreté (IPK détaillé, performance communes, évolution mensuelle, taux valorisation) avec graphiques Recharts

### 6. Carte SIG enrichie (`src/components/eco-map.tsx`)
- Couche heatmap des concentrations de déchets
- Marqueurs colorés par catégorie de déchet
- Toggle pour afficher hotspots prédictifs

### 7. Navigation (`src/components/site-nav.tsx`)
- Regrouper en menus déroulants : Citoyen / Opérations / Stratégie / Crise
- Ajouter les nouvelles entrées
- Banner d'activation Salle de Crise visible si alerte critique

### 8. Alertes automatiques
- Helper `generateAutoAlert(report)` qui vérifie proximité école/marché/hôpital + gravité → push notification dans `notification-bell`

## Détails techniques

- IA : `google/gemini-3-flash-preview` via gateway existant
- Tout en frontend + 2 server fns (analyse photo + assistant chat) ; persistance localStorage (pas de Lovable Cloud sauf demande explicite ultérieure)
- Heatmap via `leaflet.heat` (ajout dépendance)
- Pas de modification de l'auth/access-store : nouvelles routes stratégiques protégées par `AccessGate` rôle `gouverneur`
- PDF : étendre `pdf-reports.ts` avec rapport "Mur des décisions" et "Observatoire"
