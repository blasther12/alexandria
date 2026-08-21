# Logs, métricas e traces

## Matriz dos sinais

| Sinal | Responde bem | Limite |
| --- | --- | --- |
| métricas | tendência, agregação, alerta barato | perde detalhe e cardinalidade explode |
| logs | evento rico e diagnóstico local | volume, parsing e correlação |
| traces | caminho e causalidade entre serviços | sampling e custo |
| profiles | onde CPU/memória são consumidas | captura específica e privacidade |

## Logs

Use eventos estruturados com severity consistente, outcome, error type e IDs. Logue em boundaries e decisões relevantes; não cada linha. Stack trace uma vez na boundary responsável. Nunca registre token, secret, senha ou body indiscriminado. Correlation ID vindo do cliente deve ser validado/limitado; trace ID é propagado por padrão definido.

## Métricas

Counters só crescem, gauges representam estado instantâneo, histograms agregam distribuição. Prefira histograms a médias para latência. Labels devem ter conjunto limitado: route template, status class, não user/order ID. Histogram buckets precisam refletir SLO; native/exponential histograms dependem do backend.

## Traces

Span representa operação com início, duração, status, attributes e events. Parent-child explica critical path; links representam causalidade não hierárquica, útil em fila/batch. Crie spans nas boundaries, não em cada função. Context propagation deve cruzar HTTP/RPC/mensagem; mensagem assíncrona inclui causation sem fingir uma request eterna.

## Exemplars e correlação

Exemplar liga ponto de métrica a trace representativo. Logs podem incluir trace/span IDs. Isso permite alerta→série→trace→evento sem duplicar atributos de alta cardinalidade como labels.

## Custos e governança

Defina schema semântico, owner, retenção e acesso. Sampling head decide cedo e é barato; tail decide após observar trace, mas exige buffering/infra. Agregue antes de exportar quando possível. Meça dropped telemetry, queue e export failures para não ficar cego.

## Referências

- OpenTelemetry. [Signals](https://opentelemetry.io/docs/concepts/signals/).
- Prometheus. [Metric and label naming](https://prometheus.io/docs/practices/naming/).
- W3C. [Trace Context](https://www.w3.org/TR/trace-context/).

---

[← Observabilidade](README.md) · [↑ Observabilidade](README.md) · [OpenTelemetry →](opentelemetry.md)
