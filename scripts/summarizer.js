// SUMMARIZER TOOL - JavaScript

let selectedMode = 'concise';
let currentSummary = '';

function selectMode(btn) {
  document.querySelectorAll('.option-btn').forEach((b) => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedMode = btn.dataset.mode;
}

function updateWordCount() {
  const text = document.getElementById('textInput').value.trim();
  const words = text ? text.split(/\s+/).length : 0;
  document.getElementById('wordCount').textContent = words + ' words';
}

async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    document.getElementById('textInput').value = text;
    updateWordCount();
  } catch {
    alert('Please paste manually (Ctrl+V)');
  }
}

function clearInput() {
  document.getElementById('textInput').value = '';
  updateWordCount();
  document.getElementById('outputContent').innerHTML =
    '<div class="output-empty"><div class="output-empty-icon">📝</div><div class="output-empty-text">Your summary will appear here</div></div>';
  document.getElementById('copyBtn').style.display = 'none';
}

const modePrompts = {
  concise:
    'Provide a concise summary of the following text in 2-3 short paragraphs. Focus on the most important points. Use plain text only.',
  detailed:
    'Provide a detailed summary of the following text covering all key points and supporting details. Use plain text organized in clear paragraphs.',
  bullets: 'Summarize the following text as a clear list of key bullet points (use • symbol). Start each bullet on a new line. Use plain text.',
  executive:
    'Create an executive brief of the following text. Include: one-line TL;DR, 3 key takeaways, and bottom line. Use plain text.'
};

async function summarize() {
  const text = document.getElementById('textInput').value.trim();
  if (!text || text.split(/\s+/).length < 10) {
    alert('Please enter at least 10 words to summarize.');
    return;
  }

  const btn = document.getElementById('sumBtn');
  const output = document.getElementById('outputContent');
  btn.disabled = true;
  btn.textContent = 'Summarizing…';
  document.getElementById('copyBtn').style.display = 'none';

  output.innerHTML = `<div class="loading-state"><div class="loading-dots"><span></span><span></span><span></span></div><div class="loading-text">Reading and analyzing…</div></div>`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta1/models/gemini-1.5-flash:generateContent?key=AIzaSyB-c2nL-HZNdix7QO63zCa3WJDciooJMpQ`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: modePrompts[selectedMode] + '\n\nText to summarize:\n' + text }
            ]
          }
        ]
      })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    currentSummary = data.candidates[0].content.parts[0].text;

    const wordCount = text.split(/\s+/).length;
    const summaryWords = currentSummary.split(/\s+/).length;
    const ratio = ((summaryWords / wordCount) * 100).toFixed(1);

    output.innerHTML = `
      <div class="output-body">
        <div class="summary-text">${currentSummary}</div>
        <div class="summary-meta">
          <div class="meta-item">
            <div class="meta-label">Original</div>
            <div class="meta-val">${wordCount} words</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Summary</div>
            <div class="meta-val">${summaryWords} words</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Reduction</div>
            <div class="meta-val">${ratio}%</div>
          </div>
        </div>
      </div>`;
    document.getElementById('copyBtn').style.display = 'flex';
  } catch (e) {
    output.innerHTML = `<div class="error-card">⚠ Error: ${e.message || 'Please try again.'}</div>`;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Summarize';
  }
}

function copySummary() {
  navigator.clipboard.writeText(currentSummary).then(() => {
    const btn = document.getElementById('copyBtn');
    btn.textContent = '✓ Copied!';
    setTimeout(() => {
      btn.innerHTML =
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy';
    }, 2000);
  });
}

// Event listeners
document.getElementById('textInput')?.addEventListener('input', updateWordCount);
