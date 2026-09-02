(() => {
  const app = document.getElementById('app');
  if (!app) return;

  const esc = value => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
  const pre = value => esc(value).replaceAll('\n', '<br>');

  const route = () => {
    const p = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    if (p[0] !== 'chapter' || !p[1] || p[2] == null) return null;
    const index = Number(p[2]);
    return Number.isInteger(index) && index >= 0 ? { themeId: p[1], index, key: `${p[1]}:${index}` } : null;
  };

  const DEEP_DIVES = [
    {
      match: /python:/i,
      internals: [
        'Modelo de objetos: identidade, tipo, referências, mutabilidade e protocolo de atributos.',
        'CPython combina reference counting com coleta de ciclos; padrões de alocação aparecem em heap e latência.',
        'O GIL serializa bytecode Python em um processo CPython, mas I/O pode progredir enquanto a thread espera.',
        'asyncio usa cooperação. Uma coroutine que não devolve controle bloqueia o event loop.',
        'CPU-bound pede multiprocessing, extensão nativa ou outra estratégia de paralelismo.',
        'Type hints melhoram análise estática, mas dados externos continuam exigindo validação runtime.'
      ],
      diagram: `request\n  │\n  ▼\n[event loop / thread]\n  ├── I/O -> espera cooperativa\n  ├── bytecode -> GIL\n  └── CPU-bound -> bloqueia progresso\n             │\n             ▼\n process pool / native code`,
      code: { lang: 'python', text: `import asyncio\n\nasync def fetch(name: str):\n    await asyncio.sleep(0.2)\n    return name\n\nasync def main():\n    print(await asyncio.gather(fetch("a"), fetch("b")))\n\nasyncio.run(main())` },
      pitfalls: ['Executar função bloqueante dentro do event loop.', 'Usar threads esperando ganho em CPU-bound puro.', 'Confundir type hint com validação runtime.']
    },
    {
      match: /javascript:/i,
      internals: [
        'A aplicação JavaScript executa em uma call stack por isolate.',
        'Promises entram na fila de microtasks, com prioridade diferente de timers e outras fases.',
        'libuv coordena I/O e usa pool de threads em operações específicas.',
        'Streams precisam propagar backpressure para não transformar memória em fila infinita.',
        'CPU intensa aumenta event-loop lag e atrasa todos os requests do mesmo isolate.',
        'Worker Threads são uma opção quando paralelismo real de CPU é necessário.'
      ],
      diagram: `timers / I/O / callbacks\n          │\n          ▼\n      event loop\n       ├── JS stack\n       ├── microtasks\n       └── libuv\n          │\n          ▼\nprogresso global depende de não bloquear JS`,
      code: { lang: 'javascript', text: `import { monitorEventLoopDelay } from 'node:perf_hooks';\n\nconst h = monitorEventLoopDelay();\nh.enable();\nsetInterval(() => {\n  console.log('p99 ms', h.percentile(99) / 1e6);\n  h.reset();\n}, 1000);` },
      pitfalls: ['Fazer parsing ou compressão pesada na thread principal.', 'Criar Promise e assumir paralelismo de CPU.', 'Ignorar backpressure em streams.']
    },
    {
      match: /go:/i,
      internals: [
        'O scheduler do runtime distribui goroutines sobre processors lógicos e threads do sistema operacional.',
        'Goroutines são leves, não gratuitas. Elas consomem stack, scheduler e recursos externos.',
        'Channels coordenam comunicação e ownership, mas mutex pode ser mais direto para estado compartilhado simples.',
        'context propaga cancelamento e deadline por uma árvore de chamadas.',
        'Interfaces são satisfeitas implicitamente e afetam design, escape analysis e alocação.',
        'pprof e runtime metrics revelam CPU, heap, bloqueios e vazamento de goroutines.'
      ],
      diagram: `goroutines G\n │  │  │\n ▼  ▼  ▼\nprocessors P\n    │\n    ▼\nthreads M\n    │\n    ▼\nCPU / syscalls`,
      code: { lang: 'go', text: `ctx, cancel := context.WithTimeout(context.Background(), time.Second)\ndefer cancel()\n\nselect {\ncase result := <-work():\n    fmt.Println(result)\ncase <-ctx.Done():\n    return\n}` },
      pitfalls: ['Criar goroutine por item sem limite.', 'Ignorar ctx.Done em trabalho longo.', 'Usar channel apenas porque existe concorrência.']
    },
    {
      match: /domain-driven|ddd/i,
      internals: [
        'Subdomínio descreve parte do problema; bounded context delimita um modelo e uma linguagem.',
        'Ubiquitous Language reduz traduções implícitas entre negócio e código.',
        'Agregado protege invariantes dentro de uma fronteira transacional deliberada.',
        'Context Map explicita relações e assimetrias entre modelos.',
        'Anti-corruption layer protege um contexto de conceitos externos.',
        'Eventos de domínio expressam fatos relevantes, não qualquer alteração de coluna.'
      ],
      diagram: `[Contexto A]\n modelo + linguagem A\n       │ contrato\n       ▼\n [ACL / integração]\n       │\n       ▼\n[Contexto B]\n modelo + linguagem B`,
      code: { lang: 'text', text: `ScoringContext\n  owns: regras de pontuação\n  publishes: PointsCalculated\n\nWalletContext\n  owns: saldo e lançamentos\n  consumes: PointsCalculated\n\nNão compartilhar modelo interno entre contextos.` },
      pitfalls: ['Confundir tabela ou microsserviço com bounded context.', 'Criar agregados enormes para garantir tudo em uma transação.', 'Aplicar DDD tático onde o domínio é CRUD simples.']
    },
    {
      match: /microserviços|independent deployability/i,
      internals: [
        'Independent deployability exige contratos e dados controlados pelo serviço.',
        'Chamada remota adiciona timeout, retry, latência e falha parcial.',
        'Banco compartilhado mantém acoplamento mesmo quando deploy foi separado.',
        'Ownership organizacional precisa incluir operação e incidentes.',
        'Observabilidade, migração e recovery passam a fazer parte do design.',
        'Monólito modular frequentemente é a etapa certa antes de distribuir.'
      ],
      diagram: `[módulo coeso]\n     │ boundary provado\n     ▼\n[contrato explícito]\n     ├── ownership de dados\n     ├── deploy independente\n     └── operação independente\n     ▼\n[microsserviço]`,
      code: { lang: 'text', text: `Antes de extrair:\n1. Quem é dono do dado?\n2. Qual mudança precisa ser independente?\n3. Qual escala é diferente?\n4. Quem responde pelo incidente?\n5. Como rollback e replay funcionam?` },
      pitfalls: ['Distribuir antes de modularizar.', 'Compartilhar banco e chamar isso de independência.', 'Criar serviços pequenos sem motivo de domínio ou escala.']
    },
    {
      match: /linearizabilidade|serializabilidade|consistência eventual/i,
      internals: [
        'Linearizabilidade preserva uma aparência de ordem compatível com tempo real.',
        'Serializabilidade exige resultado equivalente a alguma execução serial de transações.',
        'Consistência eventual promete convergência quando cessam atualizações, mas precisa de regra de conflito.',
        'Read-your-writes, monotonic reads e causal consistency são garantias intermediárias úteis.',
        'Saldo, carrinho, feed e inventário podem exigir garantias diferentes.',
        'A escolha começa pelo invariante e pela experiência observável, não pelo nome do banco.'
      ],
      diagram: `invariante\n    │\n    ▼\nqual história pode ser observada?\n    ├── tempo real -> linearizabilidade\n    ├── transação -> serializabilidade\n    └── convergência -> eventual/causal`,
      code: { lang: 'text', text: `Saldo não pode ficar negativo:\nconsistência forte na operação crítica pode ser necessária.\n\nFeed social:\nalguns segundos de atraso podem ser aceitáveis.` },
      pitfalls: ['Chamar qualquer consistência não forte de eventual.', 'Confundir serializabilidade com linearizabilidade.', 'Escolher garantia sem declarar o invariante.']
    },
    {
      match: /consensus|raft|fencing/i,
      internals: [
        'Raft separa leader election, log replication e safety.',
        'Termos invalidam líderes antigos e ajudam a manter uma história coerente.',
        'Quorum majoritário permite progresso quando uma maioria continua disponível.',
        'Entradas de log são replicadas antes de serem consideradas committed conforme regras do protocolo.',
        'Fencing token impede que um antigo dono de lock continue escrevendo em recurso externo.',
        'Consensus não torna side effects externos automaticamente atômicos.'
      ],
      diagram: `followers\n   │ votes\n   ▼\nleader term N\n   │ append entries\n   ├──────▶ follower\n   └──────▶ follower\n       maioria ack\n           │\n           ▼\n         commit`,
      code: { lang: 'text', text: `lock token = 42\nnovo líder recebe token = 43\n\nstorage rejeita escrita com token < 43\n=> líder antigo não consegue escrever depois de perder ownership.` },
      pitfalls: ['Usar distributed lock sem fencing.', 'Assumir que consenso elimina partições.', 'Confundir quorum de storage com coordenação de todo workflow.']
    },
    {
      match: /timeout|deadline|retry budget|jitter|circuit breaker/i,
      internals: [
        'Timeout limita uma operação local; deadline expressa o tempo total restante.',
        'Retry só faz sentido para falha potencialmente transitória e efeito seguro ou idempotente.',
        'Exponential backoff espalha tentativas; jitter evita sincronização entre clientes.',
        'Retry budget limita amplificação de carga.',
        'Circuit breaker interrompe chamadas quando há evidência suficiente de falha.',
        'Bulkhead limita propagação de falha por pool, tenant ou dependência.'
      ],
      diagram: `deadline total 1000 ms\n   ├── serviço A 250 ms\n   ├── serviço B 400 ms\n   └── margem / recovery\n\nretry consome o mesmo orçamento`,
      code: { lang: 'text', text: `attempt 1 -> falha transitória\nwait 50ms + jitter\nattempt 2 -> respeita deadline restante\n\nsem tempo restante -> falhar, não repetir` },
      pitfalls: ['Retry em todas as camadas.', 'Timeout maior que deadline do chamador.', 'Circuit breaker sem fallback ou estratégia de recuperação.']
    },
    {
      match: /saga|outbox|inbox|cdc/i,
      internals: [
        'Outbox grava mudança de domínio e evento na mesma transação local.',
        'Publisher lê a outbox e publica aceitando redelivery.',
        'Inbox ou dedup store torna consumo idempotente.',
        'Saga registra passos e compensações de workflow longo.',
        'CDC transporta mudanças da base para um log sem dual write manual.',
        'Compensação é nova ação de negócio, não rollback mágico.'
      ],
      diagram: `DB local\n┌───────────────┐\n│ mudança       │\n│ outbox event  │ <- mesma transação\n└──────┬────────┘\n       ▼\n publisher -> broker -> consumer -> inbox`,
      code: { lang: 'sql', text: `BEGIN;\nUPDATE orders SET status = 'PAID' WHERE id = 123;\nINSERT INTO outbox(type, aggregate_id) VALUES ('OrderPaid', 123);\nCOMMIT;` },
      pitfalls: ['Dual write DB + broker sem coordenação.', 'Compensação não idempotente.', 'Outbox sem política de retenção e replay.']
    },
    {
      match: /b-tree|lsm-tree|índices/i,
      internals: [
        'B-tree mantém páginas ordenadas e favorece lookup e range scans.',
        'LSM-tree acumula writes e executa compaction, trocando write throughput por amplificações de leitura e espaço.',
        'Índice composto depende da ordem das colunas e dos access patterns.',
        'Covering index reduz acesso à tabela, mas aumenta custo de escrita e armazenamento.',
        'Seletividade influencia quando o planner prefere índice ou scan.',
        'Cada índice cria trabalho adicional de manutenção.'
      ],
      diagram: `query\n  │\n  ▼\n[index]\n  │ chave -> páginas / SSTables\n  ▼\nrow / document\n\nmais índice = menos leitura em alguns caminhos + mais escrita`,
      code: { lang: 'sql', text: `CREATE INDEX idx_orders_customer_created\nON orders(customer_id, created_at DESC);\n\nEXPLAIN (ANALYZE, BUFFERS)\nSELECT * FROM orders\nWHERE customer_id = 42\nORDER BY created_at DESC\nLIMIT 20;` },
      pitfalls: ['Criar índice para toda coluna filtrada.', 'Ignorar ordem de índice composto.', 'Medir só tempo e ignorar buffers e I/O.']
    },
    {
      match: /acid|mvcc|níveis de isolamento|lost update|write skew/i,
      internals: [
        'MVCC mantém versões para permitir leitores e escritores concorrentes.',
        'Read Committed evita dirty read, mas consultas separadas podem observar estados diferentes.',
        'Repeatable Read oferece snapshot mais estável, com detalhes dependentes do banco.',
        'Lost update aparece quando escritas concorrentes sobrescrevem mudanças.',
        'Write skew viola invariante entre linhas mesmo sem conflito na mesma linha.',
        'Serializable pode abortar transações para preservar equivalência serial.'
      ],
      diagram: `T1: read A ───────── write A\nT2:      read A ───────── write A\n\nsem controle adequado -> uma atualização pode desaparecer`,
      code: { lang: 'sql', text: `BEGIN;\nSELECT balance FROM accounts WHERE id = 1 FOR UPDATE;\nUPDATE accounts SET balance = balance - 100 WHERE id = 1;\nCOMMIT;` },
      pitfalls: ['Achar que ACID impede qualquer anomalia.', 'Corrigir concorrência apenas no código da aplicação.', 'Usar read-then-write sem entender lock ou versionamento.']
    },
    {
      match: /kafka|consumer groups|offsets/i,
      internals: [
        'Topic é dividido em partitions; ordering é garantido dentro de uma partição.',
        'Key normalmente influencia partição e define paralelismo e hotspot.',
        'Consumer group distribui partitions entre consumidores.',
        'Offset registra posição lógica de consumo e pode ser reposicionado para replay.',
        'Retenção desacopla consumo da remoção imediata do evento.',
        'Replication factor e ISR afetam durabilidade e disponibilidade.'
      ],
      diagram: `producer key=order-42\n       │\n       ▼\n topic\n ├─ P0 [0][1][2]\n ├─ P1 [0][1][2][3] <- key hash\n └─ P2 [0]\n       │\n       ▼\n consumer group\n P0->C1  P1->C2  P2->C1`,
      code: { lang: 'text', text: `key = orderId\n=> eventos do mesmo pedido caem na mesma partição\n=> ordering por pedido\n=> pedidos diferentes processam em paralelo` },
      pitfalls: ['Exigir ordering global sem necessidade.', 'Criar mais consumidores que partitions esperando ganho.', 'Commitar offset antes de o efeito estar seguro.']
    },
    {
      match: /exactly-once/i,
      internals: [
        'At-most-once pode perder trabalho; at-least-once pode repetir.',
        'Exactly-once normalmente combina transação, deduplicação ou idempotência em uma fronteira específica.',
        'Garantias Kafka-to-Kafka não incluem automaticamente banco ou HTTP externo.',
        'Pagamento, webhook e e-mail têm semântica própria.',
        'A pergunta correta é: exatamente uma vez onde e para qual efeito?',
        'Redelivery deve fazer parte do teste, não só da documentação.'
      ],
      diagram: `broker -> consumer -> DB -> API externa\n   garantia A       garantia B\n\nnenhuma frase de marketing atravessa fronteiras automaticamente`,
      code: { lang: 'sql', text: `INSERT INTO processed_events(event_id)\nVALUES (:event_id)\nON CONFLICT DO NOTHING;\n\n-- só execute efeito para evento realmente novo` },
      pitfalls: ['Escrever exactly-once sem especificar fronteira.', 'Acreditar que transação do broker cobre side effect externo.', 'Não testar redelivery.']
    },
    {
      match: /kubernetes control loops|scheduler|controllers/i,
      internals: [
        'API Server é a porta do control plane e persiste objetos via etcd.',
        'Scheduler escolhe node para Pods ainda sem binding.',
        'Controllers observam estado e executam reconciliação continuamente.',
        'kubelet garante execução local de Pods conforme PodSpec.',
        'Desired state e observed state podem divergir temporariamente.',
        'Recuperação acontece por loops repetidos, não por uma sequência imperativa perfeita.'
      ],
      diagram: `YAML / client\n    │\n    ▼\nAPI Server -> etcd\n    ├── scheduler -> node\n    └── controllers -> reconcile\n                      │\n                      ▼\n                   kubelet -> pods`,
      code: { lang: 'yaml', text: `apiVersion: apps/v1\nkind: Deployment\nspec:\n  replicas: 3\n  selector:\n    matchLabels: {app: api}\n  template:\n    metadata: {labels: {app: api}}\n    spec:\n      containers:\n        - name: api\n          image: example/api:1.2.3` },
      pitfalls: ['Pensar em kubectl apply como script imperativo.', 'Não saber qual controller é owner do recurso.', 'Diagnosticar Pod sem olhar status e events.']
    },
    {
      match: /readiness|liveness|requests\/limits|rollout/i,
      internals: [
        'Readiness controla recebimento de tráfego sem exigir restart.',
        'Liveness detecta estado irrecuperável local e pode causar restart.',
        'Startup probe protege inicializações lentas.',
        'requests alimentam scheduling e QoS.',
        'limits impõem teto; memória pode gerar OOMKill e CPU pode gerar throttling.',
        'Rollout saudável depende de readiness, shutdown e estratégia de surge/unavailable.'
      ],
      diagram: `Pod\n ├ startup -> já iniciou?\n ├ readiness -> recebe tráfego?\n └ liveness -> precisa reiniciar?\n\nrequests -> scheduler\nlimits -> enforcement`,
      code: { lang: 'yaml', text: `readinessProbe:\n  httpGet: {path: /ready, port: 8080}\nresources:\n  requests: {cpu: 200m, memory: 256Mi}\n  limits: {memory: 512Mi}` },
      pitfalls: ['Liveness depender de banco remoto.', 'Requests arbitrários bloqueando scheduling.', 'CPU limit baixo criando throttling.']
    },
    {
      match: /oauth2|oidc|jwt|api keys|mtls/i,
      internals: [
        'OAuth 2.0 trata delegação/autorização; OIDC acrescenta identidade.',
        'Access Token representa autorização e precisa de issuer, audience, expiry e scopes coerentes.',
        'ID Token comunica autenticação ao client OIDC e não substitui access token de API.',
        'JWT é formato, não política de autorização.',
        'API key identifica cliente com contexto limitado.',
        'mTLS autentica os dois lados do transporte e pode complementar token.'
      ],
      diagram: `client\n  │ auth/delegação\n  ▼\nAuthorization Server\n  │ access token\n  ▼\nResource Server\n  │ valida issuer/audience/scope\n  ▼\nrecurso`,
      code: { lang: 'text', text: `client_credentials:\nclient -> token endpoint -> access_token\nclient -> API: Authorization Bearer token\nAPI -> valida issuer, audience, expiry e scopes` },
      pitfalls: ['Usar ID Token como access token.', 'Validar assinatura JWT e esquecer audience.', 'Guardar client secret em aplicação pública.']
    },
    {
      match: /opentelemetry sdk|collector|otlp|propagation/i,
      internals: [
        'API define contrato de instrumentação; SDK implementa providers, processors e exporters.',
        'Instrumentação manual ou automática cria spans, métricas e atributos.',
        'Propagation transporta trace context entre processos.',
        'OTLP transporta sinais por gRPC ou HTTP.',
        'Collector recebe, processa e exporta sinais, desacoplando aplicação do backend.',
        'Resource attributes descrevem entidade emissora; span attributes descrevem operação.'
      ],
      diagram: `app instrumentation\n      │\n      ▼\nOpenTelemetry SDK\n      │ OTLP\n      ▼\nCollector\n  ├ processors\n  ├ batching/sampling\n  └ exporters\n      ▼\nbackend`,
      code: { lang: 'yaml', text: `receivers:\n  otlp:\n    protocols:\n      grpc: {}\nprocessors:\n  batch: {}\nexporters:\n  otlphttp:\n    endpoint: https://example/v1/traces` },
      pitfalls: ['Atributo de request colocado como resource.', 'Propagator ausente entre serviços.', 'Collector recebe, mas exporter ou backend descarta sinal.']
    },
    {
      match: /sli|slo|error budget|burn rate/i,
      internals: [
        'SLI mede experiência relevante, por exemplo proporção de requests bons.',
        'SLO define objetivo sobre uma janela.',
        'Error budget é a falha permitida pelo objetivo.',
        'Burn rate mede velocidade de consumo do orçamento.',
        'Alertas multi-window/multi-burn equilibram rapidez e ruído.',
        'SLO de usuário é mais útil que métrica interna isolada.'
      ],
      diagram: `eventos bons / eventos válidos = SLI\n             │\n             ▼\n         SLO alvo\n             │\n             ▼\n       error budget\n             │\n             ▼\n       burn rate`,
      code: { lang: 'text', text: `SLO 99.9% / 30 dias\nerror budget = 0.1%\n\nBurn rate alto por janela curta + longa\n=> alerta acionável sem reagir a todo ruído.` },
      pitfalls: ['SLO de CPU.', 'Excluir erros para melhorar indicador.', 'Alertar em toda violação instantânea do objetivo mensal.']
    },
    {
      match: /rag:|hybrid search|grounding/i,
      internals: [
        'Ingestão define corpus, parsing, metadata, versionamento e freshness.',
        'Chunking controla granularidade e quantidade de contexto recuperável.',
        'Retrieval pode ser lexical, denso ou híbrido.',
        'Reranking usa modelo mais caro para ordenar candidatos.',
        'Context assembly controla redundância e orçamento de tokens.',
        'Generation deve ser avaliada separadamente de retrieval.'
      ],
      diagram: `documentos\n   ▼\nparse -> chunks -> index\n                  │\nquery -> retrieve top-k\n                  ▼\n               rerank\n                  ▼\n          contexto selecionado\n                  ▼\n                LLM\n                  ▼\n resposta grounded + fontes`,
      code: { lang: 'python', text: `candidates = hybrid_search(query, k=30)\nranked = rerank(query, candidates)[:6]\nanswer = generate(query=query, context=ranked)\n\n# medir recall@k antes de julgar generation` },
      pitfalls: ['Mexer no prompt quando retrieval falhou.', 'Chunks gigantes sem metadata.', 'Avaliar só resposta final e não recall.']
    },
    {
      match: /golden sets|rubrics|regression evals/i,
      internals: [
        'Golden set deve representar casos normais, limites, falhas e distribuição real.',
        'Rubric define critérios observáveis em vez de qualidade vaga.',
        'Baseline vem antes da otimização.',
        'Regressão compara versões com mesma coleção e critérios.',
        'Revisão humana e métricas automáticas se complementam.',
        'Slice analysis revela subgrupos onde a média esconde regressão.'
      ],
      diagram: `dataset versionado\n      │\n      ▼\nsistema candidato\n      │ outputs\n      ▼\nrubric / judge / checks\n      │\n      ▼\nmétricas + slices + regressões`,
      code: { lang: 'json', text: `{"id":"case-17","input":"...","expected_facts":["A","B"],"must_not":["inventar fonte"],"slice":"long-context"}` },
      pitfalls: ['Golden set apenas com exemplos fáceis.', 'Trocar dataset junto com cada modelo.', 'LLM-as-judge sem calibração.']
    },
    {
      match: /mcp hosts|clients|servers|tools|resources/i,
      internals: [
        'Host coordena experiência, contexto e permissões.',
        'Client mantém conexão de protocolo com um server.',
        'Server expõe capabilities como tools e resources.',
        'Tool representa ação invocável e precisa de schema estreito.',
        'Resource representa conteúdo endereçável para leitura.',
        'Autorização real não pode depender só de texto no prompt.'
      ],
      diagram: `Host\n ├─ MCP Client A -> Server A -> tools/resources\n └─ MCP Client B -> Server B -> tools/resources\n\nhost coordena contexto e autorização`,
      code: { lang: 'json', text: `{"name":"get_order","description":"Read one order by id","inputSchema":{"type":"object","properties":{"orderId":{"type":"string"}},"required":["orderId"]}}` },
      pitfalls: ['Tool genérica demais.', 'Descrição ambígua sobre efeitos.', 'Servidor com permissões maiores que o usuário autorizou.']
    },
    {
      match: /loop percepção|termination conditions|budgets/i,
      internals: [
        'Cada iteração observa estado, escolhe ação, executa e incorpora resultado.',
        'Termination pode ser sucesso, erro irreparável, max_steps, deadline ou budget.',
        'Progress detector identifica ciclos que repetem estado e ação.',
        'Tool result precisa alterar estado ou fornecer evidência nova.',
        'Cost budget e risk budget são limites diferentes.',
        'Escalonamento humano deve carregar contexto suficiente para revisão.'
      ],
      diagram: `observe\n  ▼\nreason / plan\n  ▼\naction / tool\n  ▼\nresult -> update state\n  ├ success -> stop\n  ├ no progress -> stop/escalate\n  └ budget ok -> loop`,
      code: { lang: 'python', text: `for step in range(MAX_STEPS):\n    action = policy(state)\n    result = run(action)\n    state = reduce(state, result)\n    if state.done or no_progress(state):\n        break` },
      pitfalls: ['Loop sem max_steps.', 'Retry infinito do mesmo erro.', 'Condição de sucesso vaga.']
    },
    {
      match: /git: commit|tree, blob|refs, head|index/i,
      internals: [
        'Blob armazena conteúdo; tree mapeia nomes para blobs e outras trees.',
        'Commit aponta para tree e commits pais, formando DAG.',
        'Branch é uma ref móvel para commit.',
        'HEAD aponta para ref atual ou pode ficar detached.',
        'Index é a staging area entre working tree e commit.',
        'Reflog registra movimentos locais de refs e ajuda na recuperação.'
      ],
      diagram: `working tree\n     │ git add\n     ▼\n    index\n     │ git commit\n     ▼\n commit -> tree -> blobs\n    ▲\n branch ref\n    ▲\n   HEAD`,
      code: { lang: 'bash', text: `git cat-file -p HEAD\ngit ls-tree HEAD\ngit rev-parse HEAD\ngit reflog --date=relative` },
      pitfalls: ['Usar reset --hard sem entender qual árvore muda.', 'Confundir arquivo com blob identificado pelo caminho.', 'Achar que commit armazena somente um diff.']
    }
  ];

  function dataReady() {
    try { return typeof state !== 'undefined' && Array.isArray(state?.data?.themes) && state.data.themes.length > 0; }
    catch { return false; }
  }

  function themeById(id) {
    return dataReady() ? state.data.themes.find(t => t.id === id) : null;
  }

  function baseGuide(theme, index) {
    try { return typeof topicGuide === 'function' ? topicGuide(theme, index) : {}; }
    catch { return {}; }
  }

  function deepDive(topic) {
    return DEEP_DIVES.find(item => item.match.test(topic)) || null;
  }

  function concepts(topic) {
    return topic.split(/[:,;/]|\be\b|\bversus\b|\bvs\.?\b|\+/i).map(s => s.trim()).filter(s => s.length > 2).slice(0, 8);
  }

  function defaultInternals(theme, topic, guide) {
    const parts = concepts(topic);
    return [
      `Defina “${topic}” sem depender do nome de uma ferramenta específica.`,
      guide.mechanism || `Localize onde “${topic}” entra no fluxo de ${theme.title} e qual estado ou invariante ele protege.`,
      `Separe happy path de falhas, concorrência, limites de recurso e comportamento degradado.`,
      `Torne o mecanismo observável com teste, benchmark, logs, métricas, traces ou inspeção do runtime.`,
      `Compare ${parts[0] || 'o mecanismo'} com uma alternativa e explique qual restrição muda a decisão.`
    ];
  }

  function defaultDiagram(topic) {
    return `[entrada]\n    │\n    ▼\n[${topic}]\n    ├── estado / invariantes\n    ├── limites / falhas\n    ├── custo / escala\n    └── observabilidade\n    │\n    ▼\n[resultado verificável]`;
  }

  function exercises(theme, topic, guide) {
    const lab = guide.lab || theme.labs?.[0] || `Crie um experimento mínimo para tornar “${topic}” observável.`;
    const decision = guide.decision || theme.decisions?.[0] || `Compare uma alternativa e registre o trade-off.`;
    return [
      ['01 · Explicar', `Explique “${topic}” em até cinco frases: problema, mecanismo, estado e um limite.`],
      ['02 · Desenhar', `Desenhe o fluxo sem nomes de produtos. Marque entradas, estado, efeitos, dependências e pontos de falha.`],
      ['03 · Experimentar', lab],
      ['04 · Decidir', decision],
      ['05 · Quebrar', `Introduza falha, carga, concorrência ou configuração ruim. Registre hipótese, evidência e recuperação.`]
    ];
  }

  function questions(topic) {
    return [
      `Qual problema “${topic}” resolve e qual problema ele explicitamente não resolve?`,
      'Qual estado ou invariante precisa permanecer correto quando há concorrência ou falha?',
      'Que sinal mostraria em produção que o mecanismo está degradando?',
      'Qual alternativa seria melhor sob outra restrição de escala, custo ou consistência?',
      'Você consegue explicar o diagrama inteiro sem usar o nome de uma ferramenta?'
    ];
  }

  function chapterHtml(theme, index) {
    const topic = theme.focus[index];
    const guide = baseGuide(theme, index);
    const deep = deepDive(topic);
    const internals = deep?.internals || defaultInternals(theme, topic, guide);
    const diagram = deep?.diagram || defaultDiagram(topic);
    const pitfalls = deep?.pitfalls || [guide.pitfall || 'Memorizar definição sem prever comportamento real.', 'Usar ferramenta como sinônimo do conceito.', 'Ignorar falha, rollback, recovery ou comportamento sob carga.'];
    const ex = exercises(theme, topic, guide);
    const refs = (theme.references || []).slice(0, 6);
    const checked = typeof done === 'function' ? done(theme.id, index) : false;
    const previous = index > 0 ? `#/chapter/${theme.id}/${index - 1}` : null;
    const next = index < theme.focus.length - 1 ? `#/chapter/${theme.id}/${index + 1}` : null;
    const chipHtml = (concepts(topic).length ? concepts(topic) : [theme.category]).map(c => `<span class="chapter-chip">${esc(c)}</span>`).join('');
    const code = deep?.code ? `<section class="chapter-section"><div class="eyebrow">Exemplo mínimo</div><h2>Faça o mecanismo aparecer</h2><p>Use este exemplo como lente de estudo, não como receita de produção.</p><pre class="chapter-code"><code>${pre(deep.code.text)}</code></pre><div class="chapter-code-label">${esc(deep.code.lang)}</div></section>` : '';
    const source = theme.source && typeof sourceUrl === 'function' ? `<a class="source-link" href="${esc(sourceUrl(theme.source))}" target="_blank" rel="noopener noreferrer">Abrir Codex fonte ↗</a>` : '';
    return `<div class="breadcrumbs"><a href="#/">Alexandria</a><span>›</span><a href="#/themes">Temas</a><span>›</span><a href="#/theme/${esc(theme.id)}">${esc(theme.title)}</a><span>›</span>Capítulo ${index + 1}</div>
<header class="chapter-hero"><div class="eyebrow">${esc(theme.category)} · capítulo ${String(index + 1).padStart(2, '0')} de ${theme.focus.length}</div><h1>${esc(topic)}</h1><p class="lead">${esc(guide.why || `A meta é sair do reconhecimento do termo e chegar à capacidade de explicar, testar, quebrar e decidir sobre ${topic}.`)}</p><div class="chapter-chips">${chipHtml}</div></header>
<div class="chapter-layout"><main>
<section class="chapter-section"><div class="eyebrow">Internals</div><h2>O que acontece por baixo</h2><p>${esc(guide.mechanism || `Comece pelo mecanismo, depois conecte abstrações, custos e failure modes.`)}</p><ul class="chapter-list">${internals.map(x => `<li>${esc(x)}</li>`).join('')}</ul></section>
<section class="chapter-section"><div class="eyebrow">Diagrama</div><h2>Desenhe antes de decorar</h2><pre class="chapter-diagram">${pre(diagram)}</pre></section>
${code}
<section class="chapter-section"><div class="eyebrow">Prática progressiva</div><h2>Do modelo mental à evidência</h2><div class="exercise-grid">${ex.map(([level,text]) => `<article class="exercise-card"><div class="eyebrow">${esc(level)}</div><p>${esc(text)}</p></article>`).join('')}</div></section>
<section class="chapter-section"><div class="eyebrow">Failure modes</div><h2>Onde costuma dar errado</h2><ul class="chapter-list danger-list">${pitfalls.map(x => `<li>${esc(x)}</li>`).join('')}</ul></section>
<section class="chapter-section"><div class="eyebrow">Autoavaliação</div><h2>Perguntas de domínio</h2><ol class="chapter-list">${questions(topic).map(x => `<li>${esc(x)}</li>`).join('')}</ol></section>
</main><aside class="chapter-sidebar"><section class="panel sticky chapter-side-card"><div class="eyebrow">Evidência de aprendizado</div><p>${esc(guide.evidence || 'Produza algo revisável: código, benchmark, diagrama, ADR, trace, teste, threat model ou runbook.')}</p><label class="chapter-complete"><input type="checkbox" id="chapterDone" ${checked ? 'checked' : ''}><span>Marcar tópico como estudado</span></label><hr><div class="eyebrow">Referências do tema</div><ul class="ref-list">${refs.map(x => `<li>${esc(x)}</li>`).join('')}</ul>${source}</section></aside></div>
<nav class="chapter-pager">${previous ? `<a class="button secondary" href="${previous}">← Tópico anterior</a>` : '<span></span>'}${next ? `<a class="button primary" href="${next}">Próximo tópico →</a>` : `<a class="button primary" href="#/theme/${esc(theme.id)}">Voltar ao tema</a>`}</nav>`;
  }

  function renderChapter() {
    const r = route();
    if (!r || !dataReady()) return false;
    const theme = themeById(r.themeId);
    if (!theme || !theme.focus?.[r.index]) return false;
    if (app.dataset.chapterRoute === r.key && app.querySelector('.chapter-hero')) return true;
    app.dataset.chapterRoute = r.key;
    app.innerHTML = chapterHtml(theme, r.index);
    scrollTo(0, 0);
    const checkbox = document.getElementById('chapterDone');
    if (checkbox && typeof setDone === 'function') checkbox.onchange = () => setDone(theme.id, r.index, checkbox.checked);
    if (typeof installUI === 'function') installUI();
    return true;
  }

  function decorate() {
    if (route()) return;
    delete app.dataset.chapterRoute;
    app.querySelectorAll('.focus-item').forEach((item, fallbackIndex) => {
      if (item.querySelector('.chapter-link')) return;
      const checkbox = item.querySelector('input[data-theme][data-index]');
      if (!checkbox) return;
      const index = Number(checkbox.dataset.index ?? fallbackIndex);
      if (!checkbox.dataset.theme || !Number.isInteger(index)) return;
      const link = document.createElement('a');
      link.className = 'chapter-link';
      link.href = `#/chapter/${checkbox.dataset.theme}/${index}`;
      link.textContent = 'Abrir capítulo completo →';
      item.appendChild(link);
    });
  }

  let scheduled = false;
  const refresh = () => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      if (!renderChapter()) decorate();
    });
  };

  const observer = new MutationObserver(refresh);
  observer.observe(app, { childList: true, subtree: true });
  addEventListener('hashchange', () => setTimeout(refresh, 0));

  let tries = 0;
  const wait = () => {
    tries += 1;
    if (dataReady()) return refresh();
    if (tries < 240) setTimeout(wait, 25);
  };
  wait();
})();