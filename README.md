# AI Study Planner 📚

A full-stack web application to help students plan their study schedule, track progress, take tests, manage revisions, and get AI-powered study suggestions.

## Features ✨

1. **User Authentication** - Secure register and login system
2. **Subject Management** - Add, edit, delete subjects with daily targets and exam dates
3. **Daily Planner** - Schedule tasks, mark as completed, track progress
4. **AI Study Time Suggestions** - Get personalized study recommendations based on exam dates
5. **Daily Test Section** - Create MCQ tests, submit answers, view scores and history
6. **Revision Tracker** - Spaced repetition system (3-day and 7-day intervals)
7. **Quick Doubt Solver** - AI-based doubt resolution with keyword matching
8. **Dashboard** - Comprehensive analytics and statistics
9. **Clean Modern UI** - Responsive design with gradient themes and smooth animations
10. **Complete Documentation** - Setup guide, database schema, ER diagram, and viva Q&A

## Tech Stack 🛠️

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js with Express
- **Database:** MongoDB
- **Session Management:** express-session with MongoDB store
- **Password Security:** bcryptjs for hashing

## Prerequisites 📋

Before running this project, make sure you have the following installed:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download here](https://www.mongodb.com/try/download/community)

## Installation & Setup 🚀

### Step 1: Install MongoDB

1. Download and install MongoDB Community Edition
2. Start MongoDB service:
   ```powershell
   # Windows (Run as Administrator)
   net start MongoDB
   ```

### Step 2: Install Dependencies

Open PowerShell/Command Prompt in the project directory and run:

```powershell
npm install
```

This will install all required packages:
- express
- mongoose
- bcryptjs
- express-session
- connect-mongo
- cors

### Step 3: Start the Server

```powershell
node backend/server.js
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server running on http://localhost:5000
📚 AI Study Planner is ready!
```

### Step 4: Access the Application

Open your web browser and navigate to:
```
http://localhost:5000
```

## Project Structure 📁

```
smart-ai-study-planner/
├── backend/
│   ├── models/           # Database models
│   │   ├── User.js
│   │   ├── Subject.js
│   │   ├── Task.js
│   │   ├── Test.js
│   │   ├── Revision.js
│   │   └── Doubt.js
│   ├── routes/           # API routes
│   │   ├── auth.js
│   │   ├── subjects.js
│   │   ├── tasks.js
│   │   ├── tests.js
│   │   ├── revisions.js
│   │   ├── doubts.js
│   │   └── dashboard.js
│   ├── middleware/       # Authentication middleware
│   │   └── auth.js
│   ├── config/           # Database configuration
│   │   └── db.js
│   └── server.js         # Main server file
├── frontend/
│   ├── css/
│   │   └── style.css     # All styling
│   ├── js/               # Frontend JavaScript
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── subjects.js
│   │   ├── planner.js
│   │   ├── tests.js
│   │   ├── revisions.js
│   │   └── doubts.js
│   ├── index.html        # Login page
│   ├── register.html
│   ├── dashboard.html
│   ├── subjects.html
│   ├── planner.html
│   ├── tests.html
│   ├── revisions.html
│   └── doubts.html
├── documentation/
│   ├── DATABASE_SCHEMA.md
│   ├── ER_DIAGRAM.md
│   └── VIVA_QUESTIONS.md
├── package.json
└── README.md
```

## How to Use 📖

### 1. Register/Login
- Open the app and create a new account
- Login with your credentials

### 2. Add Subjects
- Go to "Subjects" page
- Click "+ Add Subject"
- Enter subject name, daily target hours, exam date, and choose a color
- Click "Save"

### 3. Get AI Suggestions
- On the Subjects page, click "🤖 AI Suggestions"
- View personalized study time recommendations based on your exam dates

### 4. Create Daily Tasks
- Go to "Planner" page
- Click "+ Add Task"
- Select subject, enter task title, date, and duration
- Tasks appear in your daily planner

### 5. Track Progress
- Mark tasks as completed by checking the checkbox
- View progress bar showing completion percentage
- See remaining study hours for the day

### 6. Take Tests
- Go to "Tests" page
- Click "+ Create Test"
- Select subject, enter title, and number of questions
- Add questions with 4 options each
- Take the test and view your score

### 7. Manage Revisions
- Go to "Revisions" page
- Add topics you've studied
- System automatically schedules revisions after 3 days, then 7 days
- Complete revisions when due

### 8. Ask Doubts
- Go to "Doubts" page
- Type your question
- Get instant AI-powered responses
- View doubt history

### 9. View Dashboard
- Dashboard shows:
  - Total study hours
  - Today's completion percentage
  - Average test score
  - Pending revisions
  - Upcoming tasks
  - Subject-wise study hours
  - Recent test performance

## API Endpoints 🔌

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/check-auth` - Check authentication status

### Subjects
- `GET /api/subjects` - Get all subjects
- `POST /api/subjects` - Create subject
- `PUT /api/subjects/:id` - Update subject
- `DELETE /api/subjects/:id` - Delete subject
- `GET /api/subjects/ai-suggestions` - Get AI study suggestions

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/today` - Get today's tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Tests
- `POST /api/tests/create` - Create test
- `POST /api/tests/submit` - Submit test answers
- `GET /api/tests/history` - Get test history
- `GET /api/tests/subject/:subjectId` - Get tests by subject

### Revisions
- `POST /api/revisions` - Create revision entry
- `GET /api/revisions/pending` - Get pending revisions
- `PUT /api/revisions/:id/complete` - Mark revision complete
- `GET /api/revisions/all` - Get all revisions

### Doubts
- `POST /api/doubts/ask` - Ask a doubt
- `GET /api/doubts/history` - Get doubt history
- `PUT /api/doubts/:id/feedback` - Submit feedback

### Dashboard
- `GET /api/dashboard/stats` - Get all dashboard statistics

## Troubleshooting 🔧

### MongoDB Connection Error
- Make sure MongoDB service is running
- Check if MongoDB is installed correctly
- Verify MongoDB is running on default port 27017

### Port Already in Use
- Change the PORT in `backend/server.js`
- Or stop the process using port 5000

### Cannot Access Application
- Make sure server is running (`node backend/server.js`)
- Check browser console for errors
- Verify you're accessing `http://localhost:5000`

## Future Enhancements 🚀

- Integration with real AI APIs (OpenAI, Google Gemini)
- Email notifications for pending revisions
- Study streak tracking
- Leaderboard for test scores
- Export study reports as PDF
- Mobile app version
- Calendar integration

## Credits 👨‍💻

Created as a comprehensive study management solution for students.

## License 📄

This project is open source and available for educational purposes.

---

**Happy Studying! 📚✨**
