# Filas, logs e pub/sub

Escolher mensageria é escolher **semântica de entrega, retenção, replay, paralelismo e operação**. Kafka e SQS resolvem problemas sobrepostos, mas partem de abstrações diferentes: Kafka organiza um log particionado retido por tempo/tamanho; SQS organiza trabalho em filas gerenciadas cujo ciclo central é receber, processar e remover mensagens.

A pergunta útil não é “qual é melhor?”, e sim: **qual comportamento o sistema precisa preservar quando produtores, consumidores e rede falham?**

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

## Mecanismo mental: quem possui o progresso?

Em Kafka, o broker mantém o log e o **consumer group mantém o progresso por offset**. Consumir não apaga o registro. Isso permite que outro grupo leia o mesmo evento, que um grupo recue o offset e que uma projeção seja reconstruída. O preço é operar partitions, retenção, rebalance, capacidade de brokers e compatibilidade de schema.

Em SQS, a mensagem recebida fica invisível durante o `visibility timeout`. Se o consumer concluir e apagar, ela sai da fila. Se falhar ou o timeout expirar, pode reaparecer. O progresso é, portanto, um lease temporário sobre trabalho. Isso simplifica muitos jobs, mas não oferece o mesmo modelo natural de replay histórico independente por múltiplos consumidores.

Esse contraste afeta arquitetura. Um evento `OrderPlaced` usado por cinco projeções independentes combina naturalmente com grupos Kafka. Um job `GenerateInvoicePdf` que só precisa ser executado por um worker combina naturalmente com uma fila SQS.

## Ordering é local, não mágico

Kafka preserva ordem **dentro de uma partition**. Se `order_id` é a chave, eventos do mesmo pedido podem compartilhar ordem, enquanto pedidos diferentes avançam em paralelo. Aumentar partitions muda a capacidade e pode exigir estratégia de chave consistente durante migração.

SQS Standard não fornece ordenação estrita. SQS FIFO fornece ordem por `MessageGroupId`, mas cada grupo serializa progresso. Usar um único group para toda a fila preserva ordem global às custas de paralelismo.

Pergunte sempre: **ordem de quê?** Conta bancária, pedido, usuário, tenant ou global? Se o requisito só existe por agregado, não pague custo de ordem global.

## Entrega e idempotência

Nos dois modelos, trate repetição como comportamento esperado. Um consumer pode concluir o efeito e falhar antes de confirmar progresso. A mensagem volta, o offset não avança ou o ack não é persistido.

Idempotência deve estar na fronteira do efeito:

- grave `message_id` junto com a alteração transacional quando possível;
- use `expected_version` para impedir transições repetidas;
- envie idempotency key a provedores externos que suportem;
- reconcilie efeitos quando o provedor não oferece deduplicação forte.

“Exactly once” só tem significado com fronteira declarada. Kafka transactions podem coordenar determinadas operações dentro do ecossistema Kafka, mas não tornam um pagamento HTTP externo exatamente uma vez. SQS FIFO deduplica mensagens em uma janela específica, mas também não substitui idempotência de negócio.

## Retenção e replay

Kafka separa retenção do consumo. Um tópico pode manter dados por horas, dias ou meses, e grupos diferentes percorrem offsets próprios. Isso habilita rebuild de views, novos consumers e debugging histórico, mas aumenta storage, governança de PII e custo de reprocessamento.

SQS retém mensagens até remoção ou expiração. DLQ/redrive ajuda recuperação operacional, mas não deve ser confundido com event log de longo prazo. Se o produto precisa reprocessar seis meses de fatos, uma fila de trabalho isolada provavelmente não é a fonte adequada.

Para replay, planeje efeitos. Reexecutar um consumer de analytics é diferente de reexecutar um consumer que envia email. Separe cálculo de efeito externo, adicione modo de replay e mantenha checkpoints auditáveis.

## Backpressure e capacidade

Kafka expõe backlog como **consumer lag**. Capacidade depende de partitions, bytes por mensagem, batch, compressão, I/O de broker e eficiência do consumer. Mais consumers que partitions no mesmo grupo não aumentam paralelismo útil.

SQS permite escalar workers conforme backlog, idade da mensagem e taxa de chegada. A fila pode absorver picos, mas downstreams continuam finitos. Autoscaling sem limite pode transformar backlog em tempestade contra banco ou API externa.

Uma conta simples ajuda:

`capacidade necessária ≈ taxa de chegada × tempo médio de processamento`

Se chegam 500 mensagens/s e cada worker processa 10/s, o baseline pede cerca de 50 workers antes de margem, picos e falhas. Para Kafka, isso também precisa caber no número de partitions efetivamente paralelizáveis.

## Falhas e recuperação

### Kafka

- **rebalance frequente:** pauses, processamento lento ou configuração ruim podem causar churn;
- **hot partition:** chave enviesada limita throughput mesmo com cluster folgado;
- **ISR degradado:** replicas fora de sync reduzem margem de falha;
- **poison event:** consumer trava repetidamente no mesmo offset;
- **retenção insuficiente:** consumer parado perde dados antes de recuperar;
- **schema incompatível:** um producer quebra vários grupos de uma vez.

### SQS

- **visibility timeout curto:** mensagem reaparece enquanto ainda está sendo processada;
- **visibility timeout longo:** falha demora a ser redistribuída;
- **DLQ sem owner:** erros acumulam sem recuperação;
- **poison message:** retries consomem custo e atrasam trabalho útil;
- **autoscaling agressivo:** downstream satura antes da fila;
- **FIFO group quente:** um grupo concentra backlog e serializa throughput.

## Observabilidade

Para Kafka, acompanhe producer error/latency, bytes, under-replicated partitions, ISR, request latency, consumer lag em registros e tempo, rebalance, commit rate e idade do evento processado.

Para SQS, acompanhe idade da mensagem mais antiga, número de mensagens visíveis/in-flight, taxa de receive/delete, DLQ, retries, duração de processamento e saturação do downstream.

Não pare em métricas do broker. Correlacione `event_id`, `correlation_id`, tenant e resultado de negócio. Uma fila vazia pode significar sucesso ou produtor quebrado.

## Segurança e governança

- autentique producers e consumers com identidade de workload;
- autorize por tópico/fila e ação, não apenas por conta ampla;
- criptografe transporte e repouso quando exigido;
- classifique PII e defina retenção antes de publicar;
- limite payload e use object storage para blobs grandes;
- versionamento de schema precisa de owner e compatibilidade no CI;
- evite colocar credenciais, tokens ou dados secretos em headers/attributes que aparecem em logs.

Kafka multi-tenant exige pensar em quotas, ACLs e noisy neighbors. SQS simplifica isolamento por recurso/IAM, mas uma role ampla ainda pode ler ou apagar filas indevidas.

## Critérios obrigatórios

1. Quem possui schema e compatibilidade?
2. Qual key define ordering?
3. Quanto tempo deve ser possível replay?
4. O que acontece depois de `processou → crash → ack`?
5. Como poison message é isolada e corrigida?
6. Qual limite de payload e política para blobs?
7. Como autorizar produtor/consumidor e segregar tenants?
8. Como reconstruir projeção sem derrubar tráfego vivo?
9. Qual backlog máximo cabe no RTO?
10. Quem paga o custo de storage, requests, transferência e operação?

## Laboratório comparativo

Implemente o mesmo fluxo de processamento de pedidos duas vezes.

1. Produza `OrderPlaced` com `event_id` e `order_id`.
2. Em Kafka, use `order_id` como key e dois consumer groups: faturamento e analytics.
3. Em SQS, modele faturamento como work queue e crie uma segunda fila apenas se analytics precisar de fan-out.
4. Mate o consumer depois do commit e antes do ack/offset commit; prove idempotência.
5. Injete uma poison message e documente quarentena/redrive.
6. Gere backlog por cinco minutos e meça recuperação sem saturar o banco.
7. Faça replay de 100 mil eventos e bloqueie efeitos externos durante a reconstrução.
8. Compare custo, latência, esforço operacional e facilidade de investigação.

O relatório final deve justificar uma escolha e dizer **qual mudança de requisito faria você trocar de tecnologia**.

## Anti-patterns

- tópico/fila como API sem contrato ou owner;
- mensagem que apenas manda outro serviço executar CRUD interno;
- payload gigante em vez de referência segura com lifecycle;
- retry infinito e DLQ sem alerta/replay;
- consumo concorrente que viola ordering do agregado;
- evento no passado re-interpretado com regra atual sem versionamento;
- escolher Kafka só porque “escala mais” sem necessidade de log/replay;
- escolher SQS só porque é gerenciado e depois tentar reconstruir histórico inexistente.

## Referências

- Apache Kafka. [Documentation](https://kafka.apache.org/documentation/).
- AWS. [Amazon SQS Developer Guide](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html).
- Kreps, Narkhede e Rao. [Kafka: a Distributed Messaging System for Log Processing](https://cwiki.apache.org/confluence/download/attachments/27822226/Kafka-netdb-06-2011.pdf).
- RabbitMQ. [Documentation](https://www.rabbitmq.com/docs).
- NATS. [Documentation](https://docs.nats.io/).

---

[← Mensageria](README.md) · [↑ Mensageria](README.md) · [Kafka →](kafka/README.md)
