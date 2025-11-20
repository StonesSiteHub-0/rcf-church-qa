// RCF Q&A Admin Panel JavaScript

// Configuration
const ADMIN_PASSWORD = 'rcfadmin123'; // Change this to your desired password
let questions = [];
let currentFilter = '';
let currentSearch = '';
let displayedQuestions = 10;
let currentQuestionId = null;

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    setupEventListeners();
});

// Authentication
function checkAuth() {
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated');
    if (isAuthenticated === 'true') {
        showAdminDashboard();
    } else {
        showLoginScreen();
    }
}

function showLoginScreen() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('admin-dashboard').style.display = 'none';
}

function showAdminDashboard() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
    loadQuestions();
    updateStats();
}

function logout() {
    sessionStorage.removeItem('adminAuthenticated');
    showLoginScreen();
}

// Event Listeners
function setupEventListeners() {
    // Login form
    document.getElementById('login-form').addEventListener('submit', handleLogin);

    // Answer form
    document.getElementById('answer-form').addEventListener('submit', handleAnswerSubmit);

    // Edit form
    document.getElementById('edit-form').addEventListener('submit', handleEditSubmit);

    // Search
    document.getElementById('admin-search').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            searchAdminQuestions();
        }
    });
}

// Login Handler
function handleLogin(e) {
    e.preventDefault();
    const password = document.getElementById('admin-password').value;

    if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem('adminAuthenticated', 'true');
        showAdminDashboard();
        document.getElementById('admin-password').value = '';
    } else {
        alert('Incorrect password. Please try again.');
        document.getElementById('admin-password').value = '';
    }
}

// Load Questions from Main Site
function loadQuestions() {
    // Load from localStorage (same storage as main site)
    const stored = localStorage.getItem('rcf-qa-questions');
    if (stored) {
        questions = JSON.parse(stored);
    } else {
        // Initialize with sample questions if none exist
        questions = [
            {
                id: 'Q-SAMPLE-1',
                title: 'What does the Bible say about prayer?',
                details: 'I want to understand the biblical foundation for prayer and how I can improve my prayer life.',
                name: 'Sarah Johnson',
                email: 'sarah.johnson@email.com',
                category: 'prayer',
                isAnonymous: false,
                date: new Date('2025-11-04').toISOString(),
                status: 'answered',
                answer: 'The Bible teaches that prayer is communication with God. Key verses include Philippians 4:6 ("Do not be anxious about anything, but in everything by prayer and petition, with thanksgiving, present your requests to God.") and 1 Thessalonians 5:17 ("Pray continually"). Prayer should be honest, persistent, and aligned with God\'s will.',
                answeredDate: new Date('2025-11-04').toISOString(),
                answeredBy: 'Pastor Femi'
            },
            {
                id: 'Q-SAMPLE-2',
                title: 'How can I get more involved in church ministry?',
                details: 'I\'ve been attending for a few months and want to serve more. What opportunities are available?',
                name: 'Anonymous',
                email: 'anonymous@email.com',
                category: 'church-life',
                isAnonymous: true,
                date: new Date('2025-11-04').toISOString(),
                status: 'pending',
                answer: null,
                answeredDate: null,
                answeredBy: null
            }
        ];
    }

    displayQuestions();
}

// Display Questions
function displayQuestions() {
    const container = document.getElementById('admin-questions-list');
    let filteredQuestions = filterQuestions();

    if (filteredQuestions.length === 0) {
        container.innerHTML = `
            <div class="no-questions">
                <p>No questions found. Questions submitted by users will appear here.</p>
            </div>
        `;
        document.getElementById('load-more-admin').style.display = 'none';
        return;
    }

    displayedQuestions = Math.min(10, filteredQuestions.length);
    container.innerHTML = filteredQuestions.slice(0, displayedQuestions).map(question => createQuestionCard(question)).join('');

    // Show/hide load more button
    const loadMoreBtn = document.getElementById('load-more-admin');
    if (filteredQuestions.length > displayedQuestions) {
        loadMoreBtn.style.display = 'block';
    } else {
        loadMoreBtn.style.display = 'none';
    }
}

// Create Question Card HTML
function createQuestionCard(question) {
    const displayName = question.isAnonymous ? 'Anonymous' : question.name;
    const categoryLabel = getCategoryLabel(question.category);
    const statusBadge = question.answer ?
        '<span class="status-badge answered">Answered</span>' :
        '<span class="status-badge pending">Pending</span>';

    const answerSection = question.answer ? `
        <div class="answer-section">
            <div class="answer-header">Answer:</div>
            <div class="answer-text">${escapeHtml(question.answer)}</div>
            <div class="answer-meta">
                <strong>Answered by:</strong> ${escapeHtml(question.answeredBy)} •
                <strong>Date:</strong> ${formatDate(question.answeredDate)}
            </div>
        </div>
    ` : '';

    return `
        <div class="admin-question-item">
            <div class="question-header">
                <h3 class="question-title">${escapeHtml(question.title)}</h3>
                <div class="question-actions">
                    ${!question.answer ? `<button class="action-btn answer-btn" onclick="answerQuestion('${question.id}')">Answer</button>` : ''}
                    <button class="action-btn edit-btn" onclick="editQuestion('${question.id}')">Edit</button>
                    <button class="action-btn view-btn" onclick="viewQuestion('${question.id}')">View</button>
                    <button class="action-btn delete-btn" onclick="deleteQuestion('${question.id}')">Delete</button>
                </div>
            </div>

            <div class="question-meta">
                <div class="meta-item">
                    <strong>From:</strong> ${escapeHtml(displayName)}
                </div>
                <div class="meta-item">
                    <strong>Date:</strong> ${formatDate(question.date)}
                </div>
                <div class="meta-item">
                    <span class="category-tag">${categoryLabel}</span>
                </div>
                <div class="meta-item">
                    ${statusBadge}
                </div>
            </div>

            <div class="question-content">
                <p class="question-text">${escapeHtml(question.details)}</p>
                ${answerSection}
            </div>
        </div>
    `;
}

// Question Actions
function answerQuestion(questionId) {
    currentQuestionId = questionId;
    const question = questions.find(q => q.id === questionId);

    if (!question) return;

    document.getElementById('modal-question-title').textContent = question.title;
    document.getElementById('modal-asker-name').textContent = `From: ${question.isAnonymous ? 'Anonymous' : question.name}`;
    document.getElementById('modal-question-date').textContent = `Date: ${formatDate(question.date)}`;
    document.getElementById('modal-question-category').textContent = getCategoryLabel(question.category);
    document.getElementById('modal-question-details').textContent = question.details;
    document.getElementById('answer-text').value = question.answer || '';

    document.getElementById('answer-modal').style.display = 'block';
}

function editQuestion(questionId) {
    currentQuestionId = questionId;
    const question = questions.find(q => q.id === questionId);

    if (!question) return;

    document.getElementById('edit-title').value = question.title;
    document.getElementById('edit-details').value = question.details;
    document.getElementById('edit-category').value = question.category;

    document.getElementById('edit-modal').style.display = 'block';
}

function viewQuestion(questionId) {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    let answerText = question.answer ?
        `Answer: ${question.answer}\n\nAnswered by: ${question.answeredBy}\nAnswered on: ${formatDate(question.answeredDate)}` :
        'This question has not been answered yet.';

    alert(`Question: ${question.title}\n\nFrom: ${question.isAnonymous ? 'Anonymous' : question.name}\nDate: ${formatDate(question.date)}\nCategory: ${getCategoryLabel(question.category)}\n\nDetails: ${question.details}\n\n${answerText}`);
}

function deleteQuestion(questionId) {
    if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
        return;
    }

    questions = questions.filter(q => q.id !== questionId);
    saveQuestions();
    displayQuestions();
    updateStats();
    alert('Question deleted successfully.');
}

// Form Handlers
function handleAnswerSubmit(e) {
    e.preventDefault();

    const question = questions.find(q => q.id === currentQuestionId);
    if (!question) return;

    const answerText = document.getElementById('answer-text').value.trim();
    const answererName = document.getElementById('answerer-name').value.trim();

    if (!answerText) {
        alert('Please provide an answer.');
        return;
    }

    // Update question with answer
    question.answer = answerText;
    question.answeredBy = answererName;
    question.answeredDate = new Date().toISOString();
    question.status = 'answered';

    saveQuestions();
    displayQuestions();
    updateStats();
    closeAnswerModal();

    alert('Answer submitted successfully!');
}

function handleEditSubmit(e) {
    e.preventDefault();

    const question = questions.find(q => q.id === currentQuestionId);
    if (!question) return;

    const title = document.getElementById('edit-title').value.trim();
    const details = document.getElementById('edit-details').value.trim();
    const category = document.getElementById('edit-category').value;

    if (!title || !details) {
        alert('Please fill in all required fields.');
        return;
    }

    // Update question
    question.title = title;
    question.details = details;
    question.category = category;

    saveQuestions();
    displayQuestions();
    closeEditModal();

    alert('Question updated successfully!');
}

// Modal Functions
function closeAnswerModal() {
    document.getElementById('answer-modal').style.display = 'none';
    document.getElementById('answer-form').reset();
    currentQuestionId = null;
}

function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
    document.getElementById('edit-form').reset();
    currentQuestionId = null;
}

// Search and Filter
function searchAdminQuestions() {
    currentSearch = document.getElementById('admin-search').value.toLowerCase();
    displayQuestions();
}

function filterAdminQuestions() {
    currentFilter = document.getElementById('status-filter').value;
    const categoryFilter = document.getElementById('category-filter-admin').value;

    // Combine filters
    if (currentFilter === '' && categoryFilter === '') {
        currentFilter = '';
    } else if (currentFilter !== '') {
        currentFilter = currentFilter;
    } else {
        currentFilter = 'category:' + categoryFilter;
    }

    displayQuestions();
}

// Filter Questions
function filterQuestions() {
    let filtered = questions;

    // Apply search filter
    if (currentSearch) {
        filtered = filtered.filter(q =>
            q.title.toLowerCase().includes(currentSearch) ||
            q.details.toLowerCase().includes(currentSearch) ||
            (q.answer && q.answer.toLowerCase().includes(currentSearch))
        );
    }

    // Apply status/category filter
    if (currentFilter) {
        if (currentFilter.startsWith('category:')) {
            const category = currentFilter.replace('category:', '');
            filtered = filtered.filter(q => q.category === category);
        } else {
            filtered = filtered.filter(q => q.status === currentFilter);
        }
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    return filtered;
}

// Load More Questions
function loadMoreAdminQuestions() {
    displayedQuestions += 10;
    const container = document.getElementById('admin-questions-list');
    let filteredQuestions = filterQuestions();

    // Add more questions to existing content
    const newQuestions = filteredQuestions.slice(displayedQuestions - 10, displayedQuestions)
        .map(question => createQuestionCard(question))
        .join('');

    container.innerHTML = container.innerHTML + newQuestions;

    // Hide load more button if all questions are displayed
    const loadMoreBtn = document.getElementById('load-more-admin');
    if (filteredQuestions.length <= displayedQuestions) {
        loadMoreBtn.style.display = 'none';
    }
}

// Update Statistics
function updateStats() {
    document.getElementById('total-questions-admin').textContent = questions.length;
    document.getElementById('pending-questions-admin').textContent = questions.filter(q => !q.answer).length;
    document.getElementById('answered-questions-admin').textContent = questions.filter(q => q.answer).length;
}

// Save Questions to Storage
function saveQuestions() {
    localStorage.setItem('rcf-qa-questions', JSON.stringify(questions));
}

// Utility Functions
function getCategoryLabel(category) {
    const labels = {
        'bible-study': 'Bible Study',
        'doctrine': 'Christian Doctrine',
        'prayer': 'Prayer & Spiritual Life',
        'church-life': 'Church Life & Community',
        'faith-doubts': 'Faith & Doubts',
        'christian-living': 'Christian Living',
        'other': 'Other'
    };
    return labels[category] || category;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Modal click outside to close
window.onclick = function(event) {
    const answerModal = document.getElementById('answer-modal');
    const editModal = document.getElementById('edit-modal');

    if (event.target === answerModal) {
        closeAnswerModal();
    }
    if (event.target === editModal) {
        closeEditModal();
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape to close modals
    if (e.key === 'Escape') {
        closeAnswerModal();
        closeEditModal();
    }

    // Ctrl+K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('admin-search').focus();
    }
});