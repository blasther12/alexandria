# Percurso: Arquitetura de Software

## Resultado

Conduzir decisões técnicas reversíveis e irreversíveis a partir de atributos de
qualidade, restrições organizacionais e evidência operacional.

## Pré-requisitos

Antes de escolher estilos arquiteturais, tenha experiência real com testes,
dados, deploy e pelo menos um incidente. Arquitetura sem feedback de operação
tende a otimizar diagramas.

## Sequência

1. [Princípios de engenharia](../software-engineering/README.md): coesão,
   acoplamento, modularidade e mudança.
2. [DDD](../software-engineering/ddd/README.md): domínio, limites e linguagem.
3. [Arquitetura](../architecture/README.md): atributos, estilos e trade-offs.
4. [Dados](../databases/README.md): integridade, topologias e evolução.
5. [Sistemas distribuídos](../distributed-systems/README.md): falhas parciais,
   coordenação e consistência.
6. Operação: segurança, observabilidade, custo e Team Topologies.
7. Evolução: ADRs, fitness functions, migrações incrementais e decommissioning.

## Prática deliberada

Para cada estudo de [System Design](../software-engineering/system-design/README.md):

- explicite requisitos e atributos de qualidade mensuráveis;
- estime ordem de grandeza antes de escolher tecnologia;
- proponha a menor arquitetura que atende ao cenário atual;
- identifique pontos de evolução e gatilhos observáveis;
- registre uma decisão e uma alternativa rejeitada;
- descreva degradação, recuperação e rollback.

## Sinal de maturidade

Uma boa proposta diz “ainda não precisamos disso” com a mesma precisão com que
explica quando a decisão deverá ser revista.

---

[← Backend](backend-engineer.md) · [↑ Atlas](README.md) · [AI Engineering →](ai-engineer.md)
