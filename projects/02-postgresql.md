# Projeto 2 — API com PostgreSQL

## Objetivo

Substituir o repositório em memória por PostgreSQL preservando o contrato e
tornando invariantes, concorrência e migrations explícitos.

## Requisitos

- persistir fontes, assuntos e relação muitos-para-muitos;
- impedir duplicidade de URL canônica;
- executar migrations versionadas e reversíveis quando possível;
- suportar paginação estável e busca por metadados;
- expor readiness distinto de liveness.

## Arquitetura

`HTTP → aplicação → repository port → PostgreSQL`. Mantenha transações na
fronteira do caso de uso que precisa de atomicidade, não escondidas por chamada.

## Restrições

Não use permissões de superuser na aplicação. Configure pool limitado, timeout
de statement e cancelamento propagado da requisição.

## Milestones

1. Modelo lógico, constraints e primeira migration.
2. Adapter e testes de integração em banco descartável.
3. Concorrência: reproduzir e corrigir uma atualização perdida ou duplicidade.
4. Índices escolhidos a partir de `EXPLAIN (ANALYZE, BUFFERS)`.

## Critérios de conclusão

- [ ] Constraints protegem invariantes mesmo fora da aplicação.
- [ ] Deploy compatível com duas versões é descrito.
- [ ] O plano das consultas críticas e sua cardinalidade são registrados.
- [ ] Restore de um backup de teste é demonstrado.

## Desafios extras

Implemente busca textual nativa e uma estratégia de soft delete auditável.

---

[← REST API](01-rest-api.md) · [↑ Projetos](README.md) · [Redis →](03-redis.md)
