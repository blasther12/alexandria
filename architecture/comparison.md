# Comparação arquitetural

Comparar arquiteturas não é escolher o maior número de vantagens em uma tabela.
O problema real é decidir **qual forma de organização preserva melhor os
atributos de qualidade importantes sob as restrições atuais**.

A mesma arquitetura pode ser excelente para um produto e péssima para outro. O
resultado depende de implementação, equipe, carga, domínio, regulação e maturidade
operacional. Por isso, esta página usa cenários mensuráveis em vez de rankings.

## Modelo mental: forças, não estilos vencedores

Toda arquitetura resolve algumas forças e cria outras.

Exemplo:

```text
mais autonomia de deploy
        ↕
mais contratos, rede e operação
```

Ou:

```text
mais consistência local
        ↕
menos independência entre partes
```

A decisão madura explicita **o que estamos comprando e o que estamos pagando**.

## Comece pelos atributos de qualidade

Antes de escolher estilo, escreva cenários como:

- **Disponibilidade:** checkout mantém 99.95% mesmo com serviço de recomendação
  indisponível.
- **Latência:** p99 de leitura abaixo de 300 ms em 2 mil req/s.
- **Evolução:** equipe de pagamentos implanta sem coordenar release com pedidos.
- **Segurança:** dados PCI permanecem em boundary dedicado.
- **Recuperação:** região inteira pode ser perdida com RPO ≤ 5 min e RTO ≤ 30 min.
- **Custo:** workload sazonal não pode manter capacidade ociosa 90% do mês.

Sem cenário, “escalável”, “resiliente” e “moderno” são palavras decorativas.

## Matriz de deployment e consistência

| Critério | Monólito modular | Microsserviços | Event-driven | Serverless |
| --- | --- | --- | --- | --- |
| Unidade de deploy | uma, com módulos internos | serviço | consumer/producer | function/recurso gerenciado |
| Ownership de dados | tabelas/schemas por módulo | store/schema por serviço | owner publica; consumer projeta | por componente gerenciado |
| Transação forte | simples entre módulos | local a um serviço | outbox local; entre limites eventual | por serviço; workflow coordena |
| Escala independente | limitada pelo processo/deploy | alta por serviço | por partition/consumer | alta dentro de quotas |
| Falhas dominantes | contenção/processo | rede/cascata | lag, duplicata, poison message | quotas, cold start, provider |
| Carga operacional | baixa–média | alta | média–alta | infra baixa; distribuição média |
| Fit organizacional | uma/poucas equipes | equipes autônomas + plataforma | vários consumers independentes | times pequenos + managed services |
| Mau uso | limites não fiscalizados | distributed monolith | evento como RPC opaco | function por método |

Nenhuma coluna vence. A pergunta é qual custo combina com os drivers.

## Monólito modular

### Força principal

Mantém transações, debugging e deployment simples enquanto permite boundaries de
código e ownership interno.

### Bom fit

- domínio ainda evolui;
- poucas equipes;
- forte consistência entre capacidades;
- operação precisa permanecer simples.

### Riscos

- módulo vira convenção sem enforcement;
- banco compartilhado cria coupling oculto;
- deploy único vira gargalo organizacional.

### Evolução

Use dependency rules, schemas lógicos e ownership. Extraia apenas quando existir
evidência de que um boundary precisa runtime independente.

## Microsserviços

### Força principal

Autonomia de deploy, escala e ownership.

### Bom fit

- bounded contexts maduros;
- equipes independentes;
- workloads diferentes;
- plataforma e observabilidade maduras.

### Custos

- rede;
- contratos;
- consistência distribuída;
- on-call por serviço;
- supply chain maior;
- mais custo de plataforma.

### Sinal de mau uso

Mudança simples exige PR e release sincronizado em cinco serviços. Isso é
monólito distribuído.

## Event-driven

### Força principal

Desacoplamento temporal, fan-out e buffering.

### Bom fit

- produtor não precisa resposta imediata;
- múltiplos consumidores;
- picos precisam absorção;
- replay/histórico têm valor.

### Custos

- ordering;
- duplicidade;
- lag;
- schemas;
- troubleshooting assíncrono;
- consistência eventual.

Event-driven pode existir dentro de monólito modular ou entre serviços. Não é
sinônimo de microsserviços.

## Serverless

### Força principal

Reduz gestão de infraestrutura e escala rapidamente dentro dos limites do
provedor.

### Bom fit

- cargas variáveis;
- eventos discretos;
- time pequeno;
- managed services são aceitáveis.

### Custos

- quotas;
- cold start em alguns runtimes;
- observabilidade distribuída;
- lock-in por integração;
- custo imprevisível em volume alto.

Serverless não remove arquitetura. Ele troca uma parte da operação por contratos
com o provedor.

## Estrutura interna

| Critério | Layered | Clean/Hexagonal/Onion | Microkernel | Pipeline |
| --- | --- | --- | --- | --- |
| Força | responsabilidades técnicas | proteger política de borda volátil | core extensível | transformação em estágios |
| Eixo favorecido | substituir/organizar layer | adapters e delivery | adicionar plugins | adicionar/reordenar etapas |
| Test seam | layer/service | port/use case | extension contract | stage contract |
| Custo | mudança cruza layers | interface/mapping | compatibilidade/trust | buffering/schema/backpressure |
| Alerta | domínio anêmico | pass-through layers | kernel importa plugins | intermediários sem limite |

## Layered

Útil quando responsabilidades técnicas são claras e o domínio não justifica
abstração maior. O problema aparece quando toda mudança atravessa controller →
service → repository sem existir boundary de negócio.

## Clean/Hexagonal/Onion

Protege policy de detalhes externos usando ports/adapters.

Bom quando:

- domínio possui regras relevantes;
- existem adapters diferentes;
- testabilidade do core importa.

Ruim quando cria dezenas de interfaces 1:1 sem volatilidade real.

## Microkernel

Core estável + plugins.

Bom para:

- IDEs;
- plataformas extensíveis;
- produtos com módulos de terceiros.

Riscos:

- plugin API vira contrato permanente;
- isolamento de plugin;
- versionamento;
- segurança de código não confiável.

## Pipeline

Dados passam por etapas.

Bom para:

- compilers;
- ETL;
- media processing;
- validation chains.

Riscos:

- buffers ilimitados;
- schema intermediário;
- reprocessamento;
- erro difícil de atribuir.

## Edge: Gateway, BFF e Service Mesh

| Elemento | Tráfego | Consumidor | Responsabilidade |
| --- | --- | --- | --- |
| API Gateway | north–south | clientes externos | edge policy e routing |
| BFF | north–south | uma experiência | composição específica |
| Service mesh | east–west | serviços/platform | identidade, telemetry, traffic policy |

Uma request pode passar Gateway → Mobile BFF → serviços via mesh. Isso não
significa que os três são necessários.

### Quando Gateway basta

- autenticação externa;
- rate limit;
- routing;
- API lifecycle.

### Quando BFF ajuda

Mobile e web precisam composições muito diferentes e isso está gerando coupling
no backend comum.

### Quando mesh ajuda

Muitos serviços precisam identidade/mTLS, telemetry e traffic policy consistentes.

Mesh não corrige API chatty nem boundary ruim.

## CQRS e Event Sourcing são decisões separadas

| | Persistência de estado atual | Persistência event-sourced |
| --- | --- | --- |
| Mesmo modelo read/write | CRUD/modelo convencional | fold escondido pelo mesmo modelo |
| Modelos command/query separados | CQRS com read model | CQRS + Event Sourcing |

CQRS responde a assimetria entre leitura e escrita. Event Sourcing responde ao
valor de manter fatos como fonte de verdade.

Nenhum decorre automaticamente de microsserviços.

## Comparando consistência

### Monólito

Pode manter transação ACID entre módulos, desde que banco e transaction boundary
sejam compartilhados.

### Microsserviços

Transação forte é local. Workflow maior usa saga, outbox ou reconciliação.

### Event-driven

Convergência é parte do modelo. Read models podem atrasar.

### Serverless

Depende do managed service. Functions não criam transação distribuída por si.

Se sua invariante exige atomicidade global frequente, distribuir pode piorar o
problema.

## Comparando disponibilidade

Mais serviços não significam mais disponibilidade.

Uma cadeia síncrona:

```text
A → B → C → D
```

fica indisponível se qualquer dependência obrigatória falha. A solução pode ser:

- reduzir caminho crítico;
- cache;
- async;
- fallback semanticamente válido;
- replicação;
- não distribuir.

Desenhe o dependency graph, não conte serviços.

## Comparando performance

### Monólito

Chamadas em memória e transação local têm overhead menor.

### Microsserviços

Serialização, TLS, network hop e retries aumentam latência.

### Event-driven

Pode reduzir latência do caller movendo trabalho para depois, mas aumenta tempo
até convergência.

### Serverless

Scale-out rápido pode ajudar picos, mas cold start/quota podem dominar tail
latency.

Benchmark deve medir a jornada, não componente isolado.

## Comparando custo

Custo inclui mais que compute.

Considere:

- infraestrutura;
- observabilidade;
- CI/CD;
- on-call;
- engenharia de plataforma;
- tempo de troubleshooting;
- licenças;
- egress;
- storage duplicado.

Arquitetura que economiza servidor e exige três equipes de plataforma pode ser
mais cara.

## Comparando segurança

### Monólito

Menos network boundaries, mas compromise pode alcançar mais módulos no mesmo
processo.

### Microsserviços

Permite least privilege por workload, mas aumenta identidade, certificates,
policies e superfície.

### Event-driven

Eventos podem espalhar PII por vários stores. Authorization por topic e retenção
viram requisitos.

### Serverless

IAM granular é vantagem, porém proliferation de roles/policies pode criar
permissão excessiva.

Segurança deve ser modelada por trust boundary e dados, não por estilo.

## Comparando observabilidade

Monólito costuma ser mais simples de debuggar localmente.

Distribuição exige:

- correlation IDs;
- tracing;
- service catalog;
- SLOs por jornada;
- dependency maps;
- logs estruturados.

Event-driven precisa lag/age, não apenas erro.

Arquitetura que o time não consegue observar é arquitetura que o time não
consegue operar.

## Comparando organização

Autonomia técnica só existe quando ownership organizacional acompanha.

Pergunte:

- uma equipe consegue deploy sozinha?
- consegue alterar schema?
- é dona do on-call?
- depende de aprovação central para tudo?
- entende SLO e custos?

Se a organização é centralizada, microsserviços podem apenas distribuir o código,
não a autonomia.

## Caminhos evolutivos

```mermaid
flowchart LR
    M[Monólito bem fatorado] --> MM[Monólito modular fiscalizado]
    MM -->|autonomia/escala| MS[Microsserviços selecionados]
    MM -->|fan-out/tempo| ED[Eventos entre módulos]
    MS --> ED
    ED -->|história é fonte de verdade?| ES[ES em agregados selecionados]
```

Evolução é preferível a big bang.

## Strangler e migração

Para extrair capability:

1. defina novo boundary;
2. introduza facade;
3. replique/sincronize dados temporariamente;
4. shadow traffic;
5. compare resultados;
6. canary;
7. cutover;
8. decommission antigo.

Mantenha rollback até convergência comprovada.

## Branch by abstraction

Quando mudança interna é grande, introduza abstração estável e troque implementação
por trás dela gradualmente. Isso reduz branch de longa duração e risco de big bang.

## Fitness functions

| Intenção | Verificação |
| --- | --- |
| autonomia de módulo | teste rejeita imports de internals |
| evolução de API | schema/consumer compatibility |
| confiabilidade | SLO burn + fault injection |
| recoverability | restore/replay cronometrado |
| segurança | policy-as-code + authorization tests |
| evolvability | coordinated changes + lead time |
| custo | budget por jornada/serviço |

Fitness function transforma intenção arquitetural em sinal contínuo.

## Cenário comparativo: e-commerce pequeno

Contexto:

- 8 desenvolvedores;
- 500 req/s;
- deploy diário;
- pedido/pagamento muito acoplados;
- equipe sem plataforma dedicada.

Provável escolha inicial: monólito modular.

Por quê:

- transações simples;
- baixo custo operacional;
- boundaries ainda evoluem.

Evolua pagamento para serviço separado se regulação, ownership ou escala justificar.

## Cenário: plataforma global

Contexto:

- dezenas de equipes;
- capacidades maduras;
- diferentes requisitos regulatórios;
- escala desigual;
- plataforma interna forte.

Microsserviços seletivos podem fazer sentido, mas ainda não significa um serviço
por tabela.

## Cenário: analytics assíncrono

Produto precisa registrar eventos e produzir múltiplas visões. Event-driven +
streaming pode reduzir coupling. Não há motivo para transformar o command path
inteiro em Event Sourcing automaticamente.

## Modos de falha arquitetural

### Distributed monolith

Sinal: deploy coordenado e cadeia síncrona profunda.

Mitigação: reduzir coupling, tornar contratos compatíveis ou juntar serviços.

### Event soup

Sinal: dezenas de eventos técnicos sem owner, fluxo impossível de seguir.

Mitigação: linguagem de domínio, orchestration quando necessário e catálogo.

### Serverless sprawl

Sinal: centenas de functions pequenas com IAM e observabilidade fragmentados.

Mitigação: agrupar por capability e padronizar plataforma.

### Clean Architecture cerimonial

Sinal: interfaces e mappers que apenas encaminham valores.

Mitigação: usar ports onde existe boundary volátil ou test seam real.

## Laboratório de decisão

Para qualquer projeto do Alexandria:

1. escreva três quality-attribute scenarios;
2. proponha duas arquiteturas;
3. estime latência/custo/ownership;
4. implemente um spike para a maior incerteza;
5. injete uma falha relevante;
6. escreva ADR;
7. defina fitness function;
8. registre condição para revisar a decisão.

## Critério de decisão

Escolha a opção **menos distribuída** que atende os drivers medidos.

Distribuição pode isolar falhas e dar autonomia, mas cada fronteira transforma
garantias locais em protocolos com latência, versão, segurança e observabilidade.

Uma arquitetura madura também sabe dizer:

> ainda não precisamos disso.

## Referências

- Fowler. [Monolith First](https://martinfowler.com/bliki/MonolithFirst.html)
- Fowler. [CQRS](https://martinfowler.com/bliki/CQRS.html)
- Fowler. [Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)
- Newman. *Building Microservices*, 2ª ed. [O'Reilly](https://www.oreilly.com/library/view/building-microservices-2nd/9781492034018/)

---

[← Estilos](styles.md) · [↑ Índice](README.md) · [Monólito modular →](modular-monolith/README.md)
