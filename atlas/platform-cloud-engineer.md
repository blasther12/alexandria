# Percurso: Platform / Cloud Engineering

## Resultado

Construir uma plataforma que reduza cognitive load para times de produto sem
esconder mecanismos críticos de operação. A meta é oferecer caminhos seguros,
observáveis e reproduzíveis, não criar um portal que apenas empilha abstrações.

## Diagnóstico de entrada

Tente responder sem consultar material:

- qual diferença existe entre control plane e data plane no seu ambiente?
- como um workload obtém identidade sem usar credencial estática?
- o que acontece quando um node fica sem memória, disco ou conectividade?
- como provar que um rollback realmente recupera o serviço?
- qual parte da plataforma é shared fate para todos os times?

## Marcos

| Marco | Estude | Evidência de conclusão |
| --- | --- | --- |
| Linux e containers | processos, namespaces, cgroups, OCI | imagem mínima com limites e shutdown correto |
| Cloud fundamentals | IAM, rede, compute, storage, failure domains | arquitetura com trust boundaries e custo estimado |
| Kubernetes | scheduling, probes, Service, CNI, CSI, controllers | workload operável sob restart e rollout |
| Delivery | CI, artifact promotion, GitOps, policy | mesmo digest promovido entre ambientes |
| Observabilidade | metrics, logs, traces, SLOs | golden signals e runbook da plataforma |
| Segurança | workload identity, secrets, admission, supply chain | least privilege e policy verificável |
| Capacidade | requests, autoscaling, quotas, FinOps | teste de saturação e capacity model |
| Platform product | golden paths, templates, docs, feedback | fluxo self-service medido por adoção e lead time |

## Laboratórios obrigatórios

### Container e resource limits

Rode um serviço com limite de CPU e memória. Provoque throttling e OOM. Relacione
os sintomas da aplicação às métricas do runtime e do orquestrador.

### Scheduling e disponibilidade

Crie um Deployment com requests, topology spread e PodDisruptionBudget. Remova um
node e observe scheduling, readiness e capacidade restante. Documente o ponto em
que a política de disponibilidade impede manutenção.

### GitOps e promoção

Construa uma imagem uma única vez, publique por digest e promova o mesmo artefato
entre dois ambientes. Introduza drift manual e observe a reconciliação.

### Identity e policy

Dê a um workload somente a permissão necessária para acessar um recurso cloud.
Tente uma ação fora do escopo e registre a negação. Depois rotacione ou revogue o
acesso sem trocar secret estático no código.

## Projeto de síntese

Construa um **golden path de serviço HTTP**:

1. template cria serviço, testes, Dockerfile e manifestos;
2. pipeline gera artefato por digest, SBOM e provenance;
3. GitOps promove o mesmo digest;
4. Kubernetes aplica requests, probes, security context e policies;
5. workload identity fornece acesso cloud mínimo;
6. OpenTelemetry exporta sinais por um Collector;
7. SLO e alertas vêm junto com o serviço;
8. dashboard mostra deployment, saturation, errors e dependências;
9. runbook cobre rollout travado, OOM, DNS e dependência indisponível;
10. documentação registra escape hatch para casos que o golden path não atende.

Meça o sucesso da plataforma por lead time, taxa de adoção, incidentes evitados,
tempo de diagnóstico e quantidade de exceções manuais, não por número de
features do portal.

## Checkpoints

### Fundamentos

Explique o caminho de uma request desde o load balancer até o processo, passando
por DNS, Service, dataplane e container.

### Aplicação

Entregue um workload non-root com recursos, probes, identity, telemetria e
rollback reproduzível.

### Proficiência

Receba um cluster com Pods Pending e diagnostique restrições, requests, topology,
volumes e quotas antes de alterar capacidade.

### Sistemas

Projete uma plataforma multi-team com tenancy, políticas, observabilidade,
upgrade strategy, DR, capacity buffer e ownership explícito do control plane.

## Perguntas de entrevista

- Quando HPA piora uma dependência em vez de recuperar capacidade?
- Qual a diferença entre disponibilidade de um cluster e de um serviço?
- Por que `cluster-admin` é um problema organizacional além de segurança?
- Como separar configuração, secret e identidade de workload?
- Quando uma abstração de plataforma deve expor o Kubernetes em vez de escondê-lo?
- Como fazer upgrade de cluster sem tratar aplicação e plataforma como mundos
  separados?
- Qual métrica mostra que um golden path realmente reduziu cognitive load?

## Critério de conclusão

A trilha termina quando você consegue oferecer uma plataforma que acelera o
caminho comum, mantém mecanismos observáveis e possui escape hatches explícitos
para necessidades legítimas fora do padrão.

---

[← Arquitetura](software-architect.md) · [↑ Atlas](README.md) · [AI Engineering →](ai-engineer.md)
