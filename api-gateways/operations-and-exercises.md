# Operação e exercícios de API Gateways

## Sinais essenciais

Requests e bytes por route/consumer; códigos de resposta; p50/p95/p99 adicionada pelo gateway e upstream; timeouts; conexão/TLS; auth failures; rate-limit decisions; retries; configuração ativa; health de upstream. Controle cardinalidade: path parametrizado é route, ID não é label.

## Resiliência

Gateway é failure domain crítico. Distribua por zonas, reserve capacidade e teste config inválida. Health passivo + ativo precisa evitar retirar todos os upstreams durante falha comum. Retry somente método/erro seguro, com jitter e budget. Circuit breaker no gateway não substitui proteção no serviço.

## Exercícios

### Beginner

Configure duas rotas, deny por padrão, limite de body e timeout. Prove respostas para método/path desconhecido e upstream lento.

### Intermediate

Implemente token bucket por tenant e limite global. Gere burst/noisy neighbor, examine fairness, `429` e recovery.

### Advanced

Valide JWT/OIDC com issuer/audience/alg allowlist. Simule key rotation, JWKS indisponível, token expirado e header de identidade forjado.

### Expert

Execute canary 5% com SLO guard e rollback automático. Inclua config versionada, contract tests, trace propagation, redaction e game day com uma zona/upstream indisponível.

## Perguntas de entrevista

- Onde termina autenticação e onde ocorre autorização de objeto?
- Como impedir retry storm e cache leak entre tenants?
- Como atualizar gateway sem quebrar conexões long-lived?
- Quando BFF é melhor que GraphQL federation ou composição no cliente?

---

[← Políticas e padrões](patterns-and-policies.md) · [↑ API Gateways](README.md) · [Observabilidade →](../observability/README.md)
