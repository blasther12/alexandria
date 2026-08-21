# Projeto 5 — Jobs com SQS

## Objetivo

Executar verificação assíncrona de links por uma fila gerenciada, distinguindo
semântica de job de um log de eventos reproduzível.

## Requisitos

- enfileirar a verificação sem bloquear a API;
- usar long polling, batch e visibility timeout coerente com a duração;
- renovar ou encerrar o lease de trabalho longo;
- tornar efeitos idempotentes;
- enviar falhas terminais a DLQ e oferecer redrive controlado.

## Arquitetura

`API → SQS → link checker → PostgreSQL`, com uma DLQ associada. Avalie Standard
e FIFO a partir de ordering, deduplicação, throughput e custo, não pelo nome.

## Restrições

Defina número máximo de tentativas, backoff com jitter e política para links que
sempre falham. Não registre conteúdo sensível de mensagens em logs.

## Milestones

1. Producer e worker localmente testáveis.
2. Timeout, retry e deduplicação.
3. DLQ, inspeção, correção e redrive.
4. Autoscaling orientado a idade da mensagem e carga da dependência.

## Critérios de conclusão

- [ ] Matar o worker durante o job não perde nem duplica o efeito final.
- [ ] Visibility timeout e duração real são observáveis.
- [ ] Poison messages não bloqueiam progresso saudável.
- [ ] Custo e diferenças frente ao uso de Kafka são documentados.

## Desafios extras

Adicione prioridade com duas filas sem causar starvation.

---

[← Kafka](04-kafka.md) · [↑ Projetos](README.md) · [Docker →](06-docker.md)
