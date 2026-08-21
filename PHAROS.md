# Pharos — para onde estudar depois

Pharos é o farol de continuidade. Escolha a linha que descreve o que você acabou
de demonstrar, não apenas o que leu.

## Rotas principais

| Se você concluiu… | Próximo estudo | Por quê | Evidência sugerida |
| --- | --- | --- | --- |
| Fundamentos de programação | runtime da linguagem → testes → Git | transformar sintaxe em modelo de execução | depurar memória, I/O e uma falha real |
| Python | asyncio → backend → dados/IA | escolher concorrência e especialização | serviço com cancelamento ou pipeline avaliado |
| JavaScript | Event Loop → TypeScript → Node.js | tornar assincronia e contratos explícitos | medir starvation e validar fronteiras |
| TypeScript | Node.js internals → APIs → arquitetura | ligar tipos apagados a validação runtime | contrato end-to-end com erro tipado |
| Go | scheduler → networking → cloud | aplicar concorrência estruturada em serviços | worker pool limitado e observável |
| Kotlin | JVM → coroutines → backend/Android | entender custo e lifecycle | serviço ou app sem trabalho órfão |
| SQL/PostgreSQL | índices → MVCC → sistemas distribuídos | conectar uma consulta a concorrência e escala | analisar plano e anomalia de isolamento |
| Redis | cache coherence → rate limiting → filas | reconhecer semânticas além de “é rápido” | política de invalidação com falhas |
| Docker | redes → segurança → Kubernetes | sair do artefato para reconciliação | imagem mínima, non-root e health checks |
| Kubernetes | GitOps → observabilidade → SRE | operar mudança e falha continuamente | rollout com SLO, rollback e runbook |
| Modular Monolith | DDD → mensageria → microservices | preservar limites antes de distribuir | extrair um módulo com dados e telemetria |
| Kafka | outbox/CDC → stream processing → Sagas | raciocinar sobre logs e efeitos duplicados | consumidor idempotente sob replay |
| Fundamentos de LLM | avaliação → RAG → guardrails | medir antes de adicionar autonomia | baseline e dataset versionado |
| RAG | hybrid search → reranking → Agentic RAG | melhorar recuperação antes do loop | análise de erros por etapa |
| MCP | threat modeling → tools → agentes | tratar integração como trust boundary | servidor com autorização e auditoria |
| Agentes | evals → human-in-the-loop → multi-agent | aumentar autonomia com evidência | comparação contra workflow determinístico |

## Quando aprofundar ou ampliar

- **Aprofunde** quando não consegue prever falhas, explicar internals ou medir a
  solução atual.
- **Amplie** quando o próximo problema exige outra perspectiva: produto,
  segurança, dados, operação ou organização.
- **Construa** quando a leitura não muda mais seu modelo mental. Um experimento
  com hipótese explícita ensina mais do que outra introdução.
- **Volte** quando uma abstração começou a parecer mágica. O retorno a redes,
  processos, armazenamento ou probabilidade costuma revelar o mecanismo.

## Rotas de recuperação

| Dificuldade observada | Retorne a |
| --- | --- |
| Promises, coroutines ou goroutines parecem imprevisíveis | processos, scheduling, filas e cancelamento |
| consultas oscilam em produção | cardinalidade, índices, cache, locks e planos |
| microservices geram mudanças coordenadas | coesão, bounded contexts e contratos |
| retries pioram incidentes | timeout budgets, backoff, jitter e idempotência |
| respostas de IA variam sem explicação | datasets, métricas, tracing e controle de versão |

---

[← Atlas](atlas/README.md) · [↑ Início](README.md) · [Pinakes →](PINAKES.md)
