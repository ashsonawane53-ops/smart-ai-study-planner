// App JavaScript
// App JavaScript
// API_URL is defined in auth.js

// Initialize app
async function initApp() {
  if (typeof log === 'function') log('initApp called');
  try {
    if (typeof log === 'function') log('Checking protectPage...');
    if (typeof protectPage === 'undefined') {
      throw new Error('Auth script not loaded (protectPage missing)');
    }

    const user = await protectPage();
    if (typeof log === 'function') log('User authenticated: ' + (user ? user.name : 'No'));

    if (user) {
      document.getElementById('user-name').textContent = user.name;
    }

    if (typeof log === 'function') log('Loading stats...');
    loadDashboardStats();
  } catch (error) {
    if (typeof log === 'function') log('CRITICAL ERROR: ' + error.message);
    alert('App logic failed: ' + error.message);
    console.error(error);
  }
}

// Load all dashboard statistics
async function loadDashboardStats() {
  try {
    if (typeof log === 'function') log('Fetching stats from API...');
    const response = await fetch(`${API_URL}/dashboard/stats`, {
      credentials: 'include'
    });

    if (typeof log === 'function') log('Stats response status: ' + response.status);
    if (!response.ok) throw new Error('Failed to load stats');

    const data = await response.json();
    if (typeof log === 'function') log('Stats loaded successfully');

    // Update stat cards
    document.getElementById('total-hours').textContent = data.totalStudyHours;
    document.getElementById('completion-percentage').textContent = data.todayCompletionPercentage + '%';
    document.getElementById('avg-test-score').textContent = data.averageTestScore + '%';
    document.getElementById('pending-revisions').textContent = data.pendingRevisions;

    // Display today's tasks
    displayTodayTasks(data.todayTasks);

    // Display upcoming tasks
    displayUpcomingTasks(data.upcomingTasks);

    // Display subject stats
    displaySubjectStats(data.subjectStats);

    // Display test performance
    displayTestPerformance(data.testPerformance);

    // Display pending revisions
    displayPendingRevisions(data.pendingRevisionsList);

  } catch (error) {
    if (typeof log === 'function') log('Error loading stats: ' + error.message);
    console.error('Error loading dashboard:', error);
    const errorHtml = `<div class="alert alert-error">Error loading data: ${error.message}</div>`;
    document.getElementById('today-tasks-container').innerHTML = errorHtml;
    document.getElementById('upcoming-tasks-container').innerHTML = errorHtml;
    document.getElementById('subject-stats-container').innerHTML = errorHtml;
    document.getElementById('test-performance-container').innerHTML = errorHtml;
    document.getElementById('pending-revisions-container').innerHTML = errorHtml;
  }
}

// Display today's tasks
function displayTodayTasks(todayData) {
  const container = document.getElementById('today-tasks-container');

  if (!todayData || todayData.total === 0) {
    container.innerHTML = '<div class="empty-state"><p>No tasks scheduled for today</p><a href="planner.html" class="btn btn-primary btn-sm">Add Task</a></div>';
    return;
  }

  container.innerHTML = `
    <p class="mb-2"><strong>${todayData.completed}</strong> of <strong>${todayData.total}</strong> tasks completed</p>
    <div class="progress-bar">
      <div class="progress-fill" style="width: ${(todayData.completed / todayData.total) * 100}%">
        ${Math.round((todayData.completed / todayData.total) * 100)}%
      </div>
    </div>
  `;
}

// Display upcoming tasks
function displayUpcomingTasks(tasks) {
  const container = document.getElementById('upcoming-tasks-container');

  if (!tasks || tasks.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No upcoming tasks</p></div>';
    return;
  }

  const html = tasks.map(task => {
    const date = new Date(task.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `
      <div class="task-item">
        <div class="task-content">
          <div class="task-title">
            <span class="subject-badge" style="background: ${task.subjectId.color}">${task.subjectId.name}</span>
            ${task.title}
          </div>
          <div class="task-meta">${date} • ${task.duration} hours</div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
}

// Display subject-wise statistics
function displaySubjectStats(stats) {
  const container = document.getElementById('subject-stats-container');

  if (!stats || stats.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No study data available</p></div>';
    return;
  }

  const html = stats.map(subject => `
    <div class="task-item">
      <div class="task-content">
        <div class="task-title">
          <span class="subject-badge" style="background: ${subject.color}">${subject.name}</span>
        </div>
      </div>
      <div style="font-weight: 700; font-size: 18px; color: #6366f1;">${subject.hours} hrs</div>
    </div>
  `).join('');

  container.innerHTML = html;
}

// Display test performance
function displayTestPerformance(tests) {
  const container = document.getElementById('test-performance-container');

  if (!tests || tests.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No test history available</p><a href="tests.html" class="btn btn-primary btn-sm">Take a Test</a></div>';
    return;
  }

  const html = `
    <table class="table">
      <thead>
        <tr>
          <th>Subject</th>
          <th>Score</th>
          <th>Percentage</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        ${tests.map(test => {
    const date = new Date(test.date).toLocaleDateString();
    const percentageColor = test.percentage >= 70 ? '#10b981' : test.percentage >= 50 ? '#f59e0b' : '#ef4444';
    return `
            <tr>
              <td>${test.subject}</td>
              <td>${test.score}/${test.total}</td>
              <td style="color: ${percentageColor}; font-weight: 600;">${test.percentage}%</td>
              <td>${date}</td>
            </tr>
          `;
  }).join('')}
      </tbody>
    </table>
  `;

  container.innerHTML = html;
}

// Display pending revisions
function displayPendingRevisions(revisions) {
  const container = document.getElementById('pending-revisions-container');

  if (!revisions || revisions.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No pending revisions! 🎉</p></div>';
    return;
  }

  const html = revisions.map(revision => {
    const dueDate = new Date(revision.nextRevisionDate).toLocaleDateString();
    const isOverdue = new Date(revision.nextRevisionDate) < new Date();
    return `
      <div class="task-item" style="${isOverdue ? 'border-color: #ef4444;' : ''}">
        <div class="task-content">
          <div class="task-title">
            <span class="subject-badge" style="background: ${revision.subjectId.color}">${revision.subjectId.name}</span>
            ${revision.topic}
          </div>
          <div class="task-meta">
            ${isOverdue ? '⚠️ Overdue' : 'Due'}: ${dueDate}
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initApp);
