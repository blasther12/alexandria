(() => {
  let excerpts = null;
  const app = document.getElementById('app');
  if (!app) return;

  const esc = value => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
  const route = () => location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);

  async function load() {
    try {
      const response = await fetch('./source-excerpts.json', { cache: 'no-store' });
      if (response.ok) excerpts = await response.json();
    } catch {}
  }

  function entryFor(themeId, index) {
    return excerpts?.themes?.[themeId]?.[index] || null;
  }

  function decorate() {
    const p = route();
    if (p[0] !== 'chapter' || !p[1] || p[2] == null) return;
    const index = Number(p[2]);
    if (!Number.isInteger(index)) return;
    const main = document.querySelector('.chapter-layout main');
    if (!main || main.dataset.clarityLesson) return;
    const entry = entryFor(p[1], index);
    if (!entry || !entry.paragraphs?.length) return;
    if (main.querySelector('[data-source-reading]')) return;

    const section = document.createElement('section');
    section.className = 'chapter-section source-reading';
    section.dataset.sourceReading = 'true';
    section.innerHTML = `
      <div class="eyebrow">Primeiro entenda</div>
      <h2>${esc(entry.heading || 'Explicação base')}</h2>
      <div class="source-reading-text">${entry.paragraphs.map((paragraph, index) => `<p class="${index === 0 ? 'source-lead' : ''}">${esc(paragraph)}</p>`).join('')}</div>
      <div class="source-reading-foot"><span>Explicação extraída do Codex do próprio tema.</span><a href="https://github.com/blasther12/alexandria/blob/main/${esc(entry.source)}" target="_blank" rel="noopener noreferrer">Abrir texto fonte ↗</a></div>
    `;
    main.prepend(section);

    const generic = [...main.querySelectorAll('.chapter-section')].find(node => node !== section && ['explicação','internals'].includes(node.querySelector('.eyebrow')?.textContent.trim().toLowerCase()));
    if (generic) {
      const eyebrow = generic.querySelector('.eyebrow');
      const title = generic.querySelector('h2');
      if (eyebrow) eyebrow.textContent = 'Aprofundamento técnico';
      if (title) title.textContent = 'Agora investigue o mecanismo';
      generic.classList.add('source-reading-advanced');
    }
  }

  function schedule() {
    requestAnimationFrame(decorate);
    setTimeout(decorate, 120);
  }

  load().then(schedule);
  addEventListener('hashchange', schedule);
  addEventListener('load', schedule);
  new MutationObserver(schedule).observe(app, { childList: true, subtree: true });
})();
