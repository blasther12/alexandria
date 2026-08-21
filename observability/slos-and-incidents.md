# SLOs, alertas e incidentes

## Do usuário ao indicador

SLI mede comportamento, SLO é objetivo para uma janela, error budget é tolerância a eventos ruins. Exemplo: 99,9% de checkouts válidos completam em 2 s em 28 dias. Defina população, evento bom, exclusions e source of truth; 100% geralmente inviabiliza mudança.

## Burn-rate alerts

Alertar em cada erro causa ruído. Burn rate compara consumo atual ao orçamento uniforme. Combine janela curta com longa: a curta detecta rápido; a longa confirma persistência. Página exige ação urgente; ticket acompanha degradação lenta; dashboard não deve alertar sozinho.

## Investigação

1. confirme impacto/escopo pelo SLI;
2. compare deploy/config/dependency changes;
3. segmente por região, versão, rota e tenant sem alta cardinalidade descontrolada;
4. vá de métrica para exemplar/trace e logs correlacionados;
5. mitigue com ação reversível e observe recuperação;
6. preserve timeline/evidências e faça postmortem sem culpa.

## Alertas saudáveis

Todo alerta tem owner, severidade, runbook, condição de resolução e teste. Evite alerta em causa sem impacto, mas mantenha alertas de capacidade que antecedem impacto inevitável. Revise false positives/negatives e retire painéis sem audiência.

## Referências

- Google SRE. [Service Level Objectives](https://sre.google/sre-book/service-level-objectives/).
- Google SRE Workbook. [Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/).
- OpenTelemetry. [Observability primer](https://opentelemetry.io/docs/concepts/observability-primer/).

---

[← OpenTelemetry](opentelemetry.md) · [↑ Observabilidade](README.md) · [Exercícios →](exercises.md)
