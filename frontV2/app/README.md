# Services-Co Frontend

Application React TypeScript pour la plateforme de mise en relation entre organisations et prestataires.

## Fonctionnalités

- ✅ **Authentification complète** : Connexion et inscription
- ✅ **Gestion des tokens JWT** : Authentification sécurisée avec Bearer token
- ✅ **Context/Store utilisateur** : Stockage des informations utilisateur (ID, email, role)
- ✅ **Routes protégées** : Redirection automatique selon l'état de connexion
- ✅ **Navbar avec menu déroulant** : Affichage de l'email et déconnexion
- ✅ **Interface moderne** : Design responsive avec CSS moderne

## Architecture

```
src/
├── components/          # Composants réutilisables
│   ├── Navbar.tsx      # Barre de navigation avec menu utilisateur
│   ├── Navbar.css      # Styles de la navbar
│   └── ProtectedRoute.tsx # Protection des routes
├── context/             # Contextes React
│   └── AuthContext.tsx # Contexte d'authentification
├── pages/               # Pages de l'application
│   ├── Home.tsx        # Page d'accueil
│   ├── Home.css        # Styles de la page d'accueil
│   ├── Login.tsx       # Page de connexion
│   ├── Register.tsx    # Page d'inscription
│   └── Auth.css        # Styles d'authentification
├── services/            # Services API
│   └── api.ts          # Service HTTP avec intercepteurs JWT
├── types/               # Types TypeScript
│   └── auth.ts         # Types d'authentification
├── App.tsx             # Composant principal avec routage
└── main.tsx            # Point d'entrée
```

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

## Configuration

L'URL du backend est configurée dans `src/services/api.ts` :
- Par défaut : `http://localhost:3001`
- Configurable via variable d'environnement `VITE_API_URL`

## Utilisation

1. **Inscription** : Créer un compte avec email/mot de passe (+ SIRET optionnel)
2. **Connexion** : Se connecter avec les identifiants
3. **Navigation** : Une fois connecté, accès à la page d'accueil
4. **Déconnexion** : Via le menu déroulant en haut à droite

## Technologies

- **React 18** avec TypeScript
- **React Router DOM** pour le routage
- **Axios** pour les requêtes HTTP
- **Context API** pour la gestion d'état
- **CSS moderne** avec Flexbox/Grid
- **Vite** comme bundler

## API Backend

L'application communique avec le backend via l'API REST :

- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion
- `POST /auth/verify` - Vérification du token

Toutes les requêtes authentifiées incluent automatiquement le header :
```
Authorization: Bearer <jwt_token>
```
