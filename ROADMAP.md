# Roadmap

O roadmap expressa maturidade editorial, não promessa de calendário. Uma fase
está consolidada quando conceitos, mecanismos, prática, referências e navegação
formam um percurso verificável.

## Legenda

- **Base publicada:** índice e Codex inicial utilizáveis.
- **Em aprofundamento:** cobertura existe, mas capítulos ainda estão migrando para
  o contrato de profundidade.
- **Consolidado:** guias canônicos permitem prever comportamento, investigar
  falhas, comparar alternativas e praticar com evidência.
- **Planejado:** arquitetura reservada, ainda sem promessa de cobertura.

## Profundidade editorial transversal

A Alexandria está migrando de uma biblioteca de mapas introdutórios para uma
biblioteca de engenharia aplicada. A meta não é aumentar contagem de palavras.
Cada guia canônico deve conectar:

```text
problema
  → modelo mental
  → mecanismo interno
  → garantias e limites
  → trade-offs
  → caminho de produção
  → falhas
  → testes/observabilidade/segurança
  → experimentos
  → fontes primárias
```

O contrato completo está em [Contribuindo](CONTRIBUTING.md) e no
[template de assunto](templates/topic.md).

### Primeira passada horizontal

Os domínios abaixo já possuem uma base mais profunda ou receberam expansão do
seu guia principal:

| Domínio | Situação editorial | Próxima camada de profundidade |
| --- | --- | --- |
| Fundamentos | guia principal aprofundado | memória virtual, redes e laboratórios separados |
| Ciência da Computação | guia principal aprofundado | algoritmos, OS, redes e compiladores em capítulos próprios |
| Linguagens | estrutura por runtime + exercícios publicada | profiling e internals reproduzíveis por linguagem |
| Engenharia de Software | base com decisões e trade-offs | change coupling, delivery e socio-technical design |
| Design Patterns | catálogo + Strategy profundo | migrar os outros 22 patterns ao formato completo |
| Arquitetura | base já orientada a atributos e falhas | estudos de migração e post-incidente |
| Bancos de dados | base já orientada a access patterns | storage engines, recovery e benchmarks |
| Sistemas distribuídos | base já orientada a modelos e falha | clocks, CRDTs e laboratórios de consenso |
| Mensageria | guia principal aprofundado | Kafka/SQS com experimentos de failure semantics |
| Containers | guia principal aprofundado | namespaces/cgroups e supply chain em labs executáveis |
| Kubernetes | guia principal aprofundado | scheduler, networking e control loops em labs |
| Cloud | guia principal aprofundado | redes, DR e FinOps com cenários multi-region |
| API Gateways | guia principal aprofundado | policies, auth e quotas reproduzíveis em Kong/Apigee |
| Observabilidade | guia principal aprofundado | tail sampling, SLOs e profiling em laboratório |
| Segurança | guia principal aprofundado | threat models completos e game days |
| Inteligência Artificial | guia principal aprofundado | matemática/ML/LLM com experimentos isolados |
| AI Engineering | base orientada a sistemas publicada | eval harness, routing e operação multimodelo |
| Agentes | base com tools/memory/guardrails publicada | trajectories, recovery e multi-agent experiments |
| Skills | base publicada | avaliação de instruções, composição e versionamento |

A expansão dos subcapítulos deve seguir risco de aprendizagem: primeiro páginas
que ainda são apenas listas ou resumos, depois conteúdo já útil que precisa de
experimentos adicionais.

## Fase 1: Foundations | em aprofundamento

- modelo editorial, Atlas, Pinakes, Pharos e templates;
- fundamentos de computação e Engenharia de Software;
- convenções de exercícios, projetos, referências e glossário;
- validação automática de Markdown, links e diagramas;
- mecanismo de CPU/memória/I/O/rede conectado a incidentes e capacidade;
- Ciência da Computação conectada a sistemas reais.

**Próximo:** redes em profundidade, sistemas operacionais, algoritmos e análise de
complexidade com laboratórios reproduzíveis.

## Fase 2: Languages | em aprofundamento

- Python, JavaScript, TypeScript, Go e Kotlin;
- sintaxe essencial ligada a runtime, concorrência e ecossistema;
- comparação orientada a contexto, exercícios e projetos.

**Próximo:** profiling reproduzível, packaging/supply chain e exemplos completos
por linguagem.

## Fase 3: Architecture | em aprofundamento

- princípios de design, GoF, DDD, estilos arquiteturais e System Design;
- decisões, atributos de qualidade, ADRs e migrações evolutivas.

**Próximo:** expandir os outros 22 GoF no formato completo já aplicado a
Strategy; aprofundar Layered, Monolith, Serverless, Microkernel, Pipeline, BFF,
API Gateway e Service Mesh nas dimensões de evolução, testes, observabilidade,
deployment e segurança; arquitetura de dados, platform engineering e estudos
pós-incidente.

## Fase 4: Distributed Systems | em aprofundamento

- modelos de falha, consistência, replicação e coordenação;
- Kafka, SQS, idempotência, outbox, Sagas e padrões de resiliência;
- mensageria expandida com delivery semantics, ordering, poison messages,
  backlog e replay.

**Próximo:** laboratórios de Raft, clocks lógicos, CRDTs e chaos experiments.

## Fase 5: Infrastructure | em aprofundamento

- Docker, Kubernetes, gateways, segurança e observabilidade;
- Helm, GitOps e troubleshooting orientado a hipóteses;
- containers aprofundados em namespaces, cgroups, PID 1 e supply chain;
- Kubernetes aprofundado em reconciliation, scheduling, probes, storage e
  autoscaling;
- cloud aprofundada em failure domains, IAM, control/data plane, DR e FinOps;
- gateways aprofundados em request path, auth, quotas, retries e config rollout;
- observabilidade aprofundada em SLOs, cardinalidade, tracing e sampling;
- segurança aprofundada em threat modeling, autorização e supply chain.

**Próximo:** redes cloud, FinOps quantitativo, supply-chain security e exercícios
multi-cluster/multi-region.

## Fase 6: AI Engineering | em aprofundamento

- fundamentos de ML/LLMs, RAG, tools, MCP, agentes e avaliação;
- guardrails, custo, latência, segurança e human-in-the-loop;
- visão geral de IA aprofundada em generalização, leakage, drift, Transformers,
  RAG, embeddings, tool calling e evals.

**Próximo:** eval harness executável, multimodalidade, engenharia de dados para
IA e laboratórios que comparem workflow determinístico versus agentic.

## Fase 7: Advanced Engineering | planejado

- performance engineering, compiladores e runtimes;
- confiabilidade quantitativa, capacity planning e incident command;
- liderança técnica, sistemas sociotécnicos e evolução organizacional;
- estudos completos com artefatos executáveis e dados públicos.

## Como priorizamos

Uma contribuição tem precedência quando fecha uma dependência do Atlas, corrige
um risco factual, adiciona prática verificável ou substitui uma referência
secundária por fonte primária.

Uma página curta não é automaticamente ruim e uma longa não é automaticamente
boa. O critério é se o leitor consegue sair da definição e chegar a previsão,
decisão, experimento e diagnóstico.

---

[← Contribuindo](CONTRIBUTING.md) · [↑ Início](README.md) · [Pharos →](PHAROS.md)
