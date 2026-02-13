// Revisions JavaScript
// Revisions JavaScript
// API_URL is defined in auth.js

let subjects = [];

// Initialize
async function init() {
    await protectPage();
    await loadSubjects();
    loadPendingRevisions();
    loadAllRevisions();

    // Set today's date as default
    document.getElementById('study-date').valueAsDate = new Date();
}

// Load subjects
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
    const select = document.getElementById('revision-subject');
    const options = subjects.map(s =>
        `<option value="${s._id}">${s.name}</option>`
    ).join('');
    select.innerHTML = '<option value="">Select subject...</option>' + options;
}

// Load pending revisions
async function loadPendingRevisions() {
    try {
        const response = await fetch(`${API_URL}/revisions/pending`, {
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to load pending revisions');

        const revisions = await response.json();
        displayPendingRevisions(revisions);
    } catch (error) {
        console.error('Error loading pending revisions:', error);
    }
}

// Display pending revisions
function displayPendingRevisions(revisions) {
    const container = document.getElementById('pending-revisions');

    if (revisions.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No pending revisions! 🎉</p></div>';
        return;
    }

    const html = revisions.map(revision => {
        const dueDate = new Date(revision.nextRevisionDate).toLocaleDateString();
        const isOverdue = new Date(revision.nextRevisionDate) < new Date();

        return `
      <div class="task-item" style="${isOverdue ? 'border-color: #ef4444; border-width: 3px;' : ''}">
        <div class="task-content">
          <div class="task-title">
            <span class="subject-badge" style="background: ${revision.subjectId.color}">${revision.subjectId.name}</span>
            ${revision.topic}
            ${revision.revisionCount > 0 ? `<span style="color: #6b7280; font-size: 14px;">(Revision #${revision.revisionCount + 1})</span>` : ''}
          </div>
          <div class="task-meta">
            ${isOverdue ? '⚠️ Overdue' : '📅 Due'}: ${dueDate}
          </div>
        </div>
        <button class="btn btn-sm btn-success" onclick="completeRevision('${revision._id}')">✓ Complete</button>
      </div>
    `;
    }).join('');

    container.innerHTML = html;
}

// Load all revisions
async function loadAllRevisions() {
    try {
        const response = await fetch(`${API_URL}/revisions/all`, {
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to load revisions');

        const revisions = await response.json();
        displayAllRevisions(revisions);
    } catch (error) {
        console.error('Error loading all revisions:', error);
    }
}

// Display all revisions
function displayAllRevisions(revisions) {
    const container = document.getElementById('all-revisions');

    if (revisions.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No topics added for revision yet</p></div>';
        return;
    }

    const html = `
    <table class="table">
      <thead>
        <tr>
          <th>Subject</th>
          <th>Topic</th>
          <th>Study Date</th>
          <th>Next Revision</th>
          <th>Status</th>
          <th>Revision #</th>
        </tr>
      </thead>
      <tbody>
        ${revisions.map(revision => {
        const studyDate = new Date(revision.studyDate).toLocaleDateString();
        const nextDate = new Date(revision.nextRevisionDate).toLocaleDateString();
        const status = revision.completed ? '✅ Completed' : '⏳ Pending';
        const statusColor = revision.completed ? '#10b981' : '#f59e0b';

        return `
            <tr>
              <td><span class="subject-badge" style="background: ${revision.subjectId.color}">${revision.subjectId.name}</span></td>
              <td>${revision.topic}</td>
              <td>${studyDate}</td>
              <td>${nextDate}</td>
              <td style="color: ${statusColor}; font-weight: 600;">${status}</td>
              <td>${revision.revisionCount + 1}</td>
            </tr>
          `;
    }).join('')}
      </tbody>
    </table>
  `;

    container.innerHTML = html;
}

// Open add revision modal
function openAddRevisionModal() {
    if (subjects.length === 0) {
        alert('Please add subjects first!');
        window.location.href = 'subjects.html';
        return;
    }
    document.getElementById('revision-modal').classList.add('active');
}

// Close revision modal
function closeRevisionModal() {
    document.getElementById('revision-modal').classList.remove('active');
}

// Handle revision form submission
document.getElementById('revision-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        subjectId: document.getElementById('revision-subject').value,
        topic: document.getElementById('revision-topic').value,
        studyDate: document.getElementById('study-date').value
    };

    try {
        const response = await fetch(`${API_URL}/revisions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error('Failed to add revision');

        closeRevisionModal();
        document.getElementById('revision-form').reset();
        document.getElementById('study-date').valueAsDate = new Date();
        loadPendingRevisions();
        loadAllRevisions();
    } catch (error) {
        alert('Error adding revision: ' + error.message);
    }
});

// Complete revision
async function completeRevision(id) {
    try {
        const response = await fetch(`${API_URL}/revisions/${id}/complete`, {
            method: 'PUT',
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to complete revision');

        const data = await response.json();
        alert(`✅ Revision completed! Next revision scheduled for ${new Date(data.nextRevision.nextRevisionDate).toLocaleDateString()}`);

        loadPendingRevisions();
        loadAllRevisions();
    } catch (error) {
        alert('Error completing revision: ' + error.message);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
