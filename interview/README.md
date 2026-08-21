# Entrevistas de Engenharia de Software

As perguntas desta área avaliam modelos mentais e comunicação de trade-offs. Não
há uma resposta universal; uma boa resposta explicita hipóteses, pede requisitos
e identifica como validar a decisão.

## Código e runtime

1. Uma tarefa assíncrona aumenta a latência de todas as outras. Como você
   distingue CPU, I/O, contenção e starvation?
2. Quando imutabilidade reduz defeitos e quando aumenta alocação ou complexidade?
3. Como você refatoraria um módulo sem testes cuja saída possui efeitos externos?

## Dados

1. Um índice acelerou leitura e degradou escrita. Como mede se o saldo é aceitável?
2. Duas transações aprovaram o mesmo recurso. Que invariante falhou e onde
   deveria ser protegido?
3. Quando cache é derivação descartável e quando se torna uma segunda fonte de verdade?

## Distribuição

1. O cliente recebeu timeout, mas a operação pode ter concluído. O que fazer?
2. Diferencie ordering por partição de ordering global e seus custos.
3. Como um retry legítimo pode causar uma tempestade e quais controles combinaria?

## Arquitetura

1. Quais evidências justificariam extrair um módulo para microservice?
2. Como você identifica um bounded context sem transformar organograma em domínio?
3. Que decisão é difícil de reverter e como reduziria sua irreversibilidade?

## Operação e segurança

1. O p50 está estável e o p99 piorou. Que hipóteses e sinais prioriza?
2. Como testar que backups podem ser restaurados dentro do RTO?
3. Onde autenticação termina e autorização de domínio começa?

## AI Engineering

1. Como demonstra que RAG supera busca ou prompt direto no caso de uso?
2. Que ações uma tool não deve expor diretamente a um agente?
3. Como separa erro de retrieval, raciocínio, tool e modelo em uma avaliação?

## Rubrica para entrevistadores

Observe clarificação, decomposição, invariantes, modos de falha, segurança,
observabilidade e plano de validação. Evite recompensar apenas nomes de produtos
ou uma arquitetura excessiva desenhada sem requisitos.

---

[← Projetos](../projects/README.md) · [↑ Início](../README.md) · [Glossário →](../glossary/README.md)
