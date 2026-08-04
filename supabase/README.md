# Supabase pour EcoKin Smart

## Variables d'environnement

Copiez le fichier `.env.example` vers un fichier `.env` local et renseignez vos valeurs Supabase.

Pour le déploiement Vercel, injectez les mêmes variables dans les settings de l’environnement Vercel :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Schéma de base

Exécutez le SQL contenu dans `supabase/signalements.sql` dans votre projet Supabase.

La table `public.signalements` est la source de vérité attendue par le bridge du client via `src/lib/supabase-reports.ts`.

## RLS

Le script `supabase/signalements.sql` applique des politiques RLS adaptées aux rôles de la plateforme.

- Lecture (`SELECT`) :
	- Tout le monde peut lire les signalements `active = true`.
	- Les rôles privilégiés (`agent`, `bourgmestre`, `gouverneur`, `admin`, `superadmin`) voient tous les signalements, même inactifs.
	- Les auteurs peuvent lire leurs propres signalements.

- Insertion (`INSERT`) :
	- Autorisée pour les citoyens anonymes (via la anon key) et pour les comptes authentifiés — les champs `author`, `commune`, `category` et `urgency` sont requis.

- Mise à jour (`UPDATE`) :
	- Autorisée pour l’auteur du signalement ou les rôles privilégiés. Les citoyens anonymes ne peuvent pas marquer `active = false`.

- Suppression (`DELETE`) :
	- Restreinte aux rôles `admin` et `superadmin`.

Ces politiques reposent sur la présence d'une réclamation JWT `role` (accessible via `current_setting('jwt.claims.role', true)`) injectée dans le token Supabase. Assurez-vous que vos comptes utilisateurs contiennent la revendication `role` appropriée lors de l'authentification.

Si vous ne pouvez pas injecter la claim `role` dans le JWT (par exemple si vous gérez les profils côté application), le script SQL crée également une table `public.app_users` qui mappe `auth.users.id` -> `role`. La RLS utilisera la claim JWT si présente, sinon fera un fallback sur `public.app_users`.

Procédure recommandée pour rendre tout opérationnel :

1. Sur votre instance Supabase, exécuter le script `supabase/signalements.sql` (il créera les politiques et la table `app_users`).

2. Si vous préférez gérer les rôles côté base de données, ajouter des lignes dans `public.app_users` pour chaque `auth.users.id` avec la colonne `role`.

3. Alternative (préférable en production) : lors de l'authentification côté serveur, émettre un JWT contenant la claim `role`. Cela permet à Supabase d'appliquer immédiatement les politiques RLS basées sur `jwt.claims.role`.

4. Pour appliquer le script localement via la ligne de commande, utilisez le script Node fourni :

```bash
# sous Windows / PowerShell
setx SUPABASE_DB_URL "postgres://user:pass@dbhost:5432/postgres"
node supabase/apply_migration.js

# Unix / macOS
export SUPABASE_DB_URL="postgres://user:pass@dbhost:5432/postgres"
node supabase/apply_migration.js
```

Le script lira `supabase/signalements.sql` et l'exécutera contre la base pointée par `SUPABASE_DB_URL` (ou `DATABASE_URL`).

Importer des rôles depuis CSV
----------------------------

Si vous avez besoin de peupler `public.app_users` en masse (mapping `auth.users.id` -> `role`), vous pouvez fournir un fichier CSV `supabase/app_users.csv` avec l'en-tête `id,role,commune` et exécuter le script d'import.

Exemples :

Windows PowerShell:
```powershell
setx SUPABASE_DB_URL "postgres://user:pass@dbhost:5432/postgres"
node supabase/import_app_users.js supabase/app_users.csv
```

Unix / macOS:
```bash
export SUPABASE_DB_URL="postgres://user:pass@dbhost:5432/postgres"
node supabase/import_app_users.js supabase/app_users.csv
```

Format CSV attendu (exemple `supabase/app_users.csv`):

```
id,role,commune
3fa85f64-5717-4562-b3fc-2c963f66afa6,citoyen,commune-1
7f4a1e0a-1234-4bcd-aa11-abcdef012345,bourgmestre,commune-2
```

Remarques de sécurité : utilisez de préférence une chaîne de connexion Postgres *service_role* accessible seulement depuis votre CI/outil d'administration. Ne mettez jamais votre `service_role` dans le code frontal ou dans des repos publics.

## Déploiement Vercel

Le projet est prêt pour un build Vercel avec l’auto-détection de Vite/Nitro. Les variables ci-dessus doivent être définies dans la configuration d’environnement Vercel.
