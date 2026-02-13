// Planner JavaScript
// Planner JavaScript
// API_URL is defined in auth.js

let subjects = [];
let tasks = [];

// Initialize
async function init() {
    await protectPage();
    await loadSubjects();
    loadTodayTasks();
    loadAllTasks();

    // Set today's date as default
    document.getElementById('task-date').valueAsDate = new Date();
}

// Load subjects for dropdown
async function loadSubjects() {
    try {
        const response = await fetch(`${API_URL}/subjects`, {
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to load subjects');

        subjects = await response.json();
        populateSubjectDropdown();
    } catch (error) {
        console.error('Error loading subjects:', error);
    }
}

// Populate subject dropdown
function populateSubjectDropdown() {
    const select = document.getElementById('task-subject');
    const options = subjects.map(s =>
        `<option value="${s._id}">${s.name}</option>`
    ).join('');
    select.innerHTML = '<option value="">Select subject...</option>' + options;
}

// Load today's tasks
async function loadTodayTasks() {
    try {
        const response = await fetch(`${API_URL}/tasks/today`, {
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to load tasks');

        const data = await response.json();
        displayTodayProgress(data.stats);
        displayTodayTasks(data.tasks);
    } catch (error) {
        console.error('Error loading today tasks:', error);
    }
}

// Display today's progress
function displayTodayProgress(stats) {
    const container = document.getElementById('today-progress');

    container.innerHTML = `
    <div class="grid grid-3 mb-2">
      <div class="stat-card" style="background: linear-gradient(135deg, #6366f1, #8b5cf6);">
        <div class="stat-value">${stats.completedTasks}/${stats.totalTasks}</div>
        <div class="stat-label">Tasks Completed</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #10b981, #059669);">
        <div class="stat-value">${stats.completedHours}h</div>
        <div class="stat-label">Hours Completed</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
        <div class="stat-value">${stats.remainingHours}h</div>
        <div class="stat-label">Hours Remaining</div>
      </div>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" style="width: ${stats.completionPercentage}%">
        ${stats.completionPercentage}%
      </div>
    </div>
  `;
}

// Display today's tasks
function displayTodayTasks(tasks) {
    const container = document.getElementById('today-tasks');

    if (tasks.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No tasks for today</p></div>';
        return;
    }

    const html = tasks.map(task => `
    <div class="task-item ${task.completed ? 'completed' : ''}">
      <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
        onchange="toggleTask('${task._id}', this.checked)">
      <div class="task-content">
        <div class="task-title">
          <span class="subject-badge" style="background: ${task.subjectId.color}">${task.subjectId.name}</span>
          ${task.title}
        </div>
        <div class="task-meta">${task.duration} hours</div>
      </div>
      <button class="btn btn-sm btn-danger" onclick="deleteTask('${task._id}')">Delete</button>
    </div>
  `).join('');

    container.innerHTML = html;
}

// Load all tasks
async function loadAllTasks() {
    try {
        const response = await fetch(`${API_URL}/tasks`, {
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to load tasks');

        tasks = await response.json();
        displayAllTasks();
    } catch (error) {
        console.error('Error loading all tasks:', error);
    }
}

// Display all tasks
function displayAllTasks() {
    const container = document.getElementById('all-tasks');

    if (tasks.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No tasks created yet</p></div>';
        return;
    }

    const html = tasks.map(task => {
        const date = new Date(task.date).toLocaleDateString();
        return `
      <div class="task-item ${task.completed ? 'completed' : ''}">
        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
          onchange="toggleTask('${task._id}', this.checked)">
        <div class="task-content">
          <div class="task-title">
            <span class="subject-badge" style="background: ${task.subjectId.color}">${task.subjectId.name}</span>
            ${task.title}
          </div>
          <div class="task-meta">${date} • ${task.duration} hours</div>
        </div>
        <button class="btn btn-sm btn-danger" onclick="deleteTask('${task._id}')">Delete</button>
      </div>
    `;
    }).join('');

    container.innerHTML = html;
}

// Open add task modal
function openAddTaskModal() {
    if (subjects.length === 0) {
        alert('Please add subjects first!');
        window.location.href = 'subjects.html';
        return;
    }
    document.getElementById('task-modal').classList.add('active');
}

// Close task modal
function closeTaskModal() {
    document.getElementById('task-modal').classList.remove('active');
}

// Handle task form submission
document.getElementById('task-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        subjectId: document.getElementById('task-subject').value,
        title: document.getElementById('task-title').value,
        date: document.getElementById('task-date').value,
        duration: parseFloat(document.getElementById('task-duration').value)
    };

    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error('Failed to create task');

        closeTaskModal();
        document.getElementById('task-form').reset();
        document.getElementById('task-date').valueAsDate = new Date();
        loadTodayTasks();
        loadAllTasks();
    } catch (error) {
        alert('Error creating task: ' + error.message);
    }
});

// Toggle task completion
async function toggleTask(id, completed) {
    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ completed })
        });

        if (!response.ok) throw new Error('Failed to update task');

        loadTodayTasks();
        loadAllTasks();
    } catch (error) {
        alert('Error updating task: ' + error.message);
    }
}

// Delete task
async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to delete task');

        loadTodayTasks();
        loadAllTasks();
    } catch (error) {
        alert('Error deleting task: ' + error.message);
    }
}

// Open AI Plan Modal
function openAIPlanModal() {
    if (subjects.length === 0) {
        alert('Please add subjects first!');
        window.location.href = 'subjects.html';
        return;
    }

    // Populate subjects checkboxes
    const container = document.getElementById('ai-subjects-container');
    container.innerHTML = subjects.map(s => `
        <div class="form-check">
            <input type="checkbox" id="subject-${s._id}" value="${s._id}" checked>
            <label for="subject-${s._id}">${s.name}</label>
        </div>
    `).join('');

    // Set default exam date to 7 days from now
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    document.getElementById('ai-exam-date').valueAsDate = nextWeek;

    document.getElementById('ai-plan-modal').classList.add('active');
}

// Close AI Plan Modal
function closeAIPlanModal() {
    document.getElementById('ai-plan-modal').classList.remove('active');
}

// Handle AI Plan Form
document.getElementById('ai-plan-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const selectedSubjectIds = Array.from(document.querySelectorAll('#ai-subjects-container input:checked')).map(cb => cb.value);
    const selectedSubjectNames = subjects.filter(s => selectedSubjectIds.includes(s._id)).map(s => s.name);

    if (selectedSubjectNames.length === 0) {
        alert('Please select at least one subject');
        return;
    }

    const availableHours = parseInt(document.getElementById('ai-hours').value);
    const examDate = document.getElementById('ai-exam-date').value;
    const academicLevel = document.getElementById('ai-academic-level').value;
    const btn = document.getElementById('ai-plan-btn');

    try {
        btn.disabled = true;
        btn.textContent = 'Generating Plan...';
        if (typeof log === 'function') log(`Generating AI Plan for ${academicLevel}...`);

        const response = await fetch(`${API_URL}/ai/generate-plan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ subjects: selectedSubjectNames, availableHours, examDate, academicLevel })
        });

        if (!response.ok) throw new Error('Failed to generate plan');

        const plan = await response.json();

        // Save tasks (sequentially to avoid overwhelming server)
        for (const item of plan) {
            // Find subject ID for the item
            const subject = subjects.find(s => s.name.toLowerCase() === item.subject.toLowerCase()) || subjects[0];

            const taskData = {
                subjectId: subject._id,
                title: `${item.topic} (${item.subject})`,
                date: item.date,
                duration: item.duration
            };

            await fetch(`${API_URL}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(taskData)
            });
        }

        closeAIPlanModal();
        alert(`Successfully created studying plan with ${plan.length} tasks!`);
        loadTodayTasks();
        loadAllTasks();

    } catch (error) {
        alert('Error generating plan: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Generate Plan';
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
