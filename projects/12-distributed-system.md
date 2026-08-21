# Projeto 12 — Sistema distribuído completo

## Objetivo

Integrar o percurso em uma plataforma operável, documentar seus limites e
demonstrar recuperação sob falhas. “Completo” significa coerente e verificável,
não conter toda tecnologia estudada.

## Requisitos

- requisitos funcionais e atributos de qualidade mensuráveis;
- ownership de dados, contratos e compatibilidade entre componentes;
- processamento idempotente com retry budgets e backpressure;
- autenticação, autorização, threat model e audit trail;
- SLOs, capacity plan, disaster recovery e controle de custo;
- RAG/agente isolados do caminho transacional crítico.

## Arquitetura

Parta da arquitetura do projeto 8. Adicione apenas componentes que fecham um
requisito. Mantenha um diagrama de contexto, um de containers e sequências para
escrita crítica, processamento assíncrono e recuperação.

## Restrições

Defina orçamento de infraestrutura e de modelos. Um modo degradado deve manter
as funções essenciais quando cache, broker, busca ou LLM estiver indisponível.

## Milestones

1. Design doc: capacidade, riscos, alternativas e plano incremental.
2. Caminho transacional com contratos e dados íntegros.
3. Assíncrono, busca e IA com isolamento de falhas.
4. Deploy progressivo, observabilidade e security controls.
5. Game day: zona indisponível, backlog, dados stale e rollback.
6. Relatório de evidências e simplificações futuras.

## Critérios de conclusão

- [ ] SLOs são calculados a partir de SLIs observados.
- [ ] RTO/RPO são demonstrados por restauração e não só declarados.
- [ ] Replays, retries e deploys concorrentes preservam invariantes.
- [ ] Cada componente possui justificativa e gatilho de remoção/revisão.
- [ ] Outra equipe executa o runbook durante um cenário desconhecido.

## Desafios extras

Execute chaos experiments graduais e proponha uma versão deliberadamente mais
simples que atenda a 80% do cenário por uma fração do custo.

---

[← AI Agent](11-ai-agent.md) · [↑ Projetos](README.md) · [Pharos →](../PHAROS.md)
