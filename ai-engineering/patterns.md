# Padrões de AI Engineering

Padrões descrevem forças recorrentes, não uma pilha obrigatória. Em sistemas de
IA, a tentação é adicionar RAG, agent, cache, router, gateway e guardrails ao
mesmo tempo. Isso produz uma arquitetura sofisticada antes de existir evidência
de que cada camada resolve um problema real.

A regra desta página é simples: **comece pela menor solução e adicione uma camada
somente quando uma métrica ou um risco justificar**.

## Modelo mental: cada camada deve fechar uma lacuna

Um sistema de IA pode ser pensado como uma cadeia:

```text
input
  → policy
  → retrieval/context
  → model
  → tools
  → output validation
  → effect
  → feedback/evaluation
```

Cada etapa pode melhorar capacidade, mas também adiciona failure modes, custo,
latência e novas fronteiras de confiança. Portanto, a decisão arquitetural é
localizar a lacuna dominante e escolher o menor padrão que a fecha.

## Baseline primeiro

Antes de aplicar qualquer padrão, construa um baseline comparável:

- busca lexical sem geração;
- prompt direto;
- modelo menor;
- workflow determinístico;
- adapter local para uma API;
- resposta templateada.

Se a arquitetura nova não supera o baseline em qualidade, custo, latência ou
risco, ela não tem justificativa técnica.

## RAG

### Problema

Conhecimento pode ser privado, recente, grande demais para o contexto ou exigir
provenance.

### Fluxo

```text
query → retrieve → filter/auth → rerank → context → generate → cite
```

### Garantias e limites

RAG pode melhorar groundedness e atualidade, mas não garante verdade. O retriever
pode não encontrar a fonte, o contexto pode estar errado e o modelo ainda pode
ignorar a evidência.

Separe avaliação de retrieval da avaliação de generation.

### Trade-offs

**Ganha:** conhecimento atual, citação, privacidade por corpus controlado.

**Paga:** indexação, staleness, autorização, custo de retrieval, chunking, novas
regressões e operação do índice.

### Quando evitar

Se o problema é apenas encontrar documentos, search UI pode ser melhor. Se a
resposta já cabe em regras determinísticas, não use geração para decorar.

## Hybrid Search

Busca lexical captura termos exatos; embeddings capturam similaridade semântica.
Combinar as duas pode melhorar recall em domínios com nomes, códigos e linguagem
natural.

Um pipeline comum:

```text
BM25 candidates + vector candidates → merge → rerank
```

Meça por slice. Hybrid search não é automaticamente melhor em todos os domínios.

## Reranking

Retriever inicial maximiza recall com custo baixo. Reranker mais caro ordena um
conjunto pequeno.

Trade-off:

- maior qualidade de contexto;
- mais latência;
- mais compute;
- risco de o reranker eliminar a evidência correta.

Avalie Recall@k antes e depois do reranking.

## Agentic RAG

O modelo decide se precisa:

- reformular query;
- recuperar novamente;
- consultar outra fonte;
- decompor pergunta.

Isso ajuda em tarefas multietapa, mas aumenta:

- latência;
- custo;
- variância;
- superfície de prompt injection;
- dificuldade de reproduzir falha.

Use step limit, source allowlist e avaliação de trajetória. Se uma única busca
bem construída resolve a maioria dos casos, agentic RAG provavelmente é excesso.

## Tool Calling

O modelo propõe uma chamada estruturada. A aplicação decide se ela é permitida.

Uma tool segura possui:

- nome não ambíguo;
- schema estreito;
- parâmetros tipados;
- autorização fora do modelo;
- timeout;
- idempotência;
- resposta canônica;
- erro útil;
- auditabilidade.

Separe leitura e escrita. `search_orders` e `refund_order` têm riscos completamente
diferentes.

## Tool gateway

Quando muitas aplicações usam as mesmas capacidades, um gateway de tools pode
centralizar:

- autenticação;
- quotas;
- policy;
- auditoria;
- schemas;
- rate limits.

Evite transformá-lo em ponto único que conhece lógica de todos os domínios. A
semântica do negócio deve permanecer no serviço responsável.

## Prompt Routing

Prompt routing classifica intenção e escolhe workflow/instrução.

Exemplo:

```text
input → classify → billing | technical | sales | unknown
```

Use quando tarefas têm políticas e métricas diferentes. Mantenha rota `unknown`
e fallback.

Falha crítica: classificação errada encaminha o usuário para workflow incapaz ou
menos seguro.

## Model Routing

Model routing escolhe modelo por:

- complexidade;
- risco;
- custo;
- latência;
- região;
- disponibilidade;
- capacidade multimodal.

Pode ser estático ou adaptativo.

Não permita fallback silencioso para modelo com política de segurança diferente.
Contrato de qualidade e safety precisa sobreviver ao route change.

## Cascata de modelos

Uma cascata tenta primeiro solução barata e promove para modelo mais capaz apenas
quando necessário.

```text
small model → confidence/validator → large model
```

Benefício: custo médio menor.

Risco: confidence ruim pode prender casos difíceis no modelo fraco. Avalie
escalation rate e erro condicionado à decisão de escalar.

## Semantic Cache

Cache semântico reutiliza resposta para inputs “parecidos”. O risco é assumir que
similaridade vetorial implica equivalência de negócio.

Namespace precisa considerar:

- tenant;
- permissões;
- idioma;
- prompt version;
- model/policy version;
- janela de frescor;
- contexto relevante.

Nunca compartilhe resposta sensível entre usuários por proximidade de embedding.

## Exact Cache

Antes de semantic cache, considere chave determinística por input normalizado,
versão e contexto. É mais previsível e mais fácil de invalidar.

## Guardrails

Guardrails devem formar defesa em profundidade.

### Antes do modelo

- validação de input;
- classificação de risco;
- redução de dados;
- autorização do contexto;
- delimitação de instruções.

### Durante ações

- tool allowlist;
- schema validation;
- authorization gate;
- budgets;
- sandbox;
- confirmation para efeitos importantes.

### Depois

- output schema;
- factual checks quando possíveis;
- PII filtering;
- policy checks;
- revisão humana.

Guardrail probabilístico não substitui boundary determinística.

## LLM Gateway

LLM gateway pode centralizar:

- credenciais de provedores;
- quotas;
- routing;
- retries;
- observabilidade;
- normalização de APIs;
- políticas de região.

Não deve virar God Service de prompts. Prompt e semântica da feature pertencem à
aplicação/domínio.

## Fallback

Fallback precisa preservar o contrato.

Exemplos:

- modelo primário indisponível → modelo compatível;
- RAG indisponível → search-only;
- agente indisponível → workflow determinístico;
- generation falha → resposta parcial segura.

Fallback que retorna informação incorreta só troca erro visível por erro
silencioso.

## Human-in-the-loop

Use humano quando:

- efeito é irreversível;
- confidence é insuficiente;
- policy exige aprovação;
- custo de erro é alto;
- sistema encontrou ambiguidade real.

A UI deve mostrar ação, alvo e consequência. “Aprovar tudo” não é controle útil.

## Workflow determinístico

Uma sequência fixa continua sendo padrão importante:

```text
classify → retrieve → validate → generate → verify
```

Use workflow quando o caminho é conhecido. Agente só deve substituir state
machine quando seleção dinâmica de passos produz ganho medido.

## MCP

[Model Context Protocol](mcp/README.md) padroniza descoberta e comunicação entre
hosts, clients e servers.

Use quando:

- múltiplos hosts precisam integrar múltiplos servers;
- interoperabilidade é valor real;
- contratos de tools/resources precisam ser descobertos.

Evite quando uma integração única e interna é mais simples como API local.

MCP cria nova trust boundary. O protocolo não autoriza ações por você.

## Memory

Memory pode guardar:

- estado de execução;
- preferências confirmadas;
- fatos persistentes;
- histórico episódico.

Problemas:

- staleness;
- informação errada persistida;
- vazamento entre usuários;
- contexto excessivo;
- privacidade.

Toda memory precisa de provenance, scope, retenção, edição e exclusão.

## Structured Output

Quando downstream depende da resposta, use schema.

```text
modelo → JSON estruturado → validation → business logic
```

Schema reduz ambiguidades de parsing, mas não garante correção semântica.

## Verification pass

Uma etapa de verificação separada pode testar:

- citations;
- constraints;
- cálculo;
- policy;
- completeness.

Antes de usar outro LLM como verificador, aplique checks determinísticos onde
possível.

## Observabilidade

Cada padrão precisa de métricas próprias.

### RAG

- recall/precision;
- empty retrieval;
- rerank latency;
- context size;
- groundedness.

### Routing

- route distribution;
- wrong-route rate;
- fallback rate;
- cost by route.

### Tools

- tool success/error;
- authorization rejection;
- latency;
- duplicate-effect prevention.

### Agents

- steps per task;
- loop rate;
- tool calls;
- intervention rate;
- cost/task.

Trace deve preservar versions de prompt, model, retriever e tools sem vazar
conteúdo sensível.

## Performance e custo

O p99 total é soma/combinação de etapas. Adicionar router + retrieval + reranker +
model + verifier pode multiplicar latência.

Faça budget explícito:

| Etapa | Budget exemplo |
| --- | ---: |
| routing | 50 ms |
| retrieval | 150 ms |
| rerank | 100 ms |
| model | 1.2 s |
| validation | 100 ms |

Os números reais dependem do produto. O ponto é que nenhuma etapa ganha budget
infinito.

Meça custo por **tarefa concluída**, não apenas preço por token.

## Segurança

A arquitetura deve assumir que conteúdo externo pode conter instruções
maliciosas.

Controles:

- separar dados de instruções;
- authorization fora do modelo;
- mínimo contexto necessário;
- tool scope estreito;
- egress limitado;
- sandbox;
- secret isolation;
- logging seguro;
- confirmação de efeitos críticos.

Prompt injection é problema de trust boundary, não apenas de wording do system
prompt.

## Modos de falha

### RAG piora resposta

Retriever trouxe contexto irrelevante. Compare resposta sem contexto, revise
chunking e reranking.

### Semantic cache vaza dado

Namespace ignorou tenant/permissão. Invalidar cache e corrigir key/policy é mais
importante que ajustar similarity threshold.

### Router barateia custo e reduz safety

Modelo barato não suporta política equivalente. Restrinja quais rotas podem usar
cada modelo.

### Agent loop

Falta condição de parada ou tool retorna observação ambígua. Adicione step budget,
detector de progresso e escalation.

### LLM gateway cai

Todas as features ficam indisponíveis. Planeje HA, bypass/fallback controlado e
rate limits.

## Testes

- golden evals por padrão;
- contract tests de tool;
- retrieval eval;
- routing confusion matrix;
- cache isolation tests;
- prompt injection fixtures;
- fallback tests;
- latency/cost regression;
- canary;
- fault injection em providers.

## Laboratório progressivo

### Beginner

Compare prompt direto contra busca simples em 30 casos. Defina onde cada um vence.

### Intermediate

Adicione RAG e meça retrieval separado da geração. Introduza um documento
irrelevante e observe a regressão.

### Advanced

Implemente routing entre dois modelos, cache com namespace e tool read-only.
Meça custo, latência e qualidade.

### Expert

Monte pipeline com RAG, tool de escrita e fallback. Injete prompt injection,
provider timeout, stale cache e tool failure. Defina SLO, stop conditions, canary
e rollback.

## Matriz de decisão

| Necessidade | Menor solução | Evolua quando |
| --- | --- | --- |
| conhecimento atual | busca lexical | semântica melhora recall medido |
| resposta com evidência | search UI | síntese reduz esforço sem perder fonte |
| saída estruturada | uma chamada + schema | tarefas pedem rotas distintas |
| sequência conhecida | workflow/state machine | seleção dinâmica traz ganho comprovado |
| integração única | adapter local | múltiplos hosts/servers justificam protocolo |
| custo alto | modelo menor | cascade/routing preserva qualidade |
| repetição exata | cache determinístico | semantic cache tem equivalência comprovada |

## Projeto de síntese

Construa um assistente interno com três versões:

1. search-only;
2. RAG;
3. RAG + tool.

Para cada versão registre:

- dataset de eval;
- qualidade por slice;
- p95/p99;
- custo por tarefa;
- threat model;
- falhas exercitadas;
- critérios de rollback.

A versão mais complexa só vence se demonstrar ganho líquido.

## Referências

- [Avaliação de AI Engineering](evaluation.md)
- [Model Context Protocol](mcp/README.md)
- [Agentes](../agents/README.md)
- [Fundamentos de IA](../artificial-intelligence/README.md)
- [Segurança](../security/README.md)

---

[← AI Engineering](README.md) · [↑ AI Engineering](README.md) · [Avaliação →](evaluation.md)
