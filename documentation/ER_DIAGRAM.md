# Entity-Relationship Diagram

## Overview
This document describes the Entity-Relationship (ER) diagram for the AI Study Planner database.

---

## Entities

### 1. User
**Attributes:**
- _id (Primary Key)
- name
- email (Unique)
- password (Hashed)
- createdAt
- updatedAt

**Description:** Represents a registered user of the application.

---

### 2. Subject
**Attributes:**
- _id (Primary Key)
- userId (Foreign Key → User)
- name
- dailyTargetHours
- examDate
- color
- createdAt
- updatedAt

**Description:** Represents a subject that a user is studying.

---

### 3. Task
**Attributes:**
- _id (Primary Key)
- userId (Foreign Key → User)
- subjectId (Foreign Key → Subject)
- title
- date
- duration
- completed
- completedAt
- createdAt
- updatedAt

**Description:** Represents a daily study task scheduled for a specific subject.

---

### 4. Test
**Attributes:**
- _id (Primary Key)
- userId (Foreign Key → User)
- subjectId (Foreign Key → Subject)
- title
- questions (Array of Objects)
  - question
  - options (Array)
  - correctAnswer
  - userAnswer
- score
- totalQuestions
- completed
- completedAt
- createdAt
- updatedAt

**Description:** Represents an MCQ test for a subject.

---

### 5. Revision
**Attributes:**
- _id (Primary Key)
- userId (Foreign Key → User)
- subjectId (Foreign Key → Subject)
- topic
- studyDate
- nextRevisionDate
- completed
- completedAt
- revisionCount
- createdAt
- updatedAt

**Description:** Represents a topic scheduled for spaced repetition revision.

---

### 6. Doubt
**Attributes:**
- _id (Primary Key)
- userId (Foreign Key → User)
- subjectId (Foreign Key → Subject, Optional)
- question
- aiResponse
- helpful
- createdAt
- updatedAt

**Description:** Represents a doubt/question asked by the user with AI response.

---

## Relationships

### User ↔ Subject
- **Type:** One-to-Many
- **Description:** One user can have multiple subjects
- **Foreign Key:** Subject.userId references User._id
- **Cardinality:** 1:N

### User ↔ Task
- **Type:** One-to-Many
- **Description:** One user can create multiple tasks
- **Foreign Key:** Task.userId references User._id
- **Cardinality:** 1:N

### User ↔ Test
- **Type:** One-to-Many
- **Description:** One user can take multiple tests
- **Foreign Key:** Test.userId references User._id
- **Cardinality:** 1:N

### User ↔ Revision
- **Type:** One-to-Many
- **Description:** One user can have multiple revision entries
- **Foreign Key:** Revision.userId references User._id
- **Cardinality:** 1:N

### User ↔ Doubt
- **Type:** One-to-Many
- **Description:** One user can ask multiple doubts
- **Foreign Key:** Doubt.userId references User._id
- **Cardinality:** 1:N

### Subject ↔ Task
- **Type:** One-to-Many
- **Description:** One subject can have multiple tasks
- **Foreign Key:** Task.subjectId references Subject._id
- **Cardinality:** 1:N

### Subject ↔ Test
- **Type:** One-to-Many
- **Description:** One subject can have multiple tests
- **Foreign Key:** Test.subjectId references Subject._id
- **Cardinality:** 1:N

### Subject ↔ Revision
- **Type:** One-to-Many
- **Description:** One subject can have multiple revision topics
- **Foreign Key:** Revision.subjectId references Subject._id
- **Cardinality:** 1:N

### Subject ↔ Doubt
- **Type:** One-to-Many (Optional)
- **Description:** One subject can have multiple doubts (subject is optional for doubts)
- **Foreign Key:** Doubt.subjectId references Subject._id
- **Cardinality:** 1:N

---

## ER Diagram (Text Representation)

```
┌─────────────┐
│    USER     │
│─────────────│
│ _id (PK)    │
│ name        │
│ email       │
│ password    │
│ createdAt   │
│ updatedAt   │
└──────┬──────┘
       │
       │ 1:N
       │
       ├──────────────────────────────────────────────┐
       │                                              │
       │                                              │
       ▼                                              ▼
┌─────────────┐                              ┌─────────────┐
│   SUBJECT   │                              │    TASK     │
│─────────────│                              │─────────────│
│ _id (PK)    │                              │ _id (PK)    │
│ userId (FK) │◄─────────────────────────────│ userId (FK) │
│ name        │                          ┌───│ subjectId   │
│ dailyTarget │                          │   │ title       │
│ examDate    │                          │   │ date        │
│ color       │                          │   │ duration    │
│ createdAt   │                          │   │ completed   │
│ updatedAt   │                          │   │ completedAt │
└──────┬──────┘                          │   │ createdAt   │
       │                                 │   │ updatedAt   │
       │ 1:N                             │   └─────────────┘
       │                                 │
       ├─────────────────────────────────┘
       │
       ├──────────────────────────────────────────────┐
       │                                              │
       ▼                                              ▼
┌─────────────┐                              ┌─────────────┐
│    TEST     │                              │  REVISION   │
│─────────────│                              │─────────────│
│ _id (PK)    │                              │ _id (PK)    │
│ userId (FK) │                              │ userId (FK) │
│ subjectId   │                              │ subjectId   │
│ title       │                              │ topic       │
│ questions[] │                              │ studyDate   │
│ score       │                              │ nextRevDate │
│ total       │                              │ completed   │
│ completed   │                              │ revCount    │
│ completedAt │                              │ createdAt   │
│ createdAt   │                              │ updatedAt   │
│ updatedAt   │                              └─────────────┘
└─────────────┘
       │
       │ (Subject relationship shown above)
       │
       
       
┌─────────────┐
│    DOUBT    │
│─────────────│
│ _id (PK)    │
│ userId (FK) │───────────────────────┐
│ subjectId   │ (Optional)            │
│ question    │                       │
│ aiResponse  │                       │
│ helpful     │                       │
│ createdAt   │                       │
│ updatedAt   │                       │
└─────────────┘                       │
                                      │
                                      │
                            (Links to USER)
```

---

## Key Relationships Summary

1. **User is central** - All other entities are linked to User
2. **Subject acts as a category** - Tasks, Tests, Revisions, and Doubts are organized by Subject
3. **Cascading deletes** - When a user is deleted, all their data should be deleted
4. **Optional relationships** - Doubt.subjectId is optional (general doubts)

---

## Cardinality Notation

- **1:N** = One-to-Many
- **PK** = Primary Key
- **FK** = Foreign Key
- **◄** = Relationship direction

---

## Database Constraints

1. **User.email** must be unique
2. **Subject.dailyTargetHours** must be between 0.5 and 12
3. **Test.questions.correctAnswer** must be between 0 and 3
4. **Task.duration** must be at least 0.25
5. All foreign keys must reference valid documents

---

## Indexes for Performance

- User: email (unique)
- Subject: userId
- Task: userId, subjectId, date
- Test: userId, subjectId
- Revision: userId, subjectId, nextRevisionDate
- Doubt: userId
