# Design Patterns — exercícios

Não comece nomeando um pattern. Em cada solução, escreva: força, parte estável, parte variável, opção mais simples rejeitada e uma condição para remover a abstração.

## Beginner

1. **Implementação/refatoração:** comece com `if/else` de frete para retirada e entrega padrão. Adicione expresso e refatore para Strategy com funções. Teste valores inválidos e limites de faixa.
2. **Classificação por intenção:** examine wrapper de log, tradutor de fornecedor e carregador lazy de imagem. Prove se cada um é Decorator, Adapter ou Proxy; renomeie classes enganosas.
3. **Debug:** configuração Singleton vaza estado entre testes. Reproduza dependência de ordem e substitua acesso global por dependência explícita.

**Concluído quando:** comportamento é testado antes/depois, dependências são visíveis e a explicação usa forças, não semelhança com UML.

## Intermediate

1. **Implementação:** crie pipeline de importação com Chain of Responsibility. Torne ordem explícita, defina “não tratado” e métricas por etapa.
2. **Refatoração:** substitua `PdfDailyReport`, `HtmlDailyReport`, `PdfMonthlyReport` e `HtmlMonthlyReport` por Bridge. Adicione Markdown sem multiplicar classes.
3. **Troubleshooting:** Observer envia emails duplicados após reconnect. Encontre leaks de subscription, implemente idempotência e teste disposal/reentrância.

**Concluído quando:** política de falha, lifecycle, ordem e concorrência estão documentados.

## Advanced

1. **Arquitetura:** modele pagamento com Command, State e Memento/compensação opcional. Explique por que desfazer uma captura externa não é rollback de memória.
2. **Performance:** profile um renderer antes/depois de Flyweight. Reporte alocações, memória retida, lookup e limiar de ganho.
3. **Evolução:** implemente AST com Visitor; adicione uma operação e um tipo de elemento. Meça qual eixo é barato e compare com pattern matching exaustivo.

**Concluído quando:** benchmarks são reproduzíveis e o design escolhe explicitamente seu eixo de evolução.

## Expert

1. **System design:** projete pricing multi-tenant. Compare Strategy + configuração, Specification, tabela de decisão e rules engine em auditabilidade, rollout, latência, segurança e operação.
2. **Confiabilidade:** implemente Command durável com idempotency key, outbox/inbox, retry budget, quarantine de poison message e trace. Demonstre crash recovery em cada fronteira.
3. **Remoção de patterns:** use amostra com ao menos cinco camadas até um cálculo puro. Analise histórico e delete abstrações sem variação independente; compare carga cognitiva e valor de testes.

**Concluído quando:** falhas injetadas são toleradas, evidência é mensurável e um ADR registra trade-offs.

## Perguntas de revisão

- Qual requisito ficou mais barato e qual ficou mais caro?
- A abstração protege política de domínio ou apenas uma biblioteca?
- Função, módulo ou tabela expressaria o mesmo seam?
- Latência, erros, cancelamento e ownership estão visíveis?
- Após seis meses de histórico, o pattern ainda paga sua manutenção?

---

[← Strategy](strategy.md) · [↑ Índice](README.md)
