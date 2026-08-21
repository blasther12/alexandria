# Pinakes — índice global do conhecimento

Pinakes é o catálogo do Alexandria. Use-o para localizar um conceito; use o
[Atlas](atlas/README.md) para saber em que ordem estudá-lo e o
[Pharos](PHAROS.md) para escolher a continuação. Um link aponta para a página
canônica do assunto, evitando cópias divergentes em vários domínios.

## Portas de entrada

| Necessidade | Entrada | Evidência de aprendizagem |
| --- | --- | --- |
| construir a base | [Fundamentos](fundamentals/README.md) | explicar execução, memória, I/O e redes |
| escolher uma linguagem | [Linguagens](languages/README.md) | defender a escolha com restrições e trade-offs |
| projetar software sustentável | [Engenharia de Software](software-engineering/README.md) | tornar limites, testes e decisões explícitos |
| escolher persistência | [Bancos de dados](databases/README.md) | relacionar workload a consistência, latência e custo |
| raciocinar sobre falhas parciais | [Sistemas distribuídos](distributed-systems/README.md) | desenhar timeouts, idempotência e recuperação |
| operar aplicações | [Infraestrutura](containers/README.md) | empacotar, implantar, observar e proteger |
| integrar IA a produtos | [AI Engineering](ai-engineering/README.md) | avaliar qualidade, risco, latência e custo |
| aprender por entrega | [Projetos](projects/README.md) | demonstrar capacidades com critérios verificáveis |

## Currículo e navegação

- [Atlas](atlas/README.md): níveis, dependências e roadmaps por papel.
- [Pharos](PHAROS.md): próximos estudos conforme a capacidade concluída.
- [Codex](codex/README.md): como os guias aprofundados se organizam sem duplicar
  os domínios canônicos.
- [Roadmap editorial](ROADMAP.md): maturidade atual e expansões prioritárias.
- [Glossário](glossary/README.md): definições curtas que apontam para os guias.
- [Entrevistas](interview/README.md): perguntas orientadas a raciocínio.

## Fundamentos e Ciência da Computação

| Área | Conteúdo inicial |
| --- | --- |
| [Fundamentos](fundamentals/README.md) | representação, CPU, memória, processos, threads, I/O, redes e estimativas |
| [Ciência da Computação](computer-science/README.md) | algoritmos, estruturas, computabilidade, sistemas, compiladores e probabilidade |
| [Cloud](cloud/README.md) | responsabilidade compartilhada, regiões, elasticidade, custo e lock-in |
| [Exercícios](exercises/README.md) | contrato Beginner → Expert e evidências esperadas |

## Linguagens e runtimes

| Trilha | Mecanismo central | Prática |
| --- | --- | --- |
| [Python](languages/python/README.md) | CPython, bytecode, GIL, garbage collection e asyncio | [exercícios](languages/python/exercises.md) |
| [JavaScript](languages/javascript/README.md) | V8, stack, heap, Event Loop, tasks e Promises | [exercícios](languages/javascript/exercises.md) |
| [TypeScript](languages/typescript/README.md) | inferência, tipagem estrutural, narrowing e type erasure | [exercícios](languages/typescript/exercises.md) |
| [Go](languages/golang/README.md) | goroutines, scheduler, channels, escape analysis e GC | [exercícios](languages/golang/exercises.md) |
| [Kotlin](languages/kotlin/README.md) | JVM, bytecode, coroutines, Native e Multiplatform | [exercícios](languages/kotlin/exercises.md) |

A [comparação multidimensional](languages/comparison.md) trata tipos,
concorrência, performance, ecossistema e domínios de uso sem eleger uma
“melhor” linguagem.

## Design e Engenharia de Software

| Assunto | Página canônica |
| --- | --- |
| princípios com contexto: SOLID, DRY, KISS, YAGNI, coesão e acoplamento | [Princípios](software-engineering/principles.md) |
| patterns GoF criacionais | [Criacionais](design-patterns/creational.md) |
| patterns GoF estruturais | [Estruturais](design-patterns/structural.md) |
| patterns GoF comportamentais | [Comportamentais](design-patterns/behavioral.md) |
| Strategy em Python, JavaScript, TypeScript, Go e Kotlin | [Strategy](design-patterns/strategy.md) |
| DDD estratégico e Context Mapping | [DDD estratégico](software-engineering/ddd/strategic.md) |
| aggregates, entities, value objects e domain events | [DDD tático](software-engineering/ddd/tactical.md) |
| níveis, doubles e estratégias de teste | [Testing](software-engineering/testing/README.md) |
| requisitos, capacidade e desenho ponta a ponta | [System Design](software-engineering/system-design/README.md) |
| nove sistemas para estudo | [Estudos de System Design](software-engineering/system-design/case-studies.md) |
| especificação antes da implementação | [Spec-Driven Development](spec-driven-development/README.md) |

## Arquitetura de Software

- [Mapa de arquitetura](architecture/README.md): atributos de qualidade,
  fronteiras, evolução e fitness functions.
- [Catálogo de estilos](architecture/styles.md): monolith, layered, serverless,
  microkernel, pipeline, BFF, gateway e service mesh.
- [Comparação orientada a forças](architecture/comparison.md): custo de mudança,
  consistência, deploy, operação e organização.
- [Modular Monolith](architecture/modular-monolith/README.md).
- [Clean, Hexagonal, Ports and Adapters e Onion](architecture/clean-hexagonal/README.md).
- [Microservices](architecture/microservices/README.md).
- [Event-Driven Architecture](architecture/event-driven/README.md).
- [CQRS e Event Sourcing](architecture/cqrs-event-sourcing/README.md).
- [Architecture Decision Records](architecture/decision-records.md) e
  [template ADR](templates/adr.md).

## Dados

| Assunto | Página |
| --- | --- |
| escolha entre SQL, document, key-value, wide-column, search, graph e vector | [Comparação de bancos](databases/comparison.md) |
| SQL, índices, CTEs, window functions, planner, locks e MVCC | [PostgreSQL](databases/postgresql/README.md) |
| documentos, modelagem por acesso, índices e consistência | [MongoDB](databases/mongodb/README.md) |
| estruturas em memória, cache, expiração, persistência e coordenação | [Redis](databases/redis/README.md) |
| partition key, access patterns, GSIs, consistência e capacidade | [DynamoDB](databases/dynamodb/README.md) |
| ACID, isolation, MVCC, CAP e consistência | [Transações e consistência](databases/transactions-and-consistency.md) |
| prática de modelagem, diagnóstico e performance | [Exercícios de dados](databases/exercises.md) |

MySQL, SQLite, Cassandra, Elasticsearch/OpenSearch, Neo4j, pgvector, Qdrant,
Milvus e Pinecone estão posicionados no
[mapa de bancos](databases/README.md); os quatro Codices iniciais recebem
profundidade primeiro.

## Sistemas distribuídos e mensageria

| Conceito | Página |
| --- | --- |
| latência, throughput, disponibilidade, consistência, CAP e PACELC | [Fundamentos distribuídos](distributed-systems/fundamentals.md) |
| replication, partitioning, quorum, leader election, Raft, Paxos e Gossip | [Consenso e coordenação](distributed-systems/consensus.md) |
| timeout, retry, backoff, jitter, circuit breaker, bulkhead e rate limit | [Padrões de resiliência](distributed-systems/resilience-patterns.md) |
| idempotência, Saga, outbox, inbox, CDC e transações distribuídas | [Sistemas distribuídos](distributed-systems/README.md) |
| broker, topic, partition, consumer groups, replay e delivery semantics | [Kafka](messaging/kafka/README.md) |
| Standard/FIFO, visibility timeout, polling, DLQ e deduplicação | [Amazon SQS](messaging/sqs/README.md) |
| arquitetura, ordenação, replay, operação e custo | [Kafka versus SQS](messaging/comparison.md) |
| ambiente local e falhas reproduzíveis | [Laboratório Docker de mensageria](messaging/docker-lab.md) |

## Infraestrutura, operação e segurança

| Área | Página canônica |
| --- | --- |
| containers, isolamento e modelo operacional | [Containers](containers/README.md) |
| images, layers, Dockerfile, BuildKit, Compose, namespaces e cgroups | [Docker](containers/docker/README.md) |
| supply chain, non-root, secrets e hardening de imagens | [Segurança de containers](containers/security.md) |
| control plane, reconciliation e recursos Kubernetes | [Kubernetes](kubernetes/README.md) |
| workloads, Services, Ingress, storage e networking | [Workloads e rede](kubernetes/workloads-and-networking.md) |
| probes, scaling, scheduling, RBAC, Helm, GitOps e troubleshooting | [Operação e segurança Kubernetes](kubernetes/operations-and-security.md) |
| routing, autenticação, quotas, policies e lifecycle de APIs | [API Gateways](api-gateways/README.md) |
| Kong e seu modelo de plugins | [Kong](api-gateways/kong/README.md) |
| Apigee, policies, analytics e developer portal | [Apigee](api-gateways/apigee/README.md) |
| decisão por arquitetura, extensibilidade, operação e custo | [Kong versus Apigee](api-gateways/kong-vs-apigee.md) |
| logs, métricas, traces, OpenTelemetry, SLI e SLO | [Observabilidade](observability/README.md) |
| threat modeling, autenticação, autorização e segurança web | [Segurança](security/README.md) |

## Inteligência Artificial

| Camada | Página |
| --- | --- |
| problema, dados, baseline e avaliação | [Fundamentos de IA](artificial-intelligence/fundamentals/README.md) |
| supervisão, generalização, leakage e métricas | [Machine Learning](artificial-intelligence/machine-learning/README.md) |
| redes, otimização, representação e compute | [Deep Learning](artificial-intelligence/deep-learning/README.md) |
| attention, Transformers, tokens, embeddings e context window | [LLMs](artificial-intelligence/llm/README.md) |
| geração, prompting, structured outputs e riscos | [Generative AI](artificial-intelligence/generative-ai/README.md) |
| integração de modelos a aplicações reais | [AI Engineering](ai-engineering/README.md) |
| RAG, Agentic RAG, routing, cache, guardrails e gateways | [Padrões de AI Engineering](ai-engineering/patterns.md) |
| datasets, métricas, tracing, custo e regressões | [Avaliação](ai-engineering/evaluation.md) |
| hosts, clients, servers, tools, resources, prompts e transports | [MCP](ai-engineering/mcp/README.md) |
| loops, planning, memory, tools e human-in-the-loop | [Agentes](agents/README.md) |
| instruções reutilizáveis e progressive disclosure | [Skills](skills/README.md) |

## Ferramentas, especificações e colaboração

- [Git](developer-tools/git/README.md): objetos, refs, branches, integração,
  recuperação e investigação.
- [Vim](developer-tools/vim/README.md): modos, operator + motion, text objects,
  registers, macros e composição.
- [Exemplo completo de SDD](spec-driven-development/examples/user-registration/feature.md):
  feature, requirements, design e tasks conectados.
- [Exemplos de skills](skills/README.md): review, segurança, debugging, testes,
  documentação, dependências e incidentes.
- [Templates](templates/README.md): assunto, exercício, projeto, ADR e RFC.
- [Contribuindo](CONTRIBUTING.md): regra editorial, referências e critérios de PR.

## Biblioteca e prática

| Catálogo | Uso |
| --- | --- |
| [Livros](BOOKS.md) | títulos, autoria, dificuldade, motivo e ordem |
| [Guias de leitura](books/README.md) | sequências por papel e objetivo |
| [Papers](library/papers.md) | fontes primárias que explicam mecanismos |
| [RFCs](library/rfcs.md) | normas e protocolos |
| [Documentação oficial](library/documentation.md) | referências normativas e operacionais |
| [Cursos e artigos](library/courses-and-articles.md) | complemento curado, não substituto da fonte primária |
| [Projetos progressivos](projects/README.md) | do REST ao sistema distribuído completo |

## Índice alfabético rápido

- **A:** ACID, ADR, agents, aggregates, API Gateway, Apigee, attention,
  autenticação e autorização.
- **B:** backpressure, backoff, BFF, bounded context, Builder e bulkhead.
- **C:** cache, CAP, CDC, circuit breaker, Clean Architecture, consensus, CORS,
  CQRS, CSRF e cgroups.
- **D:** DDD, deadlock, Deep Learning, Design Patterns, distributed locks,
  Docker, DynamoDB e DRY.
- **E:** embeddings, Event-Driven Architecture, Event Loop, Event Sourcing e
  eventual consistency.
- **F:** Factory, fine-tuning, function/tool calling e functional programming.
- **G:** garbage collection, Git, GitOps, Go, Golden Signals e Gossip.
- **H:** Helm, Hexagonal Architecture, HPA, HTTP e human-in-the-loop.
- **I:** idempotência, immutability, indexes, inbox/outbox, isolation e OIDC.
- **J:** JavaScript, jitter, joins e JWT.
- **K:** Kafka, Kotlin, Kubernetes, KISS e Kong.
- **L:** latency, leader election, LLM Gateway, locks, logs e load testing.
- **M:** Machine Learning, memory, MCP, metrics, microservices, MongoDB e MVCC.
- **N:** namespaces, networking, normalização e NoSQL.
- **O:** OAuth 2.0, observabilidade, OpenTelemetry, ordering e OWASP.
- **P:** PACELC, partitions, Paxos, performance, PostgreSQL, Prometheus e Python.
- **Q:** query planner, quorum, quotas e queues.
- **R:** Raft, RAG, rate limiting, RBAC, Redis, replication, retries e RFC.
- **S:** Saga, sampling, security, SLI/SLO/SLA, SOLID, SQL, SQS e Strategy.
- **T:** testing, throughput, timeout, TLS, tool calling, traces, transactions e
  TypeScript.
- **U:** ubiquitous language, Unicode, unit tests e USE method.
- **V:** vector search, Vim, visibility timeout e V8.
- **W:** window functions, workflows e workload identity.
- **X:** XSS.
- **Y:** YAGNI.
- **Z:** Zero Trust.

Se um termo não estiver catalogado, abra uma proposta usando o
[template de conteúdo](.github/ISSUE_TEMPLATE/content.yml) e indique em que
trilha ele fecha uma lacuna.

---

[← Início](README.md) · [↑ Início](README.md) · [Pharos →](PHAROS.md)
