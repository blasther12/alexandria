(() => {
  const LESSONS = {
    'fundamentos:0': {
      title: 'Bits, inteiros, overflow e ponto flutuante',
      intro: 'Computadores não guardam “números” de forma abstrata. Eles guardam padrões de bits dentro de uma largura finita. A forma como esses bits são interpretados determina quais valores cabem, como valores negativos são representados e o que acontece quando o resultado ultrapassa o limite.',
      exampleTitle: 'Um exemplo que revela o problema',
      example: [
        'Com 8 bits sem sinal, existem 256 combinações possíveis: de 0 até 255.',
        'Com 8 bits com sinal em complemento de dois, o intervalo típico é de -128 até 127.',
        'Se uma operação produz um valor fora desse intervalo, o comportamento depende da linguagem e do tipo: pode ocorrer wraparound, erro, saturação ou promoção para outro tipo.',
        'Ponto flutuante é outro problema: muitos números decimais não possuem representação binária exata.'
      ],
      code: `print(0.1 + 0.2)\nprint((0.1 + 0.2) == 0.3)\n# Em Python, o primeiro valor é aproximadamente 0.30000000000000004`,
      why: [
        'IDs, contadores, timestamps e valores vindos de sistemas externos podem ultrapassar limites de tipos fixos.',
        'Dinheiro exige regra explícita de precisão e arredondamento. “Usar float” sem pensar no domínio costuma gerar centavos fantasmas.',
        'Protocolos e bancos persistem uma representação concreta. Trocar largura ou interpretação pode quebrar compatibilidade.'
      ],
      mechanism: [
        'Um bit representa dois estados. N bits permitem 2^N combinações.',
        'O tipo define como essas combinações são interpretadas: inteiro sem sinal, inteiro com sinal, ponto flutuante, flags etc.',
        'Inteiros de largura fixa têm mínimo e máximo. Overflow acontece quando o resultado matemático fica fora desse conjunto.',
        'IEEE 754 representa ponto flutuante com sinal, expoente e fração. Isso dá grande faixa de valores, mas introduz aproximação.',
        'Por isso, comparar floats por igualdade exata e acumular valores monetários sem estratégia decimal pode ser incorreto.'
      ],
      practice: [
        'Converta 13, 42 e 255 para binário e descubra quantos bits são necessários.',
        'Pesquise qual é o intervalo de int32 e int64 na linguagem que você usa.',
        'Execute o exemplo de 0.1 + 0.2 e explique por que o resultado não é exatamente 0.3.'
      ],
      mistakes: [
        'Assumir que “inteiro” tem o mesmo tamanho em qualquer linguagem, protocolo ou banco.',
        'Achar que overflow sempre lança erro. O comportamento varia.',
        'Usar ponto flutuante para dinheiro sem definir escala, arredondamento e tolerância.'
      ]
    },
    'fundamentos:1': {
      title: 'Unicode, UTF-8 e representação de texto',
      intro: 'Texto também vira bytes, mas “caractere” não significa uma unidade única. Unicode define pontos de código; UTF-8 define como esses pontos viram bytes; e o que uma pessoa enxerga como um único símbolo pode ser formado por vários pontos de código.',
      exampleTitle: 'A palavra “tamanho” é ambígua',
      example: [
        'A letra A ocupa 1 byte em UTF-8.',
        'A letra á normalmente ocupa mais de 1 byte.',
        'Um emoji pode ocupar 4 bytes.',
        'Alguns emojis visuais são combinações de vários code points ligados por caracteres especiais.'
      ],
      code: `values = ["a", "á", "🙂", "👨‍👩‍👧‍👦"]\nfor value in values:\n    print(value, "len=", len(value), "bytes=", len(value.encode("utf-8")))`,
      why: [
        'Cortar strings por byte pode produzir UTF-8 inválido.',
        'Limites de banco ou APIs em bytes não equivalem a “quantidade de caracteres”.',
        'Busca, ordenação e comparação podem ser afetadas por normalização Unicode.'
      ],
      mechanism: [
        'Unicode atribui um número a cada code point.',
        'UTF-8 codifica cada code point usando de 1 a 4 bytes.',
        'Grapheme cluster é o que o usuário percebe como um símbolo. Ele pode conter mais de um code point.',
        'Normalização permite que sequências visualmente iguais tenham representações internas diferentes.',
        'Uma API precisa deixar claro se limites são medidos em bytes, code points ou graphemes.'
      ],
      practice: [
        'Compare len() e o número de bytes UTF-8 das strings do exemplo.',
        'Tente cortar um emoji complexo em posições intermediárias e observe o resultado.',
        'Pesquise NFC e NFD e encontre duas strings visualmente iguais com bytes diferentes.'
      ],
      mistakes: [
        'Confundir byte, code point e caractere visível.',
        'Assumir que uma posição em string corresponde sempre a um símbolo.',
        'Ignorar normalização ao comparar dados vindos de fontes diferentes.'
      ]
    },
    'fundamentos:2': {
      title: 'Arrays, hash tables, árvores, heaps e invariantes',
      intro: 'Estruturas de dados são formas diferentes de organizar informação para favorecer certas operações. Nenhuma é “melhor” em absoluto. A escolha depende do que você faz com os dados: acessar por posição, procurar por chave, manter ordenação, obter o menor valor ou percorrer relações.',
      exampleTitle: 'A mesma coleção, custos diferentes',
      example: [
        'Um array contíguo favorece acesso por índice e leitura sequencial.',
        'Uma hash table favorece lookup por chave, pagando memória extra e custo de hashing.',
        'Uma árvore balanceada mantém ordenação e facilita range queries.',
        'Uma heap é excelente para obter mínimo ou máximo repetidamente, mas não foi feita para busca arbitrária.'
      ],
      why: [
        'Big O não mostra locality, alocação, colisões, cache misses ou constantes.',
        'A estrutura errada pode transformar um caminho simples em gargalo de CPU ou memória.',
        'Invariantes ajudam a entender por que os algoritmos de inserção e remoção existem.'
      ],
      mechanism: [
        'Array armazena elementos próximos em memória, favorecendo cache locality.',
        'Hash table transforma chave em posição e precisa resolver colisões.',
        'Árvores balanceadas mantêm uma propriedade estrutural para evitar degeneração.',
        'Heap mantém a relação pai-filho necessária para que o topo seja mínimo ou máximo.',
        'A operação dominante deve guiar a escolha: lookup, range, append, delete, prioridade ou travessia.'
      ],
      practice: [
        'Implemente lookup de 100 mil itens com lista e dicionário/map e compare.',
        'Desenhe a invariante de uma min-heap após inserir 5, 3, 8 e 1.',
        'Explique por que um array pequeno pode vencer uma árvore mesmo com pior Big O.'
      ],
      mistakes: [
        'Escolher estrutura apenas pelo Big O de uma única operação.',
        'Ignorar consumo de memória e locality.',
        'Usar uma estrutura sem saber qual propriedade precisa permanecer verdadeira.'
      ]
    },
    'fundamentos:3': {
      title: 'CPU, registradores, cache locality e branch prediction',
      intro: 'A CPU executa instruções muito mais rápido do que a memória principal consegue fornecer dados. Por isso existe uma hierarquia de registradores e caches. Muitas diferenças de performance vêm menos da operação matemática e mais de onde os dados estão e de quão previsível é o fluxo de execução.',
      exampleTitle: 'Dois loops O(n) podem ter custos muito diferentes',
      example: [
        'Percorrer um array contíguo costuma aproveitar cache lines e prefetching.',
        'Percorrer objetos espalhados por ponteiros pode causar mais cache misses.',
        'Branches imprevisíveis podem fazer a CPU descartar trabalho especulativo.'
      ],
      why: [
        'Ajuda a explicar por que a mesma complexidade assintótica produz latências diferentes.',
        'Evita micro-otimização supersticiosa: primeiro medimos, depois mexemos.',
        'É base para entender profiling, vectorization, layout de dados e runtimes.'
      ],
      mechanism: [
        'Registradores ficam dentro da CPU e são extremamente rápidos.',
        'Caches L1/L2/L3 mantêm cópias de dados usados recentemente.',
        'Um cache miss força a CPU a esperar níveis mais lentos da hierarquia.',
        'Cache locality melhora quando acessos próximos no tempo também estão próximos na memória.',
        'Branch prediction tenta adivinhar o próximo caminho para manter o pipeline ocupado.'
      ],
      practice: [
        'Compare acesso sequencial e acesso aleatório em um array grande.',
        'Use um profiler antes de tentar otimizar um hot path.',
        'Explique por que “CPU alta” não diz sozinho qual recurso está limitando o programa.'
      ],
      mistakes: [
        'Otimizar branch prediction sem evidência.',
        'Ignorar layout de memória ao comparar estruturas.',
        'Confundir tempo de CPU com tempo total de uma operação.'
      ]
    },
    'fundamentos:4': {
      title: 'Stack, heap, GC e tempo de vida',
      intro: 'Programas precisam guardar dados enquanto executam. A stack acompanha chamadas e dados ligados a frames de execução. O heap guarda objetos cujo tempo de vida é mais flexível. Em runtimes com garbage collector, memória é recuperada quando objetos deixam de ser alcançáveis.',
      exampleTitle: 'Memória alta não significa automaticamente leak',
      example: [
        'Um runtime pode reservar arenas e mantê-las para reutilização.',
        'Um leak lógico acontece quando objetos continuam alcançáveis mesmo sem utilidade.',
        'Dois processos com o mesmo heap útil podem apresentar RSS diferente por causa do allocator e do runtime.'
      ],
      why: [
        'É essencial para diagnosticar crescimento de memória.',
        'Ajuda a entender pausas de GC, alocação excessiva e retenção.',
        'Explica por que ownership e lifecycle também são decisões de design.'
      ],
      mechanism: [
        'Cada chamada cria um frame com estado local na stack, dependendo do runtime.',
        'Objetos que precisam sobreviver à chamada geralmente vivem no heap ou em estruturas equivalentes.',
        'GC parte de roots e identifica objetos alcançáveis.',
        'Objeto alcançável não é coletado, mesmo que a aplicação já não precise dele.',
        'Diagnóstico de memória exige observar alocação, retenção e evolução ao longo do tempo.'
      ],
      practice: [
        'Desenhe os frames de uma função que chama outra função.',
        'Crie uma coleção global que cresce indefinidamente e observe a memória.',
        'Compare heap profile em dois instantes para identificar tipos retidos.'
      ],
      mistakes: [
        'Chamar todo crescimento de RSS de memory leak.',
        'Criar caches sem limite ou política de expiração.',
        'Medir apenas memória total sem descobrir quem retém os objetos.'
      ]
    },
    'fundamentos:5': {
      title: 'Processos, threads, scheduler e contenção',
      intro: 'Processos isolam espaço de memória e recursos. Threads compartilham boa parte desse estado e podem executar concorrentemente. O scheduler decide quais threads recebem CPU. Mais concorrência só ajuda enquanto existe capacidade e o trabalho não passa a disputar os mesmos recursos.',
      exampleTitle: 'Dobrar threads pode piorar throughput',
      example: [
        'Mais threads aumentam context switches.',
        'Locks muito disputados fazem várias threads esperarem.',
        'Dependências externas podem saturar antes da CPU.',
        'Filas maiores aumentam latência mesmo quando o throughput não cresce.'
      ],
      why: [
        'Evita o reflexo “está lento, aumente workers”.',
        'É base para pools, executores, runtimes assíncronos e servidores web.',
        'Ajuda a distinguir concorrência de paralelismo.'
      ],
      mechanism: [
        'Processos possuem espaço de endereços separado.',
        'Threads do mesmo processo compartilham memória e recursos.',
        'Scheduler alterna execução conforme prioridade, disponibilidade e política do SO.',
        'Context switch tem custo e afeta caches.',
        'Contenção aparece quando várias unidades de execução competem por lock, CPU, conexão ou outro recurso finito.'
      ],
      practice: [
        'Observe processos e threads de um serviço local.',
        'Aumente o número de workers e meça throughput e p99.',
        'Identifique qual recurso satura primeiro: CPU, lock, pool, banco ou rede.'
      ],
      mistakes: [
        'Confundir concorrência com paralelismo.',
        'Aumentar workers sem backpressure.',
        'Medir apenas CPU e ignorar tempo de espera e filas.'
      ]
    },
    'fundamentos:6': {
      title: 'Syscalls, file descriptors, I/O e memória virtual',
      intro: 'Aplicações comuns rodam em user space e pedem serviços ao kernel por system calls. Arquivos, sockets e pipes são frequentemente representados por file descriptors. Ao mesmo tempo, o processo enxerga endereços virtuais que o sistema operacional mapeia para memória física.',
      exampleTitle: 'Um serviço pode ter CPU livre e ainda parar',
      example: [
        'Cada conexão TCP aberta normalmente consome um file descriptor.',
        'Se o processo atingir o limite de FDs, novas conexões podem falhar mesmo com CPU e memória disponíveis.',
        'Page faults e pressão de memória também podem aumentar latência sem aparecer como “código lento”.'
      ],
      why: [
        'Explica incidentes de socket, arquivo, pool e limites do kernel.',
        'Ajuda a entender event loops e I/O assíncrono.',
        'É base para containers, cgroups, page cache e OOM.'
      ],
      mechanism: [
        'Syscall cruza a fronteira entre aplicação e kernel.',
        'File descriptor é um identificador para recurso aberto pelo processo.',
        'I/O bloqueante prende a thread até progresso; não bloqueante/assíncrono muda como a espera é organizada.',
        'Memória virtual dá a cada processo seu próprio espaço de endereços.',
        'O kernel mapeia páginas virtuais para memória física e controla faults, cache e pressão.'
      ],
      practice: [
        'Use lsof ou /proc para observar FDs de um processo.',
        'Abra várias conexões e acompanhe o número de sockets.',
        'Pesquise o limite de file descriptors do seu sistema e o que ocorre ao atingi-lo.'
      ],
      mistakes: [
        'Achar que async torna I/O gratuito.',
        'Não fechar arquivos, sockets ou respostas HTTP.',
        'Ignorar limites do SO durante troubleshooting.'
      ]
    },
    'fundamentos:7': {
      title: 'DNS, TCP/QUIC, TLS e HTTP',
      intro: 'Uma requisição HTTPS não é uma única operação. Antes de receber a resposta, o cliente pode precisar descobrir um endereço, estabelecer transporte, negociar segurança, enviar HTTP, esperar filas e dependências e só então receber os bytes de volta.',
      exampleTitle: 'Decomponha uma chamada de 800 ms',
      example: [
        'DNS pode levar parte do tempo.',
        'Criar conexão e negociar TLS adiciona round trips quando não existe conexão reutilizável.',
        'O gateway pode enfileirar a requisição.',
        'O serviço pode chamar banco e outros serviços antes de responder.'
      ],
      why: [
        'Permite localizar latência em vez de culpar “a rede”.',
        'Ajuda a entender keep-alive, connection pooling, HTTP/2, HTTP/3 e QUIC.',
        'Mostra por que retries em várias camadas podem amplificar uma falha.'
      ],
      mechanism: [
        'DNS resolve nome para endereço.',
        'TCP estabelece um fluxo confiável; QUIC fornece transporte sobre UDP com mecanismos próprios.',
        'TLS autentica e negocia criptografia.',
        'HTTP descreve semântica de request/response sobre o transporte.',
        'A latência percebida é a soma de etapas, filas, processamento e dependências.'
      ],
      practice: [
        'Use curl -v para observar conexão e TLS.',
        'Use dig/nslookup para inspecionar DNS.',
        'Desenhe o caminho de uma request da sua aplicação até o banco.'
      ],
      mistakes: [
        'Chamar toda latência de “problema de rede”.',
        'Configurar timeout interno maior que o deadline do cliente.',
        'Empilhar retries em cliente, gateway e serviço.'
      ]
    },
    'fundamentos:8': {
      title: 'p50, p95, p99, Little’s Law e saturação',
      intro: 'Média esconde a cauda. Percentis mostram quanto tempo a maioria e os casos mais lentos estão levando. Quando um sistema se aproxima da saturação, filas começam a crescer e a latência pode disparar antes mesmo de o throughput cair.',
      exampleTitle: '1000 req/s × 200 ms ≈ 200 requests concorrentes',
      example: [
        'Little’s Law relaciona itens no sistema (L), taxa de chegada (λ) e tempo médio (W): L = λ × W.',
        'Se chegam 1000 req/s e cada uma permanece 0,2 s no sistema, há cerca de 200 requests simultâneas em média.',
        'Esse número ajuda a dimensionar pools, conexões e memória.'
      ],
      why: [
        'p99 costuma revelar fila, GC, cache miss ou dependência lenta que a média apaga.',
        'Fan-out aumenta a chance de uma requisição depender de pelo menos uma chamada lenta.',
        'Saturação exige limite e overload policy, não apenas mais fila.'
      ],
      mechanism: [
        'p50 é a mediana: metade das observações fica abaixo desse valor.',
        'p95 e p99 olham para a cauda da distribuição.',
        'Quando a taxa de chegada se aproxima da capacidade de serviço, espera em fila cresce.',
        'Mais concorrência pode aumentar throughput até o ponto em que contenção e fila passam a dominar.',
        'Depois do ponto de joelho, retries e context switches podem piorar ainda mais o sistema.'
      ],
      practice: [
        'Calcule concorrência estimada com Little’s Law para um serviço que você conhece.',
        'Compare média, p50 e p99 em uma distribuição com alguns outliers.',
        'Faça um teste de carga crescente e encontre o ponto em que a latência começa a subir de forma não linear.'
      ],
      mistakes: [
        'Usar apenas média para representar experiência do usuário.',
        'Aumentar filas indefinidamente.',
        'Tratar CPU 100% como diagnóstico completo.'
      ]
    },
    'fundamentos:9': {
      title: 'Profiling, capacity planning e modos de falha',
      intro: 'Performance não se investiga por palpite. Primeiro você define o sintoma, reproduz a carga, encontra o recurso limitante e formula uma hipótese. Profiling mostra onde tempo ou memória estão sendo consumidos; capacity planning transforma demanda futura em números aproximados.',
      exampleTitle: '“Está lento” precisa virar uma pergunta mensurável',
      example: [
        'Qual percentil piorou?',
        'A CPU está executando trabalho ou esperando?',
        'Existe fila em conexão, thread pool, event loop ou banco?',
        'Quanto tráfego o sistema suporta antes de violar o SLO?'
      ],
      why: [
        'Evita otimizar código que não está no caminho crítico.',
        'Ajuda a planejar capacidade com margem antes de incidentes.',
        'Conecta falhas como leak, pool esgotado, retry storm e event-loop lag a evidências observáveis.'
      ],
      mechanism: [
        'CPU profile mostra onde o processador gasta tempo.',
        'Heap profile ajuda a encontrar alocações e retenções.',
        'Tracing mostra espera entre componentes e dependências.',
        'Teste de carga revela comportamento à medida que demanda aumenta.',
        'Capacity planning estima taxa, tamanho, concorrência, retenção e crescimento para descobrir limites futuros.'
      ],
      practice: [
        'Escolha um serviço e escreva três hipóteses para um p99 alto.',
        'Para cada hipótese, liste a evidência que poderia confirmá-la ou refutá-la.',
        'Estime bytes/dia para 5000 eventos/s de 2 KB antes de replicação e índices.'
      ],
      mistakes: [
        'Mudar várias coisas ao mesmo tempo e perder o baseline.',
        'Usar microbenchmark como prova de melhora em produção.',
        'Escalar infraestrutura sem localizar a fila ou o recurso saturado.'
      ]
    }
  };

  const escapeHtml = value => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const route = () => location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);

  function list(items) {
    return `<ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  }

  function section(label, title, body, className = '') {
    return `<section class="clarity-section ${className}">
      <div class="eyebrow">${escapeHtml(label)}</div>
      <h2>${escapeHtml(title)}</h2>
      ${body}
    </section>`;
  }

  function renderLesson(lesson) {
    const intro = section(
      'Comece aqui',
      'O que isso significa?',
      `<p class="clarity-intro">${escapeHtml(lesson.intro)}</p>`
    );

    const example = section(
      'Exemplo concreto',
      lesson.exampleTitle,
      `${list(lesson.example)}${lesson.code ? `<pre class="clarity-code"><code>${escapeHtml(lesson.code)}</code></pre>` : ''}`,
      'clarity-example'
    );

    const why = section(
      'Por que importa',
      'Onde isso aparece na engenharia?',
      list(lesson.why)
    );

    const mechanism = section(
      'Como funciona',
      'Agora desça um nível',
      list(lesson.mechanism)
    );

    const practice = section(
      'Teste você mesmo',
      'Transforme a ideia em evidência',
      list(lesson.practice),
      'clarity-practice'
    );

    const mistakes = `<details class="clarity-details">
      <summary>Erros comuns e armadilhas</summary>
      <div class="clarity-details-body">${list(lesson.mistakes)}</div>
    </details>`;

    return `<article class="clarity-lesson">${intro}${example}${why}${mechanism}${practice}${mistakes}</article>`;
  }

  function simplifyTheme() {
    const p = route();
    if (p[0] !== 'theme') return;
    document.body.classList.remove('reading-mode');
    document.querySelectorAll('.topic-toggle').forEach(button => {
      button.hidden = true;
      button.setAttribute('aria-hidden', 'true');
    });
    document.querySelectorAll('.topic-detail').forEach(detail => {
      detail.hidden = true;
      detail.setAttribute('aria-hidden', 'true');
    });
    document.querySelectorAll('.chapter-link').forEach(link => {
      if (!link.dataset.clarityLabel) {
        link.textContent = 'Abrir aula →';
        link.dataset.clarityLabel = 'true';
      }
    });
  }

  function simplifyGenericChapter() {
    const sections = [...document.querySelectorAll('.chapter-layout main > .chapter-section')];
    if (!sections.length) return;

    const internals = sections.find(node => node.querySelector('.eyebrow')?.textContent.trim().toLowerCase() === 'internals');
    if (internals && !internals.dataset.clarityGeneric) {
      internals.dataset.clarityGeneric = 'true';
      const eyebrow = internals.querySelector('.eyebrow');
      const title = internals.querySelector('h2');
      if (eyebrow) eyebrow.textContent = 'Explicação';
      if (title) title.textContent = 'Como isso funciona';
    }

    sections.forEach(sectionNode => {
      const label = sectionNode.querySelector('.eyebrow')?.textContent.trim().toLowerCase();
      if (['diagrama', 'failure modes', 'autoavaliação'].includes(label)) {
        sectionNode.classList.add('clarity-secondary');
      }
    });
  }

  function enhanceChapter() {
    const p = route();
    if (p[0] !== 'chapter' || !p[1] || p[2] == null) {
      document.body.classList.remove('reading-mode');
      return;
    }

    document.body.classList.add('reading-mode');
    const lesson = LESSONS[`${p[1]}:${p[2]}`];
    const main = document.querySelector('.chapter-layout main');
    const hero = document.querySelector('.chapter-hero');
    if (!main || !hero) return;

    if (!lesson) {
      simplifyGenericChapter();
      return;
    }

    if (main.dataset.clarityLesson === `${p[1]}:${p[2]}`) return;

    const pager = main.querySelector('.chapter-pager')?.outerHTML || '';
    main.innerHTML = renderLesson(lesson) + pager;
    main.dataset.clarityLesson = `${p[1]}:${p[2]}`;

    const lead = hero.querySelector('.lead');
    if (lead) lead.textContent = lesson.intro;

    const heading = hero.querySelector('h1');
    if (heading) heading.textContent = lesson.title;
  }

  function refresh() {
    const p = route();
    if (p[0] === 'theme') simplifyTheme();
    else if (p[0] === 'chapter') enhanceChapter();
    else document.body.classList.remove('reading-mode');
  }

  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      refresh();
    });
  };

  window.addEventListener('hashchange', schedule);
  window.addEventListener('load', schedule);
  new MutationObserver(schedule).observe(document.getElementById('app') || document.body, {
    childList: true,
    subtree: true
  });
  schedule();
})();
