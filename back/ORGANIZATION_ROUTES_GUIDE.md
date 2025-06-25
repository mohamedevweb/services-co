# Organization Routes Guide

Ce guide explique comment utiliser les routes pour gérer les organisations.

## Authentification

Toutes les routes d'organisation nécessitent une authentification JWT. Incluez le token dans le header :
```
Authorization: Bearer your_jwt_token_here
```

## Routes Disponibles

### POST `/organization`

Crée une nouvelle organisation pour l'utilisateur connecté.

**Headers requis:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Nom de l'organisation",
  "adresse": "Adresse complète",
  "solde": 1000.50,
  "tel": "0123456789"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Organization created successfully. New JWT token provided with updated role."
}
```

**Notes:**
- Le `userId` est automatiquement récupéré depuis le token JWT
- Le rôle de l'utilisateur est automatiquement mis à jour vers "ORG"
- Un nouveau JWT token est généré avec le rôle mis à jour
- Les champs `name`, `adresse`, et `tel` sont obligatoires
- **Important**: Utilisez le nouveau token retourné pour les requêtes suivantes

### GET `/organization/:id`

Récupère une organisation par son ID.

**Headers requis:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Nom de l'organisation",
    "adresse": "Adresse complète",
    "solde": 1000.50,
    "tel": "0123456789",
    "userId": 123
  },
  "message": "Organization retrieved successfully"
}
```

**Response (404):**
```json
{
  "error": "Organization not found"
}
```

### PATCH `/organization/:id`

Modifie une organisation existante (seul le propriétaire peut modifier).

**Headers requis:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body (tous les champs sont optionnels):**
```json
{
  "name": "Nouveau nom",
  "adresse": "Nouvelle adresse",
  "solde": 2000.00,
  "tel": "0987654321"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Organization updated successfully"
}
```

**Response (403):**
```json
{
  "error": "Unauthorized: You can only modify your own organization"
}
```

**Response (404):**
```json
{
  "error": "Organization not found"
}
```

### GET `/organization/me/organization`

Récupère l'organisation de l'utilisateur connecté.

**Headers requis:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Nom de l'organisation",
    "adresse": "Adresse complète",
    "solde": 1000.50,
    "tel": "0123456789",
    "userId": 123
  },
  "message": "Organization retrieved successfully"
}
```

**Response (404):**
```json
{
  "error": "No organization found for this user"
}
```

## Exemples d'Utilisation

### Créer une organisation avec curl:
```bash
curl -X POST http://localhost:3001/organization \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ma Société SARL",
    "adresse": "123 Rue de la Paix, 75001 Paris",
    "solde": 5000.00,
    "tel": "0123456789"
  }'
```

### Modifier une organisation:
```bash
curl -X PATCH http://localhost:3001/organization/1 \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "solde": 7500.00,
    "tel": "0987654321"
  }'
```

### Récupérer une organisation:
```bash
curl -X GET http://localhost:3001/organization/1 \
  -H "Authorization: Bearer your_jwt_token"
```

## Gestion des Erreurs

### Codes d'erreur HTTP:

- `400`: Requête invalide (champs manquants, ID invalide)
- `401`: Token d'authentification manquant ou invalide
- `403`: Non autorisé (tentative de modification d'une organisation qui ne vous appartient pas)
- `404`: Organisation non trouvée
- `500`: Erreur serveur

### Format des erreurs:
```json
{
  "error": "Message d'erreur",
  "details": "Détails supplémentaires (optionnel)"
}
```

## Sécurité

- **Authentification obligatoire**: Toutes les routes nécessitent un token JWT valide
- **Autorisation**: Seul le propriétaire d'une organisation peut la modifier
- **Validation**: Les champs obligatoires sont validés côté serveur
- **Isolation**: Chaque utilisateur ne peut accéder qu'à ses propres données

## Intégration avec le Système

Les routes d'organisation s'intègrent parfaitement avec le système existant :
- Utilise le même système d'authentification JWT
- Suit les mêmes patterns que les routes prestataire
- Compatible avec le schéma de base de données existant
- Gestion automatique des rôles utilisateur 