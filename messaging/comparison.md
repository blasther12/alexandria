# Filas, logs e pub/sub

## Modelos

| Modelo | Consumo | Retenção/replay | Adequado para |
| --- | --- | --- | --- |
| work queue | um worker por item | normalmente até ack/retention | distribuir tarefas |
| pub/sub | cada subscription recebe | depende do produto | fan-out de eventos |
| log particionado | offsets por grupo | retenção independente do consumo | histórico, streams, replay |
| stream in-memory | grupos/IDs | configurável e limitada | coordenação próxima ao cache |

## Kafka versus SQS

| Critério | Kafka | SQS Standard | SQS FIFO |
| --- | --- | --- | --- |
| abstração | log particionado | fila gerenciada | fila com message groups |
| ordering | por partition | best effort | por message group |
| entrega | geralmente at-least-once | at-least-once | deduplication no intervalo/escopo documentado |
| replay | offsets + retenção | redrive enquanto retida | redrive enquanto retida |
| operação | cluster/serviço Kafka e partitions | serviço AWS serverless | serviço AWS com limites FIFO |
| escala | partitions limitam paralelismo | escala gerenciada | grupos habilitam paralelismo |
| throughput | alto em batches/streams; limitado por partitions, brokers e I/O | alto e gerenciado dentro de quotas | menor/condicionado a modo e message groups |
| latência | baixa, otimizada com batch/linger conforme objetivo | latência de serviço HTTP gerenciado | latência de serviço + serialização por grupo |
| custo | brokers/serviço, storage, rede e equipe operacional | requests, payload, transferência e integrações | requests FIFO + transferência/integrações |
| complexidade operacional | maior: partitions, replication, upgrades/capacity | baixa: fila, IAM, quotas e DLQ continuam necessárias | baixa, com modelagem de groups/deduplication |
| caso de uso típico | event backbone, CDC e múltiplas projeções/replay | work queue e desacoplamento assíncrono AWS | workflow que exige ordem por entidade |

Escolha Kafka quando histórico reprocessável, múltiplos grupos independentes e streaming justificam o custo. Escolha SQS para desacoplar trabalho AWS com pouca operação. RabbitMQ favorece routing/ack flexíveis; NATS favorece comunicação leve e JetStream quando persistência é requerida; Redis Streams pode servir contextos já próximos de Redis, sem equivaler automaticamente a um log durável multi-tenant.

## Critérios obrigatórios

1. Quem possui schema e compatibilidade?
2. Qual key define ordering?
3. Quanto tempo deve ser possível replay?
4. O que acontece depois de `processou → crash → ack`?
5. Como poison message é isolada e corrigida?
6. Qual limite de payload e política para blobs?
7. Como autorizar produtor/consumidor e segregar tenants?
8. Como reconstruir projeção sem derrubar tráfego vivo?

## Anti-patterns

- tópico/fila como API sem contrato ou owner;
- mensagem que apenas manda outro serviço executar CRUD interno;
- payload gigante em vez de referência segura com lifecycle;
- retry infinito e DLQ sem alerta/replay;
- consumo concorrente que viola ordering do agregado;
- evento no passado re-interpretado com regra atual sem versionamento.

## Referências

- Kreps, Narkhede e Rao. [Kafka: a Distributed Messaging System for Log Processing](https://cwiki.apache.org/confluence/download/attachments/27822226/Kafka-netdb-06-2011.pdf) — paper original hospedado pelo Apache Kafka.
- RabbitMQ. [Documentation](https://www.rabbitmq.com/docs).
- NATS. [Documentation](https://docs.nats.io/).

---

[← Mensageria](README.md) · [↑ Mensageria](README.md) · [Kafka →](kafka/README.md)
