// RCF Church Q&A Platform - Complete JavaScript

let questions = [];
let currentFilter = '';
let currentSearch = '';
let displayedQuestions = 6;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadQuestionsFromStorage();
    updateStats();
    displayRecentQuestions();

    // Setup form submission
    document.getElementById('question-form').addEventListener('submit', handleQuestionSubmit);

    // Setup search input
    document.getElementById('search-input').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            searchQuestions();
        }
    });
});

// Tab switching functionality
function switchTab(tabName) {
    // Remove active class from all interfaces and buttons
    document.querySelectorAll('.interface').forEach(interface => {
        interface.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Add active class to selected interface and button
    const interfaceMap = {
        'home': 'home-interface',
        'ask': 'ask-interface',
        'questions': 'questions-interface',
        'about': 'about-interface'
    };

    document.getElementById(interfaceMap[tabName]).classList.add('active');

    // Find and activate the corresponding tab button
    const buttons = document.querySelectorAll('.tab-btn');
    const tabIndices = ['home', 'ask', 'questions', 'about'];
    const tabIndex = tabIndices.indexOf(tabName);
    if (tabIndex !== -1 && buttons[tabIndex]) {
        buttons[tabIndex].classList.add('active');
    }

    // Refresh displays when switching to relevant tabs
    if (tabName === 'home') {
        displayRecentQuestions();
    } else if (tabName === 'questions') {
        displayAllQuestions();
    }
}

// Handle question form submission
function handleQuestionSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const question = {
        id: generateQuestionId(),
        title: formData.get('questionTitle'),
        details: formData.get('questionDetails'),
        name: formData.get('askerName'),
        email: formData.get('askerEmail'),
        category: formData.get('category'),
        isAnonymous: formData.get('isAnonymous') === 'on',
        date: new Date().toISOString(),
        status: 'pending',
        answer: null,
        answeredDate: null,
        answeredBy: null
    };

    // Add the question to the array
    questions.unshift(question);

    // Save to local storage
    saveQuestionsToStorage();

    // Update stats
    updateStats();

    // Show success message
    alert('Thank you for your question! We will review it and provide an answer soon.');

    // Clear the form
    e.target.reset();

    // Switch to home tab to show recent questions
    switchTab('home');
}

// Generate unique question ID
function generateQuestionId() {
    return 'Q-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Display recent questions on home page
function displayRecentQuestions() {
    const container = document.getElementById('recent-questions');
    const recentQuestions = questions.slice(0, 6);

    if (recentQuestions.length === 0) {
        container.innerHTML = `
            <div class="no-questions">
                <p>No questions yet. Be the first to ask!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = recentQuestions.map(question => createQuestionCard(question)).join('');
}

// Display all questions in browse section
function displayAllQuestions() {
    const container = document.getElementById('questions-list');
    let filteredQuestions = filterQuestions();

    if (filteredQuestions.length === 0) {
        container.innerHTML = `
            <div class="no-questions">
                <p>No questions found. Try adjusting your search or filters.</p>
            </div>
        `;
        document.getElementById('load-more-btn').style.display = 'none';
        return;
    }

    // Show initial set of questions
    displayedQuestions = Math.min(6, filteredQuestions.length);
    container.innerHTML = filteredQuestions.slice(0, displayedQuestions).map(question => createQuestionCard(question)).join('');

    // Show/hide load more button
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (filteredQuestions.length > displayedQuestions) {
        loadMoreBtn.style.display = 'block';
    } else {
        loadMoreBtn.style.display = 'none';
    }
}

// Create HTML for a question card
function createQuestionCard(question) {
    const displayName = question.isAnonymous ? 'Anonymous' : question.name;
    const categoryLabel = getCategoryLabel(question.category);
    const statusBadge = question.answer ?
        '<span class="answered-badge">Answered</span>' :
        '<span class="pending-badge">Pending</span>';

    const excerpt = question.details.length > 100 ?
        question.details.substring(0, 100) + '...' :
        question.details;

    return `
        <div class="question-card" onclick="viewQuestion('${question.id}')">
            <h3 class="question-title">${escapeHtml(question.title)}</h3>
            <div class="question-meta">
                <span>${escapeHtml(displayName)}</span>
                <span>${statusBadge}</span>
            </div>
            <div class="question-meta">
                <span class="category-tag">${categoryLabel}</span>
                <span>${formatDate(question.date)}</span>
            </div>
            <p class="question-excerpt">${escapeHtml(excerpt)}</p>
        </div>
    `;
}

// View individual question details
function viewQuestion(questionId) {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const displayName = question.isAnonymous ? 'Anonymous' : question.name;
    const categoryLabel = getCategoryLabel(question.category);

    let answerSection = '';
    if (question.answer) {
        answerSection = `
            <div class="answer-section">
                <h3>Answer:</h3>
                <div class="answer-content">
                    <p>${escapeHtml(question.answer)}</p>
                    <div class="answer-meta">
                        <p><strong>Answered by:</strong> ${escapeHtml(question.answeredBy)}</p>
                        <p><strong>Answered on:</strong> ${formatDate(question.answeredDate)}</p>
                    </div>
                </div>
            </div>
        `;
    } else {
        answerSection = `
            <div class="pending-section">
                <p><em>This question is currently pending review. We'll provide an answer soon.</em></p>
            </div>
        `;
    }

    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <div class="question-detail">
            <h2>${escapeHtml(question.title)}</h2>
            <div class="question-meta-detail">
                <span class="category-tag">${categoryLabel}</span>
                <span>Asked by: ${escapeHtml(displayName)}</span>
                <span>Date: ${formatDate(question.date)}</span>
            </div>
            <div class="question-content">
                <h3>Question Details:</h3>
                <p>${escapeHtml(question.details)}</p>
            </div>
            ${answerSection}
            <div class="question-actions">
                <button onclick="closeModal()" class="secondary-btn">Close</button>
                ${!question.answer ? `<button onclick="contactAboutQuestion('${question.id}')" class="primary-btn">Follow Up</button>` : ''}
            </div>
        </div>
    `;

    document.getElementById('question-modal').style.display = 'block';
}

// Close modal
function closeModal() {
    document.getElementById('question-modal').style.display = 'none';
}

// Search questions
function searchQuestions() {
    currentSearch = document.getElementById('search-input').value.toLowerCase();
    displayAllQuestions();
}

// Filter by category
function filterByCategory() {
    currentFilter = document.getElementById('category-filter').value;
    displayAllQuestions();
}

// Filter questions based on search and category
function filterQuestions() {
    let filtered = questions;

    // Apply category filter
    if (currentFilter) {
        filtered = filtered.filter(q => q.category === currentFilter);
    }

    // Apply search filter
    if (currentSearch) {
        filtered = filtered.filter(q =>
            q.title.toLowerCase().includes(currentSearch) ||
            q.details.toLowerCase().includes(currentSearch) ||
            (q.answer && q.answer.toLowerCase().includes(currentSearch))
        );
    }

    return filtered;
}

// Load more questions
function loadMoreQuestions() {
    displayedQuestions += 6;
    const container = document.getElementById('questions-list');
    let filteredQuestions = filterQuestions();

    // Add more questions to existing content
    const newQuestions = filteredQuestions.slice(displayedQuestions - 6, displayedQuestions)
        .map(question => createQuestionCard(question))
        .join('');

    container.innerHTML = container.innerHTML + newQuestions;

    // Hide load more button if all questions are displayed
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (filteredQuestions.length <= displayedQuestions) {
        loadMoreBtn.style.display = 'none';
    }
}

// Clear form
function clearForm() {
    document.getElementById('question-form').reset();
}

// Contact about question (for follow-ups)
function contactAboutQuestion(questionId) {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const subject = `Follow-up: ${question.title}`;
    const body = `I'm following up on my question: "${question.title}"\n\nQuestion ID: ${question.id}\n\nThank you for your assistance.`;

    window.location.href = `mailto:questions@rcf-church.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// Get category label
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

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Update statistics
function updateStats() {
    document.getElementById('total-questions').textContent = questions.length;
    document.getElementById('total-answered').textContent = questions.filter(q => q.answer).length;
}

// Local Storage Functions
function saveQuestionsToStorage() {
    localStorage.setItem('rcf-qa-questions', JSON.stringify(questions));
}

function loadQuestionsFromStorage() {
    const stored = localStorage.getItem('rcf-qa-questions');
    if (stored) {
        questions = JSON.parse(stored);
    } else {
        // Sample questions for demonstration
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
                status: 'answered',
                answer: 'We\'re excited you want to get involved! Start by attending our "Discover Your Gifts" workshop on the first Sunday of each month. Current ministry opportunities include: Children\'s Ministry, Worship Team, Hospitality Team, Small Group Leaders, and Community Outreach. Please stop by the Connect Center this Sunday after service.',
                answeredDate: new Date('2025-11-04').toISOString(),
                answeredBy: 'Pastor Femi'
            },
            {
                id: 'Q-SAMPLE-3',
                title: 'Understanding the Trinity',
                details: 'I struggle with understanding how God can be three persons in one. Can you help explain this concept?',
                name: 'David Martinez',
                email: 'david.martinez@email.com',
                category: 'doctrine',
                isAnonymous: false,
                date: new Date('2025-11-04').toISOString(),
                status: 'pending',
                answer: null,
                answeredDate: null,
                answeredBy: null
            }
        ];
    }
}

// Modal click outside to close
window.onclick = function(event) {
    const modal = document.getElementById('question-modal');
    if (event.target === modal) {
        closeModal();
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape to close modal
    if (e.key === 'Escape') {
        closeModal();
    }

    // Ctrl+K to focus search (when on questions tab)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (document.getElementById('questions-interface').classList.contains('active')) {
            document.getElementById('search-input').focus();
        }
    }
});