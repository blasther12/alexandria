# Padrões de AI Engineering

Padrões descrevem forças recorrentes. Combine-os somente quando cada camada
fecha um requisito mensurável.

## RAG

- **Problema:** conhecimento é privado, recente ou precisa de provenance.
- **Fluxo:** query → retrieval → seleção/reranking → contexto → geração.
- **Trade-offs:** melhora atualidade e citação, mas adiciona indexação, staleness,
  autorização e novos modos de erro. Compare com busca sem geração.

## Agentic RAG

O modelo decide se reformula, recupera novamente ou usa outra fonte. Ajuda em
questões multietapa heterogêneas, mas aumenta latência, custo e superfície de
ataque. Limite passos/fontes e avalie a trajetória, não só a resposta final.

## Tool Calling

O modelo propõe uma chamada estruturada; a aplicação autoriza e executa. A tool
deve ter escopo estreito, schema validável, timeout, idempotência e resultado
canônico. Separe `search_orders` de `refund_order`: leitura e efeito possuem
políticas diferentes.

## Prompt Routing

Classifica intenção para selecionar prompt ou workflow. É útil quando tarefas
exigem instruções e métricas distintas. Mantenha rota “unknown”, confiança e
fallback; uma classificação errada pode ser pior que um prompt geral.

## Model Routing

Escolhe modelo por capacidade, risco, latência, região e custo. Roteamento pode
ser estático por tarefa ou adaptativo por input. Teste equivalência de segurança
e qualidade; fallback silencioso não deve violar contrato.

## Semantic Cache

Reutiliza resposta para inputs semanticamente próximos. Só aplique quando
proximidade implica equivalência de negócio. Inclua tenant, permissões, versão,
idioma, janela de frescor e policy no namespace; nunca cacheie resposta sensível
entre usuários.

## Guardrails

Defesa em profundidade antes, durante e depois do modelo:

- validação e classificação de input;
- redução de dados e instruções delimitadas;
- schemas e policy gate para actions;
- análise de output e revisão humana;
- budgets, sandbox, auditoria, canary e kill switch.

Guardrail probabilístico não substitui boundary determinística.

## LLM Gateway

Centraliza autenticação com provedores, quotas, observabilidade, routing e
normalização. Evite transformá-lo em God Service com prompts de todos os
domínios. Aplicações continuam responsáveis por semântica, autorização e
qualidade.

## MCP

[Model Context Protocol](mcp/README.md) padroniza descoberta e comunicação entre
hosts, clients e servers. Use quando interoperabilidade supera o custo de um
novo limite de confiança; chamadas internas simples podem continuar como APIs.

## Matriz de decisão

| Necessidade | Menor solução | Evolua quando |
| --- | --- | --- |
| conhecimento atual | busca lexical | semântica melhora recall medido |
| resposta com evidência | search UI | síntese reduz esforço sem perder fonte |
| saída variável estruturada | uma chamada + schema | tarefas pedem rotas distintas |
| sequência conhecida | workflow/state machine | seleção dinâmica traz ganho comprovado |
| integração única | adapter local | múltiplos hosts/servers justificam protocolo |

---

[← AI Engineering](README.md) · [↑ AI Engineering](README.md) · [Avaliação →](evaluation.md)
