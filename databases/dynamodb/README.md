# Amazon DynamoDB

DynamoDB é um banco NoSQL gerenciado de chave-valor/documentos, particionado e
projetado para latência previsível em escala quando o modelo acompanha os access
patterns. O desafio não é aprender a API `PutItem`. É transformar consultas,
invariantes, distribuição de carga e consistência em um desenho de chaves que
continue saudável quando o volume cresce.

## Problema que o DynamoDB resolve

Bancos relacionais são excelentes quando consultas e relações precisam evoluir
livremente. DynamoDB favorece outro contrato: você declara previamente como os
dados serão acessados e desenha partition/sort keys para atender essas consultas
sem joins ou scans amplos no caminho crítico.

Ele é forte quando você precisa de:

- escala horizontal gerenciada;
- latência baixa por chave;
- alta disponibilidade;
- operação reduzida de storage/replicação;
- access patterns conhecidos.

Ele é um fit ruim quando consultas ad hoc e relações complexas mudam o tempo todo.

## Modelo mental: access pattern → key → partition → capacidade

O fluxo de desenho é:

```text
caso de uso
→ query necessária
→ partition key
→ sort key
→ índices
→ distribuição de tráfego
→ consistência
→ capacidade/custo
```

Começar por “entidades e tabelas” como em modelo relacional costuma gerar Scan,
GSIs demais ou hot partitions.

## Partition key

A partition key determina onde o item é distribuído logicamente.

Uma boa chave precisa combinar:

- cardinalidade suficiente;
- distribuição razoável;
- acesso alinhado ao domínio;
- crescimento previsível.

Exemplo ruim:

```text
PK = "ORDERS"
```

Todos os pedidos concentram carga no mesmo valor lógico.

Exemplo melhor:

```text
PK = CUSTOMER#42
```

se o principal access pattern é buscar pedidos por cliente e a distribuição de
clientes for aceitável.

## Sort key

Itens com mesma partition key podem ser ordenados pela sort key.

Isso permite:

- range queries;
- prefix queries;
- agrupamento de tipos relacionados;
- versões temporais.

Exemplo:

```text
PK                 SK
USER#42            PROFILE
USER#42            ORDER#2026-08#991
USER#42            ORDER#2026-08#992
```

Uma `Query` em `USER#42` pode retornar perfil e pedidos ou apenas prefixo
`ORDER#`.

## Item collections

Partition key compartilhada cria item collection. Isso é útil para aggregate-like
access patterns, mas também concentra capacidade e tamanho.

Não coloque tudo do tenant gigante sob uma única key sem medir distribuição.

## Single-table design

Single-table design sobrecarrega chaves para responder vários access patterns em
uma tabela.

Exemplo:

```text
PK                 SK                    atributos
USER#42            PROFILE               name, email
USER#42            ORDER#2026-08#991      total, status
ORDER#991          ITEM#1                 sku, qty
IDEMP#checkout#abc RESULT                 expiresAt, response
```

### Benefícios

- uma Query pode materializar conjunto relacionado;
- transações e streams ficam em uma fronteira;
- access patterns ficam explícitos.

### Custos

- modelagem menos intuitiva;
- debugging mais difícil;
- IAM/lifecycle por entidade pode complicar;
- mudanças de access pattern podem exigir novo índice/backfill.

Single-table é opção, não religião. Tabelas múltiplas podem ser melhores para
ownership, segurança, capacidade e lifecycle independentes.

## Scan versus Query

`Query` usa partition key e opcionalmente sort key condition.

`Scan` percorre itens e filtra depois. Em dataset pequeno pode parecer barato e
virar gargalo silencioso em produção.

Regra prática: qualquer Scan em request síncrona de alto volume merece explicação
arquitetural.

## FilterExpression não economiza leitura como um índice

Uma FilterExpression é aplicada depois de itens serem lidos pela operação. Ela
reduz payload retornado, mas não transforma um conjunto grande em acesso barato.

Se você lê 100 mil itens e retorna 10, provavelmente precisa de outra key/index.

## Global Secondary Index

GSI define partition/sort keys próprias e mantém projeção assíncrona dos dados.

Use quando existe access pattern importante que não cabe na primary key.

Exemplo:

```text
GSI1PK = STATUS#PENDING
GSI1SK = CREATED#2026-08-25T10:00#ORDER#991
```

permite buscar pedidos pendentes por tempo.

### Trade-offs

- write amplification;
- storage extra;
- consistência eventual da projeção;
- capacidade/custo adicional;
- hot key pode reaparecer no índice.

Adicionar GSI não corrige partition key ruim automaticamente.

## Local Secondary Index

LSI compartilha partition key com a tabela e muda sort key. Precisa ser definido
na criação e possui restrições próprias.

É útil quando você precisa de outra ordenação dentro da mesma item collection e
as limitações são aceitáveis.

## Consistência de leitura

Leituras são eventualmente consistentes por padrão.

Strongly consistent reads estão disponíveis em certas operações/recursos na
região principal, mas não em GSI/global tables da mesma maneira.

A decisão deve ser por access pattern:

- catálogo pode tolerar stale;
- confirmação de alocação talvez não;
- tela do usuário pode exigir read-your-writes.

Não pague consistência forte onde ela não cria valor, nem use eventual onde quebra
invariante.

## Condition expressions

Condition expression é uma ferramenta central de concorrência.

Exemplos:

- criar só se não existe;
- atualizar se `version = 7`;
- decrementar se `stock >= quantity`.

Isso implementa compare-and-set próximo da autoridade e pode ser melhor que lock
distribuído externo.

## Optimistic concurrency

Um padrão:

```text
read version=7
update ... condition version=7
set version=8
```

Se outro writer venceu, a condição falha. Aplicação decide se recarrega e tenta
novamente.

Retry cego pode repetir intenção já inválida, então trate conflito semanticamente.

## Transações

DynamoDB oferece operações transacionais para múltiplos itens dentro dos limites
documentados.

Use quando a invariante realmente cruza itens e não pode ser modelada de forma
mais simples.

Custos:

- mais latência;
- mais consumo/custo;
- maior chance de conflito;
- boundary maior.

Não use transação ampla para recriar um banco relacional inteiro.

## Idempotência

APIs com retry precisam operation ID.

Um item pode representar:

```text
PK = IDEMP#checkout#abc
SK = RESULT
payloadHash = ...
status = COMPLETE
response = ...
expiresAt = ...
```

Create com condition `attribute_not_exists(PK)` reserva a operação. Mesmo ID com
payload diferente deve falhar.

TTL pode limpar registros depois, mas não serve como timer exato.

## TTL

TTL marca item para remoção assíncrona após timestamp. A exclusão não ocorre
exatamente no segundo indicado.

Use TTL para lifecycle eventual:

- sessões expiradas;
- idempotency records antigos;
- cache;
- dados temporários.

Não use para “às 10:00 execute esta ação”. Para scheduling, use mecanismo
apropriado.

## DynamoDB Streams

Streams capturam mudanças e alimentam consumidores/projeções.

Casos:

- CDC;
- atualização de search index;
- materialized view;
- integração assíncrona.

Consumidor deve tolerar:

- retry;
- duplicidade possível na prática do processamento;
- ordering apenas no escopo garantido;
- lag;
- poison record.

Efeito externo continua precisando idempotência.

## Capacidade: on-demand versus provisioned

### On-demand

Simplifica workload variável e elimina planejamento fino inicial.

Bom para:

- tráfego imprevisível;
- aplicações novas;
- picos variáveis.

### Provisioned

Você define capacidade e pode usar auto scaling.

Pode ser econômico/previsível em cargas estáveis e conhecidas.

A escolha é de workload/custo, não de maturidade.

## Hot partitions

Mesmo que a tabela tenha muita capacidade total, uma key muito quente pode
limitar throughput.

Exemplos:

- `STATUS#PENDING` recebe todos os writes;
- um influencer recebe enorme tráfego;
- contador global;
- tenant gigantesco.

Mitigações:

- write sharding;
- suffix aleatório/controlado;
- agregação posterior;
- cache;
- espalhar por bucket temporal;
- isolamento do tenant.

Cada sharding aumenta complexidade de leitura.

## Write sharding

Em vez de:

```text
PK = COUNTER#GLOBAL
```

use:

```text
PK = COUNTER#GLOBAL#0..N
```

Cada write escolhe shard. Leitura soma shards.

Você trocou write hotspot por read aggregation. Documente o trade-off.

## Item size

Itens grandes aumentam:

- custo de leitura/escrita;
- network;
- latency;
- write amplification em índices.

Não armazene blobs grandes apenas porque cabem. Use object storage quando o access
pattern indicar.

## Sparse indexes

GSI só contém itens que possuem os atributos indexados. Isso permite sparse
index.

Exemplo: apenas orders `PENDING` têm `GSI_PENDING_PK`. Quando estado muda, atributo
é removido.

Isso pode ser muito mais eficiente que indexar todos os itens por status genérico.

## Adjacency list

Single-table pode representar relações grafo-like usando PK/SK, mas isso não
transforma DynamoDB em graph database para traversals arbitrários.

Use quando os acessos são conhecidos e bounded.

## Global Tables

Global Tables replicam dados entre regiões e permitem writes em múltiplas
localidades conforme a configuração/semântica do serviço.

Perguntas obrigatórias:

- writes concorrentes na mesma chave podem ocorrer?
- qual conflict behavior?
- uma invariante global tolera merge/last-writer semantics?
- users precisam write local?
- data residency permite replicação?

Global table não torna qualquer invariante multi-region segura.

## Multi-region e invariantes

Carrinho de compras pode tolerar merge/reconciliação.

“Último assento disponível” talvez precise autoridade única ou coordenação mais
forte.

Projete pela semântica, não pela feature “multi-region”.

## PITR, backup e restore

Point-in-time recovery protege contra classes de erro e permite voltar a ponto
anterior dentro da janela suportada.

Mas recuperação completa exige testar:

- tempo de restore;
- reconfiguração de indexes/streams/dependências;
- cutover;
- validação de dados;
- RPO/RTO.

Backup habilitado sem restore testado é apenas promessa.

## Observabilidade

Monitore pelo menos:

- request latency por operação;
- throttled requests;
- consumed/provisioned capacity;
- system/user errors;
- item size;
- GSI throttling;
- stream iterator age/lag;
- transaction conflicts;
- conditional-check failures;
- hot-key symptoms;
- backup/restore status.

Separe erro esperado de negócio, como conditional conflict, de falha operacional.

## Diagnóstico de throttling

Quando aparece throttling:

1. confirme tabela ou índice;
2. veja quais access patterns aumentaram;
3. procure hot partition, não apenas capacidade total;
4. verifique item size;
5. compare read/write mode;
6. ajuste retry com jitter e deadline;
7. redesenhe key se concentração for estrutural.

Aumentar capacidade global não resolve sempre uma chave quente.

## Retry

SDKs podem retry automaticamente. Mesmo assim, você precisa compreender o budget.

Retry deve respeitar:

- deadline da request;
- backoff/jitter;
- idempotência;
- limite de tentativas.

Durante overload, retry ilimitado amplifica carga.

## Segurança

Use IAM least privilege por tabela/index/operação quando possível.

Considere:

- condition keys;
- KMS quando requisito exigir;
- VPC endpoints;
- CloudTrail/auditoria apropriada;
- backups protegidos;
- separação de ambientes;
- tenant boundary.

Single-table pode complicar autorização quando entidades têm políticas muito
diferentes. Isso pode ser motivo legítimo para tabelas separadas.

## Custos

Custo não é apenas tabela principal.

Inclua:

- reads/writes;
- GSIs;
- storage;
- streams;
- backups/PITR;
- global tables;
- data transfer;
- restore/test environments.

Um GSI “para facilitar uma tela” pode duplicar write/storage de grande parte do
dataset.

## Modos de falha

### Hot key durante pico

Sintoma: throttling concentrado apesar de capacidade total aparente suficiente.

Ação: identificar key, aplicar sharding/cache/isolation e revisar access pattern.

### GSI atrasado

Read-after-write no índice não vê item. Se UX exige consistência, leia a primary
source ou espere versão.

### Consumer de Stream atrasado

Projeções ficam stale. Monitore iterator age e capacidade do consumer.

### Global-table conflict

Writes concorrentes produzem estado inesperado. Se isso quebra invariante,
redesenhe authority em vez de tentar “mais retry”.

### Restore não cabe no RTO

Problema de arquitetura/operabilidade. Teste restore periodicamente e meça.

## Testes

- access patterns com dataset realista;
- conditional write concorrente;
- transaction conflict;
- throttling e retry;
- hot-key load test;
- GSI propagation delay;
- stream redelivery/restart;
- PITR restore;
- failover/região para Global Tables quando usado.

## Laboratório progressivo

### Beginner

Modele usuários/pedidos com PK/SK e responda consultas apenas com `GetItem` e
`Query`.

### Intermediate

Adicione GSI para pedidos pendentes. Meça write amplification e observe que a
leitura do GSI é eventual.

### Advanced

Crie workload com hot key, provoque throttling e aplique write sharding. Compare
throughput, custo e complexidade da leitura.

### Expert

Implemente checkout idempotente com condition expression + transaction, Stream
para projeção e restore de PITR em tabela nova. Documente RPO/RTO e recovery.

## Projeto de síntese

Modele marketplace com estes access patterns:

1. perfil por user;
2. pedidos recentes por user;
3. order por ID;
4. pedidos pendentes por região;
5. idempotency record de checkout;
6. atualização de search via Stream.

Antes de criar schema, escreva cada query. Depois defina PK/SK/GSI e estime:

- cardinalidade;
- hot keys;
- item size;
- capacidade;
- consistency;
- custo.

## Anti-patterns

- partition key constante;
- `Scan` no caminho síncrono;
- FilterExpression usada como “índice”;
- depender de GSI para read-after-write forte;
- item próximo do limite atualizado frequentemente;
- transação ampla para simular join;
- single-table sem access patterns explícitos;
- criar GSI para cada filtro de UI;
- retry sem deadline;
- Global Tables para invariante que não tolera conflito.

## Referências oficiais

- AWS. [DynamoDB Developer Guide](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html).
- [Best practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html).
- [Read consistency](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html).
- [DynamoDB transactions](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transactions.html).

---

[← Redis](../redis/README.md) · [↑ Bancos](../README.md) · [Exercícios →](../exercises.md)
