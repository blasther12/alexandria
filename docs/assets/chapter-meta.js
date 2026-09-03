(() => {
  const app = () => document.getElementById('app');
  const route = () => location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const themes = () => { try { return state?.data?.themes || []; } catch { return []; } };
  const themeById = id => themes().find(theme => theme.id === id);
  const safe = value => String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');

  const difficulty = themeId => {
    if (['fundamentos','linguagens','ferramentas'].includes(themeId)) return 'Fundamental';
    if (['engenharia-software','dados','infra-cloud','api-gateways','observabilidade','seguranca'].includes(themeId)) return 'Intermediário';
    return 'Avançado';
  };

  const estimated = (themeId, topic) => {
    const advanced = /consensus|raft|serializ|kafka|kubernetes|opentelemetry|rag|mcp|agente|mvcc|sharding|saga/i.test(topic);
    if (advanced) return '90–120 min';
    return themeId === 'fundamentos' || themeId === 'linguagens' ? '60–90 min' : '75–105 min';
  };

  function decorate() {
    const p = route();
    if (p[0] !== 'chapter' || !p[1] || p[2] == null || !app()) return;
    const theme = themeById(p[1]); const index = Number(p[2]); const topic = theme?.focus?.[index];
    if (!theme || !topic || app().querySelector('[data-chapter-meta]')) return;
    const prereqIds = window.alexandriaLearningMap?.prerequisites?.[theme.id] || [];
    const prereqs = prereqIds.map(themeById).filter(Boolean);
    const previous = index > 0 ? theme.focus[index - 1] : null;
    const box = document.createElement('section');
    box.className = 'chapter-meta'; box.dataset.chapterMeta = 'true';
    box.innerHTML = `<div class="chapter-meta-grid"><div><span class="eyebrow">Tempo</span><strong>${estimated(theme.id, topic)}</strong></div><div><span class="eyebrow">Nível</span><strong>${difficulty(theme.id)}</strong></div><div class="chapter-before"><span class="eyebrow">Antes</span>${previous?`<a href="#/chapter/${safe(theme.id)}/${index-1}">${safe(previous)}</a>`:prereqs.length?prereqs.map(item=>`<a href="#/theme/${safe(item.id)}">${safe(item.title)}</a>`).join(''):'<strong>Sem pré-requisito</strong>'}</div></div>`;
    const hero = app().querySelector('.chapter-hero');
    if (hero) hero.after(box);
    else app().insertBefore(box, app().children[1] || app().firstChild);
  }

  addEventListener('hashchange', () => setTimeout(decorate, 130));
  const observer = new MutationObserver(() => decorate());
  if (app()) observer.observe(app(), {childList:true, subtree:false});
  setTimeout(decorate, 180);
})();
