(() => {
  const route = () => location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const difficulty = themeId => {
    if (['fundamentos','linguagens','ferramentas'].includes(themeId)) return 'Fundamental';
    if (['engenharia-software','dados','infra-cloud','api-gateways','observabilidade','seguranca'].includes(themeId)) return 'Intermediário';
    return 'Avançado';
  };
  const estimated = (themeId, topic) => {
    if (/consensus|raft|serializ|kafka|kubernetes|opentelemetry|rag|mcp|agente|mvcc|sharding|saga/i.test(topic)) return '90–120 min';
    return themeId === 'fundamentos' || themeId === 'linguagens' ? '60–90 min' : '75–105 min';
  };

  function enhance() {
    const p = route();
    const isTheme = p[0] === 'theme' && p[1];
    document.body.classList.toggle('alexandria-theme-reading', Boolean(isTheme));
    if (!isTheme) return;

    const themeId = p[1];
    const list = document.querySelector('.focus-list');
    if (!list) return;
    list.classList.add('compact-topic-list');

    list.querySelectorAll('.topic-block').forEach((block, fallbackIndex) => {
      const input = block.querySelector('input[data-index]');
      const index = Number(input?.dataset.index ?? fallbackIndex);
      const oldLabel = block.querySelector('label');
      const title = oldLabel?.textContent?.trim() || '';
      const href = `#/chapter/${encodeURIComponent(themeId)}/${index}`;
      const row = block.querySelector('.topic-row');
      if (!row || row.dataset.compactReady === 'true') return;
      row.dataset.compactReady = 'true';

      block.querySelector('.topic-detail')?.remove();
      block.querySelector('.topic-toggle')?.remove();

      if (oldLabel) {
        const link = document.createElement('a');
        link.className = 'topic-title';
        link.href = href;
        link.textContent = title;
        oldLabel.replaceWith(link);
      }

      const meta = document.createElement('div');
      meta.className = 'topic-meta';
      meta.textContent = `${estimated(themeId, title)} · ${difficulty(themeId)}`;
      row.appendChild(meta);

      const open = document.createElement('a');
      open.className = 'topic-open';
      open.href = href;
      open.setAttribute('aria-label', `Abrir aula: ${title}`);
      open.textContent = 'Abrir →';
      row.appendChild(open);

      block.addEventListener('click', event => {
        if (event.target.closest('input,a,button')) return;
        location.hash = href.slice(1);
      });
      block.tabIndex = -1;
    });
  }

  const app = document.getElementById('app');
  if (app) new MutationObserver(() => enhance()).observe(app, { childList: true, subtree: true });
  addEventListener('hashchange', () => setTimeout(enhance, 40));
  setTimeout(enhance, 80);
})();
