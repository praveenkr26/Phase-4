// ASK TOOL - JavaScript

const history = [];
const API_KEY = 'sk-ant-d01'; // This will be set via environment variable in production

function updateCount() {
  const v = document.getElementById('questionInput').value;
  document.getElementById('charCount').textContent = v.length + ' / 500';
}

function setSuggestion(text) {
  document.getElementById('questionInput').value = text;
  updateCount();
  document.getElementById('questionInput').focus();
}

async function askQuestion() {
  const input = document.getElementById('questionInput');
  const question = input.value.trim();
  if (!question) {
    input.focus();
    return;
  }

  const btn = document.getElementById('askBtn');
  const area = document.getElementById('responseArea');

  btn.disabled = true;
  btn.innerHTML =
    '<div style="display:flex;gap:6px"><span style="width:6px;height:6px;background:var(--black);border-radius:50%;animation:loadDot 1.4s infinite"></span><span style="width:6px;height:6px;background:var(--black);border-radius:50%;animation:loadDot 1.4s .2s infinite"></span><span style="width:6px;height:6px;background:var(--black);border-radius:50%;animation:loadDot 1.4s .4s infinite"></span></div>';

  area.innerHTML = `
    <div class="response-card">
      <div class="loading-state">
        <div class="loading-dots"><span></span><span></span><span></span></div>
        <div class="loading-text">Thinking…</div>
      </div>
    </div>`;

  try {
    // Build API URL dynamically to avoid caching
    const baseUrl = 'https://generativelanguage.googleapis.com/v1beta1/models/gemini-1.5-pro:generateContent';
    const apiKey = 'AIzaSyB-c2nL-HZNdix7QO63zCa3WJDciooJMpQ';
    const timestamp = Date.now();
    const apiUrl = `${baseUrl}?key=${apiKey}&t=${timestamp}`;
    console.log('[' + new Date().toISOString() + '] API Endpoint: ' + apiUrl.substring(0, 80) + '...');
    
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: question
          }]
        }]
      })
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error('API Error Response:', errorText);
      console.log('API Endpoint:', `https://generativelanguage.googleapis.com/v1beta1/models/gemini-pro:generateContent?key=AIzaSyB-c2nL-HZNdix7QO63zCa3WJDciooJMpQ`);
      throw new Error(`API Error ${res.status}: ${errorText || res.statusText}`);
    }
    const data = await res.json();
    console.log('API Response:', data);
    if (data.error) throw new Error(data.error.message);
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content.parts[0]) {
      throw new Error('Invalid API response format: ' + JSON.stringify(data));
    }
    const answer = data.candidates[0].content.parts[0].text;
    history.unshift({ question, answer });
    showAnswer(question, answer);
    renderHistory();
  } catch (e) {
    area.innerHTML = `<div class="error-card">⚠ Something went wrong: ${e.message || 'Please try again.'}</div>`;
  } finally {
    btn.disabled = false;
    btn.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> Get Answer';
  }
}

function showAnswer(question, answer) {
  const area = document.getElementById('responseArea');
  const id = 'answer-' + Date.now();
  area.innerHTML = `
    <div class="response-card">
      <div class="response-header">
        <div class="response-label">
          ✦ AI Response
          <span class="ai-badge">NexusAI</span>
        </div>
        <button class="copy-btn" onclick="copyText('${id}')">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          Copy
        </button>
      </div>
      <div class="response-body">
        <div class="response-question">"${question}"</div>
        <div class="response-text" id="${id}">${answer}</div>
      </div>
    </div>`;
}

function copyText(id) {
  const text = document.getElementById(id).textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btns = document.querySelectorAll('.copy-btn');
    btns.forEach((b) => (b.textContent = '✓ Copied!'));
    setTimeout(() => {
      btns.forEach(
        (b) =>
          (b.innerHTML =
            '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy')
      );
    }, 2000);
  });
}

function renderHistory() {
  if (history.length === 0) return;
  document.getElementById('historySection').style.display = 'block';
  const list = document.getElementById('historyList');
  list.innerHTML = history
    .slice(0, 5)
    .map(
      (h, i) =>
        `
    <div class="history-item" onclick="showAnswer('${h.question.replace(/'/g, "\\'")}', '${h.answer
          .replace(/'/g, "\\'")
          .replace(/\n/g, '\\n')}')">
      <div class="history-q">${h.question}</div>
      <div class="history-arrow">→</div>
    </div>`
    )
    .join('');
}

// Event listeners
document.getElementById('questionInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.ctrlKey) askQuestion();
});
