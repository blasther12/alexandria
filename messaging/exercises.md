# Exercícios de mensageria

## Beginner

Defina envelope CloudEvents-like para `OrderPlaced`, compatibilidade v1→v2, classificação de dados e partition/message group key.

## Intermediate

Implemente worker at-least-once com inbox. Injete crash nos quatro pontos entre receive, efeito, commit e ack; apresente state table.

## Advanced

Crie poison messages transitórias e permanentes. Aplique backoff, max attempts, DLQ, alerta, diagnóstico e redrive rate-limited sem mudar ordering necessário.

## Expert

Projete migração Kafka→outro broker ou SQS→Kafka com dual-publish por outbox, shadow consume, comparação de resultados, cutover e rollback. Discuta offsets/identidade, ordem, retenção, custo e observabilidade.

## Rubrica

Contrato e compatibilidade 20%; correção sob duplicação 25%; fluxo/overload 20%; segurança 15%; operação/recovery 20%.

---

[← Laboratório Docker](docker-lab.md) · [↑ Mensageria](README.md) · [Containers →](../containers/README.md)
