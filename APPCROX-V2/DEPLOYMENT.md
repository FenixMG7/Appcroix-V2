# 🚀 Déployer App Croix V2 — guide de A à Z

Ce guide part du principe que tu n'as **pas encore** de projet Firebase, et que
tu as un compte Netlify mais que tu ne t'en es jamais servi. Suis les
sections dans l'ordre.

---

## 0. Récupérer le code sur un nouveau dépôt GitHub

### 0.1 Créer le dépôt sur GitHub

1. Va sur [github.com](https://github.com), connecté à ton compte.
2. En haut à droite, clique sur le **+** → **New repository**.
3. Donne-lui un nom (ex. `app-croix-v2`). Description optionnelle.
4. Choisis **Private** (recommandé pour une appli familiale) ou **Public**, comme tu veux.
5. **Ne coche aucune case** ("Add a README file", ".gitignore", "license") — on a déjà tous les fichiers, cocher une case créerait un conflit inutile avec ce qu'on va pousser.
6. **Create repository**. GitHub affiche une page "Quick setup" avec une URL du type `https://github.com/TonPseudo/app-croix-v2.git` — garde-la sous la main.

### 0.2 Pousser le code depuis ton PC

1. Dézippe `APPCROX-V2.zip` dans un dossier de ton choix.
2. Vérifie que Git est installé : ouvre un terminal (PowerShell) et tape `git --version`. Si erreur, installe-le depuis [git-scm.com](https://git-scm.com/downloads) puis relance le terminal.
3. Dans le terminal, place-toi dans le dossier dézippé (`cd chemin\vers\le\dossier`), puis :
   ```bash
   git init
   git add -A
   git commit -m "App Croix V2"
   git branch -M main
   git remote add origin https://github.com/TonPseudo/app-croix-v2.git
   git push -u origin main
   ```
   (remplace l'URL par celle de ton propre dépôt, copiée à l'étape 0.1)
4. Une fenêtre de connexion GitHub peut s'ouvrir dans ton navigateur au moment du `push` — connecte-toi et autorise. C'est normal, c'est Git Credential Manager qui gère l'authentification.
5. Actualise la page GitHub de ton dépôt : tous les fichiers doivent apparaître.

Ensuite, dans ce même terminal :
```bash
npm install
```

---

## 1. Créer le projet Firebase

1. Va sur [console.firebase.google.com](https://console.firebase.google.com) et connecte-toi avec un compte Google.
2. **Ajouter un projet** → nomme-le (ex. `app-croix`) → tu peux désactiver Google Analytics (pas utile ici) → **Créer le projet**.

## 2. Activer l'authentification par email/mot de passe

1. Dans le menu de gauche : **Build > Authentication** → **Get started**.
2. Onglet **Sign-in method** → clique sur **Email/Password** → active le premier interrupteur (Email/Password) → **Save**.

## 3. Créer la base Firestore

1. Menu de gauche : **Build > Firestore Database** → **Create database**.
2. Choisis une région proche de toi (ex. `eur3 (europe-west)`).
3. Démarre en **mode production** (l'app n'en a pas besoin, on va poser nos propres règles à l'étape suivante).

## 4. Déployer les règles de sécurité

Le fichier `firestore.rules` (à la racine du projet) contient déjà les bonnes règles : chaque famille ne peut lire/écrire que ses propres données.

**Le plus simple (sans rien installer) :**
1. Dans la console Firebase : **Firestore Database > Règles**.
2. Ouvre `firestore.rules` dans le projet, copie tout son contenu, colle-le dans l'éditeur de la console.
3. **Publier**.

## 5. Récupérer la config Firebase et remplir `.env.local`

1. Dans la console Firebase : icône ⚙️ à côté de "Aperçu du projet" → **Paramètres du projet**.
2. Section **Vos applications** → clique sur l'icône **Web `</>`** → donne un nom (ex. `app-croix-web`) → **Enregistrer l'application** (pas besoin de Firebase Hosting).
3. Firebase affiche un objet `firebaseConfig`. Copie chaque valeur dans un fichier `.env.local` à la racine du projet (utilise `.env.example` comme modèle) :

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## 6. Tester en local

```bash
npm run dev
```
Ouvre l'URL affichée (ex. `http://localhost:5173`). Crée un compte famille, fais le setup, vérifie que tu peux cocher des croix. Si tout marche ici, Firebase est bien branché.

---

## 7. Déployer sur Netlify

Ton code doit d'abord être poussé sur GitHub (étape 0).

1. Va sur [app.netlify.com](https://app.netlify.com) et connecte-toi à ton compte existant.
2. **Add new site > Import an existing project**.
3. Choisis **GitHub**, autorise Netlify à accéder à tes dépôts, sélectionne ton nouveau dépôt (ex. `app-croix-v2`).
4. Netlify détecte Vite automatiquement grâce à `netlify.toml` : build command `npm run build`, publish directory `dist`. Vérifie que c'est bien pré-rempli, sinon renseigne-le à la main.
5. **Avant de cliquer sur Deploy**, ouvre **Add environment variables** et ajoute les 6 mêmes variables que dans `.env.local` (`VITE_FIREBASE_API_KEY`, etc.).
6. **Deploy**. Le premier build prend 1-2 minutes.
7. Une fois terminé, Netlify te donne une URL du type `https://ton-site.netlify.app`. Teste-la en conditions réelles (idéalement depuis le téléphone d'un enfant).

### Sur le compte Netlify que tu as déjà

Netlify facture maintenant en **crédits** (300 crédits/mois offerts sur le plan Free, sans dépassement possible : un déploi = 15 crédits, 1 Go de bande passante = 10 crédits). Pour une appli familiale avec peu de visiteurs, tu resteras large. Si ton compte est plus ancien (avant septembre 2025), tu es peut-être encore sur l'ancien modèle "100 Go / 300 minutes de build" — dans les deux cas, ça passe très large pour ce projet. Tu peux vérifier ton plan dans **Team settings > Billing**.

### Domaine personnalisé (optionnel)
**Site settings > Domain management > Add a domain** si tu as un nom de domaine à toi. Sinon, l'URL `.netlify.app` fonctionne très bien telle quelle.

---

## 8. Checklist de test final

- [ ] Créer un compte famille (inscription)
- [ ] Setup : ajouter au moins un parent, un enfant, définir le code PIN
- [ ] Se reconnecter, choisir le profil enfant → cocher/décocher des croix
- [ ] Vérifier qu'une catégorie pénible déclenche bien la croix bonus au bon seuil
- [ ] Choisir le profil parent → code PIN → vérifier les 4 onglets (Vue d'ensemble, Catégories, Profils, Historique)
- [ ] Archiver la semaine → vérifier le résumé puis l'historique
- [ ] Actualiser la page sur `/parent` ou `/child` → vérifier qu'il n'y a pas de 404 (grâce à `netlify.toml`)

---

## Et ensuite ? (pas encore construit)

Le modèle de données est prêt pour ces trois fonctionnalités, mais l'écran reste à faire :

- **Activités spéciales** (le parent en crée une, notification aux enfants, premier arrivé premier servi)
- **Jours d'exclusion** (absent/fatigué → pas de tâche pénible recommandée ce jour-là)
- **« À qui le tour ? »** (recommandation basée sur qui a le moins fait une tâche cette semaine)

Pour les notifications de l'activité spéciale, tu as choisi des **notifications push**. Techniquement, ça demande trois briques en plus de ce qui existe déjà :
1. Un service worker + demande de permission navigateur (PWA).
2. Une **Cloud Function** Firebase déclenchée à la création de l'activité spéciale, qui envoie le push à tous les enfants.
3. Les Cloud Functions nécessitent le plan **Blaze** (pay-as-you-go) — ça demande une carte bancaire, mais l'usage d'une appli familiale reste très largement dans le quota gratuit inclus (2 millions d'appels/mois, FCM lui-même est gratuit et illimité). Tu ne devrais rien payer, mais Google demande la carte comme garantie.

On peut construire tout ça dans une prochaine session — dis-moi quand tu veux t'y remettre.
