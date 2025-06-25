# AI Routes Guide

This guide explains how to use the AI routes for extracting prestataire data from natural language prompts.

## Setup

1. Make sure you have the required environment variables in your `.env` file:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

2. Install dependencies:
```bash
npm install
```

## Available Routes

### POST `/ai/presta`

Extracts structured prestataire data from a natural language prompt.

**Request Body:**
```json
{
  "prompt": "Description textuelle du prestataire..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "first_name": "Jean",
    "name": "Dupont",
    "job": "développeur full-stack",
    "description": "Développeur expérimenté avec expertise en React, Node.js...",
    "experience_time": 5,
    "study_level": "Master (Bac+5)",
    "city": "Paris",
    "tjm": 600,
    "skills": [
      { "description": "React" },
      { "description": "Node.js" },
      { "description": "TypeScript" }
    ],
    "diplomas": [
      { "description": "Master en informatique" }
    ],
    "experiences": [
      { "description": "Développeur chez Google (2020-2023)" },
      { "description": "Développeur chez Microsoft (2018-2020)" }
    ],
    "languages": [
      { "description": "Français (natif)" },
      { "description": "Anglais (courant)" },
      { "description": "Espagnol (intermédiaire)" }
    ],
    "confidence_score": 0.9,
    "extraction_notes": "Données extraites avec confiance élevée..."
  },
  "message": "Prestataire data extracted successfully"
}
```

### GET `/ai/health`

Health check endpoint for the AI service.

**Response:**
```json
{
  "status": "healthy",
  "service": "AI Routes",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Example Usage

### Using curl:
```bash
curl -X POST http://localhost:3001/ai/presta \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Je suis Marie Martin, designer UX/UI avec 3 ans d'\''expérience à Lyon. Je maîtrise Figma, Adobe Creative Suite et j'\''ai un Bachelor en design. Mon TJM est de 450€."
  }'
```

### Using JavaScript:
```javascript
const response = await fetch('http://localhost:3001/ai/presta', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: "Description du prestataire..."
  })
});

const result = await response.json();
console.log(result.data);
```

## Error Handling

The API returns appropriate HTTP status codes:

- `400`: Invalid request (missing or empty prompt)
- `500`: Server error (AI extraction failed)

Error response format:
```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

## Testing

You can test the AI route using the provided test script:

```bash
node test-ai.js
```

Make sure your server is running on port 3001 before testing.

## Integration with Prestataire Creation

The extracted data from the AI route can be directly used to prefill forms for creating prestataires using the existing `/prestataire` routes. The structure matches the `CreatePrestataireDto` format, making integration seamless. 