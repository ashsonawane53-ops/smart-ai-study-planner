// Tests JavaScript
// Tests JavaScript
// API_URL is defined in auth.js

let subjects = [];
let currentTest = null;
let currentQuestions = [];
let userAnswers = [];

// Initialize
async function init() {
  await protectPage();
  await loadSubjects();
  loadTestHistory();
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
  const select = document.getElementById('test-subject');
  const options = subjects.map(s =>
    `<option value="${s._id}">${s.name}</option>`
  ).join('');
  select.innerHTML = '<option value="">Select subject...</option>' + options;
}

// Load test history
async function loadTestHistory() {
  try {
    const response = await fetch(`${API_URL}/tests/history`, {
      credentials: 'include'
    });

    if (!response.ok) throw new Error('Failed to load test history');

    const tests = await response.json();
    displayTestHistory(tests);
  } catch (error) {
    console.error('Error loading test history:', error);
  }
}

// Display test history
function displayTestHistory(tests) {
  const container = document.getElementById('test-history');

  if (tests.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No tests taken yet</p></div>';
    return;
  }

  const html = `
    <table class="table">
      <thead>
        <tr>
          <th>Subject</th>
          <th>Title</th>
          <th>Score</th>
          <th>Percentage</th>
          <th>Date</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${tests.map(test => {
    const date = new Date(test.completedAt).toLocaleDateString();
    const percentage = Math.round((test.score / test.totalQuestions) * 100);
    const percentageColor = percentage >= 70 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444';
    return `
            <tr>
              <td><span class="subject-badge" style="background: ${test.subjectId.color}">${test.subjectId.name}</span></td>
              <td>${test.title}</td>
              <td>${test.score}/${test.totalQuestions}</td>
              <td style="color: ${percentageColor}; font-weight: 600;">${percentage}%</td>
              <td>${date}</td>
              <td><button class="btn btn-sm btn-secondary" onclick="viewTestResults('${test._id}')">View</button></td>
            </tr>
          `;
  }).join('')}
      </tbody>
    </table>
  `;

  container.innerHTML = html;
}

// Open create test modal
function openCreateTestModal() {
  if (subjects.length === 0) {
    alert('Please add subjects first!');
    window.location.href = 'subjects.html';
    return;
  }
  document.getElementById('create-test-modal').classList.add('active');
}

// Close create test modal
function closeCreateTestModal() {
  document.getElementById('create-test-modal').classList.remove('active');
}

// Handle create test form
document.getElementById('create-test-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const numQuestions = parseInt(document.getElementById('num-questions').value);
  currentQuestions = [];

  let html = '';
  for (let i = 0; i < numQuestions; i++) {
    html += `
      <div class="card mb-2">
        <h3>Question ${i + 1}</h3>
        <div class="form-group">
          <label>Question</label>
          <input type="text" class="form-control question-text" data-index="${i}" required>
        </div>
        <div class="form-group">
          <label>Option A</label>
          <input type="text" class="form-control option-input" data-index="${i}" data-option="0" required>
        </div>
        <div class="form-group">
          <label>Option B</label>
          <input type="text" class="form-control option-input" data-index="${i}" data-option="1" required>
        </div>
        <div class="form-group">
          <label>Option C</label>
          <input type="text" class="form-control option-input" data-index="${i}" data-option="2" required>
        </div>
        <div class="form-group">
          <label>Option D</label>
          <input type="text" class="form-control option-input" data-index="${i}" data-option="3" required>
        </div>
        <div class="form-group">
          <label>Correct Answer</label>
          <select class="form-control correct-answer" data-index="${i}" required>
            <option value="0">A</option>
            <option value="1">B</option>
            <option value="2">C</option>
            <option value="3">D</option>
          </select>
        </div>
      </div>
    `;
  }

  document.getElementById('questions-container').innerHTML = html;
  closeCreateTestModal();
  document.getElementById('questions-modal').classList.add('active');
});

// Close questions modal
function closeQuestionsModal() {
  document.getElementById('questions-modal').classList.remove('active');
}

// Save test
async function saveTest() {
  const subjectId = document.getElementById('test-subject').value;
  const title = document.getElementById('test-title').value;
  const numQuestions = parseInt(document.getElementById('num-questions').value);

  const questions = [];
  for (let i = 0; i < numQuestions; i++) {
    const questionText = document.querySelector(`.question-text[data-index="${i}"]`).value;
    const options = [
      document.querySelector(`.option-input[data-index="${i}"][data-option="0"]`).value,
      document.querySelector(`.option-input[data-index="${i}"][data-option="1"]`).value,
      document.querySelector(`.option-input[data-index="${i}"][data-option="2"]`).value,
      document.querySelector(`.option-input[data-index="${i}"][data-option="3"]`).value
    ];
    const correctAnswer = parseInt(document.querySelector(`.correct-answer[data-index="${i}"]`).value);

    questions.push({ question: questionText, options, correctAnswer });
  }

  try {
    const response = await fetch(`${API_URL}/tests/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ subjectId, title, questions })
    });

    if (!response.ok) throw new Error('Failed to create test');

    const test = await response.json();
    closeQuestionsModal();
    document.getElementById('create-test-form').reset();

    // Ask if user wants to take the test now
    if (confirm('Test created! Do you want to take it now?')) {
      takeTest(test);
    } else {
      loadTestHistory();
    }
  } catch (error) {
    alert('Error creating test: ' + error.message);
  }
}

// Take test
function takeTest(test) {
  currentTest = test;
  userAnswers = new Array(test.questions.length).fill(null);

  document.getElementById('test-title-display').textContent = test.title;

  const html = test.questions.map((q, index) => `
    <div class="card mb-2">
      <h3>Question ${index + 1}</h3>
      <p style="font-size: 16px; margin-bottom: 15px;">${q.question}</p>
      ${q.options.map((option, optIndex) => `
        <div class="mcq-option" onclick="selectAnswer(${index}, ${optIndex})">
          <input type="radio" name="q${index}" value="${optIndex}" style="margin-right: 10px;">
          ${String.fromCharCode(65 + optIndex)}. ${option}
        </div>
      `).join('')}
    </div>
  `).join('');

  document.getElementById('test-questions-container').innerHTML = html;
  document.getElementById('take-test-modal').classList.add('active');
}

// Select answer
function selectAnswer(questionIndex, optionIndex) {
  userAnswers[questionIndex] = optionIndex;

  // Update UI
  const options = document.querySelectorAll(`input[name="q${questionIndex}"]`);
  options.forEach((opt, idx) => {
    opt.parentElement.classList.remove('selected');
    if (idx === optionIndex) {
      opt.checked = true;
      opt.parentElement.classList.add('selected');
    }
  });
}

// Submit test
async function submitTest() {
  if (userAnswers.includes(null)) {
    if (!confirm('You have unanswered questions. Submit anyway?')) return;
  }

  try {
    const response = await fetch(`${API_URL}/tests/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ testId: currentTest._id, answers: userAnswers })
    });

    if (!response.ok) throw new Error('Failed to submit test');

    const result = await response.json();
    closeTakeTestModal();
    showResults(result);
    loadTestHistory();
  } catch (error) {
    alert('Error submitting test: ' + error.message);
  }
}

// Close take test modal
function closeTakeTestModal() {
  document.getElementById('take-test-modal').classList.remove('active');
}

// Show results
function showResults(result) {
  const percentage = result.percentage;
  const color = percentage >= 70 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444';

  let html = `
    <div class="text-center mb-3">
      <div style="font-size: 72px; font-weight: 700; color: ${color};">${percentage}%</div>
      <p style="font-size: 24px;">Score: ${result.score}/${result.totalQuestions}</p>
    </div>
  `;

  html += result.test.questions.map((q, index) => {
    const userAnswer = q.userAnswer;
    const correctAnswer = q.correctAnswer;
    const isCorrect = userAnswer === correctAnswer;

    return `
      <div class="card mb-2">
        <h3>Question ${index + 1} ${isCorrect ? '✅' : '❌'}</h3>
        <p style="font-size: 16px; margin-bottom: 15px;">${q.question}</p>
        ${q.options.map((option, optIndex) => {
      let className = 'mcq-option';
      if (optIndex === correctAnswer) className += ' correct';
      else if (optIndex === userAnswer && !isCorrect) className += ' incorrect';

      return `<div class="${className}">${String.fromCharCode(65 + optIndex)}. ${option}</div>`;
    }).join('')}
      </div>
    `;
  }).join('');

  document.getElementById('results-container').innerHTML = html;
  document.getElementById('results-modal').classList.add('active');
}

// View test results
async function viewTestResults(testId) {
  try {
    const response = await fetch(`${API_URL}/tests/history`, {
      credentials: 'include'
    });

    if (!response.ok) throw new Error('Failed to load test');

    const tests = await response.json();
    const test = tests.find(t => t._id === testId);

    if (test) {
      showResults({
        test,
        score: test.score,
        totalQuestions: test.totalQuestions,
        percentage: Math.round((test.score / test.totalQuestions) * 100)
      });
    }
  } catch (error) {
    alert('Error loading test: ' + error.message);
  }
}

// Close results modal
function closeResultsModal() {
  document.getElementById('results-modal').classList.remove('active');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
