// DEFINITION TOOL - JavaScript

let selectedDepth = 'simple';
const searchHistory = [];
let currentDefinition = '';

function selectDepth(btn) {
  document.querySelectorAll('.depth-btn').forEach((b) => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedDepth = btn.dataset.depth;
}

function quickDefine(term) {
  document.getElementById('termInput').value = term;
  define();
}

const depthPrompts = {
  simple:
    'Define this term in 2-3 sentences in simple language. Then provide one practical example.',
  intermediate: 'Define this term clearly. Include origin and common uses. Provide 2 examples.',
  detailed:
    'Comprehensive definition including etymology, formal definition, detailed explanation, multiple examples, and related contexts.'
};

async function define() {
  const input = document.getElementById('termInput');
  const term = input.value.trim();
  if (!term) {
    input.focus();
    return;
  }

  const btn = document.getElementById('defineBtn');
  const area = document.getElementById('resultArea');

  btn.disabled = true;
  btn.innerHTML =
    '<div style="display:flex;gap:6px;color:var(--black)"><span style="width:6px;height:6px;background:var(--black);border-radius:50%;animation:loadDot 1.4s infinite"></span><span style="width:6px;height:6px;background:var(--black);border-radius:50%;animation:loadDot 1.4s .2s infinite"></span><span style="width:6px;height:6px;background:var(--black);border-radius:50%;animation:loadDot 1.4s .4s infinite"></span></div>';

  area.innerHTML = `
    <div class="result-card">
      <div class="loading-state">
        <div class="loading-dots"><span></span><span></span><span></span></div>
        <div class="loading-text">Looking up definition…</div>
      </div>
    </div>`;

  try {
    const systemPrompt = `${depthPrompts[selectedDepth]}

Structure your response EXACTLY as follows (use these exact labels):
PART_OF_SPEECH: [noun/verb/adjective/concept/etc]
DEFINITION: [your main definition - 1-3 sentences]
DETAILS: [further explanation, context, examples]
RELATED: [comma-separated list of 4-5 related terms]`;
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta1/models/gemini-1.5-flash:generateContent?key=AIzaSyB-c2nL-HZNdix7QO63zCa3WJDciooJMpQ`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt + `\n\nDefine: ${term}` }
            ]
          }
        ]
      })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    const text = data.candidates[0].content.parts[0].text;
    currentDefinition = text;

    // Parse structured response
    const posMatch = text.match(/PART_OF_SPEECH:\s*(.+)/i);
    const defMatch = text.match(/DEFINITION:\s*([\s\S]+?)(?=DETAILS:|RELATED:|$)/i);
    const detailMatch = text.match(/DETAILS:\s*([\s\S]+?)(?=RELATED:|$)/i);
    const relatedMatch = text.match(/RELATED:\s*(.+)/i);

    const pos = posMatch ? posMatch[1].trim() : 'term';
    const definition = defMatch ? defMatch[1].trim() : text;
    const details = detailMatch ? detailMatch[1].trim() : '';
    const related = relatedMatch ? relatedMatch[1].split(',').map((s) => s.trim()).filter(Boolean) : [];

    searchHistory.unshift(term);
    renderResult(term, pos, definition, details, related);
    renderHistory();
  } catch (e) {
    area.innerHTML = `<div class="error-card">⚠ ${e.message || 'Something went wrong. Please try again.'}</div>`;
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span>📚</span> Find Definition';
  }
}

function renderResult(term, pos, definition, details, related) {
  const area = document.getElementById('resultArea');
  area.innerHTML = `
    <div class="result-card">
      <div class="result-header">
        <div class="result-term-block">
          <div class="result-term">${term}</div>
          <div class="result-type">${pos}</div>
        </div>
        <div class="result-actions">
          <button class="action-btn" onclick="copyDefinition()">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            Copy All
          </button>
        </div>
      </div>
      <div class="result-body">
        <div class="def-section">
          <div class="def-section-label">Definition</div>
          <div class="def-text">${definition}</div>
        </div>
        ${details ? `<div class="def-section"><div class="def-section-label">Details</div><div class="def-detail">${details}</div></div>` : ''}
      </div>
      ${
        related.length > 0
          ? `
      <div class="related-section">
        <div class="related-label">Related Terms</div>
        <div class="related-chips">
          ${related.map((term) => `<button class="related-chip" onclick="quickDefine('${term}')">${term}</button>`).join('')}
        </div>
      </div>
      `
          : ''
      }
    </div>`;
}

function renderHistory() {
  if (searchHistory.length < 2) return;
  const area = document.getElementById('historyArea');
  area.innerHTML = `
    <div class="search-history">
      <div class="history-label">Search History</div>
      <div class="history-chips">
        ${searchHistory.slice(0, 8).map((term) => `<button class="history-chip" onclick="quickDefine('${term}')">${term}</button>`).join('')}
      </div>
    </div>`;
}

function copyDefinition() {
  navigator.clipboard.writeText(currentDefinition).then(() => {
    const btns = document.querySelectorAll('.action-btn');
    btns.forEach((b) => (b.textContent = '✓ Copied!'));
    setTimeout(() => {
      btns.forEach(
        (b) =>
          (b.innerHTML =
            '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy All')
      );
    }, 2000);
  });
}

// Event listeners
document.getElementById('termInput')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') define();
});

// Populate popular terms
const popularTerms = ['Algorithm', 'Paradigm', 'Entropy', 'Catalyst', 'Heuristic', 'Symbiotic', 'Empirical', 'Dystopia'];
const popularGrid = document.getElementById('popularGrid');
if (popularGrid) {
  popularGrid.innerHTML = popularTerms
    .map(
      (term) =>
        `<button class="popular-item" onclick="quickDefine('${term}')">
      <div class="popular-term">${term}</div>
      <div class="popular-tag">common</div>
    </button>`
    )
    .join('');
}
