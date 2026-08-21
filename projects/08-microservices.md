# Projeto 8 — Evolução para microservices

## Objetivo

Extrair uma capacidade do monólito apenas depois de identificar limite de
domínio, necessidade independente de mudança e custo operacional aceitável.

## Requisitos

- documentar módulos e dependências atuais;
- escolher a capacidade candidata com métricas e contexto organizacional;
- definir propriedade de dados e contrato versionável;
- migrar incrementalmente sem big bang;
- preservar rastreabilidade e rollback durante coexistência.

## Arquitetura

Extraia o verificador de links ou a busca, não uma camada técnica genérica. Use
Strangler Fig: redirecione um caminho pequeno, compare resultados e aumente o
escopo somente com evidência.

## Restrições

Evite banco compartilhado como estado permanente. Não introduza chamadas
síncronas em cascata para reconstruir cada objeto do monólito.

## Milestones

1. Context map e ADR com alternativa de manter módulo interno.
2. Contrato e anti-corruption layer.
3. Migração de dados/eventos com shadow traffic ou dual read controlado.
4. Cutover, rollback ensaiado e remoção do caminho antigo.

## Critérios de conclusão

- [ ] A extração melhora um atributo mensurável.
- [ ] Falha do novo serviço tem degradação definida.
- [ ] Deploys são independentes sem quebrar compatibilidade.
- [ ] Ownership, on-call e custo adicional estão explícitos.

## Desafios extras

Compare orquestração e coreografia para um workflow que cruza os limites.

---

[← Kubernetes](07-kubernetes.md) · [↑ Projetos](README.md) · [OpenTelemetry →](09-opentelemetry.md)
