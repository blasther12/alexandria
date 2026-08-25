# Percurso: Arquitetura de Software

## Resultado

Conduzir decisões técnicas a partir de atributos de qualidade, restrições
organizacionais e evidência operacional. Arquitetura aqui é a disciplina de
reduzir risco de mudança, não a arte de desenhar caixas bonitas.

## Diagnóstico de entrada

Antes de começar, tente responder:

- que decisão do seu sistema atual é mais cara de reverter e por quê?
- qual atributo de qualidade realmente limita o desenho hoje?
- que evidência justificaria extrair um módulo para outro serviço?
- como uma mudança de schema afeta rollout e rollback?
- onde a topologia de times aparece na arquitetura, mesmo sem estar documentada?

## Pré-requisitos

Tenha experiência prática com testes, dados, deploy, observabilidade e ao menos
um incidente. Se ainda não operou um serviço, use primeiro a trilha de
[Backend](backend-engineer.md) ou a de
[Engenharia de Software](software-engineer.md).

## Marcos

| Marco | Estude | Evidência de conclusão |
| --- | --- | --- |
| Atributos | disponibilidade, latência, segurança, custo, evolutibilidade | cenários mensuráveis de qualidade |
| Modularidade | coesão, acoplamento, boundaries, DDD | mapa de dependências e regra de ownership |
| Dados | invariantes, transações, ownership, migrations | decisão de autoridade e compatibilidade |
| Distribuição | falhas parciais, mensageria, consistência | trade-off explícito por interação |
| Estilos | monólito modular, event-driven, microservices, serverless | escolha ligada a forças e gatilhos |
| Operação | SLO, segurança, capacity, DR, observabilidade | arquitetura operável em incidente |
| Organização | Team Topologies, platform boundaries, cognitive load | desenho sociotécnico defendido |
| Evolução | ADRs, fitness functions, strangler, decommission | mudança incremental com rollback |

## Laboratórios obrigatórios

### Quality Attribute Scenario

Escolha três atributos importantes e descreva cada um no formato:

`fonte → estímulo → ambiente → artefato → resposta → medida`.

Só depois proponha arquitetura. Compare o desenho antes e depois das medidas.

### Monólito modular versus extração

Implemente um limite forte dentro de um monólito. Meça change coupling,
deployment coupling e necessidade de escala. Extraia o módulo apenas se uma
hipótese mensurável justificar o novo custo operacional.

### Migration architecture

Faça uma evolução incompatível de schema usando expand/migrate/contract. Rode
duas versões da aplicação simultaneamente e prove que rollback ainda funciona.

### Fitness function

Automatize ao menos uma propriedade arquitetural, por exemplo dependência entre
módulos, budget de latência, compatibilidade de API ou política de segurança.

## Projeto de síntese

Use os [estudos de System Design](../software-engineering/system-design/README.md)
e evolua um sistema em três versões:

1. menor arquitetura que atende ao cenário inicial;
2. versão pressionada por uma mudança real de requisito;
3. versão preparada para operação, recuperação e evolução.

Para cada etapa produza:

- requisitos e atributos de qualidade;
- estimativa de ordem de grandeza;
- diagrama de contexto e componentes relevantes;
- ADR com alternativa rejeitada;
- riscos e failure modes;
- SLO e sinais operacionais;
- estratégia de migration, rollback e decommissioning;
- custo aproximado e ponto em que a decisão deverá ser revisitada.

## Checkpoints

### Fundamentos

Diferencie requisito funcional de atributo de qualidade e transforme frases como
“precisa escalar” em cenários mensuráveis.

### Aplicação

Escolha entre monólito modular, microservice e event-driven para um caso
específico. Defenda a opção e descreva o que faria mudar de ideia.

### Proficiência

Receba um incidente e identifique quais decisões arquiteturais ampliaram ou
reduziram o blast radius. Proponha mudanças sem confundir causa com sintoma.

### Sistemas

Conduza uma revisão arquitetural completa incluindo software, dados, plataforma,
segurança, operação, organização, custo e estratégia de evolução.

## Perguntas de entrevista

- Como decidir se uma decisão merece ADR?
- Quando consistência eventual é aceitável e quando viola uma invariante?
- Como evitar que um shared service vire acoplamento organizacional central?
- O que torna uma arquitetura “evolutiva” além de usar microservices?
- Como um SLO altera decisões de cache, retry, replication e failover?
- Quando um API Gateway reduz complexidade e quando vira um novo monólito?
- Qual é o custo arquitetural de uma abstração de plataforma excessivamente
  genérica?

## Sinal de maturidade

Uma boa proposta diz **“ainda não precisamos disso”** com a mesma precisão com
que explica o gatilho observável que justificará a mudança no futuro.

---

[← Distribuídos](distributed-systems-engineer.md) · [↑ Atlas](README.md) · [Platform / Cloud →](platform-cloud-engineer.md)
