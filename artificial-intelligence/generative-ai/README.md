# Generative AI

Generative AI produz texto, imagem, áudio, vídeo ou estruturas condicionadas a
input. Em aplicações, o desafio não é apenas obter uma amostra convincente, mas
controlar contexto, direitos, variância, avaliação e efeitos downstream.

## Padrões de aplicação

| Padrão | Adequado para | Controle principal |
| --- | --- | --- |
| transformação | resumir, classificar, extrair | schema e exemplos avaliados |
| geração assistida | rascunho, explicação, código | revisão humana e provenance |
| RAG | conhecimento mutável/privado | qualidade de retrieval e citações |
| tool calling | consultar ou agir em sistemas | autorização e validação fora do modelo |
| workflow | sequência conhecida de passos | estado explícito e transições determinísticas |
| agent | escolha adaptativa de ações | sandbox, limites e avaliação de trajetória |

## Prompt Engineering

Um prompt útil define tarefa, contexto confiável, restrições, formato e exemplos
representativos. Versione prompts como código, mas avalie o sistema inteiro.
Separadores e hierarquia ajudam o modelo; não impedem que input malicioso tente
redirecionar comportamento.

## Structured Outputs

Use schema estreito, enums, limites de tamanho e campos obrigatórios. Faça parse
seguro, valide regras de domínio e rejeite output inválido. Nunca passe texto
gerado diretamente a shell, SQL, template HTML ou API privilegiada.

## Avaliação em camadas

1. conjunto de casos reais, adversariais e de recusa;
2. métricas determinísticas quando possíveis;
3. revisão humana com rubrica e amostragem cega;
4. model-based grading calibrado contra humanos;
5. online metrics e guardrails de impacto;
6. regressão a cada mudança de modelo, prompt, índice ou tool.

## Exercícios

- **Beginner:** extraia dados para schema e catalogue todas as rejeições.
- **Intermediate:** crie prompt versionado e teste regressão em 30 casos diversos.
- **Advanced:** implemente fallback e budget fim a fim entre duas rotas de modelo.
- **Expert:** red-team de prompt injection, data exfiltration e excessive agency.

## Referências

- [NIST Generative AI Profile](https://doi.org/10.6028/NIST.AI.600-1)
- [OWASP GenAI LLM Top 10](https://genai.owasp.org/initiative/owasp-top-10-for-llm-and-genai/)
- [AI Engineering](../../ai-engineering/README.md)

---

[← LLMs](../llm/README.md) · [↑ Inteligência Artificial](../README.md) · [AI Engineering →](../../ai-engineering/README.md)
