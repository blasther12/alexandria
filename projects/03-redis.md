# Projeto 3 — Cache com Redis

## Objetivo

Reduzir a latência de leituras sem transformar Redis em fonte acidental de
verdade nem esconder staleness.

## Requisitos

- cachear consultas por ID com TTL e chave versionada;
- invalidar ou atualizar após escrita bem-sucedida;
- impedir stampede para chave popular;
- limitar requisições por identidade confiável;
- operar corretamente quando Redis está indisponível.

## Arquitetura

Use cache-aside: leitura consulta cache, miss consulta PostgreSQL e popula o
valor; escrita confirma no banco antes de invalidar. Documente a janela em que
uma leitura pode ficar stale.

## Restrições

Não use `KEYS` no caminho de produção. Defina limites de memória, política de
eviction, timeout muito menor que o orçamento HTTP e cardinalidade das métricas.

## Milestones

1. Baseline de latência e carga sem cache.
2. Cache-aside com serialização versionada.
3. Invalidação concorrente e proteção contra stampede.
4. Experimento de indisponibilidade, recuperação e cold cache.

## Critérios de conclusão

- [ ] Hit ratio é interpretado junto de latência e carga no banco.
- [ ] Falha do cache degrada performance, não correção.
- [ ] Testes cobrem race entre leitura e escrita.
- [ ] Rate limit tem política explícita para falha e clock.

## Desafios extras

Compare TTL com invalidation events e avalie caching negativo.

---

[← PostgreSQL](02-postgresql.md) · [↑ Projetos](README.md) · [Kafka →](04-kafka.md)
