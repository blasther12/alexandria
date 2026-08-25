# SQL, NoSQL, NewSQL e bancos vetoriais

Categorias descrevem compromissos, não um ranking. Produtos convergem: relacionais oferecem JSON e vetores; documentos adicionam transações; sistemas distribuídos expõem SQL. O ponto de partida não deve ser “qual banco é mais moderno?”, mas **quais invariantes, access patterns, volume, latência, failure modes e custos o sistema precisa sustentar**.

## O problema de escolher armazenamento

Banco de dados é uma das decisões mais caras de reverter porque mistura semântica de dados, consultas, consistência, operação, backup e dependência de plataforma. Uma escolha ruim pode funcionar no protótipo e falhar quando aparecem concorrência, crescimento, auditoria ou novos access patterns.

Antes de escolher, escreva:

- quais dados são fonte de verdade;
- quais invariantes precisam ser atômicas;
- quais consultas dominam o tráfego;
- qual latência e throughput esperados;
- quanto dado cresce por dia;
- qual RPO/RTO;
- se existe multi-região;
- quais requisitos de privacidade, retenção e auditoria;
- quem vai operar o produto no pior dia.

## Modelo mental: organize dados para as perguntas e garantias reais

Todo banco transforma operações lógicas em estruturas físicas: páginas, índices, logs, partitions, replicas ou grafos. O modelo escolhido favorece alguns acessos e cobra outros.

```text
requisitos e invariantes
        ↓
modelo de dados + access patterns
        ↓
índices / particionamento / replicação
        ↓
latência, consistência e custo operacional
```

A linguagem de consulta é importante, mas não elimina física. SQL sobre um cluster distribuído ainda paga coordenação. Documento flexível ainda precisa de schema semântico. Um índice vetorial ainda precisa de atualização, autorização e recuperação.

## Matriz de decisão

| Família | Unidade natural | Força | Custo dominante | Exemplos |
| --- | --- | --- | --- | --- |
| Relacional SQL | relações normalizadas | constraints, joins, transações e linguagem madura | scale-out e schema evolution exigem disciplina | PostgreSQL, MySQL, SQLite |
| Documento | agregado JSON/BSON | leitura do agregado e schema flexível | duplicação, documentos crescentes e joins limitados | MongoDB |
| Chave-valor | key → value/estrutura | baixa latência e lookup direto | consultas secundárias restritas | Redis, DynamoDB |
| Wide-column | partição + clustering | escrita e séries grandes por chave | modelagem por consulta e operação distribuída | Cassandra |
| Grafo | vértices + arestas | travessias variáveis e relações densas | distribuição de travessias | Neo4j |
| Busca | índice invertido | texto, ranking e agregações | consistência assíncrona e reindexação | Elasticsearch |
| NewSQL / SQL distribuído | tabelas relacionais particionadas | SQL + transações com scale-out | consenso, latência e operação/custo | CockroachDB, Google Spanner |
| Vetorial | embedding + metadados | nearest-neighbor semântico | recall aproximado, memória e atualização | pgvector, Milvus |

## Heurística por requisito

| Requisito | Comece avaliando | Prova necessária |
| --- | --- | --- |
| ledger e invariantes entre entidades | relacional | teste de concorrência e auditoria |
| catálogo lido como documento | documento ou relacional/JSON | evolução de schema e tamanho máximo |
| sessão, rate limit, leaderboard | Redis | comportamento em eviction/failover |
| escala previsível por tenant/device | DynamoDB/Cassandra | hot partition e distribuição de chaves |
| relações com profundidade variável | grafo | benchmark de travessia real |
| full-text e facets | motor de busca como projeção | reindexação e atraso aceitável |
| similaridade semântica | extensão/serviço vetorial | recall@k, latência, filtros e custo |
| escrita multi-região com SQL | NewSQL | latência de commit e falha de região |

## Relacional: quando constraints são vantagem

Relacionais tornam relações e invariantes explícitas com primary/foreign keys, unique constraints e transações. Isso é particularmente valioso quando várias operações precisam formar uma unidade consistente.

O custo aparece em schema evolution, joins caros sob grande volume, índices excessivos e scale-out. Muitas aplicações crescem muito antes de esgotar um PostgreSQL bem modelado; particionar cedo pode adicionar complexidade sem necessidade.

Use `EXPLAIN`, métricas de locks, cache hit e índices para verificar comportamento em vez de assumir que “SQL não escala”.

## Documento: agregados e duplicação deliberada

Documento favorece leitura/escrita de agregados que mudam juntos. O ganho de flexibilidade não significa ausência de schema: aplicações ainda precisam validar campos, versões e migrações.

Duplicação pode ser correta quando reduz joins e mantém leitura local, mas exige política de atualização. Se endereço do cliente está copiado em dez documentos, determine se representa snapshot histórico ou valor que deve convergir.

Documentos que crescem sem limite, arrays gigantes e updates concorrentes sobre o mesmo agregado são sinais de modelagem inadequada.

## Chave-valor e wide-column: chave é arquitetura

Em stores distribuídos por chave, a escolha da partition key determina distribuição de carga, paralelismo e locality. Uma chave de baixa cardinalidade ou monotônica pode concentrar throughput em poucos shards.

Modelar “por consulta” não é atalho para ignorar domínio. É declarar antecipadamente quais access patterns justificam denormalização e duplicação.

Teste distribuição com dados realistas. Média uniforme em dataset sintético pode esconder tenants gigantes em produção.

## Busca: projeção, não verdade canônica

Motores de busca são excelentes para full-text, ranking e facets, mas normalmente recebem dados de uma fonte canônica. Indexação é assíncrona, então o produto precisa aceitar staleness e ter processo de reindexação.

Se o índice for perdido, deve ser reconstruível. Se não pode ser reconstruído, ele deixou de ser apenas projeção e precisa de estratégia de backup/consistência correspondente.

## Grafo

Grafos favorecem perguntas em que relações e profundidade variam dinamicamente, como caminhos, recomendações ou fraude em redes conectadas. Um modelo relacional pode representar grafos, mas joins recursivos complexos podem perder ergonomia/performance.

Não escolha grafo apenas porque o domínio “tem relações”. Quase todo domínio tem. Faça benchmark da travessia real e compare custo operacional.

## NewSQL e SQL distribuído

Sistemas SQL distribuídos tentam preservar interface relacional e transações enquanto distribuem dados. Para isso usam consenso, replicação e relógios/protocolos sofisticados. A abstração SQL não remove latência de coordenação.

Pergunte:

- onde vivem replicas?
- qual latência de commit entre regiões?
- quais operações cruzam partitions?
- o que acontece sem quorum?
- como backup/restore e schema changes funcionam?

Multi-região forte pode ser tecnicamente elegante e economicamente desnecessária para um produto regional.

## CAP e PACELC sem slogans

CAP trata uma execução com partição de rede: diante dela, não se pode garantir simultaneamente disponibilidade de toda requisição e consistência linearizável. PACELC lembra que, mesmo sem partição, existe troca entre latência e consistência. Não classifique um produto com duas letras; examine cada operação, quorum, região e configuração.

Uma mesma base pode oferecer leitura eventual, leitura forte e transação serializável em caminhos diferentes. A escolha é por operação e requisito.

## Vetores são uma projeção

Embeddings são derivados de conteúdo, modelo, versão e chunking. Guarde essas origens, aplique filtros de autorização antes de expor resultados e tenha processo de reindexação. Índices HNSW/IVF aproximam vizinhos: medir apenas latência sem `recall@k` mascara perda de qualidade.

Também meça atualização e deleção. Se um documento é removido por requisito de privacidade, a projeção vetorial precisa acompanhar o lifecycle.

## Polyglot persistence: custo escondido

Usar PostgreSQL, Redis, Kafka, Elasticsearch e um vector DB pode parecer “usar a ferramenta certa”, mas cada produto adiciona:

- backup e restore;
- patching/upgrades;
- observabilidade;
- IAM/secrets;
- incidentes;
- capacidade/custo;
- conhecimento on-call;
- consistência entre cópias.

Adote um segundo datastore quando ele resolve uma força que o primeiro não atende razoavelmente. A carga operacional também é requisito arquitetural.

## Falhas e recuperação

Para qualquer banco, teste pelo menos:

- node/instance indisponível;
- disco cheio ou quota;
- conexão saturada;
- replica atrasada;
- migration parcial;
- backup corrompido/ausente;
- hot partition;
- query que degrada após crescimento;
- credencial expirada/rotacionada.

A resposta não é apenas “há replicação”. Defina detecção, failover, RTO/RPO, restore e reconciliação.

## Observabilidade

Métricas úteis variam por produto, mas normalmente incluem:

- query/request latency por percentil;
- throughput;
- connections/pool saturation;
- locks/conflicts;
- cache hit;
- replica lag;
- storage growth;
- throttling;
- hot partitions;
- backup/restore status;
- custo por workload.

Correlacione com operação de negócio. Uma query lenta de dashboard é diferente de checkout lento.

## Teste de decisão

Não benchmarke só throughput máximo. Monte cenário representativo:

1. volume e distribuição de chaves;
2. mix de read/write;
3. concorrência;
4. tamanho de dados;
5. falhas/restarts;
6. backup/restore;
7. migration;
8. custo mensal estimado.

Uma tecnologia que vence benchmark sintético pode perder em operação e recuperação.

## Anti-patterns

- polyglot persistence sem ownership e custo operacional;
- escolher “schema-less” para evitar modelar e validar;
- usar busca ou cache como registro canônico;
- normalizar documentos até remontá-los com dezenas de round trips;
- uma única chave de partição monotônica ou de baixa cardinalidade;
- banco vetorial sem versionar modelo, corpus e política de exclusão;
- escolher NoSQL apenas por “escala” sem access pattern;
- adicionar replica e assumir que backup deixou de ser necessário.

## Laboratório de decisão

Para uma plataforma de pedidos, desenhe duas alternativas: PostgreSQL com outbox e DynamoDB com uma tabela.

1. Liste invariantes e access patterns.
2. Modele transação de checkout e idempotência.
3. Gere distribuição realista de tenants.
4. Teste concorrência e hot keys.
5. Estime storage e custo por 12 meses.
6. Injete indisponibilidade e descreva degradação.
7. Faça backup/restore ou PITR em ambiente de laboratório.
8. Modele exclusão de PII e histórico.
9. Compare observabilidade e esforço on-call.
10. Tome uma decisão em ADR e indique o gatilho que a faria mudar.

## Referências

- Gilbert & Lynch. [Brewer's conjecture and the feasibility of consistent, available, partition-tolerant web services](https://doi.org/10.1145/564585.564601).
- Abadi. [Consistency Tradeoffs in Modern Distributed Database System Design](https://www.cs.umd.edu/~abadi/papers/abadi-pacelc.pdf).
- Google. [Spanner paper](https://research.google/pubs/spanner-googles-globally-distributed-database/).
- pgvector. [Documentação oficial](https://github.com/pgvector/pgvector).

---

[← Bancos](README.md) · [↑ Bancos](README.md) · [Transações →](transactions-and-consistency.md)
