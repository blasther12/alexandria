(() => {
  const chapterRoute = () => {
    const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    if (parts[0] !== 'chapter' || !parts[1] || parts[2] == null) return null;
    const index = Number(parts[2]);
    return Number.isInteger(index) && index >= 0 ? { themeId: parts[1], index } : null;
  };

  const html = value => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const block = value => html(value).replaceAll('\n', '<br>');

  const DEFAULT_PROFILE = {
    objective: topic => `Construir um modelo mental operacional de “${topic}”, identificar onde o conceito aparece em sistemas reais e conseguir justificar uma decisão técnica relacionada.`,
    internals: topic => [
      `Defina ${topic} sem depender do nome de uma ferramenta específica.`,
      'Identifique entradas, saídas, estado, limites e invariantes do mecanismo.',
      'Separe comportamento esperado de modos de falha e condições de corrida.',
      'Descubra quais métricas, traces, testes ou artefatos tornam o comportamento observável.',
      'Compare pelo menos uma alternativa e registre quando a escolha deixa de ser adequada.'
    ],
    diagram: topic => `[entrada]\n    │\n    ▼\n[${topic}]\n    │\n    ├── estado / invariantes\n    ├── limites / falhas\n    └── observabilidade\n    │\n    ▼\n[resultado verificável]`,
    example: null,
    pitfalls: [
      'Memorizar definições sem conseguir prever comportamento sob carga ou falha.',
      'Usar uma ferramenta como sinônimo do conceito.',
      'Otimizar antes de medir a restrição dominante.',
      'Ignorar recuperação, rollback ou comportamento degradado.'
    ]
  };

  const PROFILES = [
    {
      match: /bits|overflow|ponto flutuante/i,
      objective: () => 'Entender como números são realmente representados pela máquina e por que operações aparentemente simples podem produzir overflow, perda de precisão ou arredondamento inesperado.',
      internals: () => [
        'Representação binária, complemento de dois e largura fixa de inteiros.',
        'Overflow signed/unsigned e diferenças entre linguagens que detectam, embrulham ou promovem valores.',
        'IEEE 754: sinal, expoente, mantissa, NaN, infinito e números subnormais.',
        'Erro de arredondamento e por que 0.1 + 0.2 não é exatamente 0.3 em ponto flutuante binário.',
        'Quando usar inteiros escalados, Decimal/BigDecimal ou tipos monetários.'
      ],
      diagram: () => `valor lógico\n    │\n    ▼\n[encoding binário]\n    │\n    ├── largura finita\n    ├── sinal / expoente / mantissa\n    └── regras de arredondamento\n    │\n    ▼\nvalor armazenado ≠ necessariamente valor matemático exato`,
      example: { language: 'python', code: `from decimal import Decimal\n\nprint(0.1 + 0.2)\nprint(Decimal("0.1") + Decimal("0.2"))\n\nMAX_U8 = 255\nprint((MAX_U8 + 1) % 256)` },
      pitfalls: ['Usar float para dinheiro sem regra explícita de arredondamento.', 'Assumir que overflow se comporta igual em todas as linguagens.', 'Comparar floats por igualdade exata sem tolerância.']
    },
    {
      match: /python:/i,
      objective: () => 'Compreender Python pelo runtime, não só pela sintaxe: modelo de objetos, referências, GIL, iteradores, asyncio, multiprocessing e custo operacional.',
      internals: () => [
        'Tudo é objeto: identidade, tipo, referências e mutabilidade.',
        'CPython usa reference counting combinado com garbage collector de ciclos.',
        'O GIL serializa execução de bytecode Python dentro de um processo CPython, mas não impede concorrência de I/O.',
        'asyncio funciona por cooperação: uma coroutine precisa devolver controle ao event loop.',
        'CPU-bound pode exigir multiprocessing, extensão nativa ou runtime alternativo.',
        'Typing melhora análise estática, mas não substitui validação de dados em runtime.'
      ],
      diagram: () => `request\n  │\n  ▼\n[event loop / thread]\n  │\n  ├── I/O aguarda sem ocupar CPU\n  ├── bytecode Python passa pelo GIL\n  └── CPU-bound prende progresso\n  │\n  ▼\nprocess pool / native code quando necessário`,
      example: { language: 'python', code: `import asyncio\n\nasync def fetch(name: str):\n    await asyncio.sleep(0.2)\n    return name\n\nasync def main():\n    print(await asyncio.gather(fetch("a"), fetch("b")))\n\nasyncio.run(main())` },
      pitfalls: ['Chamar função bloqueante dentro do event loop.', 'Usar threads esperando ganho em CPU-bound puro.', 'Confundir type hint com validação runtime.']
    },
    {
      match: /javascript:/i,
      objective: () => 'Prever o comportamento de JavaScript e Node.js a partir do event loop, microtasks, libuv, streams, workers e limites de CPU.',
      internals: () => [
        'JavaScript de aplicação executa em uma call stack por isolate.',
        'Promises entram em microtasks, que têm prioridade diferente de timers e outras fases.',
        'libuv coordena I/O e um pool de threads para operações específicas.',
        'Streams implementam fluxo incremental e precisam respeitar backpressure.',
        'CPU intensa bloqueia o event loop e aumenta event-loop lag e latência de todos os requests.',
        'Worker Threads isolam trabalho de CPU quando paralelismo real é necessário.'
      ],
      diagram: () => `callbacks / timers / I/O\n        │\n        ▼\n   [event loop]\n        │\n        ├── call stack JS\n        ├── microtasks\n        └── libuv / workers\n        │\n        ▼\n progresso global depende de não bloquear a thread JS`,
      example: { language: 'javascript', code: `import { monitorEventLoopDelay } from 'node:perf_hooks';\n\nconst h = monitorEventLoopDelay();\nh.enable();\nsetInterval(() => {\n  console.log('p99 ms', h.percentile(99) / 1e6);\n  h.reset();\n}, 1000);` },
      pitfalls: ['Fazer parsing/compressão pesada na thread principal.', 'Criar Promise e assumir que isso cria paralelismo de CPU.', 'Ignorar backpressure em streams.']
    },
    {
      match: /typescript:/i,
      objective: () => 'Usar TypeScript para modelar invariantes estáticos sem esquecer que JSON, eventos, HTTP e bancos continuam chegando como dados de runtime.',
      internals: () => [
        'Structural typing e assignability.',
        'Narrowing por guards, discriminated unions e controle de fluxo.',
        'Generics preservam relações entre tipos, mas podem virar complexidade acidental.',
        'Tipos são apagados na emissão de JavaScript.',
        'Dados externos precisam de parsing e validação runtime.',
        'Exaustividade com never ajuda a detectar estados não tratados.'
      ],
      diagram: () => `mundo externo\n JSON / HTTP / evento\n        │\n        ▼\n[validator runtime]\n        │ dado válido\n        ▼\n[tipos TypeScript]\n        │\n        ▼\n lógica com invariantes estáticas`,
      example: { language: 'typescript', code: `type Result =\n  | { kind: 'ok'; value: string }\n  | { kind: 'error'; code: number };\n\nfunction print(r: Result) {\n  if (r.kind === 'ok') return r.value;\n  return String(r.code);\n}` },
      pitfalls: ['Fazer cast com as e considerar o dado validado.', 'Criar tipos genéricos impossíveis de compreender.', 'Duplicar regras entre schema runtime e tipos sem estratégia de fonte única.']
    },
    {
      match: /go:/i,
      objective: () => 'Entender Go pelo scheduler, goroutines, channels, context, interfaces e GC, incluindo o que acontece quando concorrência cresce sem limites.',
      internals: () => [
        'Modelo G-M-P do scheduler do runtime.',
        'Goroutines são leves, mas consomem stack, scheduler, memória e recursos externos.',
        'Channels coordenam ownership e sincronização, não são obrigatórios para todo compartilhamento.',
        'context propaga deadline e cancelamento por árvore de chamadas.',
        'Interfaces são satisfeitas implicitamente e afetam design e alocação.',
        'pprof e runtime metrics mostram CPU, heap, bloqueios e goroutines.'
      ],
      diagram: () => `goroutines (G)\n  │   │   │\n  ▼   ▼   ▼\nprocessors lógicos (P)\n      │\n      ▼\nthreads do SO (M)\n      │\n      ▼\nCPU / syscalls`,
      example: { language: 'go', code: `ctx, cancel := context.WithTimeout(context.Background(), time.Second)\ndefer cancel()\n\nselect {\ncase result := <-work():\n    fmt.Println(result)\ncase <-ctx.Done():\n    return\n}` },
      pitfalls: ['Criar goroutine por item sem limite.', 'Ignorar ctx.Done em trabalho longo.', 'Usar channel onde mutex simples expressa melhor o estado compartilhado.']
    },
    {
      match: /domain-driven|ddd/i,
      objective: () => 'Usar DDD para descobrir e proteger fronteiras de significado e mudança, não para espalhar entidades, value objects e repositories por cerimônia.',
      internals: () => [
        'Subdomínio descreve uma parte do problema; bounded context delimita um modelo e sua linguagem.',
        'Ubiquitous Language reduz traduções implícitas entre negócio e código.',
        'Agregados protegem invariantes dentro de uma fronteira transacional deliberada.',
        'Context Map descreve relações e assimetrias entre modelos.',
        'Anti-corruption layer protege um contexto de conceitos externos.',
        'Eventos de domínio expressam fatos relevantes do modelo, não qualquer mudança de estado.'
      ],
      diagram: () => `[Contexto A]\n linguagem A / modelo A\n      │ contrato explícito\n      ▼\n [ACL / integração]\n      │\n      ▼\n[Contexto B]\n linguagem B / modelo B`,
      example: { language: 'text', code: `ScoringContext\n  owns: regras de pontuação\n  publishes: PointsCalculated\n\nWalletContext\n  owns: saldo e lançamentos\n  consumes: PointsCalculated\n\nNão compartilhar modelo interno entre os dois contextos.` },
      pitfalls: ['Confundir tabela ou microsserviço com bounded context.', 'Criar agregados enormes para “garantir consistência”.', 'Aplicar DDD tático onde o domínio é CRUD simples.']
    },
    {
      match: /testing:/i,
      objective: () => 'Escolher testes pelo risco que precisam reduzir e pela confiança que fornecem, em vez de perseguir apenas cobertura ou uma pirâmide rígida.',
      internals: () => [
        'Teste unitário reduz incerteza de lógica local e precisa ser rápido e diagnóstico.',
        'Integração valida comportamento real entre componentes que mocks escondem.',
        'Contrato protege compatibilidade entre produtor e consumidor.',
        'E2E valida poucos fluxos críticos através da pilha completa.',
        'Property-based explora espaço de entradas e invariantes.',
        'Mutation testing pode mostrar testes que executam código sem realmente verificar comportamento.'
      ],
      diagram: () => `risco\n │\n ├── lógica local -> unit\n ├── integração real -> integration\n ├── compatibilidade -> contract\n ├── jornada crítica -> E2E\n └── invariantes amplas -> property-based`,
      example: { language: 'text', code: `Pergunta antes do teste:\n"Qual falha este teste detectaria que hoje poderia escapar?"\n\nSe a resposta for vaga, o teste provavelmente também será.` },
      pitfalls: ['Mockar a própria implementação.', 'Cobertura alta com asserts fracos.', 'E2E demais para problemas que testes menores diagnosticariam melhor.']
    },
    {
      match: /microserviços|independent deployability/i,
      objective: () => 'Decidir extração de microsserviço a partir de boundary, ownership, autonomia de deploy, dados e necessidade operacional, não por preferência estética.',
      internals: () => [
        'Independent deployability exige contratos e dados controlados pelo serviço.',
        'Chamadas remotas adicionam latência, timeout, retry e falhas parciais.',
        'Banco compartilhado preserva acoplamento mesmo quando o deploy foi separado.',
        'Ownership organizacional influencia capacidade de operar um serviço de ponta a ponta.',
        'Observabilidade e recovery passam a ser requisitos estruturais.',
        'Monólito modular é frequentemente uma etapa de redução de coupling antes de distribuição.'
      ],
      diagram: () => `[módulo coeso]\n     │ boundary provado\n     ▼\n[contrato explícito]\n     │\n     ├── ownership de dados\n     ├── deploy independente\n     └── operação independente\n     ▼\n[microsserviço]`,
      example: { language: 'text', code: `Antes de extrair:\n1. Quem é dono do dado?\n2. Qual mudança precisa ser independente?\n3. Qual escala é realmente diferente?\n4. Quem responde pelo incidente?\n5. Como rollback e replay funcionam?` },
      pitfalls: ['Distribuir antes de modularizar.', 'Compartilhar banco e chamar isso de independência.', 'Criar nanosserviços sem ownership ou motivo de escala.']
    },
    {
      match: /event-driven/i,
      objective: () => 'Distinguir estilos de integração orientada a eventos e entender como tempo, schema, ordering e replay mudam o acoplamento entre componentes.',
      internals: () => [
        'Event notification anuncia um fato e força consumidor a buscar detalhes.',
        'Event-carried state transfer transporta estado suficiente para reduzir chamadas síncronas.',
        'Event sourcing mantém eventos como fonte de verdade do estado.',
        'Stream processing trata eventos como fluxo contínuo e ordenado por partição.',
        'Schema e semântica viram contratos públicos.',
        'Replay exige efeitos idempotentes e controle de versão.'
      ],
      diagram: () => `producer\n   │ evento\n   ▼\n[broker / log]\n   │\n   ├── consumer A\n   ├── consumer B\n   └── replay futuro\n\nacoplamento migra da chamada para o contrato do evento`,
      example: { language: 'json', code: `{"type":"OrderPaid","version":2,"orderId":"123","occurredAt":"..."}` },
      pitfalls: ['Evento genérico “EntityUpdated”.', 'Consumidor depender de detalhe interno do produtor.', 'Semântica de evento mudar silenciosamente.']
    },
    {
      match: /happens-before|relógios lógicos|clock skew/i,
      objective: () => 'Raciocinar sobre ordem causal sem confiar que relógios físicos de máquinas diferentes representam uma verdade global.',
      internals: () => [
        'Happens-before define uma ordem parcial baseada em sequência local e troca de mensagens.',
        'Lamport clocks preservam causalidade necessária, mas não detectam concorrência com precisão total.',
        'Vector clocks carregam mais informação e conseguem distinguir eventos concorrentes.',
        'NTP reduz drift, mas não transforma relógio de parede em mecanismo de consenso.',
        'Ordenação total criada artificialmente pode esconder o fato de eventos serem causalmente independentes.'
      ],
      diagram: () => `A:  a1 ─────send────▶ a2\n          │             │\nB:        b1 ◀──recv──── b2\n\ncausalidade vem das relações, não do timestamp de parede`,
      example: { language: 'text', code: `A gera evento X com clock 4\nB recebe X e avança para max(clockB, 4) + 1\n\nO valor lógico preserva ordem causal sem depender de UTC perfeito.` },
      pitfalls: ['Ordenar eventos distribuídos apenas por created_at.', 'Assumir que NTP elimina clock skew.', 'Usar timestamp como prova de causalidade.']
    },
    {
      match: /linearizabilidade|serializabilidade|consistência eventual/i,
      objective: () => 'Distinguir garantias de consistência e escolher a menor garantia capaz de proteger o invariante do domínio.',
      internals: () => [
        'Linearizabilidade trata operações concorrentes como se ocorressem instantaneamente entre início e fim reais.',
        'Serializabilidade é uma propriedade de transações equivalente a alguma execução serial, sem exigir ordem de tempo real.',
        'Consistência eventual promete convergência quando cessam atualizações, mas precisa de regra de conflito.',
        'Read-your-writes, monotonic reads e causal consistency são garantias intermediárias úteis.',
        'A escolha depende do invariante: saldo, feed e carrinho podem exigir propriedades diferentes.'
      ],
      diagram: () => `invariante do domínio\n        │\n        ▼\nqual história o usuário pode observar?\n        │\n        ├── tempo real necessário -> linearizabilidade\n        ├── transações equivalentes -> serializabilidade\n        └── convergência aceitável -> eventual/causal`,
      example: { language: 'text', code: `Saldo não pode ficar negativo:\nconsistência forte pode ser necessária na operação crítica.\n\nFeed social:\nleituras atrasadas por alguns segundos podem ser aceitáveis.` },
      pitfalls: ['Chamar qualquer consistência não forte de eventual.', 'Confundir serializabilidade com linearizabilidade.', 'Escolher garantia sem declarar invariante.']
    },
    {
      match: /consensus|raft|fencing/i,
      objective: () => 'Entender consenso como coordenação de uma decisão replicada sob falhas, incluindo eleição, quorum, termos, log e proteção contra líderes antigos.',
      internals: () => [
        'Raft separa leader election, log replication e safety.',
        'Termos impedem líderes antigos de continuar sendo tratados como atuais.',
        'Quorum majoritário permite progresso enquanto uma maioria está disponível.',
        'Commit ocorre quando entrada é replicada conforme as regras de segurança.',
        'Fencing token impede que um antigo proprietário de lock continue escrevendo em recurso externo.',
        'Consensus não resolve side effects externos automaticamente.'
      ],
      diagram: () => `followers\n  │ vote\n  ▼\n[leader term N]\n  │ append entries\n  ├────────▶ follower\n  └────────▶ follower\n       maioria ack\n          │\n          ▼\n        commit`,
      example: { language: 'text', code: `lock token = 42\nnovo líder recebe token = 43\n\nstorage rejeita escrita com token < 43\n=> líder antigo não consegue corromper estado mesmo que acorde depois.` },
      pitfalls: ['Usar distributed lock sem fencing.', 'Assumir que consenso elimina partições.', 'Confundir quorum de storage com consenso de workflow inteiro.']
    },
    {
      match: /timeout|deadline|retry budget|jitter|circuit breaker/i,
      objective: () => 'Projetar resiliência sem transformar lentidão em tempestade de retries, usando deadline ponta a ponta, orçamento de tentativas e isolamento de falhas.',
      internals: () => [
        'Timeout limita uma operação local; deadline representa o tempo total restante da requisição.',
        'Retry deve ocorrer apenas para falha potencialmente transitória e operação segura/idempotente.',
        'Exponential backoff distribui tentativas no tempo; jitter evita sincronização de clientes.',
        'Retry budget limita amplificação de carga.',
        'Circuit breaker interrompe chamadas quando evidência mostra destino indisponível.',
        'Bulkheads limitam impacto por pool, tenant ou dependência.'
      ],
      diagram: () => `deadline total 1000ms\n   │\n   ├── serviço A 250ms\n   ├── serviço B 400ms\n   └── margem/recovery\n\nretry consome o mesmo orçamento, não cria tempo novo`,
      example: { language: 'text', code: `attempt 1 -> falha transitória\nwait 50ms + jitter\nattempt 2 -> respeita deadline restante\n\nsem deadline restante -> falhar, não repetir` },
      pitfalls: ['Retry em todas as camadas.', 'Timeout maior que deadline do chamador.', 'Circuit breaker sem métrica, fallback ou estratégia de recuperação.']
    },
    {
      match: /saga|outbox|inbox|cdc/i,
      objective: () => 'Coordenar workflows distribuídos sem fingir que existe uma transação ACID única atravessando serviços e brokers.',
      internals: () => [
        'Outbox grava mudança de domínio e evento na mesma transação local.',
        'Publisher lê outbox e publica, aceitando redelivery.',
        'Inbox ou tabela de deduplicação torna processamento idempotente.',
        'Saga registra passos e compensações de um workflow longo.',
        'CDC pode transportar mudanças da base para um log sem dual write manual.',
        'Compensação é uma ação de negócio, não rollback mágico.'
      ],
      diagram: () => `DB local\n┌───────────────┐\n│ mudança       │\n│ outbox event  │ <- mesma transação\n└──────┬────────┘\n       ▼\n publisher -> broker -> consumer -> inbox/idempotência`,
      example: { language: 'sql', code: `BEGIN;\nUPDATE orders SET status = 'PAID' WHERE id = 123;\nINSERT INTO outbox(type, aggregate_id) VALUES ('OrderPaid', 123);\nCOMMIT;` },
      pitfalls: ['Dual write DB + broker sem coordenação.', 'Compensação que não é idempotente.', 'Apagar outbox sem política de replay/auditoria.']
    },
    {
      match: /b-tree|lsm-tree|índices/i,
      objective: () => 'Entender índices como estruturas físicas com trade-offs de leitura, escrita, memória, ordenação e manutenção.',
      internals: () => [
        'B-tree mantém páginas ordenadas e favorece lookup/range com atualizações in-place controladas.',
        'LSM-tree acumula writes e faz compaction, trocando write throughput por read/space amplification.',
        'Índice composto depende da ordem das colunas e do padrão de predicados.',
        'Covering index reduz acesso à tabela, mas aumenta custo de manutenção.',
        'Cardinalidade e seletividade afetam utilidade do índice.',
        'Cada índice adiciona escrita, armazenamento e trabalho de vacuum/compaction.'
      ],
      diagram: () => `query\n  │\n  ▼\n[index]\n  │ chave -> páginas / SSTables\n  ▼\nrow / document\n\nmais índice = menos leitura em alguns caminhos + mais custo de escrita`,
      example: { language: 'sql', code: `CREATE INDEX idx_orders_customer_created\nON orders(customer_id, created_at DESC);\n\nEXPLAIN (ANALYZE, BUFFERS)\nSELECT * FROM orders\nWHERE customer_id = 42\nORDER BY created_at DESC\nLIMIT 20;` },
      pitfalls: ['Criar índice para toda coluna filtrada.', 'Ignorar ordem de índice composto.', 'Medir só tempo e não buffers/IO/escrita.']
    },
    {
      match: /acid|mvcc|níveis de isolamento|lost update|write skew|serializabilidade/i,
      objective: () => 'Raciocinar sobre concorrência de transações por anomalias observáveis, entendendo MVCC e o que cada nível de isolamento impede ou permite.',
      internals: () => [
        'MVCC mantém versões para permitir leitores e escritores concorrentes.',
        'Read Committed evita dirty reads, mas operações separadas podem observar estados diferentes.',
        'Repeatable Read oferece snapshot mais estável dependendo do banco.',
        'Lost update ocorre quando escritas concorrentes sobrescrevem mudanças.',
        'Write skew viola invariante entre linhas mesmo quando não há conflito direto na mesma linha.',
        'Serializable tenta produzir resultado equivalente a uma ordem serial e pode abortar transações.'
      ],
      diagram: () => `T1: read A ───────── write A\nT2:      read A ───────── write A\n\nsem controle adequado -> uma atualização pode desaparecer`,
      example: { language: 'sql', code: `BEGIN;\nSELECT balance FROM accounts WHERE id = 1 FOR UPDATE;\nUPDATE accounts SET balance = balance - 100 WHERE id = 1;\nCOMMIT;` },
      pitfalls: ['Achar que ACID significa ausência de anomalias em qualquer isolamento.', 'Corrigir corrida apenas no código da aplicação.', 'Usar SELECT seguido de UPDATE sem entender lock/versionamento.']
    },
    {
      match: /kafka|consumer groups|offsets/i,
      objective: () => 'Entender Kafka como log particionado replicado, incluindo ordering por partição, offsets, consumer groups, retenção e como replay muda o modelo operacional.',
      internals: () => [
        'Topic é dividido em partitions; ordering é garantido dentro de uma partição, não globalmente.',
        'Producer escolhe partição, muitas vezes por key, que também define distribuição de carga.',
        'Consumer group distribui partitions entre consumidores e permite escala até o número de partitions.',
        'Offset registra posição lógica de consumo e pode ser reposicionado para replay.',
        'Retenção desacopla consumo da remoção imediata da mensagem.',
        'Replication factor e ISR afetam disponibilidade e durabilidade.'
      ],
      diagram: () => `producer key=user-42\n      │\n      ▼\n topic\n ├─ partition 0: [0][1][2]\n ├─ partition 1: [0][1][2][3] <- key hash\n └─ partition 2: [0]\n          │\n          ▼\n consumer group\n P0->C1  P1->C2  P2->C1`,
      example: { language: 'text', code: `Evento com key = orderId\n=> eventos do mesmo pedido vão para a mesma partição\n=> ordering por pedido\n=> pedidos diferentes podem ser processados em paralelo` },
      pitfalls: ['Exigir ordering global sem necessidade.', 'Aumentar consumidores acima do número de partitions esperando mais paralelismo.', 'Commitar offset antes de o efeito estar seguro.']
    },
    {
      match: /exactly-once/i,
      objective: () => 'Definir a fronteira de exactly-once com precisão e entender por que side effects externos continuam exigindo idempotência ou coordenação própria.',
      internals: () => [
        'At-most-once pode perder trabalho; at-least-once pode repetir.',
        'Exactly-once geralmente combina deduplicação, transações ou idempotência dentro de uma fronteira específica.',
        'Kafka EOS cobre determinadas operações Kafka-to-Kafka, não uma API HTTP arbitrária chamada pelo consumidor.',
        'Banco externo, e-mail, pagamento e webhook têm suas próprias semânticas.',
        'A pergunta correta é: exatamente uma vez onde e para qual efeito?' 
      ],
      diagram: () => `broker -> consumer -> DB -> API externa\n  |         |        |        |\n  └ garantia A       └ garantia diferente\n\n"exactly-once" não atravessa automaticamente todas as fronteiras`,
      example: { language: 'text', code: `idempotency_key = event_id\nINSERT processed_events(event_id)\nON CONFLICT DO NOTHING\n\nSó execute o efeito quando a inserção indicar evento novo.` },
      pitfalls: ['Escrever “exactly-once” sem especificar fronteira.', 'Acreditar que transação do broker inclui side effect externo.', 'Não testar redelivery real.']
    },
    {
      match: /idempotency keys|deduplicação/i,
      objective: () => 'Projetar operações repetíveis que produzam o mesmo efeito lógico mesmo quando retries, redelivery ou concorrência acontecem.',
      internals: () => [
        'Idempotência é propriedade do efeito observado, não do verbo HTTP isolado.',
        'Chave idempotente precisa de escopo, tempo de retenção e relação com o resultado original.',
        'Deduplicação deve ser persistente quando reinício não pode esquecer processamento.',
        'Concorrência exige constraint/lock/compare-and-set, não apenas if em memória.',
        'Resposta repetida deve ser consistente com a primeira execução.'
      ],
      diagram: () => `request/event K\n   │\n   ▼\n[dedup store]\n   ├── novo -> executa -> salva resultado\n   └── visto -> reutiliza resultado\n`,
      example: { language: 'sql', code: `INSERT INTO processed_events(event_id, processed_at)\nVALUES (:id, now())\nON CONFLICT (event_id) DO NOTHING;` },
      pitfalls: ['Deduplicar só em memória.', 'Chave sem escopo por operação/cliente.', 'Marcar como processado antes do side effect ficar seguro.']
    },
    {
      match: /oci images|namespaces|cgroups/i,
      objective: () => 'Entender containers como processos isolados e limitados pelo kernel, empacotados em imagens OCI, em vez de tratá-los como máquinas virtuais pequenas.',
      internals: () => [
        'Namespaces isolam visões de PID, rede, mounts, usuários e outros recursos.',
        'cgroups limitam e contabilizam CPU, memória e I/O.',
        'Imagem OCI é um conjunto de layers e metadata; container adiciona uma camada gravável efêmera.',
        'Copy-on-write reduz duplicação, mas pode introduzir custos em determinados padrões de I/O.',
        'PID 1 tem responsabilidades especiais sobre signals e processos filhos.',
        'Root dentro do container não equivale automaticamente a isolamento forte.'
      ],
      diagram: () => `host kernel\n  ├── namespaces -> visão isolada\n  ├── cgroups -> limites/contabilidade\n  └── filesystem layers\n          │\n          ▼\n      processo container`,
      example: { language: 'dockerfile', code: `FROM node:24-alpine AS build\nWORKDIR /app\nCOPY . .\nRUN npm ci && npm run build\n\nFROM node:24-alpine\nUSER node\nCOPY --from=build /app/dist /app\nCMD ["node", "/app/index.js"]` },
      pitfalls: ['Confundir container com VM.', 'Rodar como root sem necessidade.', 'Ignorar signal handling e graceful shutdown.']
    },
    {
      match: /kubernetes control loops|scheduler|controllers/i,
      objective: () => 'Entender Kubernetes como sistema de controle declarativo que reconcilia estado desejado e observado continuamente.',
      internals: () => [
        'API Server persiste objetos e é a porta de entrada do control plane.',
        'etcd armazena estado do cluster.',
        'Scheduler escolhe node para Pods ainda não associados.',
        'Controllers observam recursos e executam reconciliação até aproximar observed state do desired state.',
        'kubelet executa workloads no node conforme PodSpec.',
        'Falhas são tratadas por reconciliação repetida, não por uma sequência imperativa perfeita.'
      ],
      diagram: () => `YAML / client\n    │\n    ▼\nAPI Server -> etcd\n    │\n    ├── scheduler -> node escolhido\n    └── controllers -> reconciliam\n                    │\n                    ▼\n                 kubelet -> pods`,
      example: { language: 'yaml', code: `apiVersion: apps/v1\nkind: Deployment\nspec:\n  replicas: 3\n  selector:\n    matchLabels: {app: api}\n  template:\n    metadata: {labels: {app: api}}\n    spec:\n      containers:\n        - name: api\n          image: example/api:1.2.3` },
      pitfalls: ['Pensar em apply como script imperativo.', 'Não entender quem reconcilia cada recurso.', 'Diagnosticar Pod sem olhar events, status e controller owner.']
    },
    {
      match: /readiness|liveness|requests\/limits|rollout/i,
      objective: () => 'Configurar saúde e recursos de Kubernetes de forma que o cluster diferencie “pode receber tráfego”, “precisa reiniciar” e “precisa de capacidade”.',
      internals: () => [
        'Readiness remove Pod do tráfego sem necessariamente reiniciá-lo.',
        'Liveness serve para deadlock/estado irrecuperável, não para dependência temporariamente lenta.',
        'Startup probe protege inicializações lentas contra liveness prematura.',
        'requests alimentam scheduling e QoS; limits impõem teto de CPU/memória.',
        'CPU limit pode gerar throttling; memória acima do limite pode resultar em OOMKill.',
        'Rollout saudável depende de readiness, maxUnavailable/maxSurge e comportamento real de startup/shutdown.'
      ],
      diagram: () => `Pod\n ├── startup? -> já iniciou?\n ├── readiness? -> recebe tráfego?\n └── liveness? -> precisa reiniciar?\n\nrequests -> scheduler\nlimits   -> enforcement`,
      example: { language: 'yaml', code: `readinessProbe:\n  httpGet: {path: /ready, port: 8080}\n  periodSeconds: 5\nresources:\n  requests: {cpu: 200m, memory: 256Mi}\n  limits: {memory: 512Mi}` },
      pitfalls: ['Liveness consultar banco remoto e reiniciar todos os Pods durante incidente do banco.', 'Requests arbitrários que impedem scheduling.', 'CPU limit baixo criando throttling difícil de perceber.']
    },
    {
      match: /gitops|reconciliation|drift/i,
      objective: () => 'Usar GitOps como modelo de reconciliação e auditoria de estado desejado, não apenas como “deploy disparado por commit”.',
      internals: () => [
        'Git mantém declaração versionada do estado desejado.',
        'Controller compara estado desejado e observado continuamente.',
        'Drift é diferença entre o que está no Git e o que roda.',
        'Promotion move versões/configuração entre ambientes com revisão.',
        'Rollback precisa considerar dados e mudanças não reversíveis, não só git revert.',
        'Secrets exigem estratégia específica, como external secrets ou criptografia.'
      ],
      diagram: () => `Git desired state\n      │\n      ▼\nGitOps controller\n      │ compare\n      ▼\ncluster observed state\n      │\n      └── drift -> reconcile`,
      example: { language: 'text', code: `Commit muda image tag 1.2.3 -> 1.2.4\nController observa diferença\nAplica rollout\nHealth/metrics confirmam resultado\nRollback altera desired state novamente` },
      pitfalls: ['Permitir alterações manuais permanentes no cluster.', 'Tratar Git revert como rollback universal.', 'Misturar secrets em claro no repositório.']
    },
    {
      match: /oauth2|oidc|jwt|api keys|mtls/i,
      objective: () => 'Separar autenticação, autorização e delegação, escolhendo mecanismos de identidade adequados para usuário, workload e integração máquina a máquina.',
      internals: () => [
        'OAuth 2.0 é framework de autorização/delegação, não protocolo de autenticação por si só.',
        'OIDC adiciona identidade e ID Token sobre OAuth 2.0.',
        'Access Token representa autorização e precisa de audience/scope coerentes.',
        'JWT é formato de token, não política de segurança.',
        'API key identifica um cliente, mas normalmente oferece contexto de identidade limitado.',
        'mTLS autentica ambos os lados no transporte e pode complementar tokens.'
      ],
      diagram: () => `client\n  │ authorize/authenticate\n  ▼\nAuthorization Server\n  │ access token\n  ▼\nAPI / Resource Server\n  │ valida issuer/audience/scope\n  ▼\nrecurso`,
      example: { language: 'text', code: `client_credentials:\nclient -> token endpoint -> access_token\nclient -> API Authorization: Bearer ...\nAPI valida issuer, audience, expiry e scopes` },
      pitfalls: ['Usar ID Token como access token.', 'Validar assinatura JWT e esquecer audience/issuer.', 'Colocar segredo estático em app público/mobile.']
    },
    {
      match: /rate limiting|token bucket|burst|quotas/i,
      objective: () => 'Projetar rate limiting a partir do recurso protegido, identidade correta e comportamento de burst, evitando transformar limite em número arbitrário por IP.',
      internals: () => [
        'Token bucket acumula tokens até capacidade e permite bursts controlados.',
        'Leaky bucket suaviza saída em ritmo mais constante.',
        'Chave pode ser IP, usuário, client_id, tenant, API product ou recurso.',
        'Limite local é barato, mas não representa consumo global em múltiplas instâncias.',
        'Limite distribuído exige coordenação/estado e adiciona latência/falhas.',
        'Quota mede consumo em janela mais longa e resolve problema diferente de burst.'
      ],
      diagram: () => `requests -> [bucket tokens]\n              │ tem token -> passa\n              └ sem token -> 429\n\ntaxa repõe tokens\ncapacidade controla burst`,
      example: { language: 'text', code: `rate = 100 req/s\nbucket capacity = 200\n=> cliente pode fazer burst de 200\n=> depois converge para 100/s` },
      pitfalls: ['Limitar por IP atrás de NAT/proxy sem entender identidade.', 'Mesmo limite para operações de custos muito diferentes.', '429 sem Retry-After ou observabilidade por consumidor.']
    },
    {
      match: /kong db-less|control\/data plane|plugins/i,
      objective: () => 'Entender Kong como camada de edge e policy, incluindo configuração declarativa, separação control/data plane e custo operacional de plugins.',
      internals: () => [
        'DB-less carrega configuração declarativa e evita banco runtime, mas exige processo confiável de geração e promoção.',
        'Control plane administra configuração; data planes servem tráfego.',
        'Plugins executam em fases do request e podem afetar latência e disponibilidade.',
        'Policies de auth, rate limit e observabilidade pertencem ao edge quando são transversais.',
        'Lógica de domínio no plugin cria deploy coupling e debugging difícil.',
        'Mudanças precisam de validação, diff e rollback da configuração.'
      ],
      diagram: () => `config/Git\n   │\n   ▼\ncontrol plane\n   │ config\n   ▼\ndata plane -> plugins -> upstream`,
      example: { language: 'yaml', code: `_format_version: "3.0"\nservices:\n  - name: loyalty-api\n    url: http://loyalty-api\n    routes:\n      - name: loyalty\n        paths: [/loyalty]` },
      pitfalls: ['Plugin com regra de negócio.', 'Config DB-less sem validação e rollback.', 'Plugin customizado sem orçamento de latência.']
    },
    {
      match: /apigee proxies|flows|policies|products|apps/i,
      objective: () => 'Modelar Apigee por proxies, flows, policies, API products e apps, entendendo em qual estágio cada política roda e como troubleshootar autenticação e subscription.',
      internals: () => [
        'API Proxy recebe tráfego e define ProxyEndpoint/TargetEndpoint.',
        'Flows e conditions controlam quando policies executam.',
        'VerifyAPIKey, OAuth, quota e spike arrest resolvem preocupações diferentes.',
        'API Product agrupa recursos e quotas oferecidos a consumidores.',
        'Developer App associa credenciais a produtos.',
        'Trace/debug precisa seguir policy por policy até o target.'
      ],
      diagram: () => `client\n  │\n  ▼\nProxyEndpoint\n  ├ auth policy\n  ├ quota/policy\n  ├ transform\n  ▼\nTargetEndpoint -> backend`,
      example: { language: 'text', code: `401? verificar:\n1. credencial chegou?\n2. policy executou?\n3. app está associado ao API Product?\n4. produto permite este resource path?\n5. token/subscription está válido?` },
      pitfalls: ['Investigar só backend quando policy bloqueia antes do target.', 'Confundir API key com OAuth client secret.', 'Product não incluir path e parecer erro de credencial.']
    },
    {
      match: /opentelemetry sdk|collector|otlp|propagation/i,
      objective: () => 'Entender o pipeline OpenTelemetry de instrumentação até backend e diagnosticar onde traces, métricas ou contexto podem desaparecer.',
      internals: () => [
        'API cria contrato de instrumentação; SDK implementa providers, processors e exporters.',
        'Instrumentation automática/manual cria spans e atributos.',
        'Propagation transporta trace context entre processos por headers.',
        'OTLP define protocolo de exportação via gRPC/HTTP.',
        'Collector recebe, processa e exporta sinais, desacoplando aplicação do vendor.',
        'Resource attributes descrevem entidade emissora; span attributes descrevem operação.'
      ],
      diagram: () => `app instrumentation\n      │ spans\n      ▼\nOpenTelemetry SDK\n      │ OTLP\n      ▼\nCollector\n  ├ processors\n  ├ sampling/batching\n  └ exporters\n      ▼\nbackend`,
      example: { language: 'yaml', code: `receivers:\n  otlp:\n    protocols:\n      grpc: {}\nprocessors:\n  batch: {}\nexporters:\n  otlphttp:\n    endpoint: https://example/v1/traces` },
      pitfalls: ['Atributo de request colocado como resource.', 'Propagator ausente entre serviços.', 'Collector recebe sinal mas exporter/rede/backend descarta silenciosamente.']
    },
    {
      match: /sli|slo|error budget|burn rate/i,
      objective: () => 'Transformar confiabilidade em contrato mensurável de experiência do usuário usando indicadores, objetivos e velocidade de consumo do error budget.',
      internals: () => [
        'SLI é a medição, por exemplo proporção de requests válidos abaixo de uma latência.',
        'SLO é o objetivo para um período, por exemplo 99.9% em 30 dias.',
        'Error budget é a quantidade de falha permitida pelo SLO.',
        'Burn rate mede quão rápido esse orçamento está sendo consumido.',
        'Alertas multi-window/multi-burn equilibram rapidez e ruído.',
        'SLO deve representar experiência, não saúde interna de componente isolado.'
      ],
      diagram: () => `eventos bons / eventos válidos = SLI\n             │\n             ▼\n         SLO alvo\n             │\n             ▼\n       error budget\n             │\n             ▼\n       burn rate alert`,
      example: { language: 'text', code: `SLO 99.9% / 30 dias\nerror budget = 0.1%\n\nSe burn rate = 14.4x por 1h, o orçamento mensal está sendo consumido rápido demais.` },
      pitfalls: ['SLO de CPU.', 'Excluir erros “feios” para melhorar SLI.', 'Alertar em toda violação instantânea do objetivo mensal.']
    },
    {
      match: /head sampling|tail sampling/i,
      objective: () => 'Escolher sampling entendendo quando a decisão ocorre, quais traces precisam ser preservados e como custo e memória crescem.',
      internals: () => [
        'Head sampling decide no início do trace e é barato, mas ainda não conhece resultado final.',
        'Tail sampling espera spans chegarem e decide com base em erro, latência ou atributos.',
        'Tail sampling exige buffering e uma visão suficientemente completa do trace.',
        'Parent-based sampling preserva coerência da decisão entre spans.',
        'Sampling não deve apagar sistematicamente erros raros ou caudas que sustentam investigação.'
      ],
      diagram: () => `HEAD: request -> decide -> cria/descarta\n\nTAIL: request -> spans -> buffer -> observa erro/p99 -> decide`,
      example: { language: 'text', code: `Política tail:\n- manter 100% dos errors\n- manter traces > 2s\n- amostrar 1% do restante\n\nDepois medir custo e representatividade.` },
      pitfalls: ['Sampling uniforme que remove incidentes raros.', 'Tail sampler sem memória suficiente.', 'Misturar sampling de trace com cardinalidade de métricas.']
    },
    {
      match: /rag:|hybrid search|grounding/i,
      objective: () => 'Construir e avaliar RAG como pipeline de recuperação + geração, separando qualidade de ingestão, retrieval, reranking, contexto e resposta.',
      internals: () => [
        'Ingestão define corpus, parsing, metadata e freshness.',
        'Chunking controla granularidade e contexto recuperável.',
        'Retrieval pode ser lexical, denso ou híbrido.',
        'Reranking reordena candidatos com modelo mais caro e preciso.',
        'Context assembly precisa controlar redundância, orçamento de tokens e citações.',
        'Generation deve ser avaliada separadamente de retrieval para localizar falhas.'
      ],
      diagram: () => `documentos\n   ▼\nparse -> chunks -> index\n                 │\nquery -> retrieve top-k\n                 ▼\n              rerank\n                 ▼\n         contexto selecionado\n                 ▼\n               LLM\n                 ▼\n resposta grounded + fontes`,
      example: { language: 'python', code: `candidates = hybrid_search(query, k=30)\nranked = rerank(query, candidates)[:6]\nanswer = generate(query=query, context=ranked)\n\n# medir recall@k antes de julgar a resposta final` },
      pitfalls: ['Mexer no prompt quando o documento certo nunca foi recuperado.', 'Chunks gigantes sem metadata.', 'Avaliar apenas resposta final e não recall/precision do retrieval.']
    },
    {
      match: /golden sets|rubrics|regression evals/i,
      objective: () => 'Criar evals repetíveis que transformem qualidade de IA em série comparável ao longo de mudanças de prompt, modelo, retrieval e tools.',
      internals: () => [
        'Golden set deve representar casos normais, limites, falhas e distribuição real.',
        'Rubric precisa definir critérios observáveis em vez de “resposta boa”.',
        'Baseline vem antes da otimização.',
        'Regressão compara versões com mesma coleção e critérios.',
        'Métricas automáticas e revisão humana se complementam.',
        'Slice analysis revela grupos onde média esconde regressão.'
      ],
      diagram: () => `dataset versionado\n      │\n      ▼\n sistema candidato\n      │ outputs\n      ▼\n rubric / judge / checks\n      │\n      ▼\n métricas + slices + regressões`,
      example: { language: 'json', code: `{"id":"case-17","input":"...","expected_facts":["A","B"],"must_not":["inventar fonte"],"slice":"long-context"}` },
      pitfalls: ['Golden set só com exemplos fáceis.', 'Trocar dataset a cada versão e perder comparabilidade.', 'Usar LLM-as-judge sem calibrar concordância.']
    },
    {
      match: /mcp hosts|clients|servers|tools|resources/i,
      objective: () => 'Entender MCP como protocolo de contexto e capacidades, distinguindo host, client, server, tools, resources e fronteiras de autorização.',
      internals: () => [
        'Host é a aplicação que coordena experiência e permissões.',
        'Client mantém conexão/protocolo com um server MCP.',
        'Server expõe capabilities como tools, resources e prompts conforme suporte.',
        'Tool representa ação invocável e precisa de schema claro e escopo estreito.',
        'Resource representa conteúdo endereçável que pode ser lido sem confundir leitura com ação.',
        'Autorização e consentimento pertencem à fronteira real do sistema, não ao texto do prompt.'
      ],
      diagram: () => `Host\n ├─ MCP Client A -> Server A -> tools/resources\n └─ MCP Client B -> Server B -> tools/resources\n\nhost decide contexto, exposição e autorização`,
      example: { language: 'json', code: `{"name":"get_order","description":"Read one order by id","inputSchema":{"type":"object","properties":{"orderId":{"type":"string"}},"required":["orderId"]}}` },
      pitfalls: ['Tool “doEverything”.', 'Descrição ambígua que força o modelo a adivinhar efeitos.', 'Servidor ganhar acesso maior que o usuário realmente autorizou.']
    },
    {
      match: /loop percepção|termination conditions|budgets/i,
      objective: () => 'Projetar um loop agente que faça progresso mensurável, pare por condições explícitas e não continue consumindo ferramentas ou tokens indefinidamente.',
      internals: () => [
        'Cada iteração observa estado, escolhe ação, executa e incorpora resultado.',
        'Termination pode ser sucesso, erro irreparável, max_steps, deadline ou budget.',
        'Progress detector identifica ciclos que repetem o mesmo estado/ação.',
        'Tool results devem alterar estado ou fornecer evidência nova.',
        'Cost budget e risk budget são limites diferentes.',
        'Escalonamento humano deve carregar contexto suficiente para revisão.'
      ],
      diagram: () => `observe\n  ▼\nreason/plan\n  ▼\naction/tool\n  ▼\nresult -> update state\n  │\n  ├ success -> stop\n  ├ no progress -> stop/escalate\n  └ budget ok -> loop`,
      example: { language: 'python', code: `for step in range(MAX_STEPS):\n    action = policy(state)\n    result = run(action)\n    state = reduce(state, result)\n    if state.done or no_progress(state):\n        break` },
      pitfalls: ['Loop sem max_steps.', 'Retry infinito com ferramenta que retorna mesmo erro.', 'Condição de sucesso descrita só em linguagem natural vaga.']
    },
    {
      match: /working, episodic|semantic memory|estado persistente/i,
      objective: () => 'Separar estado de execução de memórias recuperáveis e definir o que deve ser persistido para evitar repetição de trabalho e erros.',
      internals: () => [
        'Working memory contém contexto imediato necessário para a tarefa atual.',
        'Episodic memory registra experiências e resultados concretos.',
        'Semantic memory guarda conhecimento abstraído e reutilizável.',
        'Estado persistente precisa de versionamento e origem para auditoria.',
        'Memória útil exige política de escrita, retrieval e expiração.',
        'Guardar tudo aumenta ruído, custo e risco de recuperar informação obsoleta.'
      ],
      diagram: () => `evento atual -> working state\n                 │\n                 ├ write episode -> histórico\n                 └ distill -> semantic memory\n\nnova tarefa -> retrieve só memória relevante`,
      example: { language: 'json', code: `{"taskId":"T-42","step":7,"attempted":["fix-a"],"result":"same compiler error","next":"escalate","traceId":"..."}` },
      pitfalls: ['Memória sem provenance.', 'Persistir chain-of-thought ou ruído em vez de decisões/evidências.', 'Recuperar memórias antigas sem checar validade temporal.']
    },
    {
      match: /git: commit|tree, blob|refs, head|index/i,
      objective: () => 'Entender Git como banco de objetos e referências para que merge, rebase, reset e recuperação deixem de parecer comandos mágicos.',
      internals: () => [
        'Blob armazena conteúdo; tree mapeia nomes para blobs/trees.',
        'Commit aponta para tree e commits pais, formando DAG.',
        'Branch é uma ref móvel para um commit.',
        'HEAD aponta para branch/ref atual ou pode ficar detached.',
        'Index representa staging area entre working tree e commit.',
        'Reflog registra movimentos locais de refs e permite recuperação.'
      ],
      diagram: () => `working tree\n     │ git add\n     ▼\n   index\n     │ git commit\n     ▼\n commit -> tree -> blobs\n    ▲\n branch ref\n    ▲\n   HEAD`,
      example: { language: 'bash', code: `git cat-file -p HEAD\ngit ls-tree HEAD\ngit rev-parse HEAD\ngit reflog --date=relative` },
      pitfalls: ['Usar reset --hard sem entender qual árvore muda.', 'Confundir arquivo com blob identificado pelo caminho.', 'Achar que commit “contém diff” em vez de snapshot/tree + parent.']
    }
  ];

  function profileFor(topic) {
    return PROFILES.find(profile => profile.match.test(topic)) || DEFAULT_PROFILE;
  }

  function guideFor(theme, index) {
    try {
      if (typeof topicGuide === 'function') return topicGuide(theme, index);
    } catch {}
    return {};
  }

  function conceptTokens(topic) {
    return topic
      .split(/[:,;/]|\be\b|\bversus\b|\bvs\.?\b|\+/i)
      .map(part => part.trim())
      .filter(part => part.length > 2)
      .slice(0, 8);
  }

  function progressiveExercises(theme, topic, guide) {
    const lab = guide.lab || theme.labs?.[0] || `Construa um experimento pequeno que torne “${topic}” observável.`;
    const decision = guide.decision || theme.decisions?.[0] || `Compare uma alternativa a “${topic}” e registre o trade-off.`;
    return [
      { level: '01 · Reconhecer', text: `Explique “${topic}” sem consultar material, em no máximo cinco frases. Inclua o problema resolvido e um limite importante.` },
      { level: '02 · Experimentar', text: lab },
      { level: '03 · Decidir', text: decision },
      { level: '04 · Quebrar', text: `Introduza uma falha, carga, entrada limite ou configuração ruim relacionada a “${topic}”. Registre hipótese, evidência observada e forma de recuperação.` }
    ];
  }

  function masteryQuestions(theme, topic, profile) {
    const parts = conceptTokens(topic);
    return [
      `Qual problema concreto “${topic}” resolve e qual problema ele não resolve?`,
      `Que estado, invariante ou recurso é mais importante para o mecanismo funcionar?`,
      `Como você observaria em produção que este mecanismo está degradando ou falhando?`,
      `Qual alternativa você escolheria se ${parts[0] || 'a restrição principal'} mudasse drasticamente?`,
      `Você consegue desenhar o fluxo do mecanismo e explicar cada seta sem usar nomes de produtos?`
    ];
  }

  function chapter(theme, index) {
    const topic = theme.focus[index];
    const guide = guideFor(theme, index);
    const profile = profileFor(topic);
    const objective = typeof profile.objective === 'function' ? profile.objective(topic, theme) : profile.objective;
    const internals = typeof profile.internals === 'function' ? profile.internals(topic, theme) : profile.internals;
    const diagram = typeof profile.diagram === 'function' ? profile.diagram(topic, theme) : profile.diagram;
    const pitfalls = profile.pitfalls || DEFAULT_PROFILE.pitfalls;
    const exercises = progressiveExercises(theme, topic, guide);
    const questions = masteryQuestions(theme, topic, profile);
    const concepts = conceptTokens(topic);
    const references = (theme.references || []).slice(0, 6);
    const previous = index > 0 ? `#/chapter/${theme.id}/${index - 1}` : null;
    const next = index < theme.focus.length - 1 ? `#/chapter/${theme.id}/${index + 1}` : null;
    return { topic, guide, objective, internals, diagram, pitfalls, exercises, questions, concepts, references, previous, next, example: profile.example };
  }

  function codeHtml(example) {
    if (!example) return '';
    return `<section class="chapter-section"><div class="eyebrow">Exemplo mínimo</div><h2>Faça o mecanismo aparecer</h2><p>O exemplo não é receita de produção. Ele existe para tornar uma parte do comportamento observável e discutível.</p><pre class="chapter-code"><code>${block(example.code)}</code></pre><div class="chapter-code-label">${html(example.language || 'text')}</div></section>`;
  }

  function chapterHtml(theme, index) {
    const c = chapter(theme, index);
    const checked = typeof done === 'function' ? done(theme.id, index) : false;
    const internals = c.internals.map(item => `<li>${html(item)}</li>`).join('');
    const pitfalls = c.pitfalls.map(item => `<li>${html(item)}</li>`).join('');
    const questions = c.questions.map(item => `<li>${html(item)}</li>`).join('');
    const concepts = c.concepts.length ? c.concepts.map(item => `<span class="chapter-chip">${html(item)}</span>`).join('') : `<span class="chapter-chip">${html(theme.category)}</span>`;
    const exercises = c.exercises.map(item => `<article class="exercise-card"><div class="eyebrow">${html(item.level)}</div><p>${html(item.text)}</p></article>`).join('');
    const refs = c.references.map(item => `<li>${html(item)}</li>`).join('');
    const source = theme.source ? `<a class="source-link" href="${html(sourceUrl(theme.source))}" target="_blank" rel="noopener noreferrer">Abrir Codex fonte ↗</a>` : '';
    const prev = c.previous ? `<a class="button secondary" href="${c.previous}">← Tópico anterior</a>` : '<span></span>';
    const next = c.next ? `<a class="button primary" href="${c.next}">Próximo tópico →</a>` : `<a class="button primary" href="#/theme/${theme.id}">Voltar ao tema</a>`;

    return `<div class="breadcrumbs"><a href="#/">Alexandria</a><span>›</span><a href="#/themes">Temas</a><span>›</span><a href="#/theme/${html(theme.id)}">${html(theme.title)}</a><span>›</span>Capítulo ${index + 1}</div>
      <header class="chapter-hero">
        <div class="eyebrow">${html(theme.category)} · capítulo ${String(index + 1).padStart(2, '0')} de ${theme.focus.length}</div>
        <h1>${html(c.topic)}</h1>
        <p class="lead">${html(c.objective)}</p>
        <div class="chapter-chips">${concepts}</div>
      </header>
      <div class="chapter-layout">
        <main>
          <section class="chapter-section chapter-intro">
            <div class="eyebrow">Modelo mental</div>
            <h2>O que está acontecendo por baixo</h2>
            <p>${html(c.guide.mechanism || c.objective)}</p>
            <ul class="chapter-list">${internals}</ul>
          </section>

          <section class="chapter-section">
            <div class="eyebrow">Diagrama</div>
            <h2>Desenhe antes de decorar</h2>
            <pre class="chapter-diagram">${block(c.diagram)}</pre>
          </section>

          ${codeHtml(c.example)}

          <section class="chapter-section">
            <div class="eyebrow">Prática progressiva</div>
            <h2>Do entendimento à prova</h2>
            <div class="exercise-grid">${exercises}</div>
          </section>

          <section class="chapter-section">
            <div class="eyebrow">Failure modes</div>
            <h2>Onde o raciocínio costuma quebrar</h2>
            <ul class="chapter-list danger-list">${pitfalls}</ul>
          </section>

          <section class="chapter-section">
            <div class="eyebrow">Autoavaliação</div>
            <h2>Perguntas de domínio</h2>
            <ol class="chapter-list">${questions}</ol>
          </section>
        </main>

        <aside class="chapter-sidebar">
          <section class="panel sticky chapter-side-card">
            <div class="eyebrow">Evidência de aprendizado</div>
            <p>${html(c.guide.evidence || 'Produza algo revisável que prove entendimento: código, benchmark, diagrama, ADR, trace, teste ou runbook.')}</p>
            <label class="chapter-complete"><input type="checkbox" id="chapterDone" ${checked ? 'checked' : ''}><span>Marcar tópico como estudado</span></label>
            <hr>
            <div class="eyebrow">Leituras</div>
            <ul class="ref-list">${refs}</ul>
            ${source}
          </section>
        </aside>
      </div>
      <nav class="chapter-pager">${prev}${next}</nav>`;
  }

  function renderChapter() {
    const route = chapterRoute();
    if (!route || typeof state === 'undefined' || !state?.data?.themes) return false;
    const theme = state.data.themes.find(item => item.id === route.themeId);
    if (!theme || !theme.focus?.[route.index]) {
      const app = document.getElementById('app');
      if (app) app.innerHTML = '<div class="empty"><h2>Capítulo não encontrado</h2><a href="#/themes">Voltar aos temas</a></div>';
      return true;
    }
    const app = document.getElementById('app');
    if (!app) return false;
    app.innerHTML = chapterHtml(theme, route.index);
    scrollTo(0, 0);
    const checkbox = document.getElementById('chapterDone');
    if (checkbox && typeof setDone === 'function') {
      checkbox.addEventListener('change', () => setDone(theme.id, route.index, checkbox.checked));
    }
    if (typeof installUI === 'function') installUI();
    return true;
  }

  function decorateTopicList() {
    if (chapterRoute()) return;
    document.querySelectorAll('.focus-item').forEach((item, fallbackIndex) => {
      if (item.querySelector('.chapter-link')) return;
      const checkbox = item.querySelector('input[data-theme][data-index]');
      if (!checkbox) return;
      const themeId = checkbox.dataset.theme;
      const index = Number(checkbox.dataset.index ?? fallbackIndex);
      if (!themeId || !Number.isInteger(index)) return;
      const link = document.createElement('a');
      link.className = 'chapter-link';
      link.href = `#/chapter/${themeId}/${index}`;
      link.textContent = 'Abrir capítulo completo →';
      item.appendChild(link);
    });
  }

  const observer = new MutationObserver(() => {
    if (!renderChapter()) decorateTopicList();
  });

  function boot() {
    const app = document.getElementById('app');
    if (!app) return;
    observer.observe(app, { childList: true, subtree: true });
    let tries = 0;
    const ready = () => {
      tries += 1;
      if (typeof state !== 'undefined' && state?.data?.themes?.length) {
        if (!renderChapter()) decorateTopicList();
        return;
      }
      if (tries < 240) setTimeout(ready, 25);
    };
    ready();
    addEventListener('hashchange', () => setTimeout(() => {
      if (!renderChapter()) decorateTopicList();
    }, 0));
  }

  boot();
})();