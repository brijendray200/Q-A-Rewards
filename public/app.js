let currentUser = null;
let currentQuestionId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
});

// API Helper
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (currentUser) {
        options.headers['x-user-id'] = currentUser._id;
    }

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`/api${endpoint}`, options);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Load users for login
async function loadUsers() {
    try {
        const users = await apiCall('/leaderboard/top-users?limit=100');
        const select = document.getElementById('userSelect');
        select.innerHTML = '<option value="">Select a user</option>';
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user._id;
            option.textContent = `${user.username} (${user.points} points)`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Login
async function login() {
    const userId = document.getElementById('userSelect').value;
    if (!userId) {
        alert('Please select a user');
        return;
    }

    try {
        const user = await apiCall(`/rewards/profile/${userId}`);
        currentUser = user;
        document.getElementById('loginSection').classList.add('hidden');
        document.getElementById('dashboardSection').classList.remove('hidden');
        document.getElementById('userPoints').textContent = `${user.points} Points`;
        loadDashboard();
    } catch (error) {
        alert('Login failed');
    }
}

// Load Dashboard
async function loadDashboard() {
    try {
        const stats = await apiCall(`/leaderboard/user/${currentUser._id}/stats`);
        document.getElementById('totalPoints').textContent = stats.user.points;
        document.getElementById('totalAnswers').textContent = stats.stats.totalAnswers;
        document.getElementById('totalUpvotes').textContent = stats.stats.totalUpvotes;
        document.getElementById('totalBadges').textContent = stats.user.badges.length;

        // Display badges
        const badgesContainer = document.getElementById('badgesContainer');
        if (stats.user.badges && stats.user.badges.length > 0) {
            badgesContainer.innerHTML = '<h3>Your Badges</h3><div class="badge-container">';
            stats.user.badges.forEach(badge => {
                badgesContainer.innerHTML += `
                    <div class="badge">
                        <div class="badge-icon">🏅</div>
                        <strong>${badge.name}</strong>
                    </div>
                `;
            });
            badgesContainer.innerHTML += '</div>';
        } else {
            badgesContainer.innerHTML = '<p style="color: #666;">No badges yet. Keep answering questions!</p>';
        }

        // Load questions by default
        loadQuestions();
    } catch (error) {
        console.error('Error loading dashboard:', error);
        alert('Error loading dashboard: ' + error.message);
    }
}

// Show Section
function showSection(section) {
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    document.getElementById(`${section}Section`).classList.remove('hidden');
    
    if (section === 'questions') loadQuestions();
    if (section === 'leaderboard') loadLeaderboard();
    if (section === 'dashboard') loadDashboard();
}

// Load Questions
async function loadQuestions() {
    try {
        const questions = await apiCall('/questions');
        const container = document.getElementById('questionsList');
        
        if (!questions || questions.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666;">No questions yet. Be the first to ask!</p>';
            return;
        }
        
        container.innerHTML = '';
        questions.forEach(q => {
            const tagsHtml = q.tags && q.tags.length > 0 
                ? q.tags.map(tag => `<span class="tag">${tag}</span>`).join('') 
                : '';
            
            container.innerHTML += `
                <div class="question-card">
                    <h3>${q.title || 'Untitled'}</h3>
                    <p>${q.content || ''}</p>
                    <div class="tags">${tagsHtml}</div>
                    <div class="question-meta">
                        <span>👁️ ${q.views || 0} views</span>
                        <span>💬 ${q.answers?.length || 0} answers</span>
                        <span>By ${q.userId?.username || 'Unknown'}</span>
                    </div>
                    <button class="btn btn-primary" onclick="viewQuestionDetails('${q._id}')">View Details</button>
                    <button class="btn btn-primary" onclick="openAnswerModal('${q._id}')" style="margin-left: 0.5rem;">Answer (+5 Points)</button>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error loading questions:', error);
        document.getElementById('questionsList').innerHTML = '<p style="color: red;">Error loading questions</p>';
    }
}

// Create Question
async function createQuestion() {
    const title = document.getElementById('questionTitle').value;
    const content = document.getElementById('questionContent').value;
    const tags = document.getElementById('questionTags').value.split(',').map(t => t.trim()).filter(t => t);

    if (!title || title.length < 10) {
        alert('Title must be at least 10 characters');
        return;
    }

    if (!content || content.length < 20) {
        alert('Content must be at least 20 characters');
        return;
    }

    if (tags.length === 0) {
        alert('Please add at least one tag');
        return;
    }

    try {
        await apiCall('/questions', 'POST', { title, content, tags });
        closeModal('createQuestion');
        alert('Question created successfully! 🎉');
        document.getElementById('questionTitle').value = '';
        document.getElementById('questionContent').value = '';
        document.getElementById('questionTags').value = '';
        loadQuestions();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Answer Modal
function openAnswerModal(questionId) {
    currentQuestionId = questionId;
    showModal('answer');
}

async function submitAnswer() {
    const content = document.getElementById('answerContent').value;
    if (!content || content.trim().length < 10) {
        alert('Answer must be at least 10 characters');
        return;
    }

    try {
        await apiCall(`/questions/${currentQuestionId}/answers`, 'POST', { content });
        closeModal('answer');
        alert('Answer submitted! You earned 5 points! 🎉');
        document.getElementById('answerContent').value = '';
        
        // Update points immediately
        currentUser.points += 5;
        document.getElementById('userPoints').textContent = `${currentUser.points} Points`;
        
        loadDashboard();
        loadQuestions();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Load Leaderboard
async function loadLeaderboard() {
    try {
        const users = await apiCall('/leaderboard/top-users?limit=20');
        const container = document.getElementById('leaderboardList');
        container.innerHTML = '';
        
        users.forEach((user, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
            container.innerHTML += `
                <div class="leaderboard-item">
                    <div class="rank">${medal} #${index + 1}</div>
                    <div>
                        <strong>${user.username}</strong>
                        <div style="color: #666; font-size: 0.9rem;">
                            ${user.badges.length} badges
                        </div>
                    </div>
                    <div class="points-badge">${user.points} Points</div>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error loading leaderboard:', error);
    }
}

// Transfer Points
async function transferPoints() {
    const toUserId = document.getElementById('transferToUser').value;
    const points = parseInt(document.getElementById('transferPoints').value);

    if (!toUserId || !points) {
        alert('Please fill all fields');
        return;
    }

    if (currentUser.points < 10) {
        alert('You need at least 10 points to transfer!');
        return;
    }

    if (points > currentUser.points) {
        alert('You don\'t have enough points!');
        return;
    }

    try {
        await apiCall('/rewards/transfer', 'POST', { toUserId, points });
        closeModal('transfer');
        alert('Points transferred successfully! 🎉');
        
        // Update current user points
        currentUser.points -= points;
        document.getElementById('userPoints').textContent = `${currentUser.points} Points`;
        
        loadDashboard();
    } catch (error) {
        alert(error.message || 'Transfer failed');
    }
}

// Modal Functions
function showModal(modalName) {
    document.getElementById(`${modalName}Modal`).style.display = 'block';
    
    if (modalName === 'transfer') {
        loadUsersForTransfer();
    }
}

function closeModal(modalName) {
    document.getElementById(`${modalName}Modal`).style.display = 'none';
}

async function loadUsersForTransfer() {
    const users = await apiCall('/leaderboard/top-users?limit=100');
    const select = document.getElementById('transferToUser');
    select.innerHTML = '<option value="">Select user</option>';
    users.filter(u => u._id !== currentUser._id).forEach(user => {
        const option = document.createElement('option');
        option.value = user._id;
        option.textContent = `${user.username} (${user.points} points)`;
        select.appendChild(option);
    });
}

// Close modal on outside click
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}


// View Question Details with Answers
async function viewQuestionDetails(questionId) {
    try {
        const question = await apiCall(`/questions/${questionId}`);
        showModal('questionDetails');
        
        const modal = document.getElementById('questionDetailsModal');
        const content = modal.querySelector('.modal-body');
        
        let answersHtml = '';
        if (question.answers && question.answers.length > 0) {
            answersHtml = '<h3>Answers</h3>';
            question.answers.forEach(answer => {
                answersHtml += `
                    <div class="answer-card">
                        <p>${answer.content}</p>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
                            <small>By ${answer.userId?.username || 'Unknown'}</small>
                            <div class="vote-buttons">
                                <button class="btn-vote btn-upvote" onclick="upvoteAnswer('${answer._id}')">
                                    👍 ${answer.upvotes || 0}
                                </button>
                                <button class="btn-vote btn-downvote" onclick="downvoteAnswer('${answer._id}')">
                                    👎 ${answer.downvotes || 0}
                                </button>
                                ${answer.userId?._id === currentUser._id ? 
                                    `<button class="btn-vote" style="background: #ff9800;" onclick="deleteAnswer('${answer._id}')">🗑️ Delete</button>` 
                                    : ''}
                            </div>
                        </div>
                    </div>
                `;
            });
        } else {
            answersHtml = '<p style="color: #666;">No answers yet. Be the first to answer!</p>';
        }
        
        content.innerHTML = `
            <h2>${question.title}</h2>
            <p>${question.content}</p>
            <div class="tags">
                ${question.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <div class="question-meta" style="margin: 1rem 0;">
                <span>👁️ ${question.views} views</span>
                <span>By ${question.userId?.username || 'Unknown'}</span>
            </div>
            <button class="btn btn-primary" onclick="closeModal('questionDetails'); openAnswerModal('${question._id}')">
                Answer This Question (+5 Points)
            </button>
            <hr style="margin: 1.5rem 0;">
            ${answersHtml}
        `;
    } catch (error) {
        alert('Error loading question details: ' + error.message);
    }
}

// Upvote Answer
async function upvoteAnswer(answerId) {
    try {
        await apiCall(`/rewards/answer/${answerId}/upvote`, 'POST');
        alert('Answer upvoted! 👍');
        // Reload current question details
        const questionId = currentQuestionId;
        if (questionId) {
            viewQuestionDetails(questionId);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Downvote Answer
async function downvoteAnswer(answerId) {
    try {
        await apiCall(`/rewards/answer/${answerId}/downvote`, 'POST');
        alert('Answer downvoted! 👎');
        // Reload current question details
        const questionId = currentQuestionId;
        if (questionId) {
            viewQuestionDetails(questionId);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Delete Answer
async function deleteAnswer(answerId) {
    if (!confirm('Are you sure? All points earned from this answer will be deducted!')) {
        return;
    }
    
    try {
        await apiCall(`/rewards/answer/${answerId}`, 'DELETE');
        alert('Answer deleted! Points have been adjusted.');
        loadDashboard();
        closeModal('questionDetails');
        loadQuestions();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Search Questions
async function searchQuestions() {
    const query = document.getElementById('searchQuery').value;
    const tags = document.getElementById('searchTags').value;
    
    try {
        let endpoint = '/questions/search?';
        if (query) endpoint += `q=${encodeURIComponent(query)}&`;
        if (tags) endpoint += `tags=${encodeURIComponent(tags)}`;
        
        const questions = await apiCall(endpoint);
        const container = document.getElementById('questionsList');
        
        if (!questions || questions.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666;">No questions found.</p>';
            return;
        }
        
        container.innerHTML = '';
        questions.forEach(q => {
            const tagsHtml = q.tags && q.tags.length > 0 
                ? q.tags.map(tag => `<span class="tag">${tag}</span>`).join('') 
                : '';
            
            container.innerHTML += `
                <div class="question-card">
                    <h3>${q.title || 'Untitled'}</h3>
                    <p>${q.content || ''}</p>
                    <div class="tags">${tagsHtml}</div>
                    <div class="question-meta">
                        <span>👁️ ${q.views || 0} views</span>
                        <span>💬 ${q.answers?.length || 0} answers</span>
                        <span>By ${q.userId?.username || 'Unknown'}</span>
                    </div>
                    <button class="btn btn-primary" onclick="viewQuestionDetails('${q._id}')">View Details</button>
                    <button class="btn btn-primary" onclick="openAnswerModal('${q._id}')" style="margin-left: 0.5rem;">Answer (+5 Points)</button>
                </div>
            `;
        });
    } catch (error) {
        alert('Search failed: ' + error.message);
    }
}
