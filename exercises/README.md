# Exercícios

Exercício é prática deliberada com evidência. “Explique CAP” pode iniciar uma
conversa, mas não prova que alguém consegue projetar ou diagnosticar um sistema.

## Níveis

| Nível | Verbo dominante | Exemplo de evidência |
| --- | --- | --- |
| Beginner | implementar e observar | programa pequeno, teste e explicação do output |
| Intermediate | integrar e depurar | serviço com dependência real e falha reproduzida |
| Advanced | medir e decidir | benchmark, ADR, capacity estimate ou runbook |
| Expert | projetar e desafiar | experimento adversarial com múltiplas restrições |

## Famílias de prática

- **Implementação:** construa o mecanismo antes de usar a abstração pronta.
- **Debugging:** receba sintomas e colete evidência antes de alterar código.
- **Refactoring:** preserve comportamento e meça a mudança de acoplamento.
- **Performance:** declare hipótese, workload e métrica; evite microbenchmark sem
  contexto.
- **Arquitetura:** compare opções contra requisitos e registre consequências.
- **Troubleshooting:** investigue sob informação parcial e produza runbook.
- **System Design:** estime capacidade, modele falhas e proponha evolução.

## Contrato de qualidade

Todo exercício deve declarar cenário, restrições, artefatos e critérios. A
solução pode variar; a evidência não. Use o [template](../templates/exercise.md).

## Sequência transversal sugerida

1. Escolha uma linguagem e implemente um parser de configuração seguro.
2. Exponha uma API com testes unitários, integração e contrato.
3. Adicione PostgreSQL e provoque uma anomalia de concorrência.
4. Introduza Redis e documente a política de invalidação.
5. Publique trabalho assíncrono e prove idempotência sob replay.
6. Empacote com Docker e execute como usuário sem privilégios.
7. Implante no Kubernetes e ensaie falha de readiness e shutdown.
8. Instrumente um SLO e diagnostique uma regressão por traces.
9. Redesenhe uma fronteira com DDD e registre a decisão.
10. Adicione IA somente com dataset, baseline e limites de custo.

---

[← Templates](../templates/README.md) · [↑ Início](../README.md) · [Projetos →](../projects/README.md)
