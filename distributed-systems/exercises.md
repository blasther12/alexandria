# Exercícios de sistemas distribuídos

## Beginner — timeline de falha

Desenhe uma request A→B→C com deadline de 800 ms. Aloque budgets, injete 500 ms em B e descreva cancelamento, métricas e resposta ao cliente.

## Intermediate — entrega pelo menos uma vez

Implemente produtor com outbox e consumidor idempotente. Mate cada processo antes/depois de persistir, publicar, receber e confirmar. Produza uma tabela de estados e recuperação.

## Advanced — serviço sob overload

Adicione fila limitada, concurrency limit, load shedding e retry budget. Aumente carga até saturar; compare throughput, p99, erro e recovery antes/depois. Verifique que retry não amplifica colapso.

## Expert — replicated state machine

Implemente ou instrumente Raft educacional. Teste leader crash, partition minoritária/majoritária, log conflitante, snapshot e reentrada. Declare o modelo: armazenamento estável, relógio, transporte e número de falhas.

## Entregáveis

- hipótese e invariantes;
- diagrama de sequência dos caminhos de falha;
- harness reproduzível e seeds;
- métricas e traces correlacionados;
- decisão e limites conhecidos;
- runbook de recuperação.

---

[← Consenso](consensus.md) · [↑ Sistemas distribuídos](README.md) · [Mensageria →](../messaging/README.md)
