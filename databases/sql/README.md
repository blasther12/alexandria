# SQL: modelagem, consulta e diagnóstico

SQL é uma linguagem declarativa: expressa o resultado, e o optimizer escolhe um plano físico. Aprender SQL exige raciocinar em conjuntos, cardinalidade, nulls, concorrência e custo—não memorizar sintaxe de um ORM.

## Fundamentos

`SELECT` projeta; `FROM` forma relações; `WHERE` filtra antes de agregação; `GROUP BY` forma grupos; `HAVING` filtra grupos; `ORDER BY` ordena; `LIMIT` reduz o resultado. A ordem textual não é a mesma ordem lógica. `NULL` usa lógica de três valores: compare com `IS NULL`, não `= NULL`.

```sql
SELECT customer_id,
       count(*) AS paid_orders,
       sum(total) AS revenue
FROM orders
WHERE status = 'paid'
  AND created_at >= $1
GROUP BY customer_id
HAVING sum(total) >= $2
ORDER BY revenue DESC, customer_id
LIMIT 100;
```

## JOIN

`INNER JOIN` exige correspondência; `LEFT JOIN` preserva o lado esquerdo; semi-join normalmente usa `EXISTS`; anti-join usa `NOT EXISTS`. Condição do lado direito em `WHERE` pode acidentalmente converter `LEFT` em `INNER`. Sempre raciocine sobre cardinalidade 1:1, 1:N e N:N para não duplicar somas.

## CTE e window functions

CTE nomeia etapas e pode ser recursiva; materialização/inlining depende do banco/versão e não deve ser presumida. Window function calcula sobre partição preservando linhas:

```sql
SELECT account_id, occurred_at, amount,
       sum(amount) OVER (
         PARTITION BY account_id
         ORDER BY occurred_at, id
         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
       ) AS running_balance
FROM entries;
```

Declare frame e desempate determinístico. `row_number`, `rank`, `lag` e `lead` resolvem top-N, ranking e comparação temporal sem loops na aplicação.

## Normalização e desnormalização

Normalização reduz redundância e anomalias de update: atributos dependem da chave, da chave toda e de nada além dela como intuição até 3NF. Não fragmente mecanicamente. Desnormalize uma leitura medida com owner, processo de atualização/reconciliação e tolerância a staleness. Materialized view e projection são cópias derivadas, não nova verdade.

## Índices e planner

Índice é uma estrutura ordenada/espacial/invertida que o planner escolhe conforme seletividade, estatísticas e custo. Um índice composto `(tenant_id, created_at)` apoia prefixo/ordem compatível; não equivale automaticamente a dois índices. Covering/index-only depende de visibilidade e colunas incluídas.

Leia `EXPLAIN` de fora para dentro/árvore: scan, join algorithm, estimated rows/cost. `EXPLAIN ANALYZE` executa e traz actual time/rows/loops; use com cuidado em writes. Grande divergência estimado-real sugere estatísticas, correlação ou distribuição ruim. Nested loop favorece entrada pequena + lookup; hash join, igualdade/conjuntos; merge join, entradas ordenadas—sempre valide no contexto.

## Transações, MVCC e locks

MVCC mantém versões e snapshots, reduzindo bloqueio leitor/writer. Ainda há row/table/predicate/advisory locks conforme engine. Transação longa aumenta retenção e contenção. Deadlock ocorre em ciclo de espera; banco aborta uma vítima. Adote ordem global de aquisição, mantenha transação curta e faça retry bounded quando seguro.

Isolamento e anomalias variam por implementação; consulte [Transações e consistência](../transactions-and-consistency.md). Não faça chamada HTTP dentro da transação. Para evento externo, use outbox.

## Performance

1. Defina SLO, parâmetros e distribuição de dados.
2. Reduza round trips/N+1 e retorne só colunas/linhas necessárias.
3. Examine plano, cardinalidade, I/O, locks e temp spill.
4. Ajuste query/modelo/índice; repita sob concorrência.
5. Verifique regressão de escrita, espaço e outros planos.

Keyset pagination usa última chave ordenada e é estável/eficiente para páginas profundas; offset ainda serve a volumes pequenos e navegação aleatória consciente. Batch enorme pode prolongar locks/WAL; limite e checkpoint.

## MySQL e SQLite

MySQL/InnoDB é um relacional client-server maduro; confira isolamento, locking, optimizer e replication específicos, sem transportar semântica PostgreSQL. SQLite é uma biblioteca embutida transacional e excelente para local/edge/testes; o modelo de concorrência de writers e filesystem muda decisões. Ambos merecem prova com drivers/configuração reais.

## Exercícios

1. Escreva a mesma consulta com join, subquery e `EXISTS`; compare planos.
2. Resolva top-3 produtos por categoria e saldo acumulado com windows.
3. Gere skew de tenant, observe erro de cardinalidade e corrija/modela.
4. Reproduza deadlock com duas sessões e imponha ordem de locks.
5. Migre relatório N+1 para query/batch e meça p95 sob concorrência.

## Referências oficiais

- ISO. [ISO/IEC 9075 — SQL](https://www.iso.org/standard/76583.html).
- PostgreSQL. [Queries](https://www.postgresql.org/docs/current/queries.html) e [Performance Tips](https://www.postgresql.org/docs/current/performance-tips.html).
- MySQL. [Reference Manual](https://dev.mysql.com/doc/refman/en/).
- SQLite. [Documentation](https://www.sqlite.org/docs.html).

---

[← Transações](../transactions-and-consistency.md) · [↑ Bancos](../README.md) · [PostgreSQL →](../postgresql/README.md)
