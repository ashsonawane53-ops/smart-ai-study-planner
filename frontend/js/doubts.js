// Doubts JavaScript
// Doubts JavaScript
// API_URL is defined in auth.js

let subjects = [];

// Initialize
async function init() {
  await protectPage();
  await loadSubjects();
  loadDoubtHistory();
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
  const select = document.getElementById('doubt-subject');
  const options = subjects.map(s =>
    `<option value="${s._id}">${s.name}</option>`
  ).join('');
  select.innerHTML = '<option value="">General / Not specific to a subject</option>' + options;
}

// Handle doubt form submission
document.getElementById('doubt-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const question = document.getElementById('doubt-question').value;
  const subjectId = document.getElementById('doubt-subject').value || null;

  // Show loading
  const responseSection = document.getElementById('ai-response-section');
  const responseContent = document.getElementById('ai-response-content');
  responseSection.classList.remove('hidden');
  responseContent.innerHTML = '<div class="spinner"></div>';

  try {
    const response = await fetch(`${API_URL}/doubts/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ question, subjectId })
    });

    if (!response.ok) throw new Error('Failed to get AI response');

    const doubt = await response.json();
    displayAIResponse(doubt);

    // Clear form and reload history
    document.getElementById('doubt-form').reset();
    loadDoubtHistory();
  } catch (error) {
    responseContent.innerHTML = `<div class="alert alert-error">Error: ${error.message}</div>`;
  }
});

// Display AI response
function displayAIResponse(doubt) {
  const responseContent = document.getElementById('ai-response-content');

  const html = `
    <div class="doubt-item">
      <div class="doubt-question">
        ❓ ${doubt.question}
      </div>
      <div class="doubt-answer">
        🤖 ${doubt.aiResponse}
      </div>
      <div class="mt-2">
        <p style="color: #6b7280; font-size: 14px;">Was this helpful?</p>
        <div class="flex gap-1">
          <button class="btn btn-sm btn-success" onclick="markHelpful('${doubt._id}', true)">👍 Yes</button>
          <button class="btn btn-sm btn-secondary" onclick="markHelpful('${doubt._id}', false)">👎 No</button>
        </div>
      </div>
    </div>
  `;

  responseContent.innerHTML = html;

  // Scroll to response
  document.getElementById('ai-response-section').scrollIntoView({ behavior: 'smooth' });
}

// Mark doubt as helpful/not helpful
async function markHelpful(doubtId, helpful) {
  try {
    await fetch(`${API_URL}/doubts/${doubtId}/feedback`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ helpful })
    });

    alert(helpful ? 'Thanks for your feedback! 😊' : 'Sorry it wasn\'t helpful. Try rephrasing your question! 🤔');
  } catch (error) {
    console.error('Error submitting feedback:', error);
  }
}

// Load doubt history
async function loadDoubtHistory() {
  try {
    const response = await fetch(`${API_URL}/doubts/history`, {
      credentials: 'include'
    });

    if (!response.ok) throw new Error('Failed to load doubt history');

    const doubts = await response.json();
    displayDoubtHistory(doubts);
  } catch (error) {
    console.error('Error loading doubt history:', error);
  }
}

// Display doubt history
function displayDoubtHistory(doubts) {
  const container = document.getElementById('doubt-history');

  if (doubts.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No doubts asked yet</p></div>';
    return;
  }

  const html = doubts.map(doubt => {
    const date = new Date(doubt.createdAt).toLocaleDateString();
    const time = new Date(doubt.createdAt).toLocaleTimeString();

    return `
      <div class="doubt-item">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <div>
            ${doubt.subjectId ? `<span class="subject-badge" style="background: ${doubt.subjectId.color}">${doubt.subjectId.name}</span>` : ''}
          </div>
          <div style="color: #6b7280; font-size: 14px;">${date} ${time}</div>
        </div>
        <div class="doubt-question">
          ❓ ${doubt.question}
        </div>
        <div class="doubt-answer">
          🤖 ${doubt.aiResponse}
        </div>
        ${doubt.helpful !== null ? `
          <div class="mt-1" style="color: #6b7280; font-size: 14px;">
            ${doubt.helpful ? '👍 Marked as helpful' : '👎 Marked as not helpful'}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  container.innerHTML = html;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
