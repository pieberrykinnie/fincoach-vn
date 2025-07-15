# FinCoach VN API Documentation

## Overview

The FinCoach VN API is a RESTful API that provides endpoints for managing personal finances using the 6-jar money management method. All API endpoints are secured with AWS Cognito authentication.

## Base URL

```
Production: https://api.fincoach-vn.vpbank.com
Development: http://localhost:3001
```

## Authentication

All API requests (except user registration) require authentication via AWS Cognito. Include the JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## API Endpoints

### User Management

#### Create User
```http
POST /v1/users
```

Creates a new user after Cognito sign-up.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "Nguyen Van A",
  "monthlyIncome": 10000000,
  "cognitoUserId": "cognito-user-id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "message": "User created successfully",
    "wisdomPointsAwarded": 100
  }
}
```

#### Get User
```http
GET /v1/users/{userId}
```

Retrieves user profile information.

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "name": "Nguyen Van A",
    "monthlyIncome": 10000000,
    "jarAllocations": {
      "necessity": 55,
      "education": 10,
      "play": 10,
      "longTermSavings": 10,
      "financialFreedom": 10,
      "give": 5
    },
    "wisdomPoints": 150,
    "createdAt": "2025-01-15T10:00:00Z"
  }
}
```

### Jar Management

#### Setup Jars
```http
POST /v1/users/{userId}/jars
```

Initialize or reset user's jar allocations.

**Request Body:**
```json
{
  "jarAllocations": {
    "necessity": 55,
    "education": 10,
    "play": 10,
    "longTermSavings": 10,
    "financialFreedom": 10,
    "give": 5
  }
}
```

#### Get Jars
```http
GET /v1/users/{userId}/jars
```

Get current jar balances and limits.

**Response:**
```json
{
  "success": true,
  "data": {
    "jars": [
      {
        "jarType": "necessity",
        "allocationPercentage": 55,
        "monthlyLimit": 5500000,
        "monthlySpent": 4500000,
        "percentageUsed": 81.8,
        "remaining": 1000000
      }
    ],
    "totalIncome": 10000000,
    "totalSpent": 7400000,
    "totalRemaining": 2600000
  }
}
```

### Transaction Management

#### Create Transaction
```http
POST /v1/users/{userId}/transactions
```

Add a new transaction.

**Request Body:**
```json
{
  "amount": 150000,
  "description": "Coffee at Highlands",
  "vendor": "Highlands Coffee",
  "date": "2025-01-15T10:00:00Z"
}
```

#### Classify Transaction
```http
POST /v1/users/{userId}/transactions/classify
```

Classify a transaction and update jar balances.

**Request Body:**
```json
{
  "amount": 150000,
  "description": "Coffee at Highlands",
  "vendor": "Highlands Coffee",
  "transactionId": "optional-transaction-id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "uuid",
    "classification": {
      "jar": "play",
      "confidence": 0.85,
      "category": "cafe"
    },
    "jarStatus": {
      "monthlyLimit": 1000000,
      "monthlySpent": 750000,
      "percentageUsed": 75,
      "remaining": 250000
    },
    "suggestions": [
      {
        "jar": "play",
        "category": "cafe",
        "confidence": 0.85
      }
    ],
    "alert": {
      "created": true,
      "message": "Your play jar is at 75% - mindful spending ahead!"
    }
  }
}
```

#### Get Transactions
```http
GET /v1/users/{userId}/transactions
```

Get user's transaction history.

**Query Parameters:**
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string
- `jar` (optional): Filter by jar type
- `limit` (optional): Number of results (default: 50)
- `lastKey` (optional): Pagination cursor

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "transactionId": "uuid",
        "amount": 150000,
        "description": "Coffee at Highlands",
        "vendor": "Highlands Coffee",
        "date": "2025-01-15T10:00:00Z",
        "jar": "play",
        "category": "cafe",
        "isReviewed": true
      }
    ],
    "lastKey": "pagination-cursor",
    "hasMore": true
  }
}
```

### AI & Insights

#### Ask AI
```http
POST /v1/ai/ask
```

Get AI-powered financial guidance.

**Request Body:**
```json
{
  "question": "How can I save more money?",
  "userId": "optional-user-id-for-context"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "question": "How can I save more money?",
    "answer": "Based on your spending patterns, here are my recommendations...",
    "sources": ["FinCoach VN Knowledge Base"],
    "disclaimer": "This is general financial guidance..."
  }
}
```

#### Get Insights
```http
GET /v1/users/{userId}/insights
```

Get spending insights and trends.

**Query Parameters:**
- `period` (optional): "week" | "month" | "quarter" (default: "month")

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "month",
    "insights": [
      {
        "type": "overspending",
        "jar": "play",
        "message": "You've exceeded your Play jar budget by 15%",
        "recommendation": "Consider reducing entertainment expenses"
      }
    ],
    "trends": {
      "necessity": { "change": -5, "direction": "down" },
      "education": { "change": 10, "direction": "up" }
    },
    "topCategories": [
      { "category": "dining_out", "amount": 1500000, "percentage": 20 }
    ]
  }
}
```

### Alerts

#### Get Alerts
```http
GET /v1/users/{userId}/alerts
```

Get user's alerts.

**Query Parameters:**
- `unreadOnly` (optional): boolean (default: false)

**Response:**
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "alertId": "uuid",
        "type": "warning",
        "jarType": "necessity",
        "message": "Your Necessity jar is at 82% capacity!",
        "percentageUsed": 82,
        "isRead": false,
        "createdAt": "2025-01-15T10:00:00Z"
      }
    ]
  }
}
```

#### Mark Alert as Read
```http
PUT /v1/users/{userId}/alerts/{alertId}/read
```

Mark an alert as read.

### Gamification

#### Get Achievements
```http
GET /v1/gamification/achievements/{userId}
```

Get user's achievements and wisdom points.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalWisdomPoints": 150,
    "achievements": [
      {
        "achievementId": "first-transaction",
        "type": "milestone",
        "name": "First Transaction Tracked!",
        "description": "You tracked your first transaction",
        "pointsAwarded": 50,
        "earnedAt": "2025-01-15T10:00:00Z"
      }
    ],
    "nextMilestones": [
      {
        "name": "Budget Master",
        "description": "Stay within budget for 30 days",
        "pointsReward": 200,
        "progress": 0.7
      }
    ]
  }
}
```

#### Get Leaderboard
```http
GET /v1/gamification/leaderboard
```

Get wisdom points leaderboard.

**Query Parameters:**
- `timeframe` (optional): "week" | "month" | "all" (default: "month")
- `limit` (optional): Number of results (default: 10)

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

### Common Error Codes

- `UNAUTHORIZED`: Missing or invalid authentication
- `FORBIDDEN`: User doesn't have permission
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid request data
- `INTERNAL_ERROR`: Server error

## Rate Limiting

API rate limits:
- 100 requests per minute per user
- 1000 requests per hour per user

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642252800
```

## Webhooks

FinCoach VN can send webhooks for certain events:

### Transaction Classified
```json
{
  "event": "transaction.classified",
  "timestamp": "2025-01-15T10:00:00Z",
  "data": {
    "userId": "uuid",
    "transactionId": "uuid",
    "jar": "play",
    "amount": 150000
  }
}
```

### Alert Created
```json
{
  "event": "alert.created",
  "timestamp": "2025-01-15T10:00:00Z",
  "data": {
    "userId": "uuid",
    "alertId": "uuid",
    "type": "warning",
    "message": "Your Necessity jar is at 82% capacity!"
  }
}
```

## SDK Examples

### JavaScript/TypeScript
```typescript
import { FinCoachClient } from '@fincoach-vn/sdk';

const client = new FinCoachClient({
  apiKey: 'your-api-key',
  region: 'us-east-1'
});

// Classify a transaction
const result = await client.transactions.classify({
  userId: 'user-id',
  amount: 150000,
  description: 'Coffee at Highlands'
});

console.log(`Transaction classified as: ${result.classification.jar}`);
```

### Python
```python
from fincoach_vn import FinCoachClient

client = FinCoachClient(
    api_key='your-api-key',
    region='us-east-1'
)

# Get user's jars
jars = client.jars.get(user_id='user-id')
for jar in jars['jars']:
    print(f"{jar['jarType']}: {jar['percentageUsed']}% used")
```

## Testing

Use our sandbox environment for testing:
- Base URL: `https://sandbox-api.fincoach-vn.vpbank.com`
- Test credentials available upon request

## Support

- Email: api-support@fincoach-vn.vpbank.com
- Documentation: https://docs.fincoach-vn.vpbank.com
- Status Page: https://status.fincoach-vn.vpbank.com