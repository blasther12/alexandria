(() => {
  const $=(selector,root=document)=>root.querySelector(selector);
  const route=()=>location.hash.replace(/^#\/?/,'').split('/').filter(Boolean);
  const links={
    fundamentos:{label:'Fundamentos',href:'#/theme/fundamentos'},
    'engenharia-software':{label:'Engenharia de Software',href:'#/theme/engenharia-software'},
    arquitetura:{label:'Arquitetura',href:'#/theme/arquitetura'},
    'sistemas-distribuidos':{label:'Sistemas Distribuídos',href:'#/theme/sistemas-distribuidos'},
    dados:{label:'Dados',href:'#/theme/dados'},
    mensageria:{label:'Mensageria',href:'#/theme/mensageria'},
    'infra-cloud':{label:'Cloud e Infraestrutura',href:'#/theme/infra-cloud'},
    observabilidade:{label:'Observabilidade',href:'#/theme/observabilidade'},
    seguranca:{label:'Segurança',href:'#/theme/seguranca'},
    'ai-engineering':{label:'AI Engineering',href:'#/theme/ai-engineering'},
    agentes:{label:'Agentes',href:'#/theme/agentes'},
    projetos:{label:'Projetos',href:'#/projects'}
  };

  const graph={
    fundamentos:{before:null,after:'engenharia-software'},
    'engenharia-software':{before:'fundamentos',after:'arquitetura'},
    arquitetura:{before:'engenharia-software',after:'sistemas-distribuidos'},
    'sistemas-distribuidos':{before:'arquitetura',after:'mensageria'},
    dados:{before:'fundamentos',after:'sistemas-distribuidos'},
    mensageria:{before:'sistemas-distribuidos',after:'observabilidade'},
    'infra-cloud':{before:'sistemas-distribuidos',after:'observabilidade'},
    observabilidade:{before:'sistemas-distribuidos',after:'seguranca'},
    seguranca:{before:'infra-cloud',after:'ai-engineering'},
    'ai-engineering':{before:'dados',after:'agentes'},
    agentes:{before:'ai-engineering',after:'projetos'},
    projetos:{before:'arquitetura',after:null}
  };

  function addOnboarding(){
    if(route().length||$('#ecosystemOnboarding')||!$('.hero'))return;
    const section=document.createElement('section');
    section.id='ecosystemOnboarding';
    section.className='ecosystem-onboarding';
    section.innerHTML=`<div class="eyebrow">Por onde começar</div><h2>Entre pelo problema que você quer resolver.</h2><p>Alexandria não exige uma ordem única. Estes atalhos só reduzem a primeira decisão e levam para temas que já fazem parte do mesmo mapa.</p><div class="onboarding-grid"><a class="onboarding-card" href="#/theme/fundamentos"><strong>Fortalecer fundamentos</strong><span>CPU, memória, sistema operacional, redes e performance.</span></a><a class="onboarding-card" href="#/theme/engenharia-software"><strong>Melhorar como backend</strong><span>Design, contratos, testes, DDD e custo de mudança.</span></a><a class="onboarding-card" href="#/theme/arquitetura"><strong>Estudar arquitetura</strong><span>Drivers, trade-offs, boundaries e atributos de qualidade.</span></a><a class="onboarding-card" href="#/theme/ai-engineering"><strong>Construir com IA</strong><span>Evals, RAG, MCP, tools, observabilidade e custo.</span></a><a class="onboarding-card" href="#/projects"><strong>Aprender construindo</strong><span>Projetos progressivos para transformar teoria em evidência.</span></a></div>`;
    $('.hero').insertAdjacentElement('afterend',section);
  }

  function addKnowledgeContext(){
    const parts=route();
    if(parts[0]!=='theme'||!parts[1]||$('.knowledge-context'))return;
    const id=parts[1];
    const current=links[id];
    const header=$('.theme-header');
    if(!current||!header)return;
    const edges=graph[id]||{};
    const before=links[edges.before];
    const after=links[edges.after];
    const block=document.createElement('aside');
    block.className='knowledge-context';
    block.setAttribute('aria-label','Contexto do tema no mapa de conhecimento');
    block.innerHTML=`<div class="knowledge-context__path"><span>Você está aqui</span><span>›</span><a href="#/themes">Mapa temático</a><span>›</span><strong>${current.label}</strong></div><div class="knowledge-context__grid"><div><span>Base útil</span>${before?`<a href="${before.href}">${before.label} →</a>`:'<a href="#/themes">Escolha conforme a necessidade →</a>'}</div><div><span>Continue depois</span>${after?`<a href="${after.href}">${after.label} →</a>`:'<a href="#/projects">Aplique em um projeto →</a>'}</div></div>`;
    header.insertAdjacentElement('afterend',block);
  }

  function markCurrentNav(){
    const parts=route();
    document.querySelectorAll('#topNav a').forEach(link=>link.removeAttribute('aria-current'));
    let selector='a[href="#/"]';
    if(parts[0]==='themes'||parts[0]==='theme')selector='a[href="#/themes"]';
    else if(parts[0]==='projects')selector='a[href="#/projects"]';
    else if(parts[0]==='method')selector='a[href="#/method"]';
    const current=$(`#topNav ${selector}`);
    if(current)current.setAttribute('aria-current','page');
  }

  function enhance(){
    addOnboarding();
    addKnowledgeContext();
    markCurrentNav();
  }

  const observer=new MutationObserver(()=>queueMicrotask(enhance));
  const app=$('#app');
  if(app)observer.observe(app,{childList:true,subtree:false});
  addEventListener('hashchange',()=>setTimeout(enhance,0));
  addEventListener('DOMContentLoaded',enhance);
  setTimeout(enhance,0);
})();
