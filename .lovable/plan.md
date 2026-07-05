# Plan — EcoKin Smart Super App

Objectif : transformer la plateforme en Super App modulaire sans régression, supprimer Kin Label, ajouter le module Déchets ménagers avec taxe.

## 1. Suppression Kin Label
- Supprimer `src/routes/suivi-evaluation.tsx`, `src/lib/kin-label-store.ts`.
- Retirer le lien "Kin Label M&E" de `site-nav.tsx`, `site-footer.tsx`, `admin.tsx`, `access-store.ts` (ROUTE_ROLES), et de `llms.txt`.
- Nettoyer la clé `ecokin_kin_label_v1` du reset (déjà présente, la garder pour purge).

## 2. Écran d'accueil modulaire (Super App)
- Refondre `src/routes/index.tsx` pour présenter deux grandes tuiles modules :
  1. **Dépôts sauvages & tas de déchets** → routes existantes (`/signaler`, `/carte`, `/crise`, etc.)
  2. **Déchets ménagers** → nouveau module `/menagers`
- Conserver hero, stats live, leaderboard existants en dessous.
- Design cohérent (couleurs `eco`, cards existants).

## 3. Module Déchets ménagers (`/menagers`)
Nouveau store `src/lib/household-store.ts` (localStorage `ecokin_household_v1`) :
- Types : `Household` (ménage OU PME), `CollectionRequest`, `BinIssue`, `CollectionHistory`.
- Champs ménage : id, type (menage|pme), nom, commune, quartier, adresse, occupants, binType (120L/240L/660L), phone, createdAt, userId.
- CRUD + hook `useHousehold()`.

Store `src/lib/collection-schedule.ts` :
- Calendrier hebdomadaire par commune (jours de passage) — configurable, valeurs par défaut vides puis générées par commune (lundi/jeudi par défaut).

Routes nouvelles :
- `src/routes/menagers.tsx` — layout + tabs (Mon ménage, Calendrier, Collecte exceptionnelle, Signaler bac, Historique, Conseils tri, Taxe).
- Sous-composants dans le même fichier ou `src/components/menagers/*`.

Fonctions :
- Enregistrement ménage/PME (formulaire zod).
- Déclaration occupants + type bac.
- Calendrier collecte (vue semaine par commune).
- Demande collecte exceptionnelle (formulaire → liste + notification).
- Signalement bac endommagé (photo optionnelle, statut).
- Historique collectes (liste chronologique).
- Conseils de tri (contenu statique éducatif : organique, plastique, papier, verre, DEEE, dangereux).
- Notifications via `notification-bell` existant (émettre événement).

## 4. Taxe déchets
Store `src/lib/waste-tax.ts` :
- Calcul auto : tarif de base par type de bac + coefficient occupants (ex: 120L=5000 CDF/mois, 240L=9000, 660L=22000 ; PME ×1.5).
- Génération factures mensuelles (à la volée pour les 12 derniers mois).
- Types : `Invoice` (id, householdId, period YYYY-MM, amountCdf, dueDate, status: due|paid|late), `Payment` (id, invoiceId, method: mobile_money|bank|card, ref, paidAt, amountCdf).

Sous-onglet Taxe dans `/menagers` :
- Solde total dû, prochaines échéances.
- Liste factures avec statut + bouton "Payer".
- Modal paiement : choix méthode (Mobile Money Orange/Airtel/M-Pesa/Vodacom, Banque, Carte), champ référence, simulation succès.
- Génération reçu PDF (jspdf, réutiliser pattern existant).
- Historique paiements.
- Rappels : notification 3 jours avant échéance + en retard (au chargement du module).

## 5. Navigation & permissions
- `site-nav.tsx` : remplacer lien "Kin Label M&E" par "Déchets ménagers" (`/menagers`).
- `access-store.ts` : `/menagers` accessible citoyen (public).
- Admin `/admin` : nouvelle section "Ménages enregistrés" + "Recettes taxe" (compteurs).

## Détails techniques
- Aucune régression : conserver toutes routes et stores existants sauf Kin Label.
- localStorage uniquement (pas de Cloud requis pour cette itération).
- Réutiliser `formatNumber`, composants `Card`, `Tabs`, `Button`, `Input`, `Label`, `Select`, `Dialog`.
- Ajouter clés au reset dans `ECOKIN_STORAGE_KEYS` : `ecokin_household_v1`, `ecokin_waste_tax_v1`, `ecokin_collection_requests_v1`, `ecokin_bin_issues_v1`.
- Responsive mobile-first (le user est sur 411px).

Livrable : Super App modulaire opérationnelle, Kin Label retiré proprement, module ménagers + taxe entièrement fonctionnels côté client.
