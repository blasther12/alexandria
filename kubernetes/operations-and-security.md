# Operação e segurança no Kubernetes

## Rollout seguro

Use readiness real, PodDisruptionBudget, topology spread/anti-affinity e capacidade para surge. Migração de schema deve ser compatível com versões adjacentes. Canary/blue-green precisam métricas de decisão e rollback. `kubectl rollout undo` não reverte banco nem efeitos externos.

## Escala e capacidade

HPA reage a métricas depois de atraso; requests erradas distorcem CPU utilization. KEDA/event-driven scaling não elimina backlog/tempo de startup. Cluster autoscaler/provisioners precisam capacity buffer. VPA pode reiniciar Pods e conflitar com HPA conforme métricas.

## Baseline de segurança

- namespace e ServiceAccount dedicados; não montar token quando desnecessário;
- RBAC por verb/resource/name, sem wildcards amplos;
- Pod Security Standards `restricted` quando compatível;
- non-root, read-only root filesystem, drop capabilities, seccomp;
- NetworkPolicy ingress/egress e workload identity curta;
- admission policies para imagens assinadas/digests e configurações proibidas;
- audit logs e acesso break-glass temporário.

## Observabilidade e runbooks

Observe control plane, nodes, scheduling, restarts, OOM, throttling, requests/usage, probe failures, rollout e SLO da aplicação. Events são efêmeros: exporte quando necessários. Runbooks cobrem Pending, CrashLoopBackOff, ImagePullBackOff, DNS, node pressure e rollout travado.

## Scheduling e extensão

Affinity/anti-affinity e topology spread orientam colocação; taints repelem e tolerations apenas permitem, não obrigam. Use constraints mínimas: regras rígidas demais deixam Pods Pending durante falha. CRDs estendem a API; um Operator combina CRD e controller para reconciliar lifecycle de um domínio. Só crie um quando invariantes operacionais repetíveis justificarem compatibilidade, upgrades, status e suporte contínuo.

## Helm e GitOps

Helm empacota templates/values/releases; mantenha values pequenos, schema validado, output inspecionável e hooks raros/idempotentes. GitOps mantém estado desejado versionado e um reconciler como Argo CD aplica/detecta drift. Secret não deve ficar em claro no Git; use integração adequada. Separe promoção de imagem/digest da geração de manifestos e defina como rollback lida com migrações.

Troubleshooting segue camada: objeto/status/events → scheduler/resources → Pod/processo/probes → Service/endpoints/DNS/network policy → dependency. Compare desired/observed antes de reiniciar, pois restart pode apagar evidência.

## Anti-patterns

- requests ausentes ou copiados entre workloads;
- `latest`, container root/privileged e host mounts sem threat model;
- ConfigMap gigante como sistema de configuração dinâmica;
- Helm chart abstrato que esconde primitives e torna debug impossível;
- operador customizado para workflow que Job/Deployment resolveria;
- acesso humano permanente com `cluster-admin`.

## Referências oficiais

- Kubernetes. [Security](https://kubernetes.io/docs/concepts/security/).
- [Pod Security Standards](https://kubernetes.io/docs/concepts/security/pod-security-standards/).
- [RBAC](https://kubernetes.io/docs/reference/access-authn-authz/rbac/).
- [Resource management](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/).
- Helm. [Documentation](https://helm.sh/docs/).
- Argo CD. [Documentation](https://argo-cd.readthedocs.io/).

---

[← Workloads e rede](workloads-and-networking.md) · [↑ Kubernetes](README.md) · [Exercícios →](exercises.md)
