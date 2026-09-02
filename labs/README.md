# Alexandria Labs

Laboratórios pequenos para transformar conceitos em evidência executável.

## Regra dos labs

Todo laboratório deve permitir responder:

1. o que estou tentando provar;
2. como executo o happy path;
3. como provoco uma falha;
4. o que devo observar;
5. como recupero;
6. que decisão técnica esse resultado informa.

## Labs iniciais

- [`postgres-write-skew`](./postgres-write-skew/README.md) — isolamento, anomalias e serialização;
- [`kafka-idempotency`](./kafka-idempotency/README.md) — redelivery, idempotência e replay;
- [`kubernetes-probes`](./kubernetes-probes/README.md) — readiness, liveness e rollout;
- [`otel-pipeline`](./otel-pipeline/README.md) — SDK, OTLP, Collector e troubleshooting;
- [`rag-eval`](./rag-eval/README.md) — separar retrieval de generation;
- [`agent-circuit-breaker`](./agent-circuit-breaker/README.md) — budgets, progresso e interrupção segura.

## Estrutura recomendada para novos labs

```text
labs/<tema>/<lab>/
├── README.md
├── docker-compose.yml   # se necessário
├── src/
├── scripts/
└── expected/
```

A ausência de código é aceitável quando o experimento pode ser reproduzido apenas com SQL, `kubectl`, `curl` ou scripts pequenos. O importante é que a evidência seja clara e repetível.
