# Machine Learning

Machine Learning ajusta um modelo a partir de dados para realizar previsões ou
decisões. O ganho aparece quando regras explícitas não capturam bem o padrão e
há feedback suficiente para avaliar generalização.

## Famílias

| Família | Sinal de aprendizagem | Exemplos |
| --- | --- | --- |
| supervisionado | labels conhecidos | classificação, regressão, ranking |
| não supervisionado | estrutura dos próprios dados | clustering, redução de dimensão |
| self-supervised | alvo derivado do dado | previsão de token, representação |
| reinforcement learning | recompensa por trajetórias | controle e decisão sequencial |

## Pipeline

1. enquadre decisão e baseline;
2. versiona dados e valida schema/distribuição;
3. construa features somente com informação disponível no instante correto;
4. treine primeiro um modelo simples;
5. selecione na validação, reporte uma vez no teste;
6. empacote preprocessing e modelo juntos;
7. monitore input, output, qualidade atrasada e resultado de produto.

## Bias, variance e regularização

Underfitting indica representação/modelo incapaz ou treino insuficiente.
Overfitting aparece quando performance de treino melhora sem generalização.
Regularização, mais dados relevantes, validação adequada e modelos mais simples
podem reduzir variance; complexidade extra só ajuda quando fecha uma lacuna real.

## Produção

Training-serving skew ocorre quando features são calculadas de forma diferente.
Feedback loops surgem quando a previsão muda os dados futuros. Além de drift,
observe missing values, faixas, categorias novas, taxa de fallback, calibração e
qualidade por segmentos relevantes.

## Anti-patterns

- escolher algoritmo antes de definir a decisão;
- otimizar leaderboard enquanto a label é proxy inadequada;
- fazer preprocessing antes do split;
- usar o test set repetidamente como validação;
- promover modelo sem shadow/canary e rollback;
- atribuir causalidade a uma correlação preditiva.

## Exercícios

- **Beginner:** compare regra, regressão logística e árvore no mesmo dataset.
- **Intermediate:** introduza leakage intencional e detecte-o pelo pipeline.
- **Advanced:** crie monitor de drift e determine quais alertas exigem label atrasada.
- **Expert:** desenhe experimento que separa ganho do modelo do efeito da interface.

## Referências

- [scikit-learn User Guide](https://scikit-learn.org/stable/user_guide.html)
- [Google Machine Learning Crash Course](https://developers.google.com/machine-learning/crash-course/)
- [TensorFlow — Responsible AI](https://www.tensorflow.org/responsible_ai)

---

[← Fundamentos](../fundamentals/README.md) · [↑ Inteligência Artificial](../README.md) · [Deep Learning →](../deep-learning/README.md)
