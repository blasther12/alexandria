# Padrões de resiliência

Resiliência é a capacidade de manter um resultado aceitável e recuperar quando
componentes atrasam, falham, saturam ou retornam respostas parciais. O problema
não é eliminar toda falha. Sistemas distribuídos inevitavelmente falham. O
objetivo é impedir que uma falha pequena se transforme em cascata e tornar a
recuperação previsível.

## Modelo mental: orçamento finito de tempo e capacidade

Toda requisição consome recursos ao longo de uma cadeia:

```text
cliente → gateway → serviço A → serviço B → banco/fila
```

Cada salto adiciona latência, possibilidade de falha e consumo de conexão,
thread, socket, memória ou slot de concorrência. Quando uma dependência fica
lenta, o problema não é apenas o tempo de resposta dela: requests se acumulam,
pools enchem e o serviço saudável também pode ficar indisponível.

Pense em quatro perguntas:

1. **quanto tempo ainda temos?**
2. **quanto trabalho simultâneo podemos aceitar?**
3. **qual falha vale retry?**
4. **qual resultado degradado ainda é correto?**

## Deadline antes de timeout

Timeout local é um limite para uma operação específica. Deadline é o orçamento
máximo da operação inteira.

Se o cliente aceita 800 ms e o gateway já gastou 250 ms, um downstream não deve
receber um timeout novo de 800 ms. Ele deveria receber o orçamento restante,
reservando margem para serialização e retorno.

Diferencie:

- connect timeout;
- TLS handshake timeout;
- request/response timeout;
- idle timeout;
- queue timeout;
- deadline total.

Cancelamento deve propagar. Se o caller já desistiu, continuar uma consulta cara
ou uma chamada externa só consome capacidade que poderia atender trabalho útil.

### Falha comum

Timeout longo demais retém recursos durante brownout. Timeout curto demais cria
falsos negativos e dispara retries. Escolha com base em distribuição de latência,
SLO e custo da tentativa abandonada.

## Retry é multiplicador de carga

Retry só deve acontecer quando:

- o erro é plausivelmente transitório;
- a operação é segura/idempotente;
- ainda existe deadline;
- existe retry budget;
- a camada atual é a dona da política.

Três tentativas em três camadas podem gerar até 27 chamadas downstream. Durante
uma degradação, isso transforma capacidade menor em carga maior.

### Exponential backoff com jitter

Backoff espaça tentativas. Jitter evita que milhares de clientes acordem ao mesmo
tempo. Full jitter é frequentemente uma boa escolha porque distribui a carga em
uma janela.

O retry budget pode ser expresso como proporção da carga original. Exemplo: não
permitir que retries adicionem mais de 10% ao volume normal. Isso força o sistema
a parar de “tentar mais forte” quando a dependência já está saturada.

## Idempotência

Retry seguro exige distinguir **tentativa** de **operação lógica**.

Para uma API de criação:

1. cliente envia `idempotency_key`;
2. serviço reserva a chave atomicamente;
3. associa hash do payload;
4. executa o efeito;
5. persiste resultado;
6. retries retornam o mesmo resultado.

A mesma chave com payload diferente deve ser rejeitada. Expiração da chave precisa
cobrir a janela em que o cliente pode repetir a operação.

Em mensageria, consumers podem registrar `message_id` junto ao efeito ou usar
conditional update/versioning. A garantia depende da fronteira. Um broker não
consegue tornar exatamente-uma-vez um email ou cobrança externa por mágica.

## Concorrência limitada e admission control

Quando a aplicação aceita trabalho ilimitado, o overload aparece tarde, geralmente
como OOM, pool exhaustion ou p99 explosivo.

Use limites explícitos:

- máximo de requests concorrentes;
- máximo por tenant;
- pool por dependência;
- fila bounded;
- semaphore para operação cara;
- token bucket para taxa.

Admission control rejeita cedo quando não existe capacidade. Uma resposta 429/503
rápida pode preservar o sistema melhor que aceitar tudo e falhar depois de 20
segundos.

## Bulkhead

Bulkhead separa capacidade para evitar que um consumidor monopolize tudo.

Exemplos:

- pool de conexões separado por dependência crítica;
- workers independentes para filas de prioridades diferentes;
- limite por tenant;
- executor separado para tarefas lentas.

O trade-off é possível capacidade ociosa. Compartilhar tudo maximiza utilização
nominal; particionar capacidade reduz blast radius.

## Circuit breaker

Circuit breaker interrompe chamadas quando uma dependência demonstra falha
persistente.

Estados típicos:

- **closed:** chamadas passam;
- **open:** falha rápido;
- **half-open:** pequena amostra testa recuperação.

Ele é útil quando continuar chamando piora o incidente. Não serve para mascarar
bugs permanentes nem substituir timeout.

Falhas comuns:

- thresholds iguais para todas as operações;
- estado compartilhado globalmente sem necessidade;
- half-open com burst grande;
- breaker flapping entre open/closed;
- métricas que não mostram por que abriu.

## Load shedding

Load shedding rejeita trabalho deliberadamente para preservar o essencial.

A ordem de descarte deve ser uma decisão de produto:

1. analytics best-effort;
2. refresh de cache;
3. requests de baixa prioridade;
4. operações interativas;
5. operações críticas.

Nunca descubra essa ordem no meio do incidente.

## Bounded queues e backpressure

Fila infinita converte overload em latência infinita. Uma fila bounded obriga uma
decisão quando a capacidade acaba:

- bloquear produtor;
- rejeitar;
- descartar mais antigo;
- descartar mais novo;
- degradar prioridade.

Backpressure faz o produtor perceber que o consumidor não acompanha. Em streaming,
pode significar pause de partitions; em HTTP, 429/503; em processamento interno,
semaphore ou channel bounded.

## Hedging

Hedging dispara uma segunda tentativa antes da primeira terminar para reduzir tail
latency de leituras. Pode funcionar quando latência caudal vem de stragglers
independentes, mas aumenta carga.

Só use quando:

- operação não possui efeito destrutivo;
- existe capacidade sobrando;
- o hedge é disparado após um percentile/threshold, não imediatamente;
- o primeiro resultado cancela o restante;
- volume adicional é medido.

## Degradação controlada

Fallback só é correto se o resultado degradado continuar semanticamente válido.

Exemplos razoáveis:

- catálogo serve dados stale por alguns minutos;
- recomendação cai para ranking estático;
- avatar usa placeholder.

Exemplos perigosos:

- saldo financeiro stale apresentado como atual;
- autorização “permite por padrão” se serviço de policy falhar;
- estoque desconhecido tratado como disponível.

Especifique o que pode degradar, por quanto tempo e como o usuário percebe.

## Saga, outbox, inbox e CDC

Saga coordena transações locais por choreography ou orchestration. Compensação é
nova ação de negócio, não rollback temporal. Ela pode falhar e precisa de
idempotência e auditoria.

Outbox persiste estado e intenção de publicar na mesma transação. O relay publica
posteriormente e pode repetir. Inbox registra message ID junto ao efeito local.
CDC lê log de mudanças e pode alimentar projeções, mas schema de tabela não é
contrato de domínio automaticamente.

Esses padrões resolvem falhas diferentes. Usar outbox não elimina necessidade de
retry; usar saga não elimina reconciliação.

## 2PC e coordenação distribuída

Two-phase commit pode oferecer atomicidade entre participantes compatíveis, mas
introduz coordinator, locks e dependência de disponibilidade dos participantes.
Não é “sempre proibido”; também não é transparente.

Compare:

- mover a invariante para uma autoridade única;
- saga;
- outbox + reconciliation;
- transação coordenada.

Escolha com base na força da invariante, latência, failure model e maturidade
operacional.

## Performance e capacidade

Resiliência começa por capacidade conhecida. Meça:

- throughput máximo sustentável;
- concorrência em steady state;
- saturação de CPU/memória/pools;
- queue depth;
- p50/p95/p99;
- tempo de recovery após pico;
- volume extra causado por retries.

Little's Law ajuda a relacionar concorrência, throughput e tempo médio:

`L = λ × W`

Se o tempo dobra com a mesma taxa de chegada, o número de requests em voo tende a
dobrar. Isso explica por que uma dependência lenta pode esgotar pools mesmo sem
aumento de tráfego.

## Observabilidade

Métricas úteis:

- requests aceitas/rejeitadas;
- deadlines expirados;
- retries por tentativa e por operação lógica;
- breaker state;
- queue depth e queue age;
- semaphore/pool utilization;
- shed rate;
- fallback rate;
- dependency latency/error;
- recovery time.

Trace deve mostrar deadline e número da tentativa. Logs precisam distinguir
**falha original** de **falha após retry budget esgotado**.

## Segurança e abuso

Resiliência também é segurança de disponibilidade. Um atacante pode explorar
retries caros, endpoints com fan-out alto, payloads que causam trabalho excessivo
ou chaves que concentram uma partição.

Proteja com:

- rate limit por identidade e operação;
- limites de payload;
- quotas;
- autenticação antes de trabalho caro;
- circuitos separados para tenants;
- proteção contra amplification.

Não deixe fallback remover autorização. “Auth service indisponível” não deve virar
“permitir tudo”.

## Modos de falha

### Brownout de dependência

A dependência responde, mas 10x mais lenta. Sintomas: p99 aumenta, pools enchem,
retries sobem. Mitigação: deadline, concurrency limit, shedding e retry budget.

### Retry storm

Muitos clientes repetem simultaneamente. Sintomas: request rate upstream maior que
tráfego de usuário. Mitigação: jitter, orçamento, retry em uma camada e respostas
com backoff hints quando aplicável.

### Pool exhaustion

Conexões ficam presas em operações lentas. Sintomas: fila local cresce mesmo com
CPU baixa. Mitigação: pool bounded, timeout, cancellation e bulkhead.

### Recovery stampede

Dependência volta e todos os clientes retornam de uma vez. Use ramp-up, jitter,
half-open controlado e limitação de concorrência.

## Testes de resiliência

Teste em ambiente controlado:

- latência crescente, não apenas falha binária;
- conexão recusada;
- timeout após efeito remoto concluído;
- resposta parcial/corrompida;
- pool pequeno;
- fila cheia;
- retry storm;
- dependência flapping;
- recuperação após outage.

Chaos engineering valida hipóteses depois que observabilidade, rollback e blast
radius estão definidos.

## Laboratório progressivo

### Beginner

Crie um endpoint que chama uma dependência lenta. Varie timeout e observe requests
em voo.

### Intermediate

Adicione retry com backoff/jitter e idempotency key. Mate a conexão após o efeito
remoto e confirme que o efeito não duplica.

### Advanced

Implemente concurrency limit, bounded queue e load shedding. Faça load test até
saturação e compare p99 com e sem admission control.

### Expert

Simule brownout em dependência crítica. Defina deadline budget, retry budget,
breaker, fallback, SLO e runbook. Depois exercite recovery e prove que não ocorre
stampede.

## Runbook de incidente

Quando latência sobe:

1. confirme se chegada aumentou ou serviço ficou mais lento;
2. examine saturation e queue age;
3. identifique dependência dominante no trace;
4. reduza retries se estiverem amplificando carga;
5. habilite shedding/degradação planejada;
6. isole tenants/rotas mais caras;
7. monitore recovery, não apenas queda de erros;
8. depois do incidente, transforme a hipótese em teste automatizado.

## Referências

- AWS Builders' Library. [Timeouts, retries, and backoff with jitter](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/).
- Google. [Site Reliability Engineering](https://sre.google/sre-book/table-of-contents/).
- Nygard. [*Release It!*, 2ª ed.](https://pragprog.com/titles/mnee2/release-it-second-edition/).

---

[← Fundamentos](fundamentals.md) · [↑ Sistemas distribuídos](README.md) · [Consenso →](consensus.md)
