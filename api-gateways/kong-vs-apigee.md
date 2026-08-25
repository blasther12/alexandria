# Kong versus Apigee

Comparar Kong e Apigee por checklist de features quase sempre produz uma decisão
fraca. As duas plataformas podem resolver autenticação, routing, policies,
observabilidade e lifecycle de APIs, mas carregam modelos operacionais e de
governança diferentes.

O problema real é escolher **qual plataforma encaixa melhor na topologia,
maturidade, compliance, ownership e forma de operar APIs da organização**.

## Modelo mental: gateway é infraestrutura no caminho crítico

Toda request passa por algo semelhante a:

```text
client
→ TLS
→ authentication
→ routing
→ policy
→ transformation
→ upstream
→ response policy
→ client
```

Portanto, a comparação precisa considerar duas dimensões ao mesmo tempo:

1. **capacidade de API management**;
2. **confiabilidade do data plane no request path**.

Portal bonito não compensa um runtime que a equipe não sabe operar. Um proxy muito
extensível também não compensa ausência de governança se o problema principal é
programa corporativo de APIs.

## Comece pelos drivers

Antes da PoC, responda:

- data plane precisa rodar em qual cloud/região/rede?
- existe requisito híbrido/on-premises?
- quem opera control plane e data plane?
- há programa de API products, subscriptions e developer portal?
- analytics corporativo é requisito central?
- políticas serão majoritariamente declarativas ou código customizado?
- Kubernetes/Gateway API são parte da plataforma?
- qual SLO do gateway?
- qual blast radius aceitável?
- como configuration changes são promovidas e revertidas?
- qual skill set existe no time?
- qual custo total, incluindo pessoas?

## Matriz contextual

| Dimensão | Kong | Apigee |
| --- | --- | --- |
| foco comum | gateway extensível/cloud-native | API management corporativo integrado |
| arquitetura | data plane + control plane em diferentes topologias | proxies/environments com gestão Apigee e opções de runtime gerenciado/hybrid |
| extensibilidade | plugins/ecossistema | policies, shared flows e extensões |
| operação | self-managed ou oferta gerenciada | serviço Google Cloud ou hybrid conforme edição/topologia |
| Kubernetes | forte integração com Ingress/Gateway API e deployments próximos ao cluster | pode frontar workloads; hybrid leva runtime a ambiente controlado |
| governança | configuração declarativa e produtos/recursos conforme oferta | API products, developers/apps, analytics e portal como modelo central |
| GitOps | natural com config declarativa e pipelines | possível via bundles/revisions/APIs de gestão, exige disciplina |
| analytics | telemetry/plugins + recursos da oferta | analytics integrado à plataforma |
| lock-in | plugins/config/topologia específicos | policies, products, analytics e modelo operacional específicos |
| skill dominante | plataforma, proxy, Kubernetes, Lua/Go/plug-ins conforme caso | API management, Google Cloud, policies/flows |

Essa tabela não é ranking. Capacidades e preços variam por edição e mudam no
tempo. Valide a versão realmente contratável.

## Arquitetura Kong

Kong Gateway pode ser operado em topologias diferentes. Conceitualmente, existe
um data plane que processa tráfego e uma forma de distribuir configuração.

Questões importantes:

- database-backed ou declarative/DB-less?
- control plane separado?
- quem faz upgrade?
- plugins customizados entram em qual lifecycle?
- como certificados/config chegam aos data planes?

Kong costuma encaixar bem quando a organização já pensa em plataforma
cloud-native, deseja proximidade com clusters e valoriza extensibilidade no proxy.

## Arquitetura Apigee

Apigee é uma plataforma de API management. O modelo costuma envolver proxies,
flows, policies, environments, API products, apps/developers e analytics.

Perguntas:

- runtime é totalmente gerenciado ou hybrid?
- onde ficam dados/telemetry?
- como environments representam promoção?
- quais recursos corporativos de portal/product são realmente usados?
- qual integração com IAM/networking do ambiente?

Apigee tende a ser forte quando governança do programa de APIs é requisito de
primeira classe, especialmente em ecossistema Google Cloud/hybrid compatível.

## Control plane versus data plane

Esta é uma das perguntas mais importantes.

O data plane deveria continuar processando tráfego durante indisponibilidade do
management/control plane, dentro das garantias da topologia escolhida.

Teste na PoC:

1. carregue configuração conhecida;
2. interrompa conectividade de management/control plane;
3. gere tráfego;
4. observe requests existentes;
5. tente nova configuração;
6. restaure conexão;
7. meça convergência.

A resposta precisa vir do produto/topologia real, não de suposição.

## Latência adicionada

Gateway executa trabalho por request. Meça p50/p95/p99 com:

- routing simples;
- autenticação;
- quota/rate limit;
- transformação;
- logging/tracing;
- plugin/policy customizada.

Compare baseline sem gateway.

Uma policy que adiciona 3 ms em ambiente local pode produzir cauda diferente sob
TLS, rede, logging e alta concorrência.

## Throughput e saturation

Teste:

- requests/s por data plane;
- CPU/memória;
- connection count;
- TLS overhead;
- payload sizes;
- upstream slow;
- rate-limit storage quando distribuído.

O objetivo não é achar “número máximo de benchmark”, e sim entender curva de
saturação e capacidade necessária para o SLO.

## Políticas

### Kong plugins

Plugins podem executar em fases do request lifecycle. Isso oferece flexibilidade,
mas código no caminho crítico precisa de:

- versionamento;
- teste;
- performance budget;
- security review;
- rollout;
- rollback.

Plugin customizado que chama rede externa em toda request pode criar nova
single point of failure.

### Apigee policies e shared flows

Policies compõem comportamento declarativo/gerenciado e Shared Flows ajudam
reuso.

Riscos:

- flow genérico demais;
- dependência invisível entre proxies;
- policy complexa virando lógica de domínio;
- rollout compartilhado com blast radius alto.

Em ambos os casos, mantenha business logic fora do gateway.

## Authentication versus authorization

Gateway é ótimo para:

- validar JWT;
- OAuth/API key;
- TLS/mTLS;
- coarse-grained access.

Mas autorização de domínio continua no serviço.

Exemplo:

```text
gateway: token é válido e caller possui scope orders:write
serviço: este usuário pode cancelar ESTE pedido neste estado?
```

Não centralize regra de negócio em policy difícil de versionar com domínio.

## Rate limiting

Compare semântica, não só presença da feature.

Pergunte:

- limite é por consumer, token, IP ou tenant?
- global ou por data plane?
- janela fixa/sliding/token bucket?
- storage central?
- comportamento em partition?
- fail-open ou fail-closed?

Uma implementação distribuída precisa escolher consistência versus disponibilidade
do contador.

## Quotas e API products

Se o produto exige planos comerciais, subscriptions e quotas por aplicação,
modelos de API product/developer/app podem ser decisivos.

Se APIs são majoritariamente internas entre workloads e não existe developer
program, essa camada pode ser custo ocioso.

## Developer Portal

Avalie portal como produto:

- onboarding;
- docs;
- credential provisioning;
- subscription;
- analytics do consumer;
- branding;
- governance.

Não escolha uma plataforma inteira por uma demo de portal se consumidores são
internos e já usam catálogo/Backstage.

## Observabilidade

A plataforma precisa responder:

- request rate/error/latency por API;
- upstream latency;
- policy/plugin latency;
- auth failures;
- rate-limit rejections;
- data-plane saturation;
- configuration version;
- propagation lag.

Trace context deve chegar ao upstream. Não gere um trace novo desconectado no
gateway.

## Logs e privacidade

Gateway vê payloads e headers sensíveis.

Defina:

- redaction;
- sampling;
- retention;
- PII handling;
- secrets/header allowlist;
- access control aos analytics/logs.

“Logar tudo para debugging” pode criar incidente de dados.

## Segurança do gateway

Gateway é high-value target.

Proteja:

- admin/control APIs;
- credentials;
- plugin/policy supply chain;
- management plane access;
- TLS keys;
- network boundaries;
- configuration pipeline.

Um atacante capaz de alterar routing/policies pode interceptar ou redirecionar
tráfego de muitas APIs.

## Segurança de plugins/extensões

Código customizado deve receber o mesmo rigor de produção:

- source review;
- dependency scan;
- sandbox/permissions quando aplicável;
- no secrets hardcoded;
- timeout;
- memory/CPU awareness;
- failure behavior.

Não instale plugin comunitário no data plane apenas porque a feature existe.

## GitOps e configuração como código

Uma configuração operável precisa de:

```text
source control
→ review
→ validation
→ environment promotion
→ canary
→ rollback
```

Teste drift entre desired config e runtime.

Kong declarativo pode encaixar naturalmente em pipelines GitOps. Apigee pode usar
bundles/revisions/APIs de gestão. O ponto é possuir processo reproduzível, não
qual ferramenta contém YAML.

## Propagação de configuração

Meça quanto tempo leva de merge/apply até todos os data planes observarem a nova
versão.

Durante propagation, versões podem coexistir. Mudanças precisam tolerar essa
janela.

## Canary

Canary de gateway pode usar:

- rota;
- header;
- consumer;
- porcentagem;
- environment/data plane separado.

Defina stop conditions por:

- 5xx;
- p99;
- auth failures;
- upstream mismatch.

## Rollback

Rollback deve ser rápido e testado.

Pergunte:

- configuração antiga permanece disponível?
- rollback de plugin exige restart?
- schema/config migration é reversível?
- propagation é observável?

## High availability

Teste perda de:

- data plane;
- zone;
- control plane;
- storage/config dependency;
- DNS/load balancer.

SLO do gateway deve incluir a cadeia real.

## Upstream lento

Gateway também pode saturar quando upstream fica lento.

Use:

- connection pool limits;
- timeout;
- request buffering control;
- circuit/load shedding quando disponível e semanticamente correto.

Não configure retry indiscriminado no gateway e também no serviço. Isso amplifica
carga.

## Multi-region

Pergunte:

- data plane por região?
- configuração global ou regional?
- certificados?
- rate limits globais?
- analytics centralizados?
- data residency?

Um contador global de quota pode colocar coordenação cross-region no caminho
crítico.

## Hybrid e compliance

Hybrid pode ser decisivo quando runtime precisa permanecer no ambiente do cliente.
Mas adiciona responsabilidades:

- upgrades;
- networking;
- capacity;
- observability;
- certificate management.

“Hybrid” não significa automaticamente “sem dados saindo do ambiente”. Verifique
fluxos de telemetry/control da edição/topologia escolhida.

## Custo total de propriedade

Inclua:

- licença/consumo;
- compute;
- storage;
- network/egress;
- support;
- observability;
- engenharia de plataforma;
- upgrades;
- on-call;
- treinamento.

Um produto mais barato por request pode custar mais se exige equipe operacional
maior.

## Lock-in

Não trate lock-in como binário.

Mapeie:

- plugins/policies proprietários;
- API products;
- portal;
- analytics;
- configs;
- consumer credentials;
- runtime assumptions.

Mantenha OpenAPI, contratos e telemetry em formatos portáveis quando possível.

## Prova de conceito justa

Implemente a **mesma API e mesmas políticas** nos dois produtos:

1. TLS;
2. JWT/OAuth;
3. quota;
4. rate limit;
5. transformação simples;
6. cache privado se necessário;
7. canary;
8. OTel/correlation;
9. rollback;
10. uma extensão customizada representativa.

Não compare Kong minimalista com Apigee carregado de policies, nem o contrário.

## Cenários de teste

### Carga normal

Meça p50/p99 e CPU.

### Upstream lento

Adicione 1 s e observe connections/timeouts.

### Control plane indisponível

Confirme comportamento do data plane.

### Config ruim

Tente promover policy inválida e teste validation/rollback.

### Zone loss

Derrube um data plane/AZ e meça recovery.

### Credential leakage

Verifique redaction de headers/logs.

## Scorecard de decisão

Pontue apenas depois de definir pesos.

Exemplo:

| Driver | Peso |
| --- | ---: |
| runtime híbrido | 5 |
| portal/API products | 4 |
| Kubernetes/Gateway API | 5 |
| plugin customizado | 3 |
| operação gerenciada | 5 |
| analytics integrado | 4 |

A pontuação não substitui PoC. Ela torna prioridades explícitas.

## Quando Kong tende a fazer sentido

- plataforma fortemente cloud-native/Kubernetes;
- controle de topologia é importante;
- extensibilidade do proxy é diferencial;
- equipe consegue operar o modelo escolhido;
- API management corporativo pesado não é driver dominante.

## Quando Apigee tende a fazer sentido

- API program corporativo;
- products/developer lifecycle/analytics são centrais;
- Google Cloud/hybrid encaixa na estratégia;
- governança integrada vale o custo;
- organização prefere plataforma de management mais completa.

Esses são padrões comuns, não regras universais.

## Anti-patterns

- escolher por quantidade de plugins/policies;
- business logic no gateway;
- retry em gateway + client + service;
- admin API exposta;
- config manual em produção;
- portal comprado sem consumers externos;
- plugin sem performance/security review;
- analytics com payload sensível;
- PoC sem failure injection;
- comparar preço sem people cost.

## Laboratório progressivo

### Beginner

Configure uma rota com auth e rate limit em ambiente de teste. Trace até upstream.

### Intermediate

Versione config em Git e execute promotion + rollback.

### Advanced

Faça a PoC equivalente nos dois produtos. Meça p99, config propagation, failure de
control plane e upstream slow.

### Expert

Projete topologia multi-region/hybrid com RTO/RPO, security boundaries, upgrade
strategy, cost model e decommissioning path.

## Critério de decisão

A plataforma escolhida deve conseguir responder:

- como permanece disponível?
- como muda com segurança?
- como limita blast radius?
- como protege dados?
- como é observada?
- como é operada pela equipe real?
- quanto custa em três anos?
- como saímos dela se necessário?

## Referências

- Kong. [Deployment topologies](https://docs.konghq.com/gateway/latest/production/deployment-topologies/).
- Google Cloud. [Apigee architecture](https://cloud.google.com/apigee/docs/api-platform/architecture/overview).

---

[← Apigee](apigee/README.md) · [↑ API Gateways](README.md) · [Operação e exercícios →](operations-and-exercises.md)
