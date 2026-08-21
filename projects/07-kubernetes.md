# Projeto 7 — Operação no Kubernetes

## Objetivo

Declarar e operar a aplicação sob reconciliação, limites de recursos e mudanças
progressivas, compreendendo o que o cluster não resolve automaticamente.

## Requisitos

- Namespace, Deployment, Service, ConfigMap, Secret reference e ServiceAccount;
- startup, readiness e liveness probes com semânticas distintas;
- requests/limits derivados de medição e PodDisruptionBudget coerente;
- migration executada como Job controlado;
- rollout, rollback e autoscaling com sinais documentados.

## Arquitetura

`Ingress → Service → Pods → serviços de dados externos`. Comece apenas com API e
worker; dados stateful no cluster exigem uma justificativa separada.

## Restrições

Use RBAC mínimo, security context non-root e NetworkPolicy default-deny quando o
ambiente suportar. Não coloque segredo em ConfigMap ou manifest versionado.

## Milestones

1. Manifests e execução local em cluster descartável.
2. Probes, recursos e shutdown gracioso.
3. Helm ou Kustomize com ambientes sem copiar manifests inteiros.
4. Rollout interrompido, drain de nó e falha de dependência exercitados.

## Critérios de conclusão

- [ ] Readiness retira tráfego sem reiniciar processo saudável.
- [ ] Um rollout com versão defeituosa é detectado e revertido.
- [ ] Escala respeita capacidade de banco e filas.
- [ ] Runbook parte de sintomas e usa Events, logs, métricas e estado desejado.

## Desafios extras

Implemente GitOps e política que rejeite imagens sem digest ou execução como root.

---

[← Docker](06-docker.md) · [↑ Projetos](README.md) · [Microservices →](08-microservices.md)
