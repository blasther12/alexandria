# Comparação arquitetural

A matriz inicia conversa; não é algoritmo de pontuação. Resultado depende de implementação, equipe, carga e maturidade. Compare sempre com cenários mensuráveis.

## Deployment e consistência

| Critério | Monólito modular | Microsserviços | Event-driven | Serverless |
| --- | --- | --- | --- | --- |
| Unidade de deploy | uma, com módulos internos | serviço | consumer/producer | function/recurso gerenciado |
| Ownership de dados | tabelas/schemas por módulo | database/schema por serviço | owner publica; consumer projeta | por componente gerenciado |
| Transação forte | simples entre módulos, embora coupling deva ser visível | local a um serviço | outbox local; entre limites eventual | por serviço; workflow coordena |
| Escala independente | limitada pelo deploy/processo | alta por serviço | por partition/consumer | alta dentro de quotas |
| Falhas | contenção/processo | rede e cascata | lag, duplicata, poison message | quotas, cold start, provider |
| Carga operacional | baixa–média | alta | média–alta | infra baixa; distribuição média |
| Fit organizacional | uma/poucas equipes | equipes autônomas + plataforma | vários consumers independentes | times pequenos com managed services |
| Mau uso | limites não fiscalizados | distributed monolith | eventos como RPC opaco | function por método |

## Estrutura interna

| Critério | Layered | Clean/Hexagonal/Onion | Microkernel | Pipeline |
| --- | --- | --- | --- | --- |
| Força | responsabilidades técnicas | proteger política de borda volátil | core extensível | transformação em estágios |
| Eixo favorecido | substituir/organizar layer | adapters e delivery | adicionar plugins | adicionar/reordenar etapas |
| Test seam | layer/service | port/use case | extension contract | stage contract |
| Custo | mudança cruza layers | interface/mapping | compatibilidade/trust | buffering/schema/backpressure |
| Alerta | domínio anêmico/god service | pass-through layers | kernel importa plugins | filas/intermediários sem limite |

## Elementos de edge: não confundir

| Elemento | Tráfego | Consumidor | Responsabilidade |
| --- | --- | --- | --- |
| API Gateway | north–south | clientes externos | edge policy e routing |
| BFF | north–south | uma experiência cliente | composição específica |
| Service mesh | east–west | serviços/platform | identidade, telemetry e traffic policy |

Uma request pode passar Gateway → Mobile BFF → serviços via mesh. Isso não implica necessidade dos três.

## CQRS e Event Sourcing são decisões separadas

| | Persistência de estado atual | Persistência event-sourced |
| --- | --- | --- |
| Mesmo modelo read/write | CRUD/modelo de domínio convencional | fold de eventos escondido pelo mesmo modelo |
| Modelos command/query separados | CQRS com projeção/read data | CQRS + Event Sourcing |

CQRS se justifica por assimetria de modelos, escala ou segurança. ES, quando história dos fatos tem valor e a equipe sustenta evolução/rebuild. Nenhum decorre automaticamente de microsserviços ou eventos.

## Caminhos evolutivos

```mermaid
flowchart LR
    M[Monólito bem fatorado] --> MM[Monólito modular fiscalizado]
    MM -->|evidência de autonomia/escala| MS[Microsserviços selecionados]
    MM -->|fan-out/tempo| ED[Eventos entre módulos]
    MS --> ED
    ED -->|história é fonte de verdade?| ES[ES em agregados selecionados]
```

- Meça coordinated changes, ownership conflicts, contenção e bloqueio de release.
- Extraia uma capability com contrato e dado próprios; evite big bang.
- Use branch by abstraction, CDC ou outbox durante migração.
- Mantenha compatibilidade e reconcilie antes do cutover.
- Preserve rota de retorno até estabilizar.

## Fitness functions

| Intenção | Verificação |
| --- | --- |
| autonomia de módulo | teste rejeita imports de internals |
| evolução de API | consumer-driven/schema compatibility no CI |
| confiabilidade | SLO burn alerts e fault injection recorrente |
| recoverability | restore e event replay cronometrados |
| segurança | policy-as-code, SBOM e authorization tests |
| evolvability | mudanças coordenadas e lead time |

## Regra prática

Escolha a opção **menos distribuída** que atende independência, escala, resiliência, regulação e ownership medidos. Distribuição pode isolar falha e dar autonomia, mas cada fronteira transforma garantias locais em protocolos com latência, falha parcial, versão e observação.

## Referências

- Fowler. [Monolith First](https://martinfowler.com/bliki/MonolithFirst.html)
- Fowler. [CQRS](https://martinfowler.com/bliki/CQRS.html)
- Fowler. [Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)
- Newman. *Building Microservices*, 2ª ed. [O'Reilly](https://www.oreilly.com/library/view/building-microservices-2nd/9781492034018/)

---

[← Estilos](styles.md) · [↑ Índice](README.md) · [Monólito modular →](modular-monolith/README.md)
