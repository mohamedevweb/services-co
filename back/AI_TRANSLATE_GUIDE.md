# AI Translation Routes Guide

Ce guide explique comment utiliser les routes pour la traduction automatique de documents avec l'IA.

## Authentification

Toutes les routes de traduction AI nécessitent une authentification JWT. Incluez le token dans le header :
```
Authorization: Bearer your_jwt_token_here
```

## Routes Disponibles

### POST `/ai-translate`

Crée une nouvelle traduction AI pour un document.

**Headers requis:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "content": "{\"pages\":[{\"pageNumber\":1,\"width\":612,\"height\":792,\"textBlocks\":[{\"id\":\"p1_0\",\"text\":\"Technical Documentation\",\"x\":100,\"y\":750,\"fontSize\":18,\"fontName\":\"Arial-Bold\"},{\"id\":\"p1_1\",\"text\":\"Chapter 1: Introduction\",\"x\":100,\"y\":700,\"fontSize\":14,\"fontName\":\"Arial-Bold\"}]}]}",
  "targetLanguage": "français",
  "organizationId": 123
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1
  },
  "message": "AI translation created successfully"
}
```

**Notes:**
- Le champ `content` doit contenir un JSON stringifié avec la structure de document
- Le champ `targetLanguage` spécifie la langue cible pour la traduction
- Le champ `organizationId` identifie l'organisation propriétaire
- La traduction est effectuée bloc par bloc de texte
- Le JSON original est sauvegardé dans `content`
- Le JSON traduit est sauvegardé dans `contentTranslate`

### GET `/ai-translate/organization/:organizationId`

Récupère toutes les traductions d'une organisation.

**Headers requis:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "content": "{\"pages\":[...]}",
      "contentTranslate": "{\"pages\":[...]}",
      "organizationId": 123
    },
    {
      "id": 2,
      "content": "{\"pages\":[...]}",
      "contentTranslate": "{\"pages\":[...]}",
      "organizationId": 123
    }
  ],
  "message": "AI translations retrieved successfully"
}
```

## Structure du JSON de Contenu

Le champ `content` doit suivre cette structure :

```json
{
  "pages": [
    {
      "pageNumber": 1,
      "width": 612,
      "height": 792,
      "textBlocks": [
        {
          "id": "p1_0",
          "text": "Text to translate",
          "x": 100,
          "y": 750,
          "fontSize": 18,
          "fontName": "Arial-Bold"
        }
      ]
    }
  ]
}
```

## Processus de Traduction

1. **Parsing** : Le JSON stringifié est parsé
2. **Extraction** : Chaque bloc de texte est extrait
3. **Traduction** : Chaque texte est traduit individuellement avec l'IA
4. **Reconstruction** : Le JSON est reconstruit avec les textes traduits
5. **Sauvegarde** : Le JSON original et traduit sont sauvegardés en base

## Exemples d'Utilisation

### Créer une traduction avec curl:
```bash
curl -X POST http://localhost:3001/ai-translate \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "{\"pages\":[{\"pageNumber\":1,\"width\":612,\"height\":792,\"textBlocks\":[{\"id\":\"p1_0\",\"text\":\"Hello World\",\"x\":100,\"y\":750,\"fontSize\":18,\"fontName\":\"Arial-Bold\"}]}]}",
    "targetLanguage": "français",
    "organizationId": 123
  }'
```

### Récupérer les traductions d'une organisation:
```bash
curl -X GET http://localhost:3001/ai-translate/organization/123 \
  -H "Authorization: Bearer your_jwt_token"
```

## Langues Supportées

L'IA peut traduire vers n'importe quelle langue. Exemples :
- `"français"`
- `"english"`
- `"español"`
- `"deutsch"`
- `"italiano"`
- `"português"`
- etc.

## Gestion des Erreurs

### Codes d'erreur HTTP:

- `400`: Requête invalide (champs manquants, JSON invalide, ID invalide)
- `401`: Token d'authentification manquant ou invalide
- `500`: Erreur serveur (échec de traduction, erreur base de données)

### Format des erreurs:
```json
{
  "error": "Message d'erreur",
  "details": "Détails supplémentaires (optionnel)"
}
```

## Performance

- **Traduction séquentielle** : Les blocs de texte sont traduits un par un
- **Gestion d'erreurs** : Si un bloc échoue, le texte original est conservé
- **Logs détaillés** : Le processus est loggé pour le debugging
- **Transaction** : La sauvegarde est atomique

## Intégration avec le Système

Les routes de traduction AI s'intègrent parfaitement avec le système existant :
- Utilise le même système d'authentification JWT
- Suit les mêmes patterns que les autres routes
- Compatible avec le schéma de base de données existant
- Utilise la même configuration OpenAI 