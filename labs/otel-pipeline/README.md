# Lab · OpenTelemetry ponta a ponta

## Objetivo

Seguir um trace desde a aplicação até o backend e localizar em que ponto ele desaparece quando o pipeline quebra.

## Arquitetura

```text
Aplicação
   │ OTLP
   ▼
Collector
   │
   ├ processors
   └ exporter
   ▼
backend ou debug exporter
```

## Collector mínimo

```yaml
receivers:
  otlp:
    protocols:
      grpc: {}
      http: {}

processors:
  batch: {}

exporters:
  debug:
    verbosity: detailed

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [debug]
```

Execute o Collector com essa configuração e envie spans via OTLP.

## Quebrar de propósito

Faça uma alteração por vez:

1. endpoint OTLP incorreto;
2. protocolo diferente entre app e Collector;
3. propagator ausente entre dois serviços;
4. processor com filtro que remove spans;
5. exporter apontando para destino inválido.

## Método de diagnóstico

Em cada cenário responda:

- a aplicação criou o span?
- o SDK exportou?
- o Collector recebeu?
- o processor manteve?
- o exporter enviou?
- o backend aceitou?

## Evidências

- logs do SDK/Collector;
- `trace_id` preservado entre serviços;
- resource attributes e span attributes corretos;
- quantidade de spans antes/depois dos processors.

## Perguntas

1. Qual a diferença entre propagation e export?
2. Quando um atributo deveria ser de Resource?
3. Como tail sampling muda o ponto em que a decisão de amostragem acontece?

---

[↑ Voltar aos laboratórios](../README.md)
