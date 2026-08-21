# JavaScript — internals

---

[← Fundamentos](fundamentals.md) · [↑ JavaScript](README.md) · [→ Exercícios](exercises.md)

Conhecer internals serve para prever comportamento e investigar produção. Separe sempre o que a especificação garante do que uma engine ou host implementa hoje.

## O modelo em três camadas

```text
source code
   ↓
ECMAScript: sintaxe e semântica, execution contexts, objects, jobs
   ↓
engine: parser, interpreter/JIT, representação de objects, GC
   ↓
host: event loop, timers, I/O, DOM/filesystem, workers
```

O TC39 mantém a especificação ECMAScript. V8, SpiderMonkey e JavaScriptCore são engines. Browser e Node.js são hosts — Node usa V8, mas seu event loop e I/O passam também por componentes do próprio runtime.

## Da fonte à execução

Uma engine valida a gramática, produz uma representação do programa e cria executable code. Engines modernas podem começar interpretando bytecode, coletar feedback e compilar funções quentes. No V8, nomes como Ignition e TurboFan descrevem partes desse pipeline, não uma promessa da linguagem.

Otimização especulativa assume shapes e tipos observados. Uma suposição quebrada pode causar deoptimization; isso preserva correção, mas muda custo. Não “programe para o JIT” por folclore. Profile o runtime e versão reais e prefira algoritmos, dados e I/O melhores.

## Execution contexts, stack e heap

Ao avaliar código, ECMAScript cria execution contexts com referências a lexical environments, função e realm relevantes. Chamadas aninhadas aparecem conceitualmente na call stack. Objects e closures vivem em memória gerenciada pela engine, usualmente descrita como heap.

```js
function format(user) {
  const prefix = "user";
  return () => `${prefix}:${user.id}`;
}

const label = format({ id: 42 });
console.log(label());
```

Depois de `format` retornar, a closure ainda alcança `prefix` e o object `user`; portanto eles permanecem live. A engine pode representar isso de forma otimizada, desde que preserve a semântica observável.

Recursão profunda pode exceder a stack; proper tail calls fazem parte da especificação em condições específicas, mas suporte prático não deve ser presumido entre engines. Para profundidade controlada por entrada, prefira iteração ou stack explícita.

## Hoisting e inicialização

“Hoisting” é uma explicação informal. Durante a instantiation de declarations, bindings são criados antes da avaliação:

- function declarations ficam disponíveis no scope aplicável;
- `var` é inicializado com `undefined` e tem function/global scope;
- `let`, `const` e `class` existem, mas acessar antes da inicialização entra na temporal dead zone e lança `ReferenceError`.

Use `const`/`let` e ordene código para leitura; não dependa de efeitos surpreendentes de `var`.

## Objects e prototype chain

Uma leitura como `object.name` procura uma own property e, se necessário, segue `[[Prototype]]`. `class extends` organiza essa cadeia, mas JavaScript permanece prototype-based.

Property descriptors controlam `writable`, `enumerable`, `configurable` e accessors. Nem toda operação percorre as mesmas propriedades; `for...in`, `Object.keys`, spread e `Reflect.ownKeys` têm contratos distintos.

Engines frequentemente armazenam objects com shapes/hidden classes e usam inline caches. Alterar repetidamente a estrutura pode prejudicar otimizações, mas shapes são implementação. Só faça mudanças motivadas por profile e mantenha tests contra a API, não contra detalhes internos.

## Realms e identidade

Cada realm possui seus próprios intrinsics. Um array criado em outro iframe pode falhar em `value instanceof Array`; `Array.isArray(value)` funciona entre realms. Esse detalhe importa ao cruzar iframes, VMs e alguns sandbox boundaries.

Executar código não confiável no mesmo process/realm não cria isolamento de segurança. Use mecanismos de sandbox apropriados ao threat model e mantenha o runtime corrigido.

## Jobs, tasks e event loop

ECMAScript define jobs, incluindo Promise reaction jobs. O host define event loop e task sources. Uma iteração simplificada é:

1. o host escolhe uma task pronta;
2. JavaScript executa até a stack ficar vazia;
3. ocorre um microtask checkpoint, drenando jobs enfileirados;
4. o browser pode renderizar; o host escolhe trabalho seguinte.

```js
console.log("A");

setTimeout(() => console.log("timer"), 0);
Promise.resolve().then(() => console.log("promise"));
queueMicrotask(() => console.log("microtask"));

console.log("B");
```

Em hosts comuns, a saída é `A`, `B`, `promise`, `microtask`, `timer`: handlers foram enfileirados nessa ordem, e microtasks rodam antes da próxima timer task. O `0` do timer é atraso mínimo, não deadline.

Uma microtask que agenda outra indefinidamente pode impedir timers, I/O e rendering: microtask starvation.

## Promises e `async`/`await`

Resolver uma Promise não chama handlers inline. As reactions viram jobs. Uma `async function` retorna uma Promise; ao encontrar `await`, ela suspende sua continuação e permite que o agent execute outro trabalho. A continuação volta como job após settlement.

```js
async function sequence() {
  console.log(1);
  await null;
  console.log(3);
}

sequence();
console.log(2);
// 1, 2, 3
```

`await` não cria paralelismo nem move CPU work para outra thread. Ele permite intercalar continuações enquanto o host aguarda operações.

### Combinators

- `Promise.all`: fail-fast para a Promise resultante; não cancela operações restantes;
- `Promise.allSettled`: coleta todos os resultados;
- `Promise.race`: observa o primeiro settlement;
- `Promise.any`: observa o primeiro fulfillment.

Cancellation precisa ser cooperativa, frequentemente por `AbortSignal`. Propague o signal por todas as camadas e remova listeners após uso.

## Event loop no browser e no Node.js

Browsers integram tasks, microtasks, rendering e Web APIs conforme os padrões Web. Node.js organiza fases de timers e I/O sobre seu runtime; também possui `process.nextTick`, cuja fila tem prioridade especial. Código que depende de ordenação fina entre timers, immediates, I/O e `nextTick` é frágil: leia a documentação da versão e teste o cenário.

Em ambos:

- callbacks longos bloqueiam progresso daquele JavaScript agent;
- mais Promises não significam mais threads;
- rede pode ser concorrente porque o host/OS realiza I/O;
- handles abertos podem manter um processo Node vivo.

Meça event-loop delay e duração do callback; não atribua automaticamente toda latência ao event loop.

## Workers e paralelismo

Web Workers e Node.js Worker Threads executam JavaScript em agents separados. Comunicação usa mensagens; dados podem ser structured-cloned, transferidos ou compartilhados por `SharedArrayBuffer` sob requisitos de segurança.

Workers ajudam CPU-bound work suficientemente grande para pagar startup, serialização e coordenação. Um pool limita workers e fila. Shared memory com `Atomics` oferece poder e risco de races/deadlocks; message passing e ownership explícito são defaults mais seguros.

Processes fornecem isolamento e limites diferentes. Escolha worker, process ou serviço separado conforme falha, segurança e custo operacional.

## Garbage collection

JavaScript usa automatic memory management. Conceitualmente, um object é coletável quando deixa de ser alcançável a partir de roots. Engines podem combinar collectors generational, incremental, concurrent e compacting.

Reference cycles são coletáveis quando o ciclo inteiro fica inalcançável. “Memory leak” em código gerenciado geralmente é retenção não intencional:

- caches sem limite;
- listeners/timers nunca removidos;
- closures que capturam graphs grandes;
- filas que crescem sem backpressure;
- requests pendentes e handles não encerrados.

`WeakMap`, `WeakRef` e `FinalizationRegistry` não tornam GC determinístico. Não use finalizers para liberar recursos essenciais; use lifecycle explícito (`try`/`finally`, `using` onde suportado pelo target, ou API equivalente).

## Diagnóstico de memória

Procedimento reproduzível:

1. estabilize uma carga e registre heap/RSS, throughput e GC;
2. force o mesmo ciclo de requests em um ambiente de diagnóstico;
3. compare heap snapshots por retained size e dominators;
4. encontre o path até um root;
5. corrija ownership/lifecycle e repita a carga;
6. confirme que a memória estabiliza sem depender de GC manual.

RSS inclui mais que JavaScript heap: native buffers, code pages e stacks também contam.

## JIT, warm-up e benchmark

Um benchmark útil declara runtime/flags, hardware, dataset, warm-up, número de amostras e distribuição. Evite:

- medir código morto ou resultado não consumido;
- misturar tempo de startup com steady state sem intenção;
- ignorar GC, I/O e concorrência;
- extrapolar microbenchmark para uma aplicação;
- escolher uma média escondendo p99.

Use profilers de CPU e allocation para localizar hot paths. A causa pode estar em serialização, regex, cópias, N+1 I/O ou cardinalidade, não em sintaxe.

## Stack traces e async context

Stack traces são ferramentas de diagnóstico, não parte portátil da semântica ECMAScript em todos os detalhes. Source maps precisam ser protegidos e corresponder ao build. Em operações assíncronas, propague correlation/trace context usando mecanismos do host; globals mutáveis misturam requests concorrentes.

Capture exceptions na borda, adicione contexto seguro e preserve `cause`. Evite logar a mesma falha em todas as camadas.

## Segurança ligada ao runtime

- dynamic code (`eval`, `new Function`) amplia injection e impede algumas otimizações;
- prototype mutation/pollution pode alterar comportamento longe da entrada;
- regex de backtracking catastrófico pode bloquear o agent;
- JSON/strings gigantes e fan-out ilimitado causam denial of service;
- side-channel e sandbox escape exigem atualização da engine e isolamento em profundidade;
- no browser, same-origin policy, CSP e cross-origin isolation condicionam recursos.

Limite tamanho, tempo, concorrência e memória em toda fronteira.

## Experimentos guiados

### 1. Ordem de jobs

Combine script, `queueMicrotask`, Promise, timer e I/O. Preveja a ordem, execute em browser e Node.js, depois explique diferenças pela documentação do host.

### 2. Retenção por listener

Crie e remova milhares de listeners que capturam payloads. Compare heap snapshots antes/depois e identifique o retaining path. Não use `global.gc()` como “correção”.

### 3. Event-loop lag

Execute um loop CPU-bound crescente ao mesmo tempo que um timer periódico. Registre drift. Depois mova o cálculo para um worker pool e compare throughput, p99 e overhead.

### 4. Backpressure

Produza dados mais rápido do que o consumidor. Primeiro permita fila ilimitada; depois aplique limite/buffer. Observe RSS e tempo total.

## Checklist de revisão

- [ ] Distingo garantia ECMAScript, implementação de engine e API do host.
- [ ] Explico stack, heap, closure e reachability sem dizer que variáveis “somem”.
- [ ] Prevejo tasks/microtasks e reconheço starvation.
- [ ] Sei quando worker oferece paralelismo e qual seu custo.
- [ ] Investigo retenção com snapshots e paths até roots.
- [ ] Faço benchmark com warm-up e distribuição apropriados.
- [ ] Correlaciono runtime metrics com sintomas de aplicação.

## Fontes primárias

- [ECMAScript specification](https://tc39.es/ecma262/)
- [HTML — Event loops](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops)
- [V8 documentation](https://v8.dev/docs)
- [Node.js — The event loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick)
- [MDN — Memory management](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Memory_management)

---

[← Fundamentos](fundamentals.md) · [↑ JavaScript](README.md) · [→ Exercícios](exercises.md)
