// IDEA SPARK TOOL - JavaScript

const catExamples = {
  blog: ['AI trends', 'Self-improvement', 'Tech reviews', 'Productivity hacks'],
  business: ['Startup ideas', 'Growth strategies', 'Management tips', 'Team building'],
  story: ['Plot twists', 'Character arcs', 'Worldbuilding', 'Narrative hooks'],
  social: ['Instagram captions', 'Tweet threads', 'TikTok angles', 'Engaging content'],
  product: ['Feature ideas', 'User experience', 'Pricing models', 'Marketing angles'],
  research: ['Research directions', 'Hypotheses', 'Study designs', 'Analysis methods'],
  names: ['Brand names', 'Product names', 'Character names', 'Company names'],
  custom: ['Free form', 'Any topic', 'Creative brainstorm', 'Custom ideas']
};

let selectedCat = 'blog';
let selectedTone = 'creative';

function selectCat(btn) {
  document.querySelectorAll('.cat-btn').forEach((b) => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedCat = btn.dataset.cat;
  renderExamples();
}

function selectTone(btn) {
  document.querySelectorAll('.tone-btn').forEach((b) => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedTone = btn.dataset.tone;
}

function renderExamples() {
  const list = document.getElementById('examplesList');
  list.innerHTML = catExamples[selectedCat]
    .map((ex) => `<button class="example-chip" onclick="setExample('${ex}')">${ex}</button>`)
    .join('');
}

function setExample(text) {
  document.getElementById('topicInput').value = text;
  document.getElementById('topicInput').focus();
}

renderExamples();

const catPrompts = {
  blog: 'Generate 5 unique and engaging blog post ideas about the topic. Each idea should have a catchy title and brief description.',
  business: 'Suggest 5 innovative business ideas related to the topic. Include potential revenue streams and target market.',
  story: 'Create 5 creative story concepts around the topic. Include plot premise and interesting hook.',
  social:
    'Generate 5 social media content ideas about the topic. Include platform and format suggestions for each.',
  product: 'Brainstorm 5 product ideas based on the topic. Include features and unique selling points.',
  research:
    'Suggest 5 research directions or academic angles related to the topic. Include hypotheses and methodology hints.',
  names: 'Generate 5 creative names related to the topic. Make them memorable, brandable, and relevant.',
  custom: 'Generate 5 creative ideas about the topic. Be innovative, practical, and forward-thinking.'
};

async function generateIdeas() {
  const input = document.getElementById('topicInput');
  const topic = input.value.trim();
  if (!topic) {
    input.focus();
    return;
  }

  const count = document.getElementById('countSelect').value;
  const btn = document.getElementById('sparkBtn');
  const output = document.getElementById('ideasOutput');

  btn.disabled = true;
  btn.innerHTML =
    '<div style="display:flex;gap:6px"><span style="width:6px;height:6px;background:var(--black);border-radius:50%;animation:loadDot 1.4s infinite"></span><span style="width:6px;height:6px;background:var(--black);border-radius:50%;animation:loadDot 1.4s .2s infinite"></span><span style="width:6px;height:6px;background:var(--black);border-radius:50%;animation:loadDot 1.4s .4s infinite"></span></div>';

  output.innerHTML = `
    <div class="loading-card">
      <div class="loading-dots"><span></span><span></span><span></span></div>
      <div class="loading-text">Sparking ideas…</div>
      <div class="loading-sub">Generating ${count} brilliant ideas for you</div>
    </div>`;

  try {
    const toneInfo = selectedTone === 'creative' ? 'creative and imaginative' : 'practical and actionable';
    const prompt = `${catPrompts[selectedCat]}

    Topic: ${topic}
    Number of ideas: ${count}
    Tone: ${toneInfo}
    
    Format each idea as a numbered list with a title and brief 1-2 sentence description. Be specific and detailed.`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta1/models/gemini-1.5-flash:generateContent?`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ]
      })
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    const ideas = data.candidates[0].content.parts[0].text;
    renderIdeas(ideas);
  } catch (e) {
    output.innerHTML = `<div class="error-card">⚠ ${e.message || 'Something went wrong. Please try again.'}</div>`;
  } finally {
    btn.disabled = false;
    btn.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> Spark Ideas';
  }
}

function renderIdeas(text) {
  const output = document.getElementById('ideasOutput');
  const lines = text.split('\n').filter((line) => line.trim());

  let ideas = [];
  let currentIdea = null;

  lines.forEach((line) => {
    // Match numbered lines (1., 2., etc.)
    const numMatch = line.match(/^\d+\.\s*(.+)/);
    if (numMatch) {
      if (currentIdea) ideas.push(currentIdea);
      currentIdea = {
        title: numMatch[1].trim(),
        detail: ''
      };
    } else if (currentIdea && line.trim()) {
      // Add to detail of current idea
      currentIdea.detail += (currentIdea.detail ? ' ' : '') + line.trim();
    }
  });

  if (currentIdea) ideas.push(currentIdea);

  if (ideas.length === 0) {
    ideas = [{ title: 'Idea', detail: text }];
  }

  const html = `
    <div class="ideas-grid">
      ${ideas
        .map(
          (idea, i) => `
        <div class="idea-card">
          <div class="idea-num">${i + 1}</div>
          <div class="idea-content">
            <div class="idea-title">${idea.title}</div>
            <div class="idea-detail">${idea.detail}</div>
            <div class="idea-actions">
              <button class="idea-copy-btn" onclick="copyIdea(this, '${idea.title} - ${idea.detail.replace(/'/g, "\\'")}')">📋 Copy</button>
            </div>
          </div>
        </div>
      `
        )
        .join('')}
    </div>`;

  output.innerHTML = html;
}

function copyIdea(btn, text) {
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = '✓ Copied!';
    setTimeout(() => {
      btn.textContent = '📋 Copy';
    }, 2000);
  });
}

// Event listeners
document.getElementById('topicInput')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') generateIdeas();
});
