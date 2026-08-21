# Projeto 10 — Assistente RAG

## Objetivo

Responder perguntas sobre a biblioteca com evidência recuperada, citações e uma
avaliação que separe retrieval de geração.

## Requisitos

- pipeline reproduzível de ingestão, chunking e metadados;
- busca lexical como baseline e busca vetorial como candidata;
- resposta que cite trechos autorizados e admita ausência de evidência;
- dataset versionado de perguntas, relevância e respostas esperadas;
- métricas de retrieval, groundedness, latência e custo.

## Arquitetura

`Documentos → parser → chunks → índices`; em consulta:
`pergunta → retrieval → reranking opcional → contexto → modelo → resposta`.

## Restrições

Use somente conteúdo próprio ou autorizado. Separe instruções do sistema de
documentos recuperados e trate estes como dados não confiáveis. Reduza dados
sensíveis antes de enviá-los a provedores.

## Milestones

1. Dataset e baseline lexical sem LLM.
2. Ingestão incremental e busca vetorial.
3. Geração com citações e resposta abstida.
4. Avaliação de erros, prompt injection, custo e observabilidade.

## Critérios de conclusão

- [ ] Mudanças só são aceitas quando melhoram métricas declaradas.
- [ ] Cada resposta permite rastrear versão do documento e chunk.
- [ ] Um documento malicioso não redefine tools ou instruções.
- [ ] Índice é reconstruível e exclusões propagam corretamente.

## Desafios extras

Compare chunking estrutural, hybrid search e reranker em categorias de pergunta.

---

[← OpenTelemetry](09-opentelemetry.md) · [↑ Projetos](README.md) · [AI Agent →](11-ai-agent.md)
