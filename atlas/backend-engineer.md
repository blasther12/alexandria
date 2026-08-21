# Percurso: Backend Engineering

## Resultado

Construir serviços que preservam contratos e dados sob concorrência, degradação
e evolução contínua.

## Sequência recomendada

| Marco | Estude | Demonstre |
| --- | --- | --- |
| Runtime | uma [linguagem](../languages/README.md), I/O e concorrência | servidor com cancelamento e shutdown gracioso |
| API | HTTP, validação, auth e idempotência | contrato versionado e testes de integração |
| Persistência | [PostgreSQL](../databases/postgresql/README.md), SQL e Redis | plano de consulta medido e cache coerente |
| Assíncrono | [Kafka e SQS](../messaging/README.md) | retry com jitter, DLQ e deduplicação |
| Distribuição | replicação, consistência e resiliência | análise de falhas parciais |
| Operação | Docker, Kubernetes e telemetria | SLO, alertas e runbook exercitado |

## Perguntas de controle

- Qual contrato é idempotente e qual chave define a operação lógica?
- O que acontece entre confirmar no banco e publicar o evento?
- Qual dado pode ficar stale, por quanto tempo e com qual impacto?
- Como o serviço reage a dependência lenta, indisponível ou inconsistente?
- Como uma mudança de schema convive com duas versões da aplicação?

## Projeto de síntese

Implemente o sistema de notificações dos [estudos de System Design](../software-engineering/system-design/README.md), primeiro como módulo no monólito e depois com worker assíncrono. Compare custo, operabilidade e isolamento.

---

[← Engenharia de Software](software-engineer.md) · [↑ Atlas](README.md) · [Arquitetura →](software-architect.md)
