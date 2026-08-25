# Percurso: Distributed Systems

## Resultado

Projetar e operar sistemas em que comunicação pode atrasar, mensagens podem se
repetir, processos podem reiniciar e diferentes nós podem observar estados
diferentes. A meta é raciocinar em termos de garantias e falhas, não decorar CAP.

## Diagnóstico de entrada

Explique sem consultar material:

- por que timeout não prova que uma operação falhou?
- qual diferença existe entre ordem local, por chave e global?
- o que um quorum realmente garante e sob quais hipóteses?
- como relógios físicos podem quebrar uma regra aparentemente simples?
- por que exactly-once fim a fim raramente é propriedade gratuita?

## Marcos

| Marco | Estude | Evidência de conclusão |
| --- | --- | --- |
| Modelo de falha | crash, omission, atraso, partição | catálogo de falhas e hipóteses do sistema |
| Tempo e ordem | clocks, causality, Lamport/vector clocks | experimento que distingue ordem causal de wall clock |
| Replicação | leader/follower, quorum, conflict | réplica com lag e comportamento de leitura documentado |
| Consistência | linearizability, serializability, eventual | escolha de garantia ligada a uma invariante |
| Coordenação | leases, locks, consensus, fencing | recurso exclusivo que resiste a lease expirado |
| Mensageria | Kafka, SQS, delivery, replay | consumer correto sob duplicata e reordenação permitida |
| Resiliência | deadlines, retry, backoff, bulkhead | fault injection sem retry storm |
| Operação | lag, backlog, quorum health, recovery | runbook de perda de nó/zona e restore exercitado |

## Laboratórios obrigatórios

### Tempo não é uma verdade global

Execute dois processos com relógios artificialmente deslocados. Mostre uma regra
que falha quando usa timestamp físico como autoridade e substitua por uma
estratégia compatível com a garantia necessária.

### Entrega duplicada

Implemente produtor, broker/fila e consumer. Force crash entre efeito e ack.
Registre a duplicata e corrija o efeito com idempotency key ou inbox.

### Partição de rede

Separe dois componentes e defina previamente qual comportamento espera:
indisponibilidade, leitura stale, rejeição de escrita ou conflito. Compare o
resultado real com a hipótese.

### Lease e fencing

Implemente exclusão com lease. Pause o antigo owner até a lease expirar, permita
novo owner e depois retome o antigo. Demonstre por que fencing token é necessário
quando o recurso externo não conhece apenas o lock.

## Projeto de síntese

Construa um **serviço de processamento replicado** sobre o domínio dos
[projetos progressivos](../projects/README.md):

1. API aceita uma operação com idempotency key;
2. estado é persistido antes da publicação por outbox;
3. consumers processam em paralelo preservando ordem apenas onde necessário;
4. leitura pode escolher consistência forte ou stale explícita;
5. falha de broker, banco, consumer e rede é injetável;
6. recovery e replay têm rate limit e auditoria;
7. métricas mostram lag por tempo, não apenas offsets;
8. um ADR explica por que não foi adotado consenso adicional onde não precisa.

## Checkpoints

### Fundamentos

Dado um diagrama, liste processos, canais, estado durável e cada hipótese de
falha. Explique o que permanece verdadeiro após reinício de um componente.

### Aplicação

Implemente um fluxo at-least-once e prove por teste que duplicata não duplica o
efeito de negócio.

### Proficiência

Analise um incidente em que retries aumentam carga durante degradação. Proponha
budget de timeout, backoff, jitter, concurrency limit e critério de shed.

### Sistemas

Projete uma topologia multi-zone ou multi-region. Declare RPO, RTO, consistência,
failover, split-brain strategy, custo e procedimento de retorno ao estado normal.

## Perguntas de entrevista

- Qual a diferença entre disponibilidade do processo e disponibilidade da
  operação de negócio?
- Quando quorum de escrita + leitura evita leitura stale e quando não basta?
- Como consumer groups alteram ordering e paralelismo?
- O que acontece com uma transaction Kafka quando existe efeito HTTP externo?
- Por que distributed lock sem fencing pode permitir dois writers válidos?
- Como diferenciar replication lag aceitável de quebra de SLO?
- Quando uma Saga é melhor que uma transação coordenada e vice-versa?

## Critério de conclusão

Você concluiu a trilha quando uma falha de rede deixa de parecer exceção e passa
a ser parte explícita do modelo do sistema, com garantia, sinal e recuperação
documentados.

---

[← Backend](backend-engineer.md) · [↑ Atlas](README.md) · [Arquitetura →](software-architect.md)
