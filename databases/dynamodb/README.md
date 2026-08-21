# Amazon DynamoDB

DynamoDB é um banco NoSQL gerenciado de chave-valor/documentos, particionado. O desenho começa pelos access patterns: partition key localiza distribuição; sort key organiza itens relacionados e habilita range queries.

## Single-table como opção

Single-table design coloca tipos diferentes em uma tabela e sobrecarrega chaves para responder consultas conhecidas com `Query`. Não é obrigação: tabelas múltiplas podem simplificar ownership, permissões, capacity e lifecycle. Evite `Scan` no caminho síncrono.

```text
PK                 SK                    atributos
USER#42            PROFILE               name, email
USER#42            ORDER#2026-08#991      total, status
ORDER#991          ITEM#1                 sku, qty
IDEMP#checkout#abc RESULT                 expiresAt, response
```

## Consistência e transações

Leituras são eventualmente consistentes por padrão; leitura fortemente consistente está disponível em tabelas e LSIs na região principal, não em GSIs/global tables da mesma maneira. Condition expressions implementam compare-and-set. Transações agrupam até os limites documentados, com custo/latência maiores; modele fronteiras pequenas.

## Índices, capacidade e partições

GSI tem partition/sort keys próprias e propagação assíncrona; LSI compartilha partition key e deve ser definida na criação. On-demand simplifica cargas imprevisíveis; provisioned + auto scaling favorece previsibilidade. Mesmo com capacidade total suficiente, uma chave quente limita throughput; use alta cardinalidade, write sharding ou cache apenas quando compatível.

DynamoDB Streams captura mudanças para projeções, mas consumidores devem tolerar repetição e ordering apenas no escopo garantido. TTL remove itens de forma assíncrona: não use como cronômetro exato.

## Resiliência e segurança

- conditional writes e idempotency key para retries;
- exponential backoff com jitter para throttling, limitado por deadline;
- point-in-time recovery, backups e teste de restore;
- IAM least privilege e condition keys, KMS quando necessário, VPC endpoints;
- observe consumed capacity, throttling, latency, system errors e item size;
- global tables exigem política explícita para conflitos e invariantes entre regiões.

## Anti-patterns

- uma partition key constante para todos os itens;
- filtrar muitos itens depois de `Query` e chamar isso de índice;
- depender de GSI para read-after-write imediato;
- armazenar payload próximo do limite em cada atualização;
- transação ampla para simular modelo relacional;
- ignorar custo de índices, streams, backups e regiões.

## Exercícios

1. Liste access patterns de um marketplace e desenhe chaves antes do schema.
2. Implemente criação idempotente com condition expression.
3. Simule chave quente em tabela de laboratório e aplique write sharding.
4. Projete uma global table para carrinho: descreva conflito concorrente e reconciliação.

## Referências oficiais

- AWS. [DynamoDB Developer Guide](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html).
- [Best practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html).
- [Read consistency](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html).
- [DynamoDB transactions](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transactions.html).

---

[← Redis](../redis/README.md) · [↑ Bancos](../README.md) · [Exercícios →](../exercises.md)
