# 🏆 App Croix V2

Le tableau de tâches ménagères de la famille — un compte par famille, un espace
Parent pour tout configurer, un espace Enfant pour cocher ses croix.

## Stack

React 18 + TypeScript + Vite · Firebase (Auth + Firestore) · React Router · Tailwind CSS (CDN) · déployé sur Netlify.

## Démarrer en local

```bash
npm install
cp .env.example .env.local   # puis remplis avec ta config Firebase
npm run dev
```

Guide complet (création du projet Firebase, règles Firestore, déploiement Netlify) : voir **DEPLOYMENT.md**.

## Scripts

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production dans `dist/` |
| `npm run preview` | Prévisualise le build de production en local |
| `npm run typecheck` | Vérifie les types TypeScript sans compiler |

## Structure

```
pages/            Écrans (Auth, Setup, ProfileSelect, ParentPin, ParentDashboard, ChildDashboard)
components/       Composants réutilisables (avatars, modales, formulaires)
context/          État global (auth Firebase, famille, profil actif)
services/         Accès Firebase (Auth + Firestore)
utils/            Logique pure (calcul des gains, croix bonus)
types.ts          Modèle de données
firestore.rules   Règles de sécurité Firestore
```

## Où en est le projet

**Fait :** authentification par famille, choix de profil avec code PIN parent,
configuration initiale (profils + PIN), gestion des catégories (normal/pénible
+ ratio de croix bonus), page enfant repensée avec suivi des gains et des
bonus, gestion des profils, historique par semaine et par catégorie,
archivage hebdomadaire.

**Pas encore fait** (le modèle de données est prêt, l'écran reste à construire) :
activités spéciales avec notification aux enfants, jours d'exclusion
(absent/fatigué) pour le système « à qui le tour ? », et le calcul de
recommandation lui-même.
