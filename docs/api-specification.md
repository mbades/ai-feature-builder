# AI Feature Builder - API Specification

## Endpoint: Generate Feature Specification

### Base Information
- **URL**: `POST /api/generate-spec`
- **Content-Type**: `application/json`
- **Authentication**: None (MVP)
- **Rate Limit**: 10 requests/minute per IP

## Request Schema

### Request Body
```json
{
  "description": "string (required, 10-2000 characters)",
  "language": "string (optional, default: 'it')",
  "template": "string (optional)",
  "complexity": "string (optional, enum: ['simple', 'medium', 'complex'])",
  "includeTests": "boolean (optional, default: false)"
}
```

### Request Examples

#### Basic Request
```json
{
  "description": "Voglio creare un sistema di autenticazione utenti con login, registrazione e reset password. Gli utenti devono poter fare login con email e password, registrarsi con email/password/nome, e richiedere reset password via email."
}
```

#### Advanced Request
```json
{
  "description": "Sistema di gestione ordini e-commerce con carrello, checkout, pagamenti e tracking spedizioni",
  "language": "en",
  "template": "ecommerce",
  "complexity": "complex",
  "includeTests": true
}
```

## Response Schema

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "feature": {
      "name": "string",
      "description": "string",
      "complexity": "string",
      "estimatedHours": "number",
      "functionalRequirements": [
        {
          "id": "string",
          "title": "string",
          "description": "string",
          "priority": "string (high|medium|low)"
        }
      ],
      "nonFunctionalRequirements": [
        {
          "id": "string",
          "category": "string (performance|security|usability|reliability)",
          "requirement": "string",
          "metric": "string"
        }
      ],
      "apiEndpoints": [
        {
          "method": "string (GET|POST|PUT|DELETE)",
          "path": "string",
          "description": "string",
          "requestBody": "object|null",
          "responseBody": "object",
          "statusCodes": ["number"]
        }
      ],
      "dataModels": [
        {
          "name": "string",
          "description": "string",
          "fields": [
            {
              "name": "string",
              "type": "string",
              "required": "boolean",
              "description": "string"
            }
          ],
          "relationships": [
            {
              "type": "string (oneToOne|oneToMany|manyToMany)",
              "target": "string",
              "description": "string"
            }
          ]
        }
      ],
      "dependencies": [
        {
          "name": "string",
          "type": "string (library|service|database)",
          "version": "string",
          "purpose": "string"
        }
      ],
      "acceptanceCriteria": [
        {
          "scenario": "string",
          "given": "string",
          "when": "string",
          "then": "string"
        }
      ],
      "testCases": [
        {
          "type": "string (unit|integration|e2e)",
          "description": "string",
          "steps": ["string"]
        }
      ]
    },
    "metadata": {
      "generatedAt": "string (ISO 8601)",
      "processingTime": "number (milliseconds)",
      "aiModel": "string",
      "version": "string"
    }
  }
}
```

### Success Response Example
```json
{
  "success": true,
  "data": {
    "feature": {
      "name": "User Authentication System",
      "description": "Complete authentication system with login, registration, and password reset functionality",
      "complexity": "medium",
      "estimatedHours": 24,
      "functionalRequirements": [
        {
          "id": "FR001",
          "title": "User Registration",
          "description": "Users can create new accounts with email, password, and name",
          "priority": "high"
        },
        {
          "id": "FR002",
          "title": "User Login",
          "description": "Registered users can authenticate with email and password",
          "priority": "high"
        },
        {
          "id": "FR003",
          "title": "Password Reset",
          "description": "Users can request password reset via email",
          "priority": "medium"
        }
      ],
      "nonFunctionalRequirements": [
        {
          "id": "NFR001",
          "category": "security",
          "requirement": "Passwords must be hashed using bcrypt",
          "metric": "All passwords encrypted with salt rounds >= 12"
        },
        {
          "id": "NFR002",
          "category": "performance",
          "requirement": "Authentication response time",
          "metric": "< 500ms for 95% of requests"
        }
      ],
      "apiEndpoints": [
        {
          "method": "POST",
          "path": "/api/auth/register",
          "description": "Register new user account",
          "requestBody": {
            "email": "string",
            "password": "string",
            "name": "string"
          },
          "responseBody": {
            "user": {
              "id": "string",
              "email": "string",
              "name": "string"
            },
            "token": "string"
          },
          "statusCodes": [201, 400, 409]
        },
        {
          "method": "POST",
          "path": "/api/auth/login",
          "description": "Authenticate user and return JWT token",
          "requestBody": {
            "email": "string",
            "password": "string"
          },
          "responseBody": {
            "user": {
              "id": "string",
              "email": "string",
              "name": "string"
            },
            "token": "string"
          },
          "statusCodes": [200, 400, 401]
        }
      ],
      "dataModels": [
        {
          "name": "User",
          "description": "User account information",
          "fields": [
            {
              "name": "id",
              "type": "UUID",
              "required": true,
              "description": "Unique user identifier"
            },
            {
              "name": "email",
              "type": "string",
              "required": true,
              "description": "User email address (unique)"
            },
            {
              "name": "password",
              "type": "string",
              "required": true,
              "description": "Hashed password"
            },
            {
              "name": "name",
              "type": "string",
              "required": true,
              "description": "User full name"
            },
            {
              "name": "createdAt",
              "type": "datetime",
              "required": true,
              "description": "Account creation timestamp"
            }
          ],
          "relationships": []
        }
      ],
      "dependencies": [
        {
          "name": "bcrypt",
          "type": "library",
          "version": "^5.1.0",
          "purpose": "Password hashing"
        },
        {
          "name": "jsonwebtoken",
          "type": "library",
          "version": "^9.0.0",
          "purpose": "JWT token generation and validation"
        },
        {
          "name": "nodemailer",
          "type": "library",
          "version": "^6.9.0",
          "purpose": "Email sending for password reset"
        }
      ],
      "acceptanceCriteria": [
        {
          "scenario": "Successful user registration",
          "given": "A new user with valid email, password, and name",
          "when": "They submit the registration form",
          "then": "Account is created and JWT token is returned"
        },
        {
          "scenario": "Failed login with wrong password",
          "given": "An existing user with correct email but wrong password",
          "when": "They attempt to login",
          "then": "Authentication fails with 401 error"
        }
      ],
      "testCases": [
        {
          "type": "unit",
          "description": "Test password hashing function",
          "steps": [
            "Call hashPassword with plain text password",
            "Verify returned hash is different from plain text",
            "Verify hash can be validated with comparePassword"
          ]
        }
      ]
    },
    "metadata": {
      "generatedAt": "2024-01-13T10:30:00Z",
      "processingTime": 2340,
      "aiModel": "gpt-4",
      "version": "1.0.0"
    }
  }
}
```

## Error Responses

### Validation Error (400 Bad Request)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "description",
        "message": "Description must be between 10 and 2000 characters"
      }
    ]
  }
}
```

### Rate Limit Error (429 Too Many Requests)
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 60
  }
}
```

### AI Service Error (502 Bad Gateway)
```json
{
  "success": false,
  "error": {
    "code": "AI_SERVICE_ERROR",
    "message": "AI service temporarily unavailable",
    "details": "The AI provider is experiencing issues. Please try again in a few minutes."
  }
}
```

### Internal Server Error (500 Internal Server Error)
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred",
    "requestId": "req_123456789"
  }
}
```

## Error Codes Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request parameters |
| `DESCRIPTION_TOO_SHORT` | 400 | Description under 10 characters |
| `DESCRIPTION_TOO_LONG` | 400 | Description over 2000 characters |
| `INVALID_LANGUAGE` | 400 | Unsupported language code |
| `INVALID_TEMPLATE` | 400 | Unknown template name |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests from IP |
| `AI_SERVICE_ERROR` | 502 | AI provider unavailable |
| `AI_RESPONSE_INVALID` | 502 | AI returned malformed response |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

## Request Validation Rules

### Description Field
- **Required**: Yes
- **Type**: String
- **Min Length**: 10 characters
- **Max Length**: 2000 characters
- **Pattern**: Must contain at least one letter

### Language Field
- **Required**: No
- **Type**: String
- **Default**: "it"
- **Allowed Values**: ["it", "en"]

### Template Field
- **Required**: No
- **Type**: String
- **Allowed Values**: ["crud", "auth", "ecommerce", "api", "dashboard"]

### Complexity Field
- **Required**: No
- **Type**: String
- **Default**: "medium"
- **Allowed Values**: ["simple", "medium", "complex"]

### IncludeTests Field
- **Required**: No
- **Type**: Boolean
- **Default**: false

## Response Headers

### Success Response Headers
```
Content-Type: application/json
X-Processing-Time: 2340
X-AI-Model: gpt-4
X-Rate-Limit-Remaining: 9
X-Rate-Limit-Reset: 1642089600
```

### Error Response Headers
```
Content-Type: application/json
X-Error-Code: VALIDATION_ERROR
X-Request-ID: req_123456789
```