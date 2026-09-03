(() => {
  let guides = {};
  const app = document.getElementById('app');
  if (!app) return;

  const esc = value => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
  const route = () => location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);

  function render() {
    const p = route();
    if (p[0] !== 'theme' || !p[1]) return;
    const guide = guides[p[1]];
    if (!guide || document.querySelector('[data-theme-guide]')) return;

    const header = document.querySelector('.page-header, .theme-hero');
    const topicList = document.querySelector('.topic-list, .topics-list, .topic-stack');
    if (!header && !topicList) return;

    const section = document.createElement('section');
    section.className = 'theme-teaching-guide';
    section.dataset.themeGuide = 'true';
    section.innerHTML = `
      <div class="eyebrow">Comece por aqui</div>
      <h2>O que este tema tenta ensinar?</h2>
      <p class="theme-guide-lead">${esc(guide.plain)}</p>
      <div class="theme-guide-grid">
        <section>
          <div class="eyebrow">Perguntas que orientam o estudo</div>
          <ol>${(guide.questions || []).map(item => `<li>${esc(item)}</li>`).join('')}</ol>
        </section>
        <section>
          <div class="eyebrow">Erros de leitura comuns</div>
          <ul>${(guide.watch || []).map(item => `<li>${esc(item)}</li>`).join('')}</ul>
        </section>
      </div>
      ${(guide.start || []).length ? `<details class="theme-guide-order" open><summary>Por onde começar</summary><ol>${guide.start.map(item => `<li>${esc(item)}</li>`).join('')}</ol></details>` : ''}
    `;

    if (header) header.after(section);
    else topicList.before(section);
  }

  async function init() {
    try {
      const response = await fetch('./theme-guides.json', { cache: 'no-store' });
      if (response.ok) guides = await response.json();
    } catch {}
    const observer = new MutationObserver(() => requestAnimationFrame(render));
    observer.observe(app, { childList: true, subtree: true });
    addEventListener('hashchange', () => setTimeout(render, 80));
    render();
  }

  init();
})();
