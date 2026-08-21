# System Design — exercícios

Use os [nove estudos](case-studies.md) como bases mutáveis. Todo exercício exige premissas, cálculo, diagrama, trade-offs, falhas, segurança, observabilidade e ao menos um ADR.

## Beginner

1. Recalcule URL Shortener para 10× escrita e apenas 90 dias de retenção. Mostre QPS médio/pico, storage e bandwidth; remova componentes que não se justificam.
2. Desenhe API de Chat com idempotency key, cursor e códigos de erro. Modele retry após timeout sem duplicar mensagem.
3. Para Notification, faça tabela de decisão preference × quiet-hours × prioridade × canal e cubra boundary de fuso/DST.

## Intermediate

1. Implemente protótipo do cache de URL com negative caching, TTL jitter e single-flight. Faça benchmark de cold start/hot key.
2. Modele e teste state machine de Payment ou Trip com optimistic concurrency e comandos duplicados/fora de ordem.
3. Construa pipeline de feed simples, injete celebrity fan-out e compare write/read amplification nas duas estratégias.

## Advanced

1. Faça teste de carga de Chat ou Search com distribuição realista e SLO p99. Encontre saturação por métricas e valide uma alteração.
2. Implemente saga de E-commerce com outbox/inbox, timeout e compensação falhando. Crie reconciliador e dashboard de instâncias presas.
3. Reindexe Search v1→v2 com dual-write/log, backfill, checksum/ACL validation, catch-up e alias switch reversível.

## Expert

1. Projete Streaming multi-região/multi-CDN sob perda de região e de CDN. Quantifique egress, RTO/RPO, failover e risco de entitlement stale.
2. Execute game day de Ride Sharing: localização atrasada, hot cell e falha regional durante matching. Defina stop conditions e preserve segurança física.
3. Faça revisão de privacidade/abuso dos nove casos: data inventory, purpose/retention, deletion propagation, insider access, enumeration/replay e alertas. Priorize mudanças por risco, não por facilidade.

## Variações para entrevista

- reduza orçamento a 10% e preserve só dois SLOs;
- exija residência de dados em três jurisdições;
- multiplique uma dimensão por 100 e explique o próximo gargalo;
- perca uma zona, região, broker ou provider por 30 minutos;
- faça um tenant responder por 70% do tráfego;
- exija eliminação de usuário em 24 h, incluindo cache, índice, backup e evento.

## Rubrica

| Nível | Evidência esperada |
| --- | --- |
| Beginner | unidades/fórmulas corretas e API/estado coerentes |
| Intermediate | protótipo/testes provam mecanismo local |
| Advanced | falha e migração sob carga são observadas |
| Expert | segurança, custo, recovery e operação multi-região são quantificados |

---

[← Estudos](case-studies.md) · [↑ Índice](README.md)
