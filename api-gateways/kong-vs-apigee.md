# Kong versus Apigee

Não compare por lista de features isolada. Comece por deployment boundary, skills, governança, volume, integração cloud, developer experience, compliance e custo total.

## Matriz contextual

| Dimensão | Kong | Apigee |
| --- | --- | --- |
| arquitetura | gateway/data plane com opções declarativa, database e hybrid | plataforma de API management com proxies, environments e runtime gerenciado/hybrid |
| extensibilidade | plugins e ecossistema; código no request path exige lifecycle | catálogo de policies, shared flows e extensões |
| operação | self-managed ou oferta gerenciada; grande afinidade cloud-native | integração profunda a Google Cloud; serviço/hybrid muda responsabilidades |
| Kubernetes | Ingress Controller/Gateway API e deployments próximos ao cluster | pode frontar workloads; hybrid conecta runtime ao ambiente do cliente |
| policies | plugins escopados a serviço/route/consumer | policies encadeadas por flows/conditions |
| analytics | telemetry/plugins e recursos da oferta escolhida | analytics integrado à plataforma |
| portal | recursos variam por produto/edição | developer portal e products como modelo central |
| GitOps | configuração declarativa favorece promoção como artefato | bundles/revisions e APIs de gestão exigem pipeline disciplinado |
| custo | infra + operação + licença/oferta | consumo/licença + rede + operação hybrid quando aplicável |
| melhor ajuste comum | times platform/cloud-native que valorizam proxy extensível e controle de topologia | programa corporativo de APIs com governança, analytics e portal integrados |

Capacidades e preços mudam: valide edição, região, limite e contrato nas páginas oficiais antes da decisão.

## Prova de conceito justa

Implemente a mesma OpenAPI e política: TLS, auth, quota, rate/spike, transformação, cache privado, canary, OTel e rollback. Meça latência adicionada p50/p99, throughput, propagation de config, tempo de recovery, esforço de policy/plugin, experiência de consumer e custo anual incluindo pessoas.

## Perguntas decisivas

- Control/data plane podem ficar onde dados/compliance exigem?
- O data plane continua servindo com management plane indisponível?
- Qual blast radius de policy/shared plugin e como testar/rollback?
- Portal, subscription e analytics são necessidades ou features ociosas?
- A equipe opera database/control plane/upgrades ou quer serviço integrado?
- Como exportar configuração, telemetria e consumers para evitar lock-in irreversível?

## Referências

- Kong. [Deployment topologies](https://docs.konghq.com/gateway/latest/production/deployment-topologies/).
- Google Cloud. [Apigee architecture](https://cloud.google.com/apigee/docs/api-platform/architecture/overview).

---

[← Apigee](apigee/README.md) · [↑ API Gateways](README.md) · [Operação e exercícios →](operations-and-exercises.md)
