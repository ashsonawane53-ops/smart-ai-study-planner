# Database Schema Documentation

## Overview
The AI Study Planner uses MongoDB as its database. Below are the detailed schemas for all collections.

---

## Collections

### 1. Users Collection

**Collection Name:** `users`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | Auto | Unique identifier |
| name | String | Yes | User's full name |
| email | String | Yes | User's email (unique, lowercase) |
| password | String | Yes | Hashed password using bcrypt |
| createdAt | Date | Auto | Account creation timestamp |
| updatedAt | Date | Auto | Last update timestamp |

**Indexes:**
- `email` (unique)

**Example Document:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "$2a$10$...", 
  "createdAt": "2026-02-11T10:30:00.000Z",
  "updatedAt": "2026-02-11T10:30:00.000Z"
}
```

---

### 2. Subjects Collection

**Collection Name:** `subjects`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | Auto | Unique identifier |
| userId | ObjectId | Yes | Reference to User |
| name | String | Yes | Subject name |
| dailyTargetHours | Number | Yes | Daily study target (0.5-12 hours) |
| examDate | Date | Yes | Exam date |
| color | String | No | Hex color code (default: #6366f1) |
| createdAt | Date | Auto | Creation timestamp |
| updatedAt | Date | Auto | Last update timestamp |

**Indexes:**
- `userId`

**Example Document:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439011",
  "name": "Mathematics",
  "dailyTargetHours": 2.5,
  "examDate": "2026-03-15T00:00:00.000Z",
  "color": "#6366f1",
  "createdAt": "2026-02-11T10:35:00.000Z",
  "updatedAt": "2026-02-11T10:35:00.000Z"
}
```

---

### 3. Tasks Collection

**Collection Name:** `tasks`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | Auto | Unique identifier |
| userId | ObjectId | Yes | Reference to User |
| subjectId | ObjectId | Yes | Reference to Subject |
| title | String | Yes | Task title |
| date | Date | Yes | Scheduled date |
| duration | Number | Yes | Duration in hours (min: 0.25) |
| completed | Boolean | No | Completion status (default: false) |
| completedAt | Date | No | Completion timestamp |
| createdAt | Date | Auto | Creation timestamp |
| updatedAt | Date | Auto | Last update timestamp |

**Indexes:**
- `userId`
- `subjectId`
- `date`

**Example Document:**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "userId": "507f1f77bcf86cd799439011",
  "subjectId": "507f1f77bcf86cd799439012",
  "title": "Study Chapter 5 - Derivatives",
  "date": "2026-02-11T00:00:00.000Z",
  "duration": 2,
  "completed": true,
  "completedAt": "2026-02-11T14:30:00.000Z",
  "createdAt": "2026-02-11T10:40:00.000Z",
  "updatedAt": "2026-02-11T14:30:00.000Z"
}
```

---

### 4. Tests Collection

**Collection Name:** `tests`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | Auto | Unique identifier |
| userId | ObjectId | Yes | Reference to User |
| subjectId | ObjectId | Yes | Reference to Subject |
| title | String | Yes | Test title |
| questions | Array | Yes | Array of question objects |
| questions[].question | String | Yes | Question text |
| questions[].options | Array[String] | Yes | 4 options |
| questions[].correctAnswer | Number | Yes | Correct option index (0-3) |
| questions[].userAnswer | Number | No | User's selected answer (0-3) |
| score | Number | No | Total correct answers (default: 0) |
| totalQuestions | Number | Yes | Number of questions |
| completed | Boolean | No | Completion status (default: false) |
| completedAt | Date | No | Completion timestamp |
| createdAt | Date | Auto | Creation timestamp |
| updatedAt | Date | Auto | Last update timestamp |

**Indexes:**
- `userId`
- `subjectId`

**Example Document:**
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "userId": "507f1f77bcf86cd799439011",
  "subjectId": "507f1f77bcf86cd799439012",
  "title": "Chapter 5 Quiz",
  "questions": [
    {
      "question": "What is the derivative of x²?",
      "options": ["x", "2x", "x²", "2"],
      "correctAnswer": 1,
      "userAnswer": 1
    }
  ],
  "score": 8,
  "totalQuestions": 10,
  "completed": true,
  "completedAt": "2026-02-11T15:00:00.000Z",
  "createdAt": "2026-02-11T14:45:00.000Z",
  "updatedAt": "2026-02-11T15:00:00.000Z"
}
```

---

### 5. Revisions Collection

**Collection Name:** `revisions`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | Auto | Unique identifier |
| userId | ObjectId | Yes | Reference to User |
| subjectId | ObjectId | Yes | Reference to Subject |
| topic | String | Yes | Topic name |
| studyDate | Date | Yes | Original study date |
| nextRevisionDate | Date | Yes | Next scheduled revision |
| completed | Boolean | No | Completion status (default: false) |
| completedAt | Date | No | Completion timestamp |
| revisionCount | Number | No | Number of revisions (default: 0) |
| createdAt | Date | Auto | Creation timestamp |
| updatedAt | Date | Auto | Last update timestamp |

**Indexes:**
- `userId`
- `subjectId`
- `nextRevisionDate`

**Spaced Repetition Logic:**
- First revision: 3 days after study date
- Second revision: 7 days after first revision
- Continues with 7-day intervals

**Example Document:**
```json
{
  "_id": "507f1f77bcf86cd799439015",
  "userId": "507f1f77bcf86cd799439011",
  "subjectId": "507f1f77bcf86cd799439012",
  "topic": "Derivatives and Integration",
  "studyDate": "2026-02-08T00:00:00.000Z",
  "nextRevisionDate": "2026-02-11T00:00:00.000Z",
  "completed": false,
  "revisionCount": 0,
  "createdAt": "2026-02-08T16:00:00.000Z",
  "updatedAt": "2026-02-08T16:00:00.000Z"
}
```

---

### 6. Doubts Collection

**Collection Name:** `doubts`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | Auto | Unique identifier |
| userId | ObjectId | Yes | Reference to User |
| subjectId | ObjectId | No | Reference to Subject (optional) |
| question | String | Yes | User's question |
| aiResponse | String | Yes | AI-generated response |
| helpful | Boolean | No | User feedback (null/true/false) |
| createdAt | Date | Auto | Creation timestamp |
| updatedAt | Date | Auto | Last update timestamp |

**Indexes:**
- `userId`

**Example Document:**
```json
{
  "_id": "507f1f77bcf86cd799439016",
  "userId": "507f1f77bcf86cd799439011",
  "subjectId": "507f1f77bcf86cd799439012",
  "question": "How do I find the derivative of x²?",
  "aiResponse": "To find the derivative, use the power rule: d/dx(x^n) = n*x^(n-1). For x², the derivative is 2x.",
  "helpful": true,
  "createdAt": "2026-02-11T16:00:00.000Z",
  "updatedAt": "2026-02-11T16:05:00.000Z"
}
```

---

## Relationships

- **User → Subjects**: One-to-Many (One user can have multiple subjects)
- **User → Tasks**: One-to-Many (One user can have multiple tasks)
- **User → Tests**: One-to-Many (One user can have multiple tests)
- **User → Revisions**: One-to-Many (One user can have multiple revisions)
- **User → Doubts**: One-to-Many (One user can have multiple doubts)
- **Subject → Tasks**: One-to-Many (One subject can have multiple tasks)
- **Subject → Tests**: One-to-Many (One subject can have multiple tests)
- **Subject → Revisions**: One-to-Many (One subject can have multiple revisions)
- **Subject → Doubts**: One-to-Many (One subject can have multiple doubts)

---

## Database Connection

**Connection String:**
```
mongodb://localhost:27017/ai-study-planner
```

**Database Name:** `ai-study-planner`

---

## Session Store

Sessions are stored in MongoDB using `connect-mongo`:

**Collection Name:** `sessions`

This collection is automatically managed by the session middleware and stores user session data.
