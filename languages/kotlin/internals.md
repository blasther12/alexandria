# Kotlin — internals

---

[← Fundamentos](fundamentals.md) · [↑ Kotlin](README.md) · [→ Exercícios](exercises.md)

Kotlin não possui um único runtime. Primeiro escolha o target; depois relacione linguagem, compiler, libraries e plataforma. Este capítulo aprofunda JVM e contrasta os demais backends.

## Pipeline do compiler

Um modelo conceitual:

```text
Kotlin source + dependencies + compiler options
                    ↓
frontend: parse, symbols, resolution, inference, diagnostics
                    ↓
Kotlin intermediate representation (IR) + lowerings
                    ↓
backend JVM | JS | Wasm | Native
                    ↓
bytecode   | JS | Wasm module | native binary/object
```

O frontend e a infraestrutura mudam entre versões, mas o princípio permanece: types são verificados antes de um backend gerar artefatos específicos. Compiler plugins podem participar do pipeline e devem ser tratados como dependência fortemente acoplada à versão.

## Kotlin/JVM: do arquivo à classe

Top-level functions/properties precisam de representação JVM e normalmente são colocadas em classes sintéticas relacionadas ao file. Classes Kotlin viram class files; properties podem gerar fields, getters/setters ou apenas accessors conforme declaração. `object` implementa singleton por estrutura gerada.

Detalhes de nomes e otimizações não são public API, exceto quando fazem parte da ABI observada por Java/reflection. Para investigar:

```text
./gradlew compileKotlin
javap -c -p build/classes/kotlin/main/example/ExampleKt.class
```

Use o path real do build. O bytecode viewer/decompiler ajuda a aprender, mas Java decompilado é aproximação, não source original.

## Metadata e nullability

Class files podem carregar Kotlin metadata e annotations. Compilers/tools Kotlin usam isso para reconstruir signatures, nullability e constructs que JVM bytecode sozinho não expressa.

Código Java pode ignorar contratos Kotlin:

- retornar `null` onde Kotlin esperava non-null;
- passar mutable collection por interface read-only;
- chamar API em ordem que quebra invariant;
- lançar checked exception não declarada ao Kotlin.

Java sem annotations confiáveis produz platform types (`T!` no modelo do tooling). O developer escolhe uso nullable/non-null, assumindo risco. Normalize em adapters e teste interoperabilidade nos dois sentidos.

## Functions e lambdas na JVM

Uma function type como `(A) -> B` tem representação por interfaces/function objects e mecanismos de geração que podem variar. Capturing lambda precisa guardar captured values; non-capturing pode ser reutilizada/otimizada. SAM conversion integra interfaces Java/Kotlin `fun interface`.

Higher-order code pode alocar, mas JIT/inline transformam alguns casos. Não deduza allocation apenas do source nem aplique `inline` a tudo; confirme com JFR/profiler/benchmark.

### Extension functions

Extension não modifica a classe nem faz dispatch virtual por receiver extension. Em JVM, comporta-se essencialmente como função estática cujo receiver é parâmetro, salvo detalhes de generation. Member dispatch e extension resolution coexistem; member normalmente vence quando assinatura colide.

### Default arguments

O compiler gera mecanismos auxiliares para default parameters nas chamadas Kotlin. Java callers não obtêm overloads automaticamente; `@JvmOverloads` gera alguns e aumenta ABI/method count. Para library, desenhe a superfície Java explicitamente.

## Data, sealed e value classes

### Data classes

O compiler gera `equals`, `hashCode`, `toString`, `componentN` e `copy` com base no primary constructor. `copy` é shallow. Um field mutável dentro do object continua compartilhado, e `copy` não preserva invariants além das executadas pelo constructor.

### Sealed hierarchies

O compiler conhece subclasses permitidas sob as regras da linguagem e pode verificar `when` exaustivo. Reflection/deserialization remota ainda pode encontrar version mismatch; valide discriminants antes de instanciar o tipo interno.

### Value classes

Value class pode ser representada sem wrapper em alguns usos e boxed em outros — generics, nullable, interfaces e boundaries podem exigir wrapper. Não prometa “zero allocation” sem verificar o bytecode e profile do caminho real. Mudanças no underlying type impactam ABI/serialization.

## Generics e erasure na JVM

JVM normalmente apaga type arguments. `List<String>` e `List<Int>` compartilham raw runtime class; nested checks completos não são possíveis por `is List<String>`.

Declaration-site `out`/`in` é traduzida para constraints do checker e, quando necessário, wildcards/signatures JVM. `@JvmSuppressWildcards`/`@JvmWildcard` alteram interoperabilidade; use depois de testar Java source.

```kotlin
inline fun <reified T> decode(text: String, decoder: (String, Class<T>) -> T): T =
    decoder(text, T::class.java)
```

`reified` funciona porque a inline function insere acesso ao type token no call site. Ainda não recupera, por exemplo, `String` dentro de um `List<String>` apenas via `List::class.java`.

## Inline functions

Inline copia body/lambdas elegíveis no call site, habilita non-local returns e `reified`. Benefícios possíveis: remover function/lambda overhead e permitir API expressiva. Custos: code size, stack traces/source mapping menos intuitivos, recompilation/ABI considerations e debugging.

`noinline` mantém lambda como valor; `crossinline` proíbe non-local return onde execução não é direta. Só aplique depois de entender semantics, não como annotation de performance automática.

## Delegated properties

`by lazy`, observable properties e delegates customizados traduzem get/set para protocol methods. `lazy` possui thread-safety modes; escolher modo inadequado pode adicionar sincronização ou races. Delegate captura objects e pode prolongar lifetime.

Inspecione initialization order e não faça I/O invisível em property getter; observabilidade e failure handling ficam ruins.

## Coroutines: suporte da linguagem e library

Kotlin fornece `suspend` e primitives de continuation. `kotlinx.coroutines` fornece builders, `Job`, dispatchers, scopes, channels, Flow e políticas. Separar os dois evita chamar coroutine de “green thread do compiler”.

### Continuation e state machine

Conceitualmente, uma suspend function recebe uma `Continuation<T>` adicional e retorna resultado ou marker de suspensão. O compiler transforma pontos de suspensão em states com locals necessários preservados:

```text
state 0: inicia request
         se suspender → retorna marker
state 1: retoma com resultado/exception
         processa e conclui continuation
```

Se a chamada conclui imediatamente, talvez não haja suspensão efetiva. Esses detalhes explicam stack traces e allocation, mas não devem ser manipulados no domínio.

### Coroutine context e dispatcher

`CoroutineContext` combina elementos como `Job`, dispatcher, name e context elements. O dispatcher decide onde uma continuation elegível executa; ele não torna operações blocking automaticamente non-blocking.

- CPU-bound: dispatcher/pool compatível com CPU e parallelism limitado;
- blocking I/O: adapter/pool destinado a blocking e limites do recurso;
- UI: dispatcher main e lifecycle;
- tests: scheduler/dispatcher controlado.

Mudar de dispatcher excessivamente adiciona scheduling. Meça e mantenha responsibility clara na camada que conhece o blocking behavior.

### Structured concurrency

`coroutineScope` cria parent que só conclui após children. O `Job` forma hierarchy; cancellation desce e falhas normalmente cancelam siblings/parent conforme builder/scope.

- `launch` comunica failure ao hierarchy/handler;
- `async` guarda outcome em `Deferred`, observado por `await`, sem remover as regras de parent failure;
- `supervisorScope` isola failure de um child dos siblings, mas cada falha ainda precisa ser observada;
- scopes devem ter owner e método de cancelamento.

Não escolha supervisor apenas para “continuar apesar de erro”; defina semantics de falha parcial.

### Cancellation

Cancellation é cooperativa. Suspend points de libraries normalmente verificam; CPU loop precisa cooperar (`ensureActive`, `yield` ou estrutura apropriada). Cleanup usa `finally`; trabalho suspending indispensável durante cleanup pode exigir contexto non-cancellable curto e limitado.

```kotlin
try {
    operation()
} catch (error: kotlinx.coroutines.CancellationException) {
    throw error
} catch (error: Exception) {
    recordFailure(error)
}
```

Capturar `Exception` sem preservar `CancellationException` pode transformar shutdown em trabalho zumbi. Timeout é cancellation com escopo; não confunda com timeout do socket/upstream.

## Channels e Flow

Channel oferece comunicação e buffers. Capacidade zero faz rendezvous; buffers mudam throughput, memória e semantics. Unlimited channel sem backpressure transforma pico em heap growth. Defina quem fecha, como errors/cancellation propagam e se múltiplos consumers preservam ordering necessário.

`Flow` é cold e sequential por default; cada collect executa producer. `StateFlow` e `SharedFlow` são hot e possuem replay/buffer semantics. Operators como `buffer`, `conflate`, `flatMapMerge` e `flowOn` mudam concurrency/ordering/backpressure — use-os com teste de carga e temporal.

## Threads e Java Memory Model

Na JVM, coroutines executam sobre threads e obedecem ao Java Memory Model. Suspender/retomar não torna acesso shared state atomic. Use confinement, immutable messages, locks, atomics ou concurrency primitives com happens-before apropriado.

`@Volatile` dá visibility/ordering para field, não atomicidade de operações compostas (`counter++`). `Mutex` suspende coroutine; `synchronized` bloqueia thread. A escolha depende de critical section e interoperability.

ThreadLocal/MDC não acompanha coroutine automaticamente se ela muda de thread. Use context element/instrumentation suportada e teste propagation.

## JVM runtime

### Class loading e startup

Class loading, verification, initialization e framework scanning afetam startup. Static/object initialization com I/O cria falha e latência ocultas. Cold start e steady state são métricas diferentes.

### JIT e profiles

A JVM interpreta/compila hot methods com base em profiles e pode deoptimize. Warm-up, class hierarchy e allocation escape influenciam resultado. Benchmark de função isolada deve usar JMH para evitar dead-code elimination e outros pitfalls.

### Heap e garbage collectors

Objects alcançáveis por roots permanecem live. Escolha/tuning de GC depende da JVM e SLO; nenhum collector compensa cache/fila sem limite. Meça allocation rate, live set, pauses, concurrent cycles e RSS/container limit.

Strings, boxing, collection pipelines, coroutines suspensas e captured lambdas podem contribuir para allocation. Procure retained path e hot allocation, não culpe “Kotlin” genericamente.

## Diagnóstico na JVM

- **JFR/JDK Mission Control:** eventos de CPU, allocation, locks, threads, GC e I/O;
- **async-profiler:** CPU, wall-clock, allocation e lock profiles conforme ambiente;
- **heap dump/analyzer:** dominators e paths até GC roots;
- **`jstack`/thread dump:** deadlocks e blocking;
- **coroutine debug tooling:** jobs/stacks lógicas em ambientes de diagnóstico;
- **Gradle/Kotlin build reports:** compilation/build performance.

Profiles podem conter source names, arguments ou dados sensíveis. Colete com autorização e retenção limitada.

## Reflection e serialization

Kotlin reflection requer library/capability conforme target e pode aumentar startup/size. Java reflection vê representação JVM, não toda intenção Kotlin. Shrinkers/AOT/native images exigem configuration para reflection.

Serialization baseada em compiler plugin gera código/metadata e possui compatibilidade própria. Nunca deserialize class arbitrária a partir de input. Versione schemas, limite tamanho/profundidade e teste unknown/missing fields.

## Build, ABI e incremental compilation

Mudança de public/internal-inline declaration pode invalidar consumers. Compile avoidance e incremental build dependem de inputs e ABI corretos. Annotation processing/compiler plugins podem ampliar recompilação.

Use build scans/reports para separar configuration, dependency resolution, Kotlin compilation, Java compilation, tests e packaging. Cache remoto requer controle de secrets e confiança nos artifacts.

Library authors devem testar binary compatibility e consumers Java/Kotlin. Default parameters, inline functions, metadata e target version tornam “assinatura source igual” uma análise insuficiente.

## Kotlin/Native

Kotlin/Native usa compiler ahead-of-time, runtime e automatic memory manager próprios; não possui JIT da JVM. Interop com Objective-C/Swift e ARC cria ownership/lifetime boundaries. Threads, GC behavior, binary size, startup e debugging devem ser medidos no target.

Não aplique tuning/assumptions de HotSpot ao Native. Consulte a documentação de memory management da versão usada.

## Kotlin/JS e Wasm

Kotlin/JS gera JavaScript e integra module/package ecosystem JS. O runtime efetivo é browser/Node/outro host; bundle, source maps, interop e event loop importam. Kotlin/Wasm gera módulos Wasm com interfaces e maturidade específicas do target.

Types Kotlin não validam JavaScript/DOM/network. Adapters externos e declarations precisam de testes no host.

## Kotlin Multiplatform

Source sets formam hierarchy. `commonMain` enxerga APIs comuns e libraries multiplataforma; source sets de plataforma implementam integrações. `expect`/`actual` expressa contrato platform-specific, mas compartilhar implementação pode esconder semantics diferentes de threads, clocks, filesystem e crypto.

Otimize para coerência de produto/manutenção, não percentual máximo de linhas compartilhadas. Teste cada target e mantenha erro/observabilidade adequados a ele.

## Performance: método

1. declare target, versions, hardware e SLO;
2. reproduza com workload/dataset realista;
3. separe cold start, warm-up e steady state;
4. capture profile/allocations/GC/dispatcher queues;
5. mude uma hipótese por vez;
6. repita distribuição, não apenas média;
7. valide impacto em legibilidade e portability.

Armadilhas comuns: comparar JVM aquecida com processo frio, benchmark sem consumir resultado, executar JMH por test runner comum e usar `measureTimeMillis` como prova final.

## Segurança em internals

- reflection/deserialization amplia reachable code/types;
- platform types e casts deslocam null/type errors para runtime;
- regex/input CPU-bound pode monopolizar dispatcher;
- coroutine/channel sem limite permite resource exhaustion;
- build/compiler plugins executam com privilégios do CI;
- stack traces, heap dumps e source maps podem vazar dados;
- native/JS interop quebra assumptions de memory/type safety nas fronteiras.

Use isolation, limits, updates e least privilege; tipos da linguagem são uma camada, não threat model completo.

## Experimentos guiados

### 1. Bytecode tour

Compile top-level function, extension, data class, value class, defaults e lambda. Rode `javap -c -p`; identifique wrappers, helper methods e captures. Repita ao mudar target/toolchain.

### 2. Suspend state machine

Crie suspend function com dois suspension points e `try/finally`. Inspecione decompiled bytecode e stack trace em failure/cancellation. Explique states sem depender do nome de fields gerados.

### 3. Dispatcher starvation

Misture CPU loop, blocking call e delay sob carga controlada. Observe thread/queue/latency. Isole cada classe de trabalho com limites e compare p99, CPU e throughput.

### 4. Collection versus sequence

Compare small/large datasets, short-circuit e pipelines diferentes usando JMH. Registre allocation e não generalize um vencedor.

### 5. Platform type

Crie Java API sem null annotations que retorna `null`; consuma de Kotlin, normalize no adapter e escreva contract test em Java e Kotlin.

### 6. Multiplatform semantic audit

Implemente clock/random/storage abstractions em dois targets. Liste onde contratos divergem e se `expect`/`actual`, interface ou código platform-specific é mais honesto.

## Checklist de revisão

- [ ] Sei qual backend/runtime executa cada módulo.
- [ ] Explico metadata, platform types, erasure e boxing.
- [ ] Consigo relacionar `suspend` a continuation/state machine.
- [ ] Modelo Job hierarchy, failure, supervision e cancellation.
- [ ] Não confundo coroutine com thread nem Flow com queue ilimitada.
- [ ] Investigo JVM com JFR/profile/heap/thread data.
- [ ] Avalio ABI, build plugins e target compatibility.
- [ ] Separo assumptions JVM, Native e JS/Wasm.

## Fontes primárias

- [Kotlin specification](https://kotlinlang.org/spec/)
- [Coroutines specification section](https://kotlinlang.org/spec/asynchronous-programming-with-coroutines.html)
- [Coroutines guide](https://kotlinlang.org/docs/coroutines-guide.html)
- [Kotlin/JVM interoperability](https://kotlinlang.org/docs/java-interop.html)
- [Kotlin/Native memory management](https://kotlinlang.org/docs/native-memory-manager.html)
- [Kotlin Multiplatform source sets](https://kotlinlang.org/docs/multiplatform-discover-project.html)

---

[← Fundamentos](fundamentals.md) · [↑ Kotlin](README.md) · [→ Exercícios](exercises.md)
