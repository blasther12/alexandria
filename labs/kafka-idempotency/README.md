# Lab · Kafka, redelivery e idempotência

## Objetivo

Demonstrar que `at-least-once` implica duplicação possível e que idempotência precisa existir no efeito, não apenas no consumer loop.

## Ambiente

Use uma instalação local de Kafka/Redpanda ou qualquer cluster de desenvolvimento.

## Cenário

Evento:

```json
{"event_id":"evt-42","order_id":"order-9","type":"OrderPaid"}
```

Crie um consumer que:

1. grava o `event_id` em uma tabela `processed_events` com chave única;
2. executa o efeito apenas quando o insert realmente cria uma linha nova;
3. só confirma o offset depois de o efeito ficar seguro.

SQL de deduplicação:

```sql
INSERT INTO processed_events(event_id, processed_at)
VALUES (:event_id, now())
ON CONFLICT DO NOTHING;
```

## Quebrar de propósito

Depois de executar o efeito, mate o consumer **antes do commit do offset**.

Ao reiniciar, a mensagem deve ser entregue novamente.

## Evidência esperada

- o broker redelivera o evento;
- o consumer recebe `evt-42` outra vez;
- o efeito de negócio ocorre uma única vez;
- o offset avança depois da recuperação.

## Replay

Reposicione o consumer group para reler uma pequena janela. Verifique que a deduplicação continua protegendo o efeito.

## Perguntas

1. Onde termina a garantia do broker?
2. O que muda se o efeito for uma chamada HTTP externa?
3. Quanto tempo a dedup store precisa reter IDs?
4. Quando uma idempotency key deveria ser chave de negócio em vez de event ID?

---

[↑ Voltar aos laboratórios](../README.md)
