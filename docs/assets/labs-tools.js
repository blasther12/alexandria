(() => {
  let labs=[];
  const app=()=>document.getElementById('app');
  const route=()=>location.hash.replace(/^#\/?/,'').split('/').filter(Boolean);
  const safe=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
  const themes=()=>{try{return state?.data?.themes||[]}catch{return[]}};
  const themeById=id=>themes().find(theme=>theme.id===id);

  function injectNav(){
    const top=document.getElementById('topNav');
    if(top&&!top.querySelector('[data-labs-nav]')){
      const repo=[...top.children].find(el=>el.textContent.includes('Repositório'));
      const a=document.createElement('a');a.href='#/labs';a.textContent='Labs';a.dataset.labsNav='true';top.insertBefore(a,repo||top.firstChild);
    }
  }

  const card=lab=>{const theme=themeById(lab.theme);return `<article class="lab-card"><div class="eyebrow">Lab reproduzível · ${safe(theme?.title||lab.theme)}</div><h2>${safe(lab.title)}</h2><p>${safe(lab.summary)}</p><div class="lab-actions"><a class="button primary" href="${safe(lab.href)}" target="_blank" rel="noopener noreferrer">Abrir laboratório ↗</a>${theme?`<a class="button secondary" href="#/theme/${safe(theme.id)}">Revisar tema</a>`:''}</div></article>`};

  function labsPage(){return `<header class="theme-header"><div class="eyebrow">Laboratórios reproduzíveis</div><h1>Faça funcionar. Quebre de propósito. Recupere com evidência.</h1><p class="lead">Os labs são pequenos experimentos versionados no repositório. Cada um descreve objetivo, happy path, falha induzida, observação, recuperação e perguntas de análise.</p></header><div class="labs-grid">${labs.map(card).join('')||'<div class="empty">Nenhum laboratório publicado.</div>'}</div>`}

  function renderRoute(){if(route()[0]!=='labs'||!app())return false;app().innerHTML=labsPage();scrollTo(0,0);return true}

  function enhanceHome(){const p=route();if(p.length||!app()||!labs.length||app().querySelector('[data-labs-home]'))return;const section=document.createElement('section');section.className='section';section.dataset.labsHome='true';section.innerHTML=`<div class="section-head"><div><div class="eyebrow">Prática deliberada</div><h2>Laboratórios reproduzíveis</h2><p>Experimentos para provar mecanismo, falha e recuperação.</p></div><a class="button secondary" href="#/labs">Ver todos os labs</a></div><div class="labs-grid">${labs.slice(0,2).map(card).join('')}</div>`;app().appendChild(section)}

  function enhanceTheme(){const p=route();if(p[0]!=='theme'||!p[1]||!app())return;const matches=labs.filter(lab=>lab.theme===p[1]);if(!matches.length||app().querySelector('[data-theme-labs]'))return;const section=document.createElement('section');section.className='lab-callout';section.dataset.themeLabs='true';section.innerHTML=`<div class="eyebrow">Prove no laboratório</div><h3>${matches.length===1?'Há um experimento reproduzível para este tema.':'Há experimentos reproduzíveis para este tema.'}</h3><p>Use o lab depois de compreender o mecanismo. A conclusão exige observar uma falha e explicar a recuperação.</p><div class="lab-actions">${matches.map(lab=>`<a class="button secondary" href="${safe(lab.href)}" target="_blank" rel="noopener noreferrer">${safe(lab.title)} ↗</a>`).join('')}</div>`;app().appendChild(section)}

  function afterRender(){if(renderRoute())return;setTimeout(()=>{enhanceHome();enhanceTheme()},100)}

  async function init(){try{const res=await fetch('./labs.json',{cache:'no-store'});if(res.ok)labs=(await res.json()).labs||[]}catch{}injectNav();addEventListener('hashchange',()=>setTimeout(afterRender,70));const observer=new MutationObserver(()=>{injectNav();if(route()[0]!=='labs'){enhanceHome();enhanceTheme()}});if(app())observer.observe(app(),{childList:true,subtree:false});setTimeout(afterRender,100)}
  init();
})();
