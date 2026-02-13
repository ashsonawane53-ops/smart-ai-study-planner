# Viva Questions and Answers

## Project Overview Questions

### Q1: What is the purpose of your project?
**Answer:** The AI Study Planner is a full-stack web application designed to help students manage their study schedule effectively. It provides features like subject management, daily task planning, test creation, spaced repetition for revisions, AI-powered study suggestions, and a doubt solver. The main goal is to improve student productivity and retention through systematic planning and AI assistance.

### Q2: What technologies did you use and why?
**Answer:** 
- **Frontend:** HTML, CSS, JavaScript - Chosen for simplicity and universal browser support
- **Backend:** Node.js with Express - Lightweight, fast, and JavaScript-based for full-stack consistency
- **Database:** MongoDB - NoSQL database perfect for flexible document storage and easy integration with Node.js
- **Session Management:** express-session with connect-mongo - Secure session handling with MongoDB persistence
- **Security:** bcryptjs - Industry-standard password hashing for user security

### Q3: What is the architecture of your application?
**Answer:** The application follows a client-server architecture with a three-tier design:
1. **Presentation Layer:** HTML/CSS/JavaScript frontend
2. **Application Layer:** Node.js/Express backend with RESTful API
3. **Data Layer:** MongoDB database

The frontend communicates with the backend via HTTP requests, and the backend handles business logic and database operations.

---

## Technical Questions

### Q4: How does user authentication work?
**Answer:** User authentication uses session-based authentication:
1. User registers with name, email, and password
2. Password is hashed using bcryptjs (salt rounds: 10) before storing
3. On login, password is compared with the hashed version
4. If successful, a session is created and stored in MongoDB
5. Session cookie is sent to the client
6. Subsequent requests include the session cookie for authentication
7. Middleware checks session validity before accessing protected routes

### Q5: Explain the database schema.
**Answer:** The database has 6 main collections:
1. **Users:** Stores user credentials and profile information
2. **Subjects:** Contains subjects with daily targets and exam dates
3. **Tasks:** Daily study tasks linked to subjects and users
4. **Tests:** MCQ tests with questions, options, and scoring
5. **Revisions:** Topics for spaced repetition with scheduled dates
6. **Doubts:** Questions asked by users with AI responses

All collections (except Users) have foreign key relationships with the User collection, creating a one-to-many relationship structure.

### Q6: How does the AI suggestion feature work?
**Answer:** The AI suggestion feature uses rule-based logic:
1. Calculates days remaining until exam
2. Compares with current daily target hours
3. Provides recommendations based on urgency:
   - Less than 7 days: Increase study time by 50%
   - 7-14 days: Increase by 20%
   - 14-30 days: Maintain current target
   - More than 30 days: Steady pace recommendation
4. Returns personalized suggestions for each subject

### Q7: Explain the spaced repetition system.
**Answer:** Spaced repetition follows scientific learning principles:
1. When a topic is studied, it's added to the revision tracker
2. First revision is scheduled 3 days after the study date
3. After completing the first revision, the next is scheduled 7 days later
4. Subsequent revisions continue at 7-day intervals
5. This spacing helps move information from short-term to long-term memory
6. System tracks revision count and completion status

### Q8: How do you handle password security?
**Answer:** Password security is implemented using:
1. **bcryptjs** library for hashing
2. Passwords are never stored in plain text
3. Salt rounds set to 10 for strong hashing
4. Pre-save middleware in User model automatically hashes passwords
5. Password comparison uses bcrypt's compare function
6. Minimum password length enforced (6 characters)

### Q9: What is the purpose of middleware in your application?
**Answer:** Middleware serves two main purposes:
1. **Authentication Middleware:** Checks if user is logged in before accessing protected routes. If not authenticated, returns 401 error.
2. **Express Middleware:** 
   - CORS for cross-origin requests
   - express.json() for parsing JSON bodies
   - express-session for session management
   - express.static() for serving frontend files

### Q10: How does the test scoring system work?
**Answer:** Test scoring process:
1. Test is created with questions and correct answers
2. When user takes test, answers are stored temporarily
3. On submission, backend compares user answers with correct answers
4. Score is calculated as number of correct answers
5. Percentage is computed: (score / totalQuestions) × 100
6. Results are stored in database with completion timestamp
7. Frontend displays score with color coding (green ≥70%, yellow ≥50%, red <50%)

---

## Database Questions

### Q11: Why did you choose MongoDB over SQL databases?
**Answer:** MongoDB was chosen because:
1. **Flexible Schema:** Easy to modify structure as requirements change
2. **JSON-like Documents:** Natural fit with JavaScript/Node.js
3. **Nested Data:** Can store arrays (test questions, options) without joins
4. **Scalability:** Horizontal scaling capabilities
5. **Fast Development:** No need for complex migrations
6. **Mongoose ODM:** Provides schema validation and easy querying

### Q12: What are the relationships in your database?
**Answer:** 
- **One-to-Many relationships:**
  - User → Subjects (one user, many subjects)
  - User → Tasks (one user, many tasks)
  - User → Tests (one user, many tests)
  - User → Revisions (one user, many revisions)
  - User → Doubts (one user, many doubts)
  - Subject → Tasks (one subject, many tasks)
  - Subject → Tests (one subject, many tests)
  - Subject → Revisions (one subject, many revisions)

### Q13: How do you ensure data integrity?
**Answer:** Data integrity is maintained through:
1. **Schema Validation:** Mongoose schemas enforce required fields and data types
2. **Unique Constraints:** Email field has unique index
3. **Foreign Key References:** ObjectId references ensure valid relationships
4. **Validation Rules:** Min/max values for numbers, string length limits
5. **Timestamps:** Automatic createdAt and updatedAt tracking
6. **Middleware Validation:** Backend validates data before database operations

---

## Feature-Specific Questions

### Q14: How does the daily planner calculate progress?
**Answer:** Progress calculation:
1. Fetches all tasks for the current day
2. Counts total tasks and completed tasks
3. Calculates completion percentage: (completed / total) × 100
4. Sums total duration and completed task durations
5. Computes remaining hours: total hours - completed hours
6. Displays progress bar with percentage
7. Updates in real-time when tasks are marked complete

### Q15: Explain the doubt solver AI logic.
**Answer:** The doubt solver uses keyword-based pattern matching:
1. User submits a question
2. Question is converted to lowercase for matching
3. System checks for keywords in predefined categories:
   - Math: derivative, integration, etc.
   - Physics: force, energy, Newton, etc.
   - Chemistry: acid, base, pH, etc.
   - Programming: loop, array, etc.
4. Returns relevant pre-written response based on keywords
5. If no match, provides general study guidance
6. Response is stored in database for history

### Q16: How do you handle session management?
**Answer:** Session management:
1. **express-session** middleware creates sessions
2. Sessions stored in MongoDB using **connect-mongo**
3. Session cookie sent to client (httpOnly for security)
4. Cookie expires after 7 days
5. Session contains userId and userName
6. Every protected route checks session validity
7. Logout destroys session from database

---

## API and Frontend Questions

### Q17: What is a RESTful API and how did you implement it?
**Answer:** REST (Representational State Transfer) is an architectural style. Implementation:
- **GET:** Retrieve data (subjects, tasks, tests, etc.)
- **POST:** Create new resources (register, create task, etc.)
- **PUT:** Update existing resources (edit subject, mark task complete)
- **DELETE:** Remove resources (delete subject, task)
- **Stateless:** Each request contains all necessary information
- **Resource-based URLs:** /api/subjects, /api/tasks, etc.
- **JSON Format:** All data exchanged in JSON

### Q18: How does the frontend communicate with the backend?
**Answer:** Communication uses Fetch API:
1. Frontend makes HTTP requests to backend endpoints
2. Includes credentials for session cookies
3. Sends/receives data in JSON format
4. Handles responses with async/await
5. Displays success/error messages to user
6. Updates UI based on response data
7. Example: `fetch('/api/subjects', { credentials: 'include' })`

### Q19: How did you make the UI responsive?
**Answer:** Responsive design techniques:
1. **CSS Grid:** Auto-fit columns that stack on mobile
2. **Flexbox:** Flexible layouts that adapt to screen size
3. **Media Queries:** Specific styles for screens < 768px
4. **Viewport Meta Tag:** Ensures proper scaling on mobile
5. **Relative Units:** Uses percentages and rem instead of fixed pixels
6. **Mobile-First Approach:** Base styles work on small screens

### Q20: What security measures did you implement?
**Answer:** Security measures:
1. **Password Hashing:** bcryptjs with salt rounds
2. **Session Security:** httpOnly cookies prevent XSS
3. **Authentication Middleware:** Protects all routes
4. **Input Validation:** Frontend and backend validation
5. **CORS Configuration:** Controls cross-origin access
6. **No Password Exposure:** Passwords never sent in responses
7. **Session Expiration:** Auto-logout after 7 days

---

## Challenges and Improvements

### Q21: What challenges did you face during development?
**Answer:** Main challenges:
1. **Session Management:** Configuring MongoDB session store correctly
2. **Date Handling:** Managing timezones for tasks and revisions
3. **Spaced Repetition Logic:** Calculating next revision dates accurately
4. **Test Question Storage:** Designing flexible schema for MCQs
5. **Real-time Progress:** Updating statistics without page refresh
6. **Responsive Design:** Making complex layouts work on mobile

### Q22: What improvements would you make?
**Answer:** Future improvements:
1. **Real AI Integration:** Use OpenAI or Google Gemini API
2. **Email Notifications:** Remind users of pending revisions
3. **Data Visualization:** Charts for study trends using Chart.js
4. **File Upload:** Allow uploading study materials
5. **Collaboration:** Share study plans with friends
6. **Mobile App:** React Native version
7. **Export Reports:** PDF generation of study statistics
8. **Calendar Integration:** Sync with Google Calendar

### Q23: How would you scale this application?
**Answer:** Scaling strategies:
1. **Database:** MongoDB sharding for horizontal scaling
2. **Caching:** Redis for session and frequently accessed data
3. **Load Balancing:** Multiple server instances with nginx
4. **CDN:** Serve static files from CDN
5. **Microservices:** Separate services for tests, doubts, etc.
6. **Database Indexing:** Optimize queries with proper indexes
7. **API Rate Limiting:** Prevent abuse

### Q24: How do you test your application?
**Answer:** Testing approach:
1. **Manual Testing:** Test all features in browser
2. **API Testing:** Use Postman for endpoint testing
3. **Database Testing:** Verify data integrity in MongoDB Compass
4. **User Flow Testing:** Complete user journeys (register → add subject → create task)
5. **Edge Cases:** Test with invalid inputs, empty data
6. **Browser Compatibility:** Test on Chrome, Firefox, Edge
7. **Responsive Testing:** Test on different screen sizes

### Q25: What did you learn from this project?
**Answer:** Key learnings:
1. **Full-Stack Development:** End-to-end application building
2. **Database Design:** Schema design and relationships
3. **Authentication:** Session-based auth implementation
4. **API Design:** RESTful principles and best practices
5. **Frontend-Backend Integration:** Connecting both layers
6. **User Experience:** Importance of clean UI/UX
7. **Problem Solving:** Debugging and troubleshooting skills
8. **Project Management:** Breaking down features into tasks
