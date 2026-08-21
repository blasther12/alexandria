# Fundamentos de Inteligência Artificial

## Enquadrar antes de modelar

Converta a ideia em uma decisão: qual input existe no momento da previsão, qual
output altera o produto, quem sofre com falsos positivos/negativos e qual
baseline atual precisa ser superado. Se a resposta correta exige informação
indisponível no input, trocar o modelo não corrige o problema.

## Vocabulário mínimo

- **feature:** representação usada como entrada;
- **label/target:** resultado usado como supervisão;
- **parameter:** valor aprendido pelo treino;
- **hyperparameter:** escolha externa ao processo de otimização;
- **loss:** objetivo numérico otimizado;
- **inference:** aplicação do modelo a novos dados;
- **generalization:** desempenho sobre exemplos fora do treino;
- **distribution shift:** produção deixa de refletir a distribuição avaliada.

## Dados e splits

Separe treino, validação e teste pela unidade real de generalização. Em séries
temporais, treino no passado e teste no futuro. Se registros do mesmo usuário ou
documento aparecem nos dois lados, o score pode refletir leakage, não aprendizado.

```mermaid
flowchart LR
    RAW[Dados brutos] --> CHECK[Qualidade e consentimento]
    CHECK --> SPLIT[Split por unidade/tempo]
    SPLIT --> TRAIN[Treino]
    TRAIN --> VALID[Seleção na validação]
    VALID --> TEST[Teste final uma vez]
    TEST --> MON[Monitoramento em produção]
```

## Métricas e custos de erro

Accuracy esconde classes raras. Para classificação, examine matriz de confusão,
precision, recall, F1, ROC-AUC e PR-AUC conforme decisão. Calibração pergunta se
eventos previstos com 70% ocorrem aproximadamente 70% das vezes. Métrica offline
é proxy: defina também resultado de produto e guardrail de dano.

## Risco ao longo do ciclo

- proveniência, licença, consentimento e representatividade dos dados;
- vieses de medição e de seleção;
- privacidade e memorization;
- robustez a inputs adversariais;
- transparência sobre limites e recurso para contestação;
- drift, rollback e retirement do modelo.

## Exercícios

- **Beginner:** calcule precision/recall para dois thresholds e explique quem é afetado.
- **Intermediate:** construa split que evita leakage por usuário e compare o score ingênuo.
- **Advanced:** defina métricas, baseline e plano de rollback para uma decisão real.
- **Expert:** execute threat modeling e análise de impacto com stakeholders afetados.

## Referências

- [NIST AI RMF 1.0](https://doi.org/10.6028/NIST.AI.100-1)
- [Google — Rules of ML](https://developers.google.com/machine-learning/guides/rules-of-ml)
- [Google — Problem Framing](https://developers.google.com/machine-learning/problem-framing)

---

[← Visão geral](../README.md) · [↑ Inteligência Artificial](../README.md) · [Machine Learning →](../machine-learning/README.md)
