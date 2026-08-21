# SQL, NoSQL, NewSQL e bancos vetoriais

> Estado: em expansão

Categorias descrevem compromissos, não um ranking. Produtos convergem: relacionais oferecem JSON e vetores; documentos adicionam transações; sistemas distribuídos expõem SQL.

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

## CAP e PACELC sem slogans

CAP trata uma execução com partição de rede: diante dela, não se pode garantir simultaneamente disponibilidade de toda requisição e consistência linearizável. PACELC lembra que, mesmo sem partição, existe troca entre latência e consistência. Não classifique um produto com duas letras; examine cada operação, quorum, região e configuração.

## Vetores são uma projeção

Embeddings são derivados de conteúdo, modelo, versão e chunking. Guarde essas origens, aplique filtros de autorização antes de expor resultados e tenha processo de reindexação. Índices HNSW/IVF aproximam vizinhos: medir apenas latência sem `recall@k` mascara perda de qualidade.

## Anti-patterns

- polyglot persistence sem ownership e custo operacional;
- escolher “schema-less” para evitar modelar e validar;
- usar busca ou cache como registro canônico;
- normalizar documentos até remontá-los com dezenas de round trips;
- uma única chave de partição monotônica ou de baixa cardinalidade;
- banco vetorial sem versionar modelo, corpus e política de exclusão.

## Exercício de decisão

Para uma plataforma de pedidos, desenhe duas alternativas: PostgreSQL com outbox e DynamoDB com uma tabela. Liste invariantes, consultas, transação de checkout, idempotência, histórico, exclusão de PII, custo e recuperação. Tome uma decisão em um ADR e indique o gatilho que a faria mudar.

## Referências

- Gilbert & Lynch. [Brewer's conjecture and the feasibility of consistent, available, partition-tolerant web services](https://doi.org/10.1145/564585.564601).
- Abadi. [Consistency Tradeoffs in Modern Distributed Database System Design](https://www.cs.umd.edu/~abadi/papers/abadi-pacelc.pdf).
- Google. [Spanner paper](https://research.google/pubs/spanner-googles-globally-distributed-database/).
- pgvector. [Documentação oficial](https://github.com/pgvector/pgvector).

---

[← Bancos](README.md) · [↑ Bancos](README.md) · [Transações →](transactions-and-consistency.md)
