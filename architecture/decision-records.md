# Architecture Decision Records (ADR)

Um ADR preserva uma decisão arquitetural significativa junto de seu **contexto, alternativas e consequências**. Ele não congela a arquitetura: torna explícito por que uma escolha fazia sentido e como substituí-la com responsabilidade.

O template do repositório está em [`../templates/adr.md`](../templates/adr.md).

## Quando registrar

Registre escolhas caras de reverter ou que afetam várias pessoas: limites de módulos/serviços, armazenamento, protocolo, consistência, identidade, observabilidade, estratégia de deploy e exceções a padrões.

Não crie ADR para formatação, dependência trivial ou decisão já imposta sem alternativa relevante. Se uma restrição externa determina tudo, registre-a apenas quando a memória do contexto for valiosa.

## Ciclo de vida

```mermaid
stateDiagram-v2
    [*] --> Proposed
    Proposed --> Accepted: decisão tomada
    Proposed --> Rejected: alternativa recusada
    Accepted --> Superseded: novo ADR substitui
    Accepted --> Deprecated: não recomendado para novos casos
    Superseded --> [*]
    Rejected --> [*]
```

Nunca apague ou reescreva silenciosamente um ADR aceito. Corrija erros menores com histórico; para mudar a decisão, crie outro ADR e conecte `supersedes` / `superseded by`.

## Estrutura recomendada

```markdown
# ADR-004: Usar outbox para publicação de eventos de pedidos

- Status: Accepted
- Date: 2026-08-21
- Owners: Orders team
- Supersedes: none

## Context
Qual força e restrição exigem uma decisão? Inclua evidência e qualidade mensurável.

## Decision
O que faremos, em qual escopo e a partir de quando?

## Alternatives
Quais opções viáveis foram comparadas e por que não foram escolhidas?

## Consequences
Benefícios, custos, riscos, trabalho operacional e efeitos de segunda ordem.

## Validation
Fitness function, métrica, experimento e gatilho/data para revisão.
```

O template mínimo pedido pelo Alexandria contém Context, Decision, Alternatives e Consequences; os metadados e Validation são extensões úteis, não burocracia obrigatória.

## Processo leve

1. Autor abre ADR como `Proposed` antes de a decisão estar consolidada.
2. Pessoas afetadas revisam contexto, alternativas e consequências; comentários ficam no PR.
3. Owner explícito resolve discordâncias e marca `Accepted` ou `Rejected`.
4. Código, diagrama e runbook apontam para o ADR; o ADR aponta para evidência estável, não para chat efêmero.
5. Fitness function e data/gatilho provocam revisão.

Prefira um documento curto que permite decidir. Benchmarks, ameaça detalhada e protótipos podem ser anexos/referências.

## Como escrever bem

- Título é uma decisão: “Usar outbox…”, não “Mensageria”.
- Contexto descreve forças sem antecipar a solução: volume, SLO, ownership, restrição regulatória.
- Alternativas são plausíveis, incluindo “não mudar”. Não construa uma opção-palha.
- Consequências têm sinal positivo e negativo; inclua migração, segurança, custo e operação.
- Escopo diz onde a decisão **não** se aplica.
- Quantifique: p99, RPO, custo mensal, janela de compatibilidade, pessoas on-call.

## Exemplo condensado

### Context

Pedidos grava estado no PostgreSQL e publica `OrderPlaced`. A escrita dupla perdeu 3 eventos em testes de kill entre commit e publish. O fluxo aceita até 60 s de atraso, deve tolerar redelivery e não pode usar transação distribuída com o broker.

### Decision

Persistir evento em `orders_outbox` na mesma transação do pedido. Um relay publica com at-least-once; consumidores deduplicam por `event_id`. Retenção de outbox publicada: 14 dias.

### Alternatives

- Publicar antes do commit: consumidor pode observar pedido inexistente.
- Publicar depois: mantém a janela de perda observada.
- 2PC: broker/stack e operação não oferecem suporte aceitável.
- CDC: viável, mas a equipe ainda não opera a plataforma; reavaliar com >5 produtores.

### Consequences

Elimina a janela de perda entre duas escritas, não duplicidade. Adiciona relay, lag/SLO, limpeza, idempotência, alerta e reconciliação. O banco absorve mais escrita. Um teste de falha entre cada etapa e um alerta `oldest_unpublished_age > 60s` validam a decisão.

## Organização e navegação

- numere de forma monotônica: `0004-use-transactional-outbox.md`;
- um índice lista status, título, owner e substituição;
- mantenha ADR perto do código afetado ou em `docs/adr/`, mas escolha uma convenção única;
- links relativos conectam decisões dependentes;
- IDs nunca são reutilizados, mesmo para ADR rejeitado.

## Anti-patterns

- **arqueologia reversa:** ADR escrito depois para justificar decisão já tomada;
- **catálogo de tecnologia:** descreve Kafka, mas não registra uma escolha/contexto;
- **só benefícios:** esconde custo operacional e migração;
- **cemitérios Proposed:** nenhum owner ou prazo decide;
- **imutabilidade absoluta:** erro factual não pode ser corrigido e links apodrecem;
- **aprovação central:** comitê distante vira gargalo para toda decisão local;
- **sem validação:** hipótese nunca confrontada com produção.

## Checklist de revisão

- A decisão e o escopo cabem em uma frase?
- Drivers são verificáveis e alternativas são reais?
- Dados, segurança, entrega, operação e reversibilidade aparecem?
- Existe owner e mecanismo para medir sucesso?
- O gatilho de substituição está claro?
- Um novo integrante entenderá “por quê” sem abrir o código histórico?

## Referências

- Michael Nygard. [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions).
- ADR GitHub organization. [ADR resources](https://adr.github.io/).
- Joel Parker Henderson. [Architecture Decision Record repository](https://github.com/joelparkerhenderson/architecture-decision-record).
- Thoughtworks Technology Radar. [Lightweight Architecture Decision Records](https://www.thoughtworks.com/radar/techniques/lightweight-architecture-decision-records).

---

[← CQRS + Event Sourcing](cqrs-event-sourcing/README.md) · [↑ Índice](README.md) · [Exercícios →](exercises.md)
