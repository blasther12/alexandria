# Exercícios de bancos de dados

Use dados gerados com distribuição realista, registre hipótese, plano, métricas e explicação. Resultado sem método não demonstra entendimento.

## Beginner — integridade e acesso

Modele biblioteca, empréstimos e reservas em PostgreSQL. Inclua constraints para impedir dois empréstimos ativos do mesmo exemplar e datas inválidas. Escreva cinco access patterns, índices correspondentes e explique um índice que decidiu não criar.

## Intermediate — quatro modelos

Modele carrinho/pedido em PostgreSQL, MongoDB, Redis (somente projeção/cache) e DynamoDB. Para cada um, mostre unidade atômica, query crítica, falha esperada, forma de recuperação e custo de evolução.

## Advanced — migração online

Migre `customer_name` para `customer_id` sem parar duas versões da aplicação. Planeje expand/backfill/dual-read/constraint/contract, limite carga, meça lag e defina rollback. Prove que retry não duplica efeitos.

## Expert — incidente e recuperação

Construa um laboratório com primário, réplica/projeção e backup. Injete perda de conexão, atraso, processo morto e exclusão lógica. Meça RPO/RTO, restaure em ambiente isolado e escreva postmortem com controles preventivos e detectivos.

## Rubrica

- 25% modelo e invariantes;
- 20% método e dados de teste;
- 20% concorrência/falhas;
- 20% operação, segurança e observabilidade;
- 15% trade-offs e comunicação.

---

[← DynamoDB](dynamodb/README.md) · [↑ Bancos](README.md) · [Sistemas distribuídos →](../distributed-systems/README.md)
