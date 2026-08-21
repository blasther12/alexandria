# JavaScript — exercícios e projetos

---

[← Internals](internals.md) · [↑ JavaScript](README.md) · [→ Referências](references.md)

Resolva sem framework quando a tarefa for sobre a linguagem. Depois compare com bibliotecas consolidadas. Cada entrega precisa de `README`, comandos reproduzíveis, testes, casos de erro e uma nota curta de trade-offs.

## Regras de avaliação

| Dimensão | Evidência |
| --- | --- |
| Correção | testes de caso normal, bordas e falhas; invariantes explícitas |
| Clareza | nomes de domínio, funções coesas, API pequena e sem estado oculto |
| Segurança | validação, limites, secrets ausentes do código e dependências justificadas |
| Performance | complexidade explicada; benchmark/profile apenas quando relevante |
| Operação | erros contextualizados; logs/métricas nos projetos de serviço |
| Reprodutibilidade | runtime declarado, lockfile quando houver packages e CI limpo |

Não otimize para quantidade de abstrações. Uma solução curta que torna invariantes visíveis é melhor que uma “framework interna”.

## Beginner

### 1. Normalizador de pedidos

Implemente `normalizeOrder(input)` para converter um object externo em:

```js
{
  id: "ord-123",
  items: [{ sku: "book", quantity: 2, unitPriceCents: 3500 }],
  coupon: null
}
```

Requisitos:

- não mutar a entrada;
- rejeitar propriedades ausentes, números não seguros, quantidade não positiva e arrays vazios;
- calcular total sem floating-point monetário;
- testar `null`, strings vazias, ids duplicados e valor máximo aceito.

Explique por que optional chaining não substitui validação.

### 2. Índice de palavras

Conte palavras de um texto usando `Map`, normalização Unicode documentada e ordenação estável por frequência/nome. Compare uma versão com object e discuta chaves como `__proto__`.

Meta: explicar complexidade de tempo/espaço e separar tokenização da agregação.

### 3. Closure com lifecycle

Crie um contador de tentativas com `consume()`, `remaining()` e `reset()`. Depois adicione expiração baseada em um `clock` injetado para testes determinísticos.

Não use timer se consultar o relógio for suficiente. Explique a retenção criada pela closure.

### 4. Parser de configuração

Converta um object semelhante a `process.env` em configuração tipada por convenção: port, log level e timeout. Colete todos os erros em uma única resposta, nunca logue secrets e congele apenas a camada necessária.

Critério de aceite: nenhuma coerção implícita silenciosa de valores inválidos.

## Intermediate

### 5. Fila assíncrona limitada

Implemente `mapConcurrent(iterable, { concurrency, signal }, fn)`.

Requisitos:

- no máximo `concurrency` operações ativas;
- preservar ordem dos resultados;
- parar de iniciar trabalho após cancellation;
- escolher e documentar fail-fast ou coleta de erros;
- remover listeners ao concluir;
- testes sem depender de delays frágeis.

Instrumente gauges de itens ativos/na fila e histogram de duração com uma interface fake.

### 6. Retry responsável

Implemente retry com exponential backoff, jitter injetável, deadline total e classificação de erro. Apenas operações explicitamente idempotentes podem ser repetidas.

Teste com relógio/função `sleep` injetados. Demonstre que timeout por tentativa não substitui deadline total e que `Retry-After`, quando aplicável, precisa de limite.

### 7. Async iterator paginado

Exponha páginas de uma API como `async function*`. Pare ao receber cursor final, detecte cursor repetido, propague `AbortSignal` e não busque páginas além do necessário se o consumidor interromper o loop.

Adicione um teste que chama `break` depois de três itens e confirma cleanup.

### 8. Module boundary

Modele um módulo de pricing com API pública pequena, implementações privadas e sem side effect na importação. Escreva testes apenas contra exports públicos e configure `package.json#exports` para impedir deep imports acidentais.

Registre em um ADR quando usar function, class ou closure para o estado.

## Advanced

### 9. Stream com backpressure

Leia um arquivo NDJSON grande, valide cada registro, agregue estatísticas e escreva saída incremental. A memória não pode crescer proporcionalmente ao arquivo.

Entregue:

- teste com chunks que quebram no meio de caracteres/linhas;
- política para linha inválida e limite de tamanho;
- benchmark de throughput e gráfico simples de RSS ao longo do tempo;
- comparação entre API de streams do host e async iterables.

### 10. Worker pool

Mova uma transformação CPU-bound verificável para Worker Threads ou Web Workers. Implemente pool fixo, fila limitada, timeout, cancellation e recuperação de worker que falha.

Compare 1, 2, 4 e 8 workers. Explique quando serialização/transferência supera o ganho e por que mais workers podem piorar p99.

### 11. Caça à retenção

Uma aplicação de laboratório registra listeners e mantém um cache sem limite. Gere carga estável, capture heap snapshots e encontre retaining paths. Corrija lifecycle e política de eviction.

O relatório deve distinguir heap usado, RSS e leak real de variação de GC. Inclua antes/depois e procedimento reproduzível.

### 12. API resiliente

Crie uma API sem framework ou com framework justificado que:

- valida payload e autenticação antes do domínio;
- impõe body limit, timeout e concorrência;
- propaga correlation/trace context;
- usa graceful shutdown;
- retorna erros sem stack/segredos;
- possui integração real com uma dependência fake e testes de overload.

Faça threat model de injection, SSRF, broken access control e dependency compromise.

## Expert

### 13. Semântica de event loops

Prepare uma suíte de pequenos programas com script, Promise jobs, `queueMicrotask`, timers, I/O, `nextTick` e workers. Execute em dois hosts/versões.

Para cada diferença:

1. preveja a ordem;
2. registre a saída;
3. cite o contrato do host/especificação;
4. classifique se a aplicação poderia depender dela;
5. proponha uma coordenação explícita que remova a dependência.

### 14. Benchmark auditável

Escolha uma decisão real — parser, representação de índice ou estratégia de batching. Crie benchmark com dataset representativo, warm-up, amostras e consumo do resultado. Colete CPU profile e allocations.

Publique conclusão inclusive se a diferença for irrelevante. Liste ameaças à validade e não transforme detalhe do V8 em API.

### 15. Mini runtime de jobs

Implemente, para fins educacionais, um scheduler cooperativo com task queue, microtask queue, cancellation e budget por tick. Ele não precisa emular ECMAScript.

Use testes de starvation e fairness para mostrar por que o modelo simplificado diverge de browsers/Node. Documente quais garantias são suas e quais pertencem ao host real.

### 16. Revisão de supply chain

Escolha uma aplicação com dependências transitivas. Produza inventário, identifique lifecycle scripts, licenses, packages abandonados e superfícies substituíveis. Faça uma atualização controlada e demonstre CI/release reproduzível.

Não publique vulnerabilidades novas. Use processo de responsible disclosure quando necessário.

## Projeto integrador: dependency status aggregator

### Objetivo

Construir um serviço Node.js que consulta dependências autorizadas e apresenta saúde agregada sem virar ferramenta de SSRF ou amplificador de tráfego.

### Entregas por milestone

1. **Domínio:** estados `healthy`, `degraded`, `unavailable` e `unknown`, invariantes e testes puros.
2. **I/O:** HTTP client injetável, deadline, timeout por tentativa, limite de resposta e cancellation.
3. **Concorrência:** fila limitada, cache com TTL/max size e deduplicação de checks simultâneos.
4. **Segurança:** allowlist canônica de scheme/host/port; resolução e redirects tratados no threat model; auth e rate limit.
5. **API:** snapshot e stream de mudanças, versionamento e errors estáveis.
6. **Operação:** health/readiness distintos, logs estruturados, métricas RED, traces e graceful shutdown.
7. **Qualidade:** unit/integration/load tests, CI, dependency policy, runbook e ADRs.

### Failure injection

Simule DNS lento, conexão recusada, TLS inválido, response parcial, payload gigante, `429`, `503`, timeout, cancellation e shutdown durante requests. O serviço deve degradar com limites, não acumular trabalho sem fim.

### SLO de laboratório

Defina seus próprios valores antes do teste, por exemplo disponibilidade da API, p95 sob carga e teto de RSS. Um SLO sem janela e método de medição não é verificável.

### Review final

- Quais dados são confiáveis e quais são input?
- Onde existem fila, cache e fan-out? Quais são seus limites?
- Como uma operação é cancelada de ponta a ponta?
- Qual signal diferencia upstream ruim de event-loop congestionado?
- Como deploy e rollback preservam conexões em andamento?
- Qual decisão você mudaria com dez vezes mais carga?

## Prática de entrevista

Grave respostas de até três minutos para as perguntas do [README](README.md#perguntas-de-entrevista). Depois faça uma sessão de 45 minutos:

1. 10 min para esclarecer requisitos de uma fila limitada;
2. 20 min para implementar o núcleo;
3. 10 min para casos de falha, cancellation e testes;
4. 5 min para performance e observabilidade.

Avalie raciocínio e comunicação, não memorização de trivia.

## Próximos passos

Ao concluir, releia [Internals](internals.md) e explique quais medições confirmaram ou refutaram seu modelo. Explore TypeScript para modelagem estática, depois HTTP, segurança Web, streams, distributed systems e observabilidade.

---

[← Internals](internals.md) · [↑ JavaScript](README.md) · [→ Referências](references.md)
