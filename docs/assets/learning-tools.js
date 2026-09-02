(() => {
  const MAP_URL = './learning-map.json';
  const NOTES_KEY = 'alexandria-chapter-notes-v1';
  const MASTERY_KEY = 'alexandria-mastery-v1';
  let learningMap = null;
  let mermaidModule = null;

  const app = () => document.getElementById('app');
  const nav = () => document.getElementById('topNav');
  const mobileNav = () => document.querySelector('.mobile-nav');
  const safe = value => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
  const read = (key, fallback = {}) => { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const route = () => location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const themes = () => { try { return state?.data?.themes || []; } catch { return []; } };
  const themeById = id => themes().find(theme => theme.id === id);

  const injectNav = () => {
    const top = nav();
    if (top && !top.querySelector('[data-learning-nav="tracks"]')) {
      const repo = [...top.children].find(el => el.textContent.includes('Repositório'));
      const links = [
        ['Trilhas', '#/tracks', 'tracks'],
        ['Mapa', '#/graph', 'graph'],
        ['Busca', '#/search', 'search'],
        ['Notas', '#/notes', 'notes']
      ];
      for (const [label, href, id] of links) {
        const a = document.createElement('a');
        a.href = href; a.textContent = label; a.dataset.learningNav = id;
        top.insertBefore(a, repo || top.firstChild);
      }
    }
    const bottom = mobileNav();
    if (bottom && !bottom.querySelector('[data-learning-mobile]')) {
      const a = document.createElement('a');
      a.href = '#/search'; a.dataset.learningMobile = 'true';
      a.innerHTML = '<span>⌕</span>Busca';
      bottom.appendChild(a);
      bottom.style.gridTemplateColumns = `repeat(${bottom.children.length},1fr)`;
    }
  };

  const editorialMeta = themeId => learningMap?.editorial?.[themeId] || null;
  const statusLabel = status => ({draft:'Rascunho',reviewed:'Revisado',verified:'Verificado'})[status] || status || 'Sem status';
  const isStale = meta => {
    if (!meta?.lastReviewed || !meta?.reviewEveryDays) return false;
    const reviewed = new Date(`${meta.lastReviewed}T00:00:00Z`).getTime();
    return Date.now() - reviewed > meta.reviewEveryDays * 86400000;
  };

  const linkedRefs = theme => (theme.references || []).map(ref => {
    const url = learningMap?.referenceLinks?.[ref];
    return url ? `<a href="${safe(url)}" target="_blank" rel="noopener noreferrer">${safe(ref)} ↗</a>` : safe(ref);
  });

  function tracksPage() {
    const cards = (learningMap?.tracks || []).map(track => {
      const steps = track.themes.map((id, index) => themeById(id)).filter(Boolean)
        .map((theme, index) => `<a class="track-step" href="#/theme/${safe(theme.id)}"><span>${index + 1}</span>${safe(theme.title)}</a>`).join('');
      return `<article class="track-card"><div class="eyebrow">Trilha opcional</div><h2>${safe(track.title)}</h2><p>${safe(track.description)}</p><div class="track-steps">${steps}</div></article>`;
    }).join('');
    return `<header class="theme-header"><div class="eyebrow">Trilhas</div><h1>Caminhos por objetivo, sem transformar Alexandria em grade escolar.</h1><p class="lead">Use uma trilha quando quiser direção. Saia dela sempre que uma pergunta levar a outro tema.</p></header><div class="track-grid">${cards}</div>`;
  }

  function graphPage() {
    const nodes = themes().map(theme => {
      const prereqs = (learningMap?.prerequisites?.[theme.id] || []).map(themeById).filter(Boolean);
      const related = (learningMap?.related?.[theme.id] || []).map(themeById).filter(Boolean);
      const links = list => list.length ? list.map(item => `<a href="#/theme/${safe(item.id)}">${safe(item.title)}</a>`).join('') : '<span class="learning-chip">Nenhum</span>';
      return `<article class="graph-node"><div class="eyebrow">${safe(theme.category)}</div><h3><a href="#/theme/${safe(theme.id)}" style="color:inherit;text-decoration:none">${safe(theme.title)}</a></h3><div class="graph-relations"><div><strong>Depende de</strong><div class="relation-links">${links(prereqs)}</div></div><div><strong>Conecta com</strong><div class="relation-links">${links(related)}</div></div></div></article>`;
    }).join('');
    return `<header class="theme-header"><div class="eyebrow">Grafo de conhecimento</div><h1>Os assuntos não vivem em gavetas.</h1><p class="lead">Veja pré-requisitos e relações para entender onde um conceito reaparece com outra função.</p></header><div class="graph-list">${nodes}</div>`;
  }

  const buildSearchIndex = () => {
    const items = [];
    for (const theme of themes()) {
      items.push({kind:'Tema', title:theme.title, text:`${theme.summary} ${theme.category}`, href:`#/theme/${theme.id}`});
      (theme.focus || []).forEach((topic,index) => items.push({kind:'Capítulo', title:topic, text:`${theme.title} ${theme.category}`, href:`#/chapter/${theme.id}/${index}`}));
      (theme.decisions || []).forEach(item => items.push({kind:'Trade-off', title:item, text:theme.title, href:`#/theme/${theme.id}`}));
      (theme.labs || []).forEach(item => items.push({kind:'Laboratório', title:item, text:theme.title, href:`#/theme/${theme.id}`}));
      (theme.references || []).forEach(item => items.push({kind:'Referência', title:item, text:theme.title, href:`#/theme/${theme.id}`}));
    }
    return items;
  };

  function searchPage(query = '') {
    const q = query.trim().toLocaleLowerCase('pt-BR');
    const index = buildSearchIndex();
    const results = q ? index.filter(item => `${item.title} ${item.text} ${item.kind}`.toLocaleLowerCase('pt-BR').includes(q)).slice(0,100) : index.slice(0,30);
    return `<header class="theme-header"><div class="eyebrow">Busca global</div><h1>Procure conceito, tecnologia, decisão, laboratório ou referência.</h1><p class="lead">A busca atravessa temas e capítulos. “Idempotência”, por exemplo, pode aparecer em APIs, mensageria, agentes e sistemas distribuídos.</p></header><div class="section-head"><input id="alexGlobalSearch" class="search" type="search" placeholder="Ex.: idempotência, Kafka, RAG, SLO, DDD…" value="${safe(query)}"><div><strong>${results.length}</strong> resultados exibidos</div></div><div class="global-search-results">${results.map(item => `<a class="search-result" href="${safe(item.href)}"><span class="search-kind">${safe(item.kind)}</span><h3>${safe(item.title)}</h3><p>${safe(item.text)}</p></a>`).join('') || '<div class="empty">Nada encontrado.</div>'}</div>`;
  }

  const masteryName = key => ({explain:'Consigo explicar',implement:'Consigo implementar',diagnose:'Consigo diagnosticar'})[key];
  function notesPage() {
    const notes = read(NOTES_KEY);
    const entries = Object.entries(notes).filter(([,value]) => String(value).trim()).map(([key,value]) => {
      const [themeId,indexText] = key.split('::');
      const theme = themeById(themeId); const index = Number(indexText); const title = theme?.focus?.[index] || key;
      return {key,value,theme,title,index};
    });
    const cards = entries.map(item => `<article class="note-card"><div class="eyebrow">${safe(item.theme?.title || 'Capítulo')}</div><h3><a href="#/chapter/${safe(item.theme?.id || '')}/${item.index}" style="color:inherit">${safe(item.title)}</a></h3><p>${safe(item.value)}</p></article>`).join('');
    return `<header class="theme-header"><div class="eyebrow">Notas</div><h1>Seu caderno local do Alexandria.</h1><p class="lead">As notas ficam neste navegador. Exporte periodicamente se quiser levá-las para outro dispositivo.</p></header><div class="study-actions"><button id="exportAlexNotes" class="button secondary">Exportar notas</button><button id="importAlexNotes" class="button secondary">Importar notas</button><input id="importAlexNotesFile" type="file" accept="application/json,.json" hidden></div><section class="section notes-list">${cards || '<div class="empty">Nenhuma nota salva ainda.</div>'}</section>`;
  }

  function downloadJson(filename, data) {
    const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download=filename; a.click(); setTimeout(()=>URL.revokeObjectURL(url),500);
  }

  function bindSpecial() {
    const input = document.getElementById('alexGlobalSearch');
    if (input) input.addEventListener('input', () => { app().innerHTML = searchPage(input.value); bindSpecial(); const next=document.getElementById('alexGlobalSearch'); next.focus(); next.setSelectionRange(next.value.length,next.value.length); });
    const exportBtn = document.getElementById('exportAlexNotes');
    if (exportBtn) exportBtn.onclick = () => downloadJson('alexandria-notes.json', {version:1, exportedAt:new Date().toISOString(), notes:read(NOTES_KEY), mastery:read(MASTERY_KEY)});
    const importBtn = document.getElementById('importAlexNotes'); const fileInput = document.getElementById('importAlexNotesFile');
    if (importBtn && fileInput) {
      importBtn.onclick=()=>fileInput.click();
      fileInput.onchange=async()=>{const file=fileInput.files?.[0];if(!file)return;try{const data=JSON.parse(await file.text());if(data.notes)write(NOTES_KEY,data.notes);if(data.mastery)write(MASTERY_KEY,data.mastery);location.hash='#/notes';renderSpecialRoute();}catch{alert('Arquivo de notas inválido.')}};
    }
  }

  function renderSpecialRoute() {
    if (!learningMap || !themes().length || !app()) return false;
    const p = route(); let html = null;
    if (p[0] === 'tracks') html = tracksPage();
    if (p[0] === 'graph') html = graphPage();
    if (p[0] === 'search') html = searchPage('');
    if (p[0] === 'notes') html = notesPage();
    if (html !== null) { app().innerHTML = html; scrollTo(0,0); bindSpecial(); return true; }
    return false;
  }

  function enhanceThemePage() {
    const p=route(); if(p[0] !== 'theme' || !p[1] || !learningMap) return;
    const theme=themeById(p[1]); const header=document.querySelector('.theme-header'); if(!theme || !header || header.querySelector('.learning-meta')) return;
    const meta=editorialMeta(theme.id); const prereqs=(learningMap.prerequisites?.[theme.id]||[]).map(themeById).filter(Boolean); const related=(learningMap.related?.[theme.id]||[]).map(themeById).filter(Boolean); const tracks=(learningMap.tracks||[]).filter(track=>track.themes.includes(theme.id));
    const wrapper=document.createElement('div'); wrapper.className='learning-meta';
    wrapper.innerHTML=`${meta?`<span class="learning-chip ${isStale(meta)?'editorial-warning':'editorial-ok'}"><strong>${safe(statusLabel(meta.status))}</strong> · revisão ${safe(meta.lastReviewed)}</span>`:''}${tracks.map(t=>`<a class="learning-chip" href="#/tracks"><strong>Trilha</strong> ${safe(t.title)}</a>`).join('')}${prereqs.map(t=>`<a class="learning-chip" href="#/theme/${safe(t.id)}"><strong>Pré</strong> ${safe(t.title)}</a>`).join('')}${related.slice(0,4).map(t=>`<a class="learning-chip" href="#/theme/${safe(t.id)}"><strong>Relacionado</strong> ${safe(t.title)}</a>`).join('')}`;
    header.appendChild(wrapper);
    const sticky=document.querySelector('.sticky'); const refs=linkedRefs(theme).filter(item=>item.includes('<a'));
    if(sticky && refs.length && !sticky.querySelector('[data-official-refs]')){const section=document.createElement('div');section.dataset.officialRefs='true';section.innerHTML=`<hr style="border:0;border-top:1px solid var(--line);margin:22px 0"><div class="eyebrow">Referências clicáveis</div><ul class="ref-list">${refs.map(r=>`<li>${r}</li>`).join('')}</ul>`;sticky.appendChild(section);}
  }

  const chapterKey = (themeId,index) => `${themeId}::${index}`;
  function mermaidCode(topic) {
    const label=String(topic).replaceAll('"','').slice(0,80);
    return `flowchart LR\n  A[Problema / entrada] --> B["${label}"]\n  B --> C[Estado e invariantes]\n  B --> D[Modos de falha]\n  B --> E[Observabilidade]\n  C --> F[Decisão técnica]\n  D --> F\n  E --> F\n  F --> G[Evidência reproduzível]`;
  }

  async function renderMermaid(host, code) {
    if (!host || host.dataset.rendered) return;
    host.dataset.rendered='pending';
    host.innerHTML=`<pre>${safe(code)}</pre>`;
    try {
      mermaidModule ||= await import('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs');
      const mermaid=mermaidModule.default; mermaid.initialize({startOnLoad:false,securityLevel:'strict',theme:document.documentElement.dataset.theme==='dark'?'dark':'neutral'});
      const id=`alex-mermaid-${Math.random().toString(36).slice(2)}`; const result=await mermaid.render(id,code); host.innerHTML=result.svg; host.dataset.rendered='true';
    } catch { host.dataset.rendered='fallback'; }
  }

  function enhanceChapterPage() {
    const p=route(); if(p[0] !== 'chapter' || !p[1] || p[2] == null || !learningMap || !app()) return;
    const theme=themeById(p[1]); const index=Number(p[2]); const topic=theme?.focus?.[index]; if(!theme || !topic || app().querySelector('[data-study-tools]')) return;
    const key=chapterKey(theme.id,index); const notes=read(NOTES_KEY); const mastery=read(MASTERY_KEY); const current=mastery[key]||{};
    const section=document.createElement('section'); section.className='study-tools'; section.dataset.studyTools='true';
    const levels=[['explain','Consigo explicar','Explico o mecanismo sem depender do nome da ferramenta.'],['implement','Consigo implementar','Consigo montar uma versão pequena, observável e testável.'],['diagnose','Consigo diagnosticar','Consigo provocar uma falha, localizar causa e recuperar.']];
    section.innerHTML=`<div class="eyebrow">Domínio e fichamento</div><h2>Transforme leitura em evidência.</h2><p style="color:var(--muted)">Marque níveis apenas quando conseguir demonstrá-los. O objetivo é separar “li” de “sei usar e diagnosticar”.</p><div class="mastery-grid">${levels.map(([id,title,desc])=>`<div class="mastery-item"><label><input type="checkbox" data-mastery="${id}" ${current[id]?'checked':''}><span><strong>${title}</strong><small>${desc}</small></span></label></div>`).join('')}</div><label for="chapterNotes"><strong>Minhas notas</strong></label><textarea id="chapterNotes" class="chapter-notes" placeholder="Modelo mental, dúvidas, decisões, resultados do laboratório…">${safe(notes[key]||'')}</textarea><div class="study-actions"><button id="saveChapterNotes" class="button primary">Salvar notas</button><a class="button secondary" href="#/notes">Ver caderno</a></div><div class="mermaid-panel"><div class="eyebrow">Diagrama navegável</div><h3>Mapa do mecanismo</h3><div class="mermaid-host" data-mermaid-host></div></div>`;
    app().appendChild(section);
    section.querySelectorAll('[data-mastery]').forEach(input=>input.onchange=()=>{const allMastery=read(MASTERY_KEY);allMastery[key]={...(allMastery[key]||{}),[input.dataset.mastery]:input.checked};write(MASTERY_KEY,allMastery);});
    document.getElementById('saveChapterNotes').onclick=()=>{const allNotes=read(NOTES_KEY);const value=document.getElementById('chapterNotes').value.trim();if(value)allNotes[key]=value;else delete allNotes[key];write(NOTES_KEY,allNotes);document.getElementById('saveChapterNotes').textContent='Salvo ✓';setTimeout(()=>{const b=document.getElementById('saveChapterNotes');if(b)b.textContent='Salvar notas';},1200);};
    renderMermaid(section.querySelector('[data-mermaid-host]'),mermaidCode(topic));
  }

  function afterBaseRender(){if(renderSpecialRoute())return;setTimeout(()=>{enhanceThemePage();enhanceChapterPage();},80);}

  async function init() {
    try { const res=await fetch(MAP_URL,{cache:'no-store'}); if(res.ok) learningMap=await res.json(); } catch {}
    window.alexandriaLearningMap=learningMap;
    injectNav();
    addEventListener('hashchange',()=>setTimeout(afterBaseRender,40));
    const observer=new MutationObserver(()=>{injectNav();const p=route();if(['tracks','graph','search','notes'].includes(p[0]))return;enhanceThemePage();enhanceChapterPage();});
    observer.observe(app(),{childList:true,subtree:false});
    setTimeout(afterBaseRender,80);
  }
  init();
})();
