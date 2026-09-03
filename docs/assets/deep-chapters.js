(() => {
  const app = document.getElementById('app');
  if (!app) return;

  const esc = value => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const route = () => {
    const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    if (parts[0] !== 'chapter' || !parts[1] || parts[2] == null) return null;
    const index = Number(parts[2]);
    return Number.isInteger(index) && index >= 0
      ? { themeId: parts[1], index, key: `${parts[1]}:${index}` }
      : null;
  };

  const dataReady = () => {
    try { return typeof state !== 'undefined' && Array.isArray(state?.data?.themes); }
    catch { return false; }
  };

  const themeById = id => dataReady() ? state.data.themes.find(theme => theme.id === id) : null;

  const guideFor = (theme, index) => {
    try { return typeof topicGuide === 'function' ? topicGuide(theme, index) : {}; }
    catch { return {}; }
  };

  const splitTopic = topic => String(topic || '')
    .split(/[:,;/]|\be\b|\bversus\b|\bvs\.?\b|\+/i)
    .map(part => part.trim())
    .filter(part => part.length > 2);

  const normalizeSentence = text => {
    const value = String(text || '').trim();
    if (!value) return '';
    return /[.!?]$/.test(value) ? value : `${value}.`;
  };

  let configPromise;
  const loadConfig = () => {
    if (!configPromise) {
      configPromise = fetch('./chapter-depth.json', { cache: 'no-store' })
        .then(response => {
          if (!response.ok) throw new Error(`chapter-depth.json: HTTP ${response.status}`);
          return response.json();
        });
    }
    return configPromise;
  };

  function narrative(theme, topic, guide, cfg) {
    const parts = splitTopic(topic);
    const first = parts[0] || topic;
    const second = parts[1] || null;
    const why = guide.why || `O primeiro passo é definir qual problema concreto “${first}” resolve.`;
    const mechanism = guide.mechanism || cfg.mechanism;
    return [
      `Este capítulo deve ser lido pela lente de ${cfg.lens}. Reconhecer o termo é apenas o ponto de partida. A meta é conseguir reconstruir o mecanismo, prever custos e explicar o comportamento quando alguma suposição deixa de ser verdadeira.`,
      normalizeSentence(why),
      `${normalizeSentence(mechanism)} Faça a explicação atravessar entrada, estado, transformação, efeito observável e recovery. Se ela termina no nome de uma ferramenta, ainda existe uma abstração escondendo a parte importante.`,
      second
        ? `“${first}” e “${second}” aparecem juntos no título, mas não devem ser tratados como sinônimos. Separe a responsabilidade de cada um e identifique em qual fronteira eles interagem. Essa distinção costuma revelar trade-offs que desaparecem em explicações curtas.`
        : `Depois de entender o mecanismo principal, compare uma alternativa real. Pergunte qual restrição muda a decisão: latência, throughput, consistência, segurança, memória, custo, simplicidade operacional ou velocidade de mudança.`
    ];
  }

  function mechanismSteps(topic, guide, cfg) {
    return [
      ['01 · Entrada e contrato', `O que entra em “${topic}”? Defina dado, evento, request, instrução ou intenção e explicite pré-condições. Sem contrato claro, é impossível distinguir erro de entrada de erro do mecanismo.`],
      ['02 · Estado e ownership', 'Localize o estado consultado ou alterado. Quem é o owner? Quanto tempo ele vive? Outra execução pode alterá-lo ao mesmo tempo? Existe estado derivado ou cache que pode ficar defasado?'],
      ['03 · Transformação', normalizeSentence(guide.mechanism || cfg.mechanism)],
      ['04 · Efeito observável', 'Defina o que muda externamente quando o mecanismo funciona. Pode ser estado persistido, bytes enviados, tarefa concluída, decisão tomada, recurso alocado ou redução de uma incerteza.'],
      ['05 · Custo e escala', 'Identifique qual recurso cresce com volume ou concorrência. Considere CPU, memória, I/O, rede, locks, filas, serialização, cardinalidade, storage, tokens ou complexidade humana conforme o domínio.'],
      ['06 · Falha e recovery', `Provoque um cenário como ${cfg.failure}. Explique detecção, contenção e recuperação. Em sistemas reais, o desenho não termina no happy path.`]
    ];
  }

  function tradeoffRows(topic) {
    const pieces = splitTopic(topic);
    const primary = pieces[0] || topic;
    const alternative = pieces[1] || 'uma alternativa mais simples';
    return [
      ['Problema', `Que problema exige ${primary}?`, `Em que cenário ${alternative} resolve o suficiente?`],
      ['Garantia', 'Que propriedade precisa continuar verdadeira?', 'Qual garantia pode ser relaxada sem quebrar o domínio?'],
      ['Estado', 'Onde fica o estado e quem coordena mudanças?', 'É possível reduzir compartilhamento, sincronização ou duplicação?'],
      ['Escala', 'Qual recurso satura primeiro?', 'O gargalo muda com volume, cardinalidade ou concorrência?'],
      ['Falha', 'Como o mecanismo falha e recupera?', 'A alternativa reduz a superfície de falha ou apenas a desloca?'],
      ['Operação', 'Como diagnosticar e reverter em produção?', 'Qual opção é mais fácil de testar, observar e manter pela equipe?']
    ];
  }

  function investigationSteps(theme, topic, guide, cfg) {
    const decision = theme.decisions?.[theme.focus.indexOf(topic) % (theme.decisions?.length || 1)] || 'Compare uma alternativa e registre o trade-off.';
    const lab = guide.lab || theme.labs?.[theme.focus.indexOf(topic) % (theme.labs?.length || 1)] || `Crie um experimento mínimo para “${topic}”.`;
    return [
      ['Hipótese', `Escreva uma frase causal antes de abrir a ferramenta: “Se X estiver limitando ${topic}, então ao alterar Y devo observar Z”.`],
      ['Baseline', 'Registre o comportamento antes da mudança. Sem baseline, qualquer melhora vira impressão e qualquer regressão pode passar despercebida.'],
      ['Experimento', lab],
      ['Falha deliberada', `Introduza uma condição ligada a ${cfg.failure}. Preserve logs, métricas, traces, perfis ou resultados suficientes para explicar o que ocorreu.`],
      ['Decisão', decision]
    ];
  }

  function connectionCards(theme, index) {
    const items = [];
    if (index > 0) items.push({ label: 'Base anterior', index: index - 1, title: theme.focus[index - 1] });
    if (index < theme.focus.length - 1) items.push({ label: 'Próxima conexão', index: index + 1, title: theme.focus[index + 1] });
    if (theme.focus.length > 3) {
      const anchor = index < Math.floor(theme.focus.length / 2) ? theme.focus.length - 1 : 0;
      if (anchor !== index && !items.some(item => item.index === anchor)) {
        items.push({ label: 'Conecte também', index: anchor, title: theme.focus[anchor] });
      }
    }
    return items;
  }

  function buildSection(theme, index, topic, guide, cfg) {
    const paragraphs = narrative(theme, topic, guide, cfg);
    const steps = mechanismSteps(topic, guide, cfg);
    const tradeoffs = tradeoffRows(topic);
    const investigation = investigationSteps(theme, topic, guide, cfg);
    const connections = connectionCards(theme, index);
    const expectedEvidence = guide.evidence || cfg.evidence;
    const pitfall = guide.pitfall || cfg.failure;

    const wrapper = document.createElement('div');
    wrapper.dataset.globalDeepening = `${theme.id}:${index}`;
    wrapper.innerHTML = `
      <section class="chapter-section deep-chapter-section">
        <div class="eyebrow">Modelo mental</div>
        <h2>Entenda antes de decorar</h2>
        ${paragraphs.map(paragraph => `<p>${esc(paragraph)}</p>`).join('')}
        <div class="deep-callout"><strong>Pergunta-guia</strong><span>Se você remover o nome da tecnologia, ainda consegue explicar o fluxo, o estado e o que acontece quando uma hipótese falha?</span></div>
      </section>

      <section class="chapter-section deep-chapter-section">
        <div class="eyebrow">Mecanismo em camadas</div>
        <h2>Siga o fluxo do início ao recovery</h2>
        <p>Use estas seis camadas para desmontar a abstração. Elas servem tanto para explicar o conceito quanto para investigar uma implementação real.</p>
        <div class="deep-step-grid">${steps.map(([title, text]) => `<article><strong>${esc(title)}</strong><p>${esc(text)}</p></article>`).join('')}</div>
      </section>

      <section class="chapter-section deep-chapter-section">
        <div class="eyebrow">Exemplo trabalhado</div>
        <h2>Leve o conceito para um sistema real</h2>
        <p>${esc(cfg.workedExample)}</p>
        <p>Agora aplique o mesmo raciocínio especificamente a <strong>${esc(topic)}</strong>. Mude uma variável por vez e não conclua pela correlação: procure um mecanismo que explique por que a métrica se moveu.</p>
        <div class="deep-signal-grid">${cfg.signals.map(signal => `<span>${esc(signal)}</span>`).join('')}</div>
        <p class="deep-caption">Sinais de partida. A implementação e o ambiente podem exigir métricas adicionais.</p>
      </section>

      <section class="chapter-section deep-chapter-section">
        <div class="eyebrow">Trade-offs</div>
        <h2>Compare pela restrição, não pela preferência</h2>
        <p>Uma boa decisão técnica não termina em “depende”. Ela explica <em>de quê</em> depende e qual evidência faria a escolha mudar.</p>
        <div class="deep-table-wrap"><table class="deep-table"><thead><tr><th>Dimensão</th><th>Pergunta para o mecanismo</th><th>Pergunta para a alternativa</th></tr></thead><tbody>${tradeoffs.map(row => `<tr>${row.map(cell => `<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
      </section>

      <section class="chapter-section deep-chapter-section">
        <div class="eyebrow">Investigação guiada</div>
        <h2>Transforme entendimento em evidência</h2>
        <div class="deep-investigation">${investigation.map(([title, text]) => `<article><strong>${esc(title)}</strong><p>${esc(text)}</p></article>`).join('')}</div>
        <div class="deep-callout"><strong>Evidência esperada</strong><span>${esc(expectedEvidence)}</span></div>
        <div class="deep-callout deep-callout--danger"><strong>Failure mode para explorar</strong><span>${esc(pitfall)}</span></div>
      </section>

      ${connections.length ? `<section class="chapter-section deep-chapter-section"><div class="eyebrow">Mapa de conhecimento</div><h2>Conecte este capítulo ao restante do tema</h2><p>O entendimento fica mais forte quando você consegue explicar como conceitos vizinhos alteram as mesmas decisões.</p><div class="deep-connections">${connections.map(item => `<a href="#/chapter/${esc(theme.id)}/${item.index}"><span>${esc(item.label)}</span><strong>${esc(item.title)}</strong></a>`).join('')}</div></section>` : ''}
    `;
    return wrapper;
  }

  async function deepen() {
    const current = route();
    if (!current || !dataReady()) return;
    if (current.key === 'fundamentos:3') return; // possui capítulo dedicado de microarquitetura ainda mais profundo.

    const theme = themeById(current.themeId);
    const topic = theme?.focus?.[current.index];
    const main = app.querySelector('.chapter-layout main');
    if (!theme || !topic || !main) return;
    if (main.querySelector(`[data-global-deepening="${CSS.escape(current.key)}"]`)) return;

    let config;
    try { config = await loadConfig(); }
    catch (error) { console.error('Alexandria: não foi possível carregar profundidade dos capítulos.', error); return; }

    if (route()?.key !== current.key) return;
    const themeConfig = config?.themes?.[theme.id];
    if (!themeConfig) {
      console.error(`Alexandria: tema sem contrato de profundidade: ${theme.id}`);
      return;
    }

    const guide = guideFor(theme, current.index);
    const section = buildSection(theme, current.index, topic, guide, themeConfig);
    main.insertBefore(section, main.firstChild);
  }

  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      deepen();
    });
  };

  new MutationObserver(schedule).observe(app, { childList: true, subtree: true });
  addEventListener('hashchange', schedule);
  addEventListener('DOMContentLoaded', schedule);
  setTimeout(schedule, 0);
})();
