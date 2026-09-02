# Lab · RAG: retrieval antes da geração

## Objetivo

Separar falha de recuperação de contexto da falha de geração do modelo.

## Dataset mínimo

Crie 20 a 30 perguntas com:

- pergunta;
- documento ou trecho que contém a resposta;
- fatos obrigatórios;
- respostas que não podem ser inventadas.

Exemplo:

```json
{
  "id": "q-01",
  "question": "Qual componente recebe OTLP?",
  "expected_document": "otel-collector.md",
  "required_facts": ["Collector"]
}
```

## Etapa 1 · Retrieval

Para cada pergunta, recupere `top-k` documentos e calcule:

```text
recall@k = perguntas em que o documento correto apareceu no top-k / total
```

Compare:

- lexical/BM25;
- embeddings;
- busca híbrida;
- híbrida + reranking.

## Etapa 2 · Generation

Somente depois de obter um retrieval aceitável, envie o contexto recuperado para o modelo.

Avalie separadamente:

- factualidade;
- cobertura dos fatos obrigatórios;
- citação da fonte;
- abstenção quando o contexto não contém resposta.

## Quebrar de propósito

- use chunks grandes demais;
- remova metadata;
- reduza `k` agressivamente;
- adicione documentos semanticamente parecidos, mas incorretos.

## Evidência esperada

Uma tabela que mostre pelo menos:

```text
estratégia | recall@5 | qualidade final | custo | latência
```

## Perguntas

1. Melhorar prompt corrige documento ausente do top-k?
2. Quando reranking paga seu custo?
3. Qual slice do dataset mais falha?
4. Como detectar regressão depois de trocar embeddings ou chunking?

---

[↑ Voltar aos laboratórios](../README.md)
