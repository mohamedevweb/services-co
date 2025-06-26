# Guide d'utilisation - Création et gestion de projet avec IA

## Vue d'ensemble

Le système de création et gestion de projet avec IA permet de générer automatiquement des projets complets avec leurs parcours de développement en analysant une description textuelle fournie par l'utilisateur, ainsi que de gérer ces projets via des routes dédiées.

## Architecture

### Tables impliquées
- `project` : Informations du projet (titre, description, organisation)
- `path` : Parcours de développement (3 par projet)
- `path_prestataire` : Tâches associées aux prestataires (3 par path)

### Structure des données
- Chaque projet contient exactement **3 paths**
- Chaque path contient exactement **3 tâches**
- Chaque tâche est associée à un prestataire spécifique
- Les champs `isChoose` (path) et `isApproved` (path_prestataire) sont toujours à `false` lors de la création

## API Endpoints

### 🚀 Création de projet avec IA

#### 1. Créer un projet avec l'IA
```http
POST /project-ai/create
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "prompt": "Je souhaite créer un site e-commerce qui vend des fruits et légumes bio",
  "organizationId": 1
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Projet créé avec succès",
  "data": {
    "projectId": 1,
    "paths": [
      {
        "pathId": 1,
        "number": 1,
        "tasks": [
          {
            "name": "Design et wireframes",
            "prestataireId": 2,
            "nbDays": 5
          }
        ]
      }
    ]
  }
}
```

#### 2. Récupérer les prestataires disponibles
```http
GET /project-ai/prestataires
Authorization: Bearer <JWT_TOKEN>
```

### 📋 Gestion des projets

#### 3. Récupérer un projet par ID (avec tous ses détails)
```http
GET /project/{id}
Authorization: Bearer <JWT_TOKEN>
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "project": {
      "id": 1,
      "title": "Site E-commerce Fruits et Légumes",
      "description": "Description détaillée du projet",
      "organizationId": 1
    },
    "organization": {
      "id": 1,
      "name": "Ma Société",
      "adresse": "123 Rue de la Paix",
      "tel": "0123456789"
    },
    "paths": [
      {
        "id": 1,
        "number": 1,
        "isChoose": false,
        "projectId": 1,
        "tasks": [
          {
            "id": 1,
            "prestataireId": 2,
            "pathId": 1,
            "isApproved": false,
            "nbDays": 5,
            "name": "Design et wireframes"
          }
        ]
      }
    ]
  }
}
```

#### 4. Récupérer tous les projets d'une organisation
```http
GET /project/organization/{organizationId}
Authorization: Bearer <JWT_TOKEN>
```

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Site E-commerce",
      "description": "Description du projet",
      "organizationId": 1
    }
  ]
}
```

#### 5. Récupérer tous les projets d'un prestataire
```http
GET /project/prestataire/{prestataireId}
Authorization: Bearer <JWT_TOKEN>
```

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "project": {
        "id": 1,
        "title": "Site E-commerce",
        "description": "Description du projet",
        "organizationId": 1
      },
      "organization": {
        "id": 1,
        "name": "Ma Société"
      },
      "paths": [
        {
          "id": 1,
          "number": 1,
          "isChoose": false,
          "tasks": [
            {
              "name": "Design et wireframes",
              "nbDays": 5,
              "isApproved": false
            }
          ]
        }
      ]
    }
  ]
}
```

#### 6. Mettre à jour isChoose d'un path
```http
PATCH /project/path/{pathId}/choose
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "isChoose": true
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Path mis à jour avec succès",
  "data": {
    "id": 1,
    "isChoose": true
  }
}
```

#### 7. Mettre à jour isApproved d'une tâche
```http
PATCH /project/path/{pathId}/prestataire/{prestataireId}/approve
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "isApproved": true
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Tâche approuvée avec succès",
  "data": {
    "pathId": 1,
    "prestataireId": 2,
    "isApproved": true
  }
}
```

## Fonctionnement de l'IA

### Prompt système
L'IA reçoit un prompt détaillé qui inclut :
- La description du projet fournie par l'utilisateur
- La liste complète des prestataires disponibles avec leurs informations
- Les instructions pour créer la structure du projet
- **Enum dynamique des IDs de prestataires** pour éviter les erreurs

### Extraction des données
L'IA extrait et structure automatiquement :
1. **Informations du projet** : titre et description
2. **3 paths de développement** numérotés de 1 à 3
3. **3 tâches par path** avec :
   - Nom de la tâche
   - ID du prestataire choisi (parmi ceux disponibles)
   - Nombre de jours estimés

### Choix des prestataires
L'IA sélectionne les prestataires en fonction de :
- Leur métier (DEVELOPMENT, DESIGN, MARKETING, etc.)
- Leur expérience
- Leur description et compétences
- La nature de la tâche à réaliser

## Exemple d'utilisation

### Prompt utilisateur
```
"Je souhaite créer un site e-commerce qui vend des fruits et légumes bio. 
Le site doit avoir un système de panier, de paiement en ligne, et une gestion des stocks."
```

### Résultat attendu
L'IA pourrait créer :
- **Path 1** : Conception et design
  - Design des wireframes (Prestataire Designer)
  - Création de la maquette (Prestataire Designer)
  - Validation du design (Prestataire Designer)

- **Path 2** : Développement frontend
  - Développement des pages principales (Prestataire Développeur)
  - Intégration du système de panier (Prestataire Développeur)
  - Responsive design (Prestataire Développeur)

- **Path 3** : Développement backend
  - API de gestion des produits (Prestataire Développeur)
  - Système de paiement (Prestataire Développeur)
  - Gestion des stocks (Prestataire Développeur)

## Gestion des erreurs

### Erreurs courantes
1. **Aucun prestataire disponible** : L'IA ne peut pas créer de projet sans prestataires
2. **Prompt insuffisant** : L'IA ne peut pas extraire assez d'informations
3. **Token invalide** : Authentification requise
4. **OrganizationId invalide** : L'organisation doit exister
5. **Projet non trouvé** : L'ID de projet n'existe pas
6. **Path non trouvé** : L'ID de path n'existe pas
7. **Tâche non trouvée** : La combinaison path/prestataire n'existe pas

### Messages d'erreur
```json
{
  "success": false,
  "error": "Description de l'erreur"
}
```

## Tests

### Test création de projet avec IA
Utilisez le fichier `test-project-ai.js` :
1. Modifiez le token JWT
2. Modifiez l'organizationId
3. Exécutez : `node test-project-ai.js`

### Test routes de gestion
Utilisez le fichier `test-project-routes.js` :
1. Modifiez le token JWT
2. Modifiez les IDs (projectId, organizationId, prestataireId, pathId)
3. Exécutez : `node test-project-routes.js`

## Sécurité

- Authentification JWT requise pour toutes les routes
- Validation des données d'entrée
- Transactions de base de données pour garantir l'intégrité
- Gestion des erreurs robuste
- Enum dynamique des IDs de prestataires pour éviter les erreurs d'IA

## Dépendances

- OpenAI API (GPT-3.5-turbo)
- Drizzle ORM
- Hono framework
- JWT pour l'authentification 