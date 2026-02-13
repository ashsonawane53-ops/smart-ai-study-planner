// Subjects JavaScript
// Subjects JavaScript
// API_URL is defined in auth.js

let subjects = [];

// Initialize
async function init() {
    await protectPage();
    loadSubjects();
}

// Load all subjects
async function loadSubjects() {
    try {
        const response = await fetch(`${API_URL}/subjects`, {
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to load subjects');

        subjects = await response.json();
        displaySubjects();
    } catch (error) {
        console.error('Error loading subjects:', error);
        document.getElementById('subjects-container').innerHTML = `<div class="alert alert-error">Error loading subjects: ${error.message}</div>`;
    }
}

// Display subjects
function displaySubjects() {
    const container = document.getElementById('subjects-container');

    if (subjects.length === 0) {
        container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📚</div>
        <div class="empty-state-text">No subjects added yet</div>
        <button class="btn btn-primary" onclick="openAddModal()">Add Your First Subject</button>
      </div>
    `;
        return;
    }

    const html = subjects.map(subject => {
        const examDate = new Date(subject.examDate).toLocaleDateString();
        const daysUntilExam = Math.ceil((new Date(subject.examDate) - new Date()) / (1000 * 60 * 60 * 24));

        return `
      <div class="card">
        <div class="flex-between mb-2">
          <div>
            <h2 style="color: ${subject.color};">${subject.name}</h2>
            <p style="color: #6b7280;">Target: ${subject.dailyTargetHours} hours/day</p>
          </div>
          <div class="flex gap-1">
            <button class="btn btn-sm btn-secondary" onclick="editSubject('${subject._id}')">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteSubject('${subject._id}')">Delete</button>
          </div>
        </div>
        <div class="task-meta">
          📅 Exam Date: ${examDate} (${daysUntilExam} days remaining)
        </div>
      </div>
    `;
    }).join('');

    container.innerHTML = html;
}

// Open add modal
function openAddModal() {
    document.getElementById('modal-title').textContent = 'Add Subject';
    document.getElementById('subject-form').reset();
    document.getElementById('subject-id').value = '';
    document.getElementById('subject-modal').classList.add('active');
}

// Edit subject
function editSubject(id) {
    const subject = subjects.find(s => s._id === id);
    if (!subject) return;

    document.getElementById('modal-title').textContent = 'Edit Subject';
    document.getElementById('subject-id').value = subject._id;
    document.getElementById('subject-name').value = subject.name;
    document.getElementById('daily-target').value = subject.dailyTargetHours;
    document.getElementById('exam-date').value = subject.examDate.split('T')[0];
    document.getElementById('subject-color').value = subject.color;
    document.getElementById('subject-modal').classList.add('active');
}

// Close modal
function closeModal() {
    document.getElementById('subject-modal').classList.remove('active');
}

// Handle form submission
document.getElementById('subject-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('subject-id').value;
    const data = {
        name: document.getElementById('subject-name').value,
        dailyTargetHours: parseFloat(document.getElementById('daily-target').value),
        examDate: document.getElementById('exam-date').value,
        color: document.getElementById('subject-color').value
    };

    try {
        const url = id ? `${API_URL}/subjects/${id}` : `${API_URL}/subjects`;
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error('Failed to save subject');

        closeModal();
        loadSubjects();
    } catch (error) {
        alert('Error saving subject: ' + error.message);
    }
});

// Delete subject
async function deleteSubject(id) {
    if (!confirm('Are you sure you want to delete this subject?')) return;

    try {
        const response = await fetch(`${API_URL}/subjects/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to delete subject');

        loadSubjects();
    } catch (error) {
        alert('Error deleting subject: ' + error.message);
    }
}

// Get AI suggestions
async function getAISuggestions() {
    try {
        const response = await fetch(`${API_URL}/subjects/ai-suggestions`, {
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to get suggestions');

        const data = await response.json();
        displayAISuggestions(data.suggestions);
    } catch (error) {
        alert('Error getting AI suggestions: ' + error.message);
    }
}

// Display AI suggestions
function displayAISuggestions(suggestions) {
    const container = document.getElementById('ai-suggestions-container');

    if (!suggestions || suggestions.length === 0) {
        container.innerHTML = '<p>Add subjects first to get AI suggestions!</p>';
    } else {
        const html = suggestions.map(s => `
      <div class="card">
        <h3>${s.subjectName}</h3>
        <p><strong>Days until exam:</strong> ${s.daysUntilExam}</p>
        <p><strong>Current target:</strong> ${s.currentTarget} hours/day</p>
        <p><strong>Recommended:</strong> ${s.recommendedHours} hours/day</p>
        <div class="alert alert-info mt-1">${s.suggestion}</div>
      </div>
    `).join('');

        container.innerHTML = html;
    }

    document.getElementById('ai-modal').classList.add('active');
}

// Close AI modal
function closeAIModal() {
    document.getElementById('ai-modal').classList.remove('active');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
