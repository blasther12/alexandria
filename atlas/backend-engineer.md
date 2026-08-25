# Percurso: Backend Engineering

## Resultado

Construir serviços que preservam contratos e dados sob concorrência, degradação,
falhas parciais e evolução contínua. O objetivo não é conhecer frameworks; é
conseguir prever o comportamento do sistema e demonstrá-lo em produção.

## Diagnóstico de entrada

Antes de começar, tente responder sem consultar material:

- o que acontece entre `accept()` de uma conexão e a resposta HTTP?
- quando um retry é seguro e quando duplica um efeito de negócio?
- por que uma transação pode estar correta isoladamente e ainda quebrar um fluxo?
- como distinguir lentidão de CPU, banco, pool, rede e fila?
- o que acontece se o banco confirmar e a publicação do evento falhar?

As perguntas que não consegue explicar viram o backlog da trilha.

## Marcos

| Marco | Estude | Evidência de conclusão |
| --- | --- | --- |
| Runtime e I/O | linguagem, sockets, concorrência, cancelamento | servidor com timeout, backpressure e shutdown gracioso |
| Contratos HTTP | HTTP, validação, authn/authz, idempotência | API versionada com contract e integration tests |
| Persistência | SQL, PostgreSQL, índices, MVCC, migrations | plano de consulta medido e concorrência reproduzida |
| Cache | Redis, TTL, invalidação, stampede | cache com política de frescor e degradação explícita |
| Assíncrono | Kafka, SQS, outbox, deduplicação | worker idempotente sob replay e poison message |
| Distribuição | consistência, retries, deadlines, circuit breaking | análise de falha parcial com fault injection |
| Operação | Docker, OTel, SLOs, capacidade | dashboard, alerta e runbook exercitado |
| Evolução | schema, compatibilidade, rollout, ADR | duas versões convivendo com rollback seguro |

## Laboratórios obrigatórios

### Concorrência e overload

Crie um endpoint com uma dependência lenta. Aumente a concorrência até o pool
saturar e compare:

- fila ilimitada;
- limite de concorrência;
- timeout/deadline;
- shed de carga.

Registre throughput, p50, p95, p99 e uso do recurso limitante.

### Banco e consistência

Reproduza ao menos uma anomalia de concorrência no PostgreSQL. Depois corrija com
constraint, lock, isolamento ou redesign. A entrega deve explicar por que a
correção está na camada correta.

### Entrega assíncrona

Mate o consumer depois do efeito durável e antes do commit/ack. Demonstre a
redelivery e prove efeito único com uma estratégia de idempotência.

### Falha de dependência

Injete latência, timeout e erro em uma dependência externa. Verifique se retry,
backoff, jitter e circuit breaking reduzem ou ampliam o incidente.

## Projeto de síntese

Evolua os [projetos 1 a 9](../projects/README.md) como uma **plataforma de
notificações**:

1. API para registrar preferência e solicitar notificação;
2. PostgreSQL como fonte de verdade;
3. Redis apenas para dado derivado;
4. evento publicado via outbox;
5. Kafka para fatos e SQS para trabalho de entrega quando a semântica justificar;
6. idempotência por operação de negócio;
7. Docker e Kubernetes com graceful shutdown;
8. OpenTelemetry ponta a ponta;
9. SLO, capacity test, runbook e post-mortem de uma falha injetada.

Não é obrigatório usar toda tecnologia. Uma decisão de **não usar** Kafka,
Redis ou Kubernetes vale quando sustentada por requisitos e medição.

## Checkpoints

### Fundamentos

Explique o caminho de uma request da rede ao banco, incluindo pool, transação e
resposta. Desenhe onde existem filas e buffers.

### Aplicação

Entregue uma operação idempotente com migration, testes, autenticação,
autorização e tratamento explícito de timeout.

### Proficiência

Receba um cenário com p99 alto e diagnostique por evidência, sem reiniciar o
serviço como primeira ação. Produza hipótese, sinais e experimento de validação.

### Sistemas

Projete a evolução para 10x de carga. Declare o gargalo esperado, a capacidade de
cada dependência, estratégia de rollout e quais mudanças só serão feitas quando
um gatilho mensurável aparecer.

## Perguntas de entrevista

Use também o [banco geral de entrevistas](../interview/README.md).

- Onde termina a idempotência HTTP e começa a idempotência de negócio?
- Qual a diferença entre timeout, deadline e cancelamento propagado?
- Quando uma fila melhora confiabilidade e quando só esconde overload?
- Como fazer migration sem impedir rollback da aplicação?
- Consumer lag alto significa necessariamente que o sistema está atrasado?
- Quando cache deve falhar aberto, fechado ou ser ignorado?
- Como provar que um retry policy não cria retry storm?

## Critério de conclusão

A trilha termina quando você consegue **implementar, medir, quebrar, diagnosticar
e evoluir** o projeto sem depender de respostas do tipo “o framework faz isso”.

---

[← Engenharia de Software](software-engineer.md) · [↑ Atlas](README.md) · [Distribuídos →](distributed-systems-engineer.md)
