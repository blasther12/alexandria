# Kotlin — exercícios e projetos

---

[← Internals](internals.md) · [↑ Kotlin](README.md) · [→ Referências](references.md)

Cada exercício deve declarar target e toolchain. Entregue Gradle Wrapper, comandos reproduzíveis, testes, análise de erros e nota de trade-offs. Framework não substitui domínio nem entendimento de coroutines/JVM.

## Critérios comuns

| Dimensão | Evidência |
| --- | --- |
| Correção | invariants no constructor/parser e tests de borda |
| Tipos | nullability explícita, sealed states e casts/`!!` justificados |
| Concorrência | scope owner, limites, cancellation, failure policy e cleanup |
| Segurança | input/schema limits, autorização e dependencies verificáveis |
| Performance | benchmark/profile adequado ao target, com baseline |
| Operação | logs/métricas/traces sem PII; runbook nos serviços |
| Interop | tests no consumer Java/target quando fizer parte do contrato |

## Beginner

### 1. Value objects de catálogo

Implemente `Sku`, `Money` em minor units e `Quantity`. Constructors devem validar formato/faixa e proteger overflow. Modele `Product` e total de linha.

Teste strings vazias, Unicode não permitido pelo contrato, valores negativos, multiplication overflow e currencies diferentes. Não use `Double` para dinheiro.

### 2. Estados de entrega

Modele `Created`, `Dispatched`, `Delivered` e `Cancelled` com sealed hierarchy. Apenas states válidos carregam tracking/timestamps/reason. Escreva formatter e transition function exaustivos.

Adicione um state e confirme que o compiler aponta todos os consumers relevantes.

### 3. Collections sem retenção desnecessária

Receba milhões de eventos de laboratório e agregue contagem/valor por category. Compare `groupBy`, `groupingBy` e loop com mutable map interno/public immutable snapshot.

Explique complexidade e meça allocation/tempo sem afirmar que um estilo sempre vence.

### 4. Parser de configuração

Transforme `Map<String, String?>` em `ServiceConfig`: port, timeout, log level e optional endpoint. Colete todos os erros sem logar secret values e diferencie ausência de vazio.

Não use `!!`; escreva table-driven tests e gere mensagem segura para operator.

## Intermediate

### 5. Repository por composição

Crie domain service que depende de interface mínima `OrderRepository`, `Clock` e `IdGenerator`. Faça implementações in-memory thread-safe e adapter JDBC fake/real conforme ambiente.

Teste regras sem mocking framework e discuta transaction boundary, ownership do mutable state e por que generic repository talvez esconda o domínio.

### 6. Java interop contract

Escreva uma library Kotlin consumida por fixture Java. Cubra nullability annotations, defaults/overloads, checked exception, function/SAM e collections.

Depois consuma API Java que retorna platform type incorreto. Centralize normalização e teste ambos os callers. Inspecione signatures com `javap`.

### 7. Fan-out estruturado

Implemente `suspend fun loadDashboard(id)` consultando três dependencies em paralelo.

Requisitos:

- deadline total e timeout por dependency com distinção clara;
- limite de concorrência global;
- cancellation propagada;
- política de falha parcial explícita;
- nenhum `GlobalScope`, `runBlocking` interno ou `Thread.sleep`;
- tests com virtual time/fakes.

### 8. Flow com backpressure

Transforme um producer paginado em `Flow<Event>`, processe em batches e grave via consumer lento. Compare buffer zero, limitado e conflation (quando semanticamente aceitável).

Teste cancellation no terceiro batch, exception do collector, cleanup e memória sob producer mais rápido.

## Advanced

### 9. Worker pool de coroutines

Projete fila limitada com número fixo de workers, per-job timeout e graceful shutdown. Defina ordering, fairness, retry/idempotency e outcome de jobs na fila ao encerrar.

Faça stress test e prove que active/queued nunca excedem limits. Exponha gauges e duração sem usar job ID como metric label.

### 10. Profiling JVM

Escolha um pipeline com allocation alta. Capture JFR/async-profiler, identifique hot allocation/retaining path e formule hipótese. Compare uma mudança algorítmica, collection/sequence e value class boxing.

Relatório inclui warm-up, workload, p50/p99, throughput, heap/GC e ameaça à validade. Aceite “sem ganho relevante” como resultado.

### 11. Serviço HTTP seguro

Implemente endpoint de importação com Ktor, Spring ou stack mínima justificada:

- authn/authz, request/body limit e schema validation;
- transaction/idempotency key;
- parametrização de queries e sem deserialization polimórfica aberta;
- deadline, overload protection e graceful shutdown;
- logs redigidos, metrics RED e traces;
- unit/integration/contract/load tests.

Produza threat model de injection, SSRF, broken access control, dependency/plugin compromise e resource exhaustion.

### 12. Library multiplataforma pequena

Extraia parsing/value objects para `commonMain`; implemente clock/storage adapter em JVM e outro target. Teste em ambos e documente diferenças de regex, time, threading, errors e serialization.

Se a abstração piorar o desenho, entregue a conclusão de não compartilhar e um boundary mais honesto — isso vale como solução.

## Expert

### 13. Laboratório de cancellation

Construa matrix de `coroutineScope`, `supervisorScope`, `launch`, `async`, timeout e exception handler. Injete failures antes/depois de suspension e durante cleanup.

Para cada caso, desenhe Job tree, preveja outcomes, execute e cite documentação. Identifique failure não observada, child zumbi e cleanup que mascara causa.

### 14. Concorrência e memory model

Implemente contador/estado composto usando, separadamente, confinement, `Mutex`, atomics e `synchronized`. Faça stress/litmus tests e explique happens-before e operação composta.

Não use ausência de falha em uma execução como prova. Compare blocking, suspension, fairness e interoperabilidade.

### 15. ABI evolution

Publique três versões locais de library Kotlin/JVM. Mude default parameter, data class constructor, inline function, value class, sealed hierarchy e nullability.

Teste consumers Kotlin/Java já compilados e recompilados. Classifique source, binary, behavioral e serialization compatibility; produza migration guide e API/ABI checks automatizados.

### 16. Compiler/build incident

Reproduza build lento ou cache miss com annotation processing/plugin, source sets e dependency graph. Use Gradle/Kotlin build reports para decompor tempo e inputs.

Corrija uma causa por vez, preserve build correctness e documente riscos de cache remoto. Sanitize source/paths/secrets antes de compartilhar report.

## Projeto integrador: processador de pedidos

### Cenário

Uma API recebe pedidos, reserva inventory, autoriza payment e publica outcome. Retries e mensagens duplicadas são esperados; dependências podem ficar lentas ou retornar state incerto.

### Domain model

- `OrderId`, `Sku`, `Money`, `Quantity` como value objects;
- sealed order states e transition function;
- comandos/eventos versionados e validados;
- distinction entre rejection de domínio, conflito, falha transitória e cancellation;
- nenhum framework type no núcleo.

### Milestones

1. **Core:** regras puras, clock/ID injetados e unit tests.
2. **Persistence:** transaction boundary, optimistic locking e idempotency record.
3. **Orchestration:** structured concurrency e policy para inventory/payment; não paralelize operações dependentes.
4. **Messaging:** transactional outbox/inbox ou alternativa com failure analysis.
5. **API:** authz, limits, runtime validation, stable error contract e request cancellation.
6. **Operation:** health/readiness distintos, logs, metrics, traces, dashboard e alerts ligados a SLO.
7. **Resilience:** retry budget, backoff/jitter, deadline, circuit/load shedding e graceful shutdown.
8. **Delivery:** container/JVM flags conscientes do limite, SBOM, dependency verification, migration/rollback.

### Failure injection

Simule:

- payment timeout após possível autorização;
- inventory responde duas vezes ou fora de ordem;
- process termina entre commit e publish;
- outbox consumer recebe duplicata;
- database pool satura;
- cancellation durante compensation;
- payload gigante/unknown event version;
- GC pressure e dispatcher starvation.

Defina outcome e recovery para cada caso antes de implementar.

### Observabilidade mínima

- correlation/trace ID propagado por coroutine context suportado;
- logs de state transition sem dados de cartão/PII;
- request rate/error/duration e saturation de pools/queues;
- counters de retry/duplicate/conflict com labels limitadas;
- traces de DB e downstream com sampling;
- JFR procedure no runbook e alerta baseado em sintoma de usuário.

### Test strategy

- unit para invariants/transitions;
- integration para DB/outbox e framework boundary;
- contract para inventory/payment/event schema;
- concurrency/stress para idempotency e race;
- failure/load para SLO e overload;
- smoke test do artifact/container final.

### Review arquitetural

Responda:

1. Onde começa/termina cada transaction?
2. Quem possui cada CoroutineScope e queue?
3. Qual operação é idempotente e com qual key/retention?
4. Como distinguir timeout de outcome desconhecido?
5. Quais limits impedem heap/thread/connection exhaustion?
6. Como rollback lida com schema/event compatibility?
7. Que evidência justificaria Multiplatform aqui?

## Entrevista prática

Faça uma sessão de 60 minutos:

1. 10 min: esclarecer invariants de state machine;
2. 20 min: implementar sealed model e transitions;
3. 15 min: tornar orchestration suspending/cancelável;
4. 10 min: testes de failure/concurrency;
5. 5 min: JVM performance e observabilidade.

Avalie comunicação e trade-offs. Trivia de scope functions não substitui domínio do runtime.

## Autoavaliação

- [ ] Minhas public APIs expressam nullability, states e ownership.
- [ ] Não há scope/job sem owner nem queue sem limite.
- [ ] Cancellation e exceptions preservam semantics.
- [ ] Interop Java e target artifacts têm tests.
- [ ] Profile/benchmark separa JVM warm-up e steady state.
- [ ] Build/plugins/dependencies são reproduzíveis e auditáveis.
- [ ] Observabilidade ajuda a distinguir app, dispatcher, DB e GC.

---

[← Internals](internals.md) · [↑ Kotlin](README.md) · [→ Referências](references.md)
