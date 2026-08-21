# Arquitetura — exercícios

Para toda solução, entregue diagrama C4/Mermaid suficiente, drivers priorizados, estimativa simples, modelo de falhas, ameaça principal, plano de evolução e ADR. Não existe resposta universal: a avaliação é a coerência entre contexto e trade-offs.

## Beginner

1. **Mapear:** pegue uma API CRUD e desenhe runtime, banco e dependências. Marque chamada síncrona, dono do dado e trust boundary.
2. **Refatorar:** transforme pacotes por camada em dois módulos verticais. Crie API pública e um teste que proíba imports internos cruzados.
3. **Decidir:** compare chamada direta e evento para envio de email. Registre latência, confirmação ao usuário, retry e observabilidade em um ADR.

**Critério:** nenhum componente sem responsabilidade; links entre requisito, decisão e teste são rastreáveis.

## Intermediate

1. **Clean/Hexagonal:** extraia um checkout acoplado ao framework para domínio/use case/ports/adapters. Teste domínio sem I/O e adaptador com banco real.
2. **Event-driven:** implemente outbox e consumidor idempotente. Mate processos após commit, publish, efeito e antes do ack; prove recuperação.
3. **Deployment:** faça migração expand/contract de uma coluna sob duas versões concorrentes. Demonstre rollback do binário sem perda de dado.

**Critério:** falhas parciais e janelas de compatibilidade estão automatizadas, não apenas descritas.

## Advanced

1. **Decomposição:** use histórico de mudanças e DDD para propor extração de um serviço. Compare modular monolith, serviço síncrono e evento; estime nova carga operacional.
2. **CQRS:** crie projeção de busca reconstruível. Defina read-your-writes, checkpoint atômico, SLA de lag e cutover entre v1/v2.
3. **Resiliência:** monte cadeia de três serviços com orçamento de 500 ms. Aloque timeout/retry, limite concorrência e teste cascata sob 5% de falhas.

**Critério:** SLOs, capacidade e custo são mensurados; contratos passam por testes de compatibilidade.

## Expert

1. **Event Sourcing:** implemente ledger simplificado com streams versionados, snapshots, upcaster e duas projeções. Rehidrate fixtures históricas e ensaie restore/rebuild.
2. **Evolução sem big bang:** execute strangler de um módulo com tráfego sombra, migração/CDC, reconciliação, canary, retorno e remoção. Produza runbook de cada estágio.
3. **Fitness functions:** estabeleça uma suíte que verifica dependências, schema, SLO, recuperação, least privilege e número de mudanças coordenadas. Use dados de quatro semanas para aceitar ou substituir um ADR.

**Critério:** a arquitetura é operável em incidentes, reversível onde prometido e validada por evidência.

## Rubrica

| Dimensão | Pergunta |
| --- | --- |
| Adequação | O desenho resolve drivers priorizados sem escopo especulativo? |
| Integridade | Dados, consistência e idempotência resistem a falha? |
| Operação | Há sinais, alertas acionáveis, ownership, runbook e recovery? |
| Segurança | Atores, ativos, fronteiras e least privilege estão claros? |
| Evolução | Compatibilidade, migração e gatilho de revisão estão registrados? |

---

[← ADRs](decision-records.md) · [↑ Índice](README.md)
