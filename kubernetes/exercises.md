# Exercícios de Kubernetes

## Beginner

Implante API com Deployment/Service, requests/limits e probes distintas. Mate Pod e observe reconciliation, endpoints e shutdown.

## Intermediate

Aplique default-deny NetworkPolicy e libere somente gateway→API, API→DB e DNS. Prove conexões permitidas/negadas e evite namespace selector acidentalmente amplo.

## Advanced

Execute rollout com duas versões compatíveis, PDB e schema expand/contract. Injete readiness failure e node drain; meça erro/p99 e reverta aplicação.

## Expert

Construa policy-as-code que exige digest, non-root, seccomp, resources e imagens de registry aprovado. Modele exceção temporária com owner/expiração/audit e teste bypasses.

## Checklist da entrega

Manifestos declarativos; diagrama; threat model; métricas antes/depois; comandos de diagnóstico; runbook e limpeza do namespace de laboratório.

---

[← Operação e segurança](operations-and-security.md) · [↑ Kubernetes](README.md) · [API Gateways →](../api-gateways/README.md)
