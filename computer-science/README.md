# Ciência da Computação

Esta área organiza a teoria que permite generalizar além de uma ferramenta. A
cobertura inicial é um mapa; cada item deve crescer por meio de problemas,
provas ou experimentos, não de definições isoladas.

## Trilhas

| Trilha | Conceitos | Aplicação em engenharia |
| --- | --- | --- |
| Algoritmos | invariantes, busca, ordenação, grafos, programação dinâmica | escolher estratégia e justificar custo |
| Estruturas de dados | arrays, hashes, trees, heaps, tries, probabilísticas | modelar operações dominantes |
| Computabilidade | autômatos, linguagens, decidibilidade | reconhecer limites e desenhar parsers |
| Sistemas operacionais | processos, memória virtual, arquivos, scheduling | entender runtimes e containers |
| Redes | camadas, routing, congestion control, DNS, TCP, QUIC, HTTP | diagnosticar latência e falhas |
| Compiladores | parsing, IR, otimização, code generation | compreender toolchains e type systems |
| Bancos de dados | álgebra relacional, índices, transações, recovery | preservar invariantes sob concorrência |
| Probabilidade | distribuições, Bayes, amostragem, incerteza | métricas, experimentos e Machine Learning |

## Método

Para cada conceito, escreva um invariante, implemente a versão mínima, meça um
caso adverso e explique onde a abstração aparece em um sistema real. Por exemplo,
consistent hashing só fica concreto ao simular nós entrando e saindo e medir a
redistribuição das chaves.

## Ordem sugerida

1. estruturas de dados e análise de complexidade;
2. processos, memória e I/O;
3. redes e protocolos de aplicação;
4. bancos de dados e concorrência;
5. probabilidade e sistemas distribuídos;
6. compiladores, linguagens e temas especializados.

## Projetos de síntese

- um key-value store persistente com log, índice e recuperação;
- um servidor HTTP limitado por backpressure e cancelamento;
- um interpretador pequeno com lexer, parser e evaluator;
- uma simulação de replicação que torna staleness mensurável.

## Referências

- [Teach Yourself Computer Science](https://teachyourselfcs.com/) — mapa
  comunitário baseado em livros universitários; use como complemento.
- [MIT OpenCourseWare — Electrical Engineering and Computer Science](https://ocw.mit.edu/search/?d=Electrical%20Engineering%20and%20Computer%20Science) — cursos e materiais oficiais do MIT.
- [ACM Computing Classification System](https://dl.acm.org/ccs) — taxonomia útil
  para localizar áreas e literatura.

---

[← Fundamentos](../fundamentals/README.md) · [↑ Início](../README.md) · [Linguagens →](../languages/README.md)
