# Testing — exercícios

Cada exercício deve registrar risco, nível escolhido, oráculo, evidência de que o teste falha pelo motivo certo e custo de execução.

## Beginner

1. **Limites:** implemente tabela de preço e derive classes de equivalência/valores-limite antes do código. Introduza três defeitos e prove que a suíte os detecta.
2. **Doubles:** teste um serviço de cadastro com stub de consulta e mock apenas do envio. Depois substitua o mock por fake; compare acoplamento e falhas detectáveis.
3. **Debug:** receba cinco testes ordem-dependentes. Isole dados/relógio/global e faça 1.000 execuções com seed registrada.

**Concluído quando:** testes são determinísticos, nomes descrevem regra e nenhuma espera usa `sleep` arbitrário.

## Intermediate

1. **Integração:** escreva contrato de Repository e rode sobre fake + banco real efêmero. Teste transação, unique constraint, null/collation e concorrência.
2. **Contract:** um consumidor depende de três campos/erros de uma API. Publique contrato e faça a build do provedor rejeitar uma mudança incompatível.
3. **Property-based:** gere sequências de reserva/liberação e verifique invariantes e idempotência. Preserve seed e shrinking do menor contraexemplo.

**Concluído quando:** a suíte diferencia semântica real de simulação e produz diagnóstico acionável.

## Advanced

1. **Mutation:** rode mutation testing no cálculo financeiro. Classifique sobreviventes em equivalente, código morto e teste ausente; corrija apenas risco real.
2. **Carga:** modele 500 rps, distribuição de endpoints e SLO p99. Rode load + spike + soak; encontre gargalo por telemetry e valide uma correção com baseline.
3. **Mensageria:** injete crash antes/depois de persistir e antes do ack. Demonstre outbox/inbox, idempotência e redrive seguro da DLQ.

**Concluído quando:** resultados incluem ambiente, versão, dados, percentis, saturação e reprodutibilidade.

## Expert

1. **Chaos:** formule hipótese sob perda de zona/dependência lenta, defina blast radius e abort condition, execute game day e converta achados em teste recorrente/runbook.
2. **Portfólio:** use incidentes e histórico de regressões para redesenhar a suíte. Remova testes redundantes, mova casos para níveis mais baratos e compare lead time, flaky rate e escapes em quatro semanas.
3. **Recovery:** restaure backup, reaplique log/eventos e reconstrua projeção sob volume realista. Verifique RPO/RTO e invariantes de negócio, não só “processo terminou”.

**Concluído quando:** há evidência de segurança do experimento, mudança mensurável e owner para cada ação.

## Perguntas de entrevista/revisão

- Quando um mock piora a confiança?
- Por que 100% de cobertura não prova correção?
- Que diferença um teste de componente encontra que unidade não encontra?
- Como provar idempotência após timeout ambíguo?
- O que torna um experimento de caos seguro e científico?
- Como escolher entre pirâmide e troféu para este sistema específico?

---

[← Testing](README.md) · [↑ Índice](README.md) · [System Design →](../system-design/README.md)
