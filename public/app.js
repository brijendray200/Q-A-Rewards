let currentUser = null;
let currentQuestionId = null;

document.addEventListener('DOMContentLoaded', () => { loadUsers(); });

async function apiCall(endpoint, method = 'GET', body = null) {
    const options = { method, headers: { 'Content-Type': 'application/json' } };
    if (currentUser) options.headers['x-user-id'] = currentUser._id;
    if (body) options.body = JSON.stringify(body);
    const response = await fetch(`/api${endpoint}`, options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Request failed');
    return data;
}

function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('loginTab').classList.toggle('hidden', tab !== 'login');
    document.getElementById('registerTab').classList.toggle('hidden', tab !== 'register');
}

async function loadUsers() {
    try {
        const response = await fetch('/api/leaderboard/top-users?limit=100');
        const users = await response.json();
        const select = document.getElementById('userSelect');
        if (!users || users.length === 0) {
            select.innerHTML = '<option value="">No users - Register below!</option>';
            return;
        }
        select.innerHTML = '<option value="">-- Select your account --</option>';
        users.forEach(u => {
            const opt = document.createElement('option');
            opt.value = u._id;
            opt.textContent = `${u.username} (${u.points} pts)`;
            select.appendChild(opt);
        });
    } catch (e) { console.error(e); }
}

async function login() {
    const userId = document.getElementById('userSelect').value;
    if (!userId) { alert('Please select a user'); return; }
    try {
        const user = await apiCall(`/rewards/profile/${userId}`);
        setCurrentUser(user);
    } catch (e) { alert('Login failed: ' + e.message); }
}

async function register() {
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    if (!username || !email) { alert('Please fill all fields'); return; }
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email })
        });
        const user = await response.json();
        if (!response.ok) throw new Error(user.error);
        setCurrentUser(user);
        alert('Welcome ' + user.username + '! 🎉');
    } catch (e) { alert('Register failed: ' + e.message); }
}

function setCurrentUser(user) {
    currentUser = user;
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    document.getElementById('navPoints').textContent = user.points + ' Points';
    document.getElementById('navUsername').textContent = user.username;
    showPage('dashboard');
}

function logout() {
    currentUser = null;
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('loginPage').classList.remove('hidden');
    loadUsers();
}

function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.getElementById(page + 'Page').classList.remove('hidden');
    // Set active nav link
    const links = document.querySelectorAll('.nav-link');
    const map = { dashboard: 0, questions: 1, leaderboard: 2 };
    if (links[map[page]]) links[map[page]].classList.add('active');
    if (page === 'dashboard') loadDashboard();
    if (page === 'questions') loadQuestions();
    if (page === 'leaderboard') loadLeaderboard();
}

async function loadDashboard() {
    try {
        const stats = await apiCall('/leaderboard/user/' + currentUser._id + '/stats');
        document.getElementById('statPoints').textContent = stats.user.points;
        document.getElementById('statAnswers').textContent = stats.stats.totalAnswers;
        document.getElementById('statUpvotes').textContent = stats.stats.totalUpvotes;
        document.getElementById('statBadges').textContent = stats.user.badges.length;
        document.getElementById('navPoints').textContent = stats.user.points + ' Points';
        currentUser.points = stats.user.points;
        const bc = document.getElementById('badgesContainer');
        if (stats.user.badges && stats.user.badges.length > 0) {
            bc.innerHTML = '<div class="badges-section"><h3>🏅 Your Badges</h3><div class="badge-grid">' +
                stats.user.badges.map(b => '<span class="badge-item">🏅 ' + b.name + '</span>').join('') +
                '</div></div>';
        } else {
            bc.innerHTML = '<div class="badges-section"><p style="color:#888">No badges yet. Keep answering! 🎯</p></div>';
        }
    } catch (e) { console.error(e); }
}

async function loadQuestions() {
    const container = document.getElementById('questionsList');
    container.innerHTML = '<p style="color:#888;text-align:center;padding:2rem">Loading...</p>';
    try {
        const questions = await apiCall('/questions');
        renderQuestions(questions, container);
    } catch (e) {
        container.innerHTML = '<p style="color:#888;text-align:center;padding:2rem">No questions yet. Ask the first one!</p>';
    }
}

function renderQuestions(questions, container) {
    if (!questions || questions.length === 0) {
        container.innerHTML = '<p style="color:#888;text-align:center;padding:2rem">No questions found.</p>';
        return;
    }
    container.innerHTML = questions.map(q => `
        <div class="question-card">
            <h3>${q.title}</h3>
            <p>${q.content}</p>
            <div class="tags">${(q.tags || []).map(t => '<span class="tag">' + t + '</span>').join('')}</div>
            <div class="question-meta">
                <span>👁️ ${q.views || 0} views</span>
                <span>💬 ${q.answers?.length || 0} answers</span>
                <span>👤 ${q.userId?.username || 'Unknown'}</span>
            </div>
            <div class="card-actions">
                <button class="btn btn-primary" onclick="viewQuestion('${q._id}')">View & Answer</button>
            </div>
        </div>`).join('');
}

async function createQuestion() {
    const title = document.getElementById('questionTitle').value.trim();
    const content = document.getElementById('questionContent').value.trim();
    const tags = document.getElementById('questionTags').value.split(',').map(t => t.trim()).filter(Boolean);
    if (title.length < 10) { alert('Title must be at least 10 characters'); return; }
    if (content.length < 20) { alert('Content must be at least 20 characters'); return; }
    if (tags.length === 0) { alert('Add at least one tag'); return; }
    try {
        await apiCall('/questions', 'POST', { title, content, tags });
        closeModal('createQuestion');
        document.getElementById('questionTitle').value = '';
        document.getElementById('questionContent').value = '';
        document.getElementById('questionTags').value = '';
        alert('Question posted! 🎉');
        loadQuestions();
    } catch (e) { alert('Error: ' + e.message); }
}

async function searchQuestions() {
    const q = document.getElementById('searchQuery').value;
    const tags = document.getElementById('searchTags').value;
    let endpoint = '/questions/search?';
    if (q) endpoint += 'q=' + encodeURIComponent(q) + '&';
    if (tags) endpoint += 'tags=' + encodeURIComponent(tags);
    const container = document.getElementById('questionsList');
    try {
        const questions = await apiCall(endpoint);
        renderQuestions(questions, container);
    } catch (e) {
        container.innerHTML = '<p style="color:#888;text-align:center">No results found.</p>';
    }
}

async function viewQuestion(questionId) {
    currentQuestionId = questionId;
    try {
        const q = await apiCall('/questions/' + questionId);
        const answersHtml = q.answers && q.answers.length > 0
            ? q.answers.map(a => `
                <div class="answer-card">
                    <p>${a.content}</p>
                    <div class="answer-meta">
                        <small>👤 ${a.userId?.username || 'Unknown'}</small>
                        <div class="vote-buttons">
                            <button class="btn-vote btn-upvote" onclick="upvoteAnswer('${a._id}','${questionId}')">👍 ${a.upvotes || 0}</button>
                            <button class="btn-vote btn-downvote" onclick="downvoteAnswer('${a._id}','${questionId}')">👎 ${a.downvotes || 0}</button>
                            ${a.userId?._id === currentUser._id ? '<button class="btn-vote btn-delete" onclick="deleteAnswer(\'' + a._id + '\',\'' + questionId + '\')">🗑️ Delete</button>' : ''}
                        </div>
                    </div>
                </div>`).join('')
            : '<p style="color:#888;padding:1rem 0">No answers yet. Be the first!</p>';

        document.getElementById('questionDetailsBody').innerHTML = `
            <h2 style="margin-bottom:0.5rem">${q.title}</h2>
            <p style="color:#666;margin-bottom:1rem;line-height:1.6">${q.content}</p>
            <div class="tags">${(q.tags || []).map(t => '<span class="tag">' + t + '</span>').join('')}</div>
            <div class="question-meta" style="margin:0.8rem 0">
                <span>👁️ ${q.views} views</span>
                <span>👤 ${q.userId?.username || 'Unknown'}</span>
            </div>
            <button class="btn btn-primary" onclick="closeModal('questionDetails');openAnswerModal('${q._id}')">✍️ Answer This (+5 Points)</button>
            <hr style="margin:1.5rem 0;border:none;border-top:2px solid #f0f0f0">
            <h3 style="margin-bottom:1rem">💬 ${q.answers?.length || 0} Answers</h3>
            ${answersHtml}`;
        showModal('questionDetails');
    } catch (e) { alert('Error: ' + e.message); }
}

function openAnswerModal(questionId) {
    currentQuestionId = questionId;
    document.getElementById('answerModal').style.display = 'block';
}

async function submitAnswer() {
    const content = document.getElementById('answerContent').value.trim();
    if (content.length < 10) { alert('Answer must be at least 10 characters'); return; }
    try {
        await apiCall('/questions/' + currentQuestionId + '/answers', 'POST', { content });
        closeModal('answer');
        document.getElementById('answerContent').value = '';
        currentUser.points += 5;
        document.getElementById('navPoints').textContent = currentUser.points + ' Points';
        alert('Answer submitted! You earned 5 points! 🎉');
        loadDashboard();
    } catch (e) { alert('Error: ' + e.message); }
}

async function upvoteAnswer(answerId, questionId) {
    try {
        await apiCall('/rewards/answer/' + answerId + '/upvote', 'POST');
        viewQuestion(questionId);
    } catch (e) { alert('Error: ' + e.message); }
}

async function downvoteAnswer(answerId, questionId) {
    try {
        await apiCall('/rewards/answer/' + answerId + '/downvote', 'POST');
        viewQuestion(questionId);
    } catch (e) { alert('Error: ' + e.message); }
}

async function deleteAnswer(answerId, questionId) {
    if (!confirm('Delete this answer? All earned points will be deducted!')) return;
    try {
        await apiCall('/rewards/answer/' + answerId, 'DELETE');
        alert('Answer deleted. Points adjusted.');
        closeModal('questionDetails');
        loadDashboard();
        loadQuestions();
    } catch (e) { alert('Error: ' + e.message); }
}

async function showModal(name) {
    if (name === 'transfer') {
        const response = await fetch('/api/leaderboard/top-users?limit=100');
        const users = await response.json();
        const select = document.getElementById('transferToUser');
        select.innerHTML = '<option value="">-- Select user --</option>';
        users.filter(u => u._id !== currentUser._id).forEach(u => {
            const opt = document.createElement('option');
            opt.value = u._id;
            opt.textContent = u.username + ' (' + u.points + ' pts)';
            select.appendChild(opt);
        });
        document.getElementById('transferBalance').textContent = 'Your balance: ' + currentUser.points + ' points';
    }
    document.getElementById(name + 'Modal').style.display = 'block';
}

function closeModal(name) {
    document.getElementById(name + 'Modal').style.display = 'none';
}

async function transferPoints() {
    const toUserId = document.getElementById('transferToUser').value;
    const points = parseInt(document.getElementById('transferPoints').value);
    if (!toUserId) { alert('Please select a user'); return; }
    if (!points || points <= 0) { alert('Enter valid points'); return; }
    if (currentUser.points < 10) { alert('You need at least 10 points to transfer!'); return; }
    if (points > currentUser.points) { alert('Insufficient points!'); return; }
    try {
        await apiCall('/rewards/transfer', 'POST', { toUserId, points });
        closeModal('transfer');
        document.getElementById('transferPoints').value = '';
        alert(points + ' points transferred! 🎉');
        loadDashboard();
    } catch (e) { alert('Error: ' + e.message); }
}

async function loadLeaderboard() {
    try {
        const users = await apiCall('/leaderboard/top-users?limit=20');
        const medals = ['🥇', '🥈', '🥉'];
        document.getElementById('leaderboardList').innerHTML = users.map((u, i) => `
            <div class="leaderboard-item">
                <div class="leaderboard-rank">${medals[i] || '#' + (i + 1)}</div>
                <div class="leaderboard-info">
                    <strong>${u.username}</strong>
                    <small>${u.badges?.length || 0} badges</small>
                </div>
                <span class="points-badge">${u.points} pts</span>
            </div>`).join('');
    } catch (e) { console.error(e); }
}

window.onclick = e => { if (e.target.classList.contains('modal')) e.target.style.display = 'none'; };
