# Tasks — Cadastro de usuário

Cada tarefa deixa o sistema integrável e referencia os requisitos validados.

## 1. Esqueleto e contrato

- [ ] definir API, respostas neutras e schemas (`REQ-01`, `REQ-08`);
- [ ] adicionar testes de contrato para válido, inválido e repetido;
- [ ] criar módulo sem ativar rota pública.

**Concluído quando:** contrato passa localmente sem persistir segredo bruto.

## 2. Persistência transacional

- [ ] migrations aditivas de account, token, idempotency e outbox;
- [ ] implementar constraint de e-mail e compare-and-set de confirmação;
- [ ] testar concorrência e rollback (`REQ-02`, `REQ-04`, `REQ-05`, `REQ-12`).

**Concluído quando:** stress test cria uma conta canônica e nenhum evento órfão.

## 3. Password e token

- [ ] integrar biblioteca de hashing e versionar parâmetros;
- [ ] gerar token, persistir somente hash e testar expiração/uso único;
- [ ] confirmar ausência em logs e fixtures (`REQ-07`, `REQ-11`).

**Concluído quando:** testes de segurança e redaction passam.

## 4. Entrega assíncrona

- [ ] implementar claim concorrente de outbox;
- [ ] adapter do provider com timeout, retry limitado e telemetria;
- [ ] testar crash antes/depois do envio (`REQ-03`).

**Concluído quando:** replay não muda o estado final nem perde solicitação.

## 5. Controles e rollout

- [ ] rate limit e métricas sem PII (`REQ-09`);
- [ ] load test do caminho síncrono (`REQ-10`);
- [ ] runbook, dashboards, flag, canary e rollback;
- [ ] documentar decisão do merge de progresso (`REQ-06`).

**Concluído quando:** acceptance criteria, threat model e rollout são exercitados
em staging e questões abertas possuem decisão ou owner.

---

[← Design](design.md) · [↑ Exemplo](feature.md) · [SDD →](../../README.md)
