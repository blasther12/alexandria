# Monólito modular

Um monólito modular combina **um deployável** com módulos de negócio que possuem contrato, modelo e dados bem delimitados. Ele preserva transações locais e uma operação simples sem aceitar o acoplamento irrestrito de um “monólito acidental”.

## Problema e contexto

Produtos novos precisam aprender rápido, e equipes pequenas raramente se beneficiam de rede, descoberta de serviço e consistência distribuída desde o primeiro dia. Ao mesmo tempo, separar apenas em controllers, services e repositories permite que qualquer funcionalidade leia qualquer tabela e importe qualquer classe.

Use módulos para alinhar mudança, linguagem e propriedade: Catálogo, Pedidos e Pagamentos são candidatos melhores do que `utils`, `services` e `models`.

## Componentes e regras

Cada módulo contém:

- uma **API pública** pequena: comandos, consultas e eventos aceitos;
- um **modelo interno** que não é importável por outros módulos;
- propriedade explícita sobre tabelas/esquemas;
- adaptadores para HTTP, mensageria e persistência;
- testes de arquitetura que bloqueiam dependências proibidas.

```text
src/
  orders/
    api/                 # contrato importável
    application/
    domain/
    infrastructure/
  payments/
    api/
    application/
    domain/
    infrastructure/
  bootstrap/             # composição, rotas, migrações
```

```mermaid
flowchart LR
    Client --> OrdersAPI[API pública: Pedidos]
    OrdersAPI --> Orders[Internos de Pedidos]
    Orders -->|porta/chamada explícita| PaymentsAPI[API pública: Pagamentos]
    PaymentsAPI --> Payments[Internos de Pagamentos]
    Orders --> ODB[(dados de Pedidos)]
    Payments --> PDB[(dados de Pagamentos)]
    Build[teste de arquitetura] -. bloqueia import interno .-> Payments
```

## Fluxo de exemplo

1. O adaptador HTTP transforma `POST /orders` em `PlaceOrder`.
2. Pedidos valida regras e grava a transação em suas tabelas.
3. Após o commit, publica `OrderPlaced` em um barramento **em processo** ou em uma outbox.
4. Pagamentos reage por sua API pública. Se a reação for síncrona, falha e atomicidade precisam estar explícitas; se assíncrona, duplicidade e atraso também.

Evite compartilhar entidades ORM. Passe identificadores e DTOs imutáveis; o consumidor não deve depender da representação interna do produtor.

## Dados e transações

Há três níveis crescentes de isolamento:

1. tabelas com prefixo e convenção de propriedade;
2. schemas e credenciais por módulo no mesmo servidor;
3. bancos separados, ainda no mesmo deployável.

Comece pelo nível que as ferramentas conseguem fiscalizar. Uma transação entre módulos pode ser pragmática, mas deve ser rara e registrada: ela é uma dependência que dificultará extração. Para fluxos longos, prefira estado explícito, outbox e compensações.

## Vantagens, custos e decisão

| Benefício | Custo / tensão |
| --- | --- |
| chamada e transação locais | um deploy e, em geral, um domínio de falha |
| depuração e ambiente simples | disciplina/ferramentas precisam proteger fronteiras |
| refatoração entre módulos ainda possível | autonomia de release é limitada |
| custo operacional menor | escala normalmente ocorre no processo inteiro |

**Use quando:** produto/equipe ainda aprendem limites; regras precisam de consistência local; um processo atende a escala; velocidade operacional importa.

**Não use quando:** cargas exigem runtime ou escala incompatíveis; isolamento regulatório/de falha pede processos separados; equipes realmente necessitam ciclos de deploy independentes e o custo distribuído é aceitável.

## Testes

- **Unidade:** invariantes e políticas internas sem I/O.
- **Módulo:** use cases pela API pública com banco real isolado.
- **Contrato interno:** garante compatibilidade de comandos/eventos consumidos.
- **Arquitetura:** grafo de imports, propriedade de schema e ausência de acesso cruzado.
- **Poucos E2E:** jornadas críticas entre módulos.

Um teste de arquitetura deve falhar se `orders.internal.*` for importado por Pagamentos ou se uma consulta acessar tabela de outro proprietário.

## Observabilidade

Um processo único ainda precisa de contexto por módulo: `module`, `use_case`, `trace_id`, duração, resultado e métricas de negócio. Meça filas internas, pools, lock contention e consumo por módulo para detectar “noisy neighbor”. Trace chamadas entre módulos como spans, mesmo sem rede; isso revela acoplamento antes de uma extração.

## Deployment e segurança

- migrações são compatíveis com a versão anterior durante rollout;
- inicialização valida configuração e contratos internos;
- feature flags permitem ativar alterações por módulo;
- handlers drenam antes do encerramento;
- autorização ocorre na API do módulo, não apenas no controller externo;
- credenciais de banco por módulo reforçam propriedade quando viável;
- dados sensíveis não atravessam eventos “por conveniência”.

O rollback de binário não reverte automaticamente uma migração destrutiva. Use expand/contract: adicionar, preencher, alternar leitores/escritores e só depois remover.

## Evolução para serviços

Extraia por evidência: escala independente, ownership, isolamento ou cadence de entrega—não pelo número de linhas.

```mermaid
flowchart LR
    A[Contrato público do módulo] --> B[Adaptador remoto atrás do mesmo contrato]
    B --> C[Replicar/migrar dados com reconciliação]
    C --> D[Rotear pequena parcela]
    D --> E[Observar SLO e divergência]
    E --> F[Concluir corte e remover caminho antigo]
```

Use branch by abstraction/strangler. Crie outbox antes do corte, defina uma fonte de verdade, mantenha compatibilidade, reconcilie contagens e valores, e preserve uma rota de retorno.

## Anti-patterns

- “módulo” que é só uma pasta e importa internals de todos os outros;
- banco compartilhado sem dono, joins cruzados e triggers intermodulares;
- barramento em processo usado para esconder fluxo crítico e síncrono;
- `shared` crescendo como um domínio sem proprietário;
- construir contratos de rede para toda chamada “pensando no futuro”;
- extrair o módulo mais acoplado primeiro.

## Perguntas de revisão

- Uma mudança de preço toca quantos módulos?
- Qual módulo autoriza e grava cada dado?
- Quais dependências são sincrônicas e por quê?
- O que falharia ou escalaria junto?
- Há um motivo mensurável para cruzar o limite de processo?

## Referências

- Kamil Grzybek. [Modular Monolith with DDD](https://github.com/kgrzybek/modular-monolith-with-ddd) — implementação de referência aberta.
- Microsoft. [Domain analysis for microservices](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis).
- Fowler. [Monolith First](https://martinfowler.com/bliki/MonolithFirst.html).
- Newman. *Monolith to Microservices*. [O'Reilly](https://www.oreilly.com/library/view/monolith-to-microservices/9781492047834/).

---

[← Comparação](../comparison.md) · [↑ Índice](../README.md) · [Microsserviços →](../microservices/README.md)
