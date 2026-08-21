# Kotlin

---

[← Go](../golang/README.md) · [↑ Linguagens](../README.md) · [→ Fundamentos](fundamentals.md)

Kotlin combina tipos estáticos expressivos, interoperabilidade com Java e suporte multiplataforma. Esta trilha prioriza Kotlin/JVM para tornar runtime e operação concretos, sinalizando onde Native, JS, Wasm e Multiplatform mudam o modelo.

## O que é

Kotlin é uma linguagem statically typed, general purpose e multi-paradigma criada pela JetBrains. Oferece type inference, null safety, funções de primeira classe, classes, sealed hierarchies, extension functions e suporte de linguagem a suspend functions.

Ela pode ser compilada para JVM bytecode, JavaScript, WebAssembly e targets nativos. “Como Kotlin funciona” depende, portanto, do backend e runtime escolhidos.

## Para que serve

- aplicações Android e bibliotecas mobile;
- serviços backend no ecossistema JVM;
- compartilhamento seletivo de domínio e infraestrutura com Kotlin Multiplatform;
- aplicações desktop com Compose e tooling JVM;
- CLIs e automações em ambientes onde o runtime/distribuição são aceitáveis;
- libraries interoperáveis com Java.

## Quando utilizar

Use quando a plataforma JVM/Android já é estratégica, quando null safety e concisão melhoram um domínio Java ou quando compartilhar código multiplataforma oferece valor mensurável. É forte em equipes que dominam Gradle, JVM e structured concurrency.

## Quando não utilizar

Avalie alternativas para browser-first sem necessidade Kotlin, hard real-time, artefatos mínimos com startup estritamente limitado ou compartilhamento multiplataforma que force abstrair UI/plataforma de modo artificial. Kotlin/Native e ahead-of-time targets mudam trade-offs, mas não tornam automaticamente todo package JVM portátil.

Evite adotar apenas por sintaxe se a equipe não puder operar o runtime, controlar build e tratar interoperabilidade.

## Como funciona

O compiler analisa source, resolve types e produz uma intermediate representation consumida pelo backend. Em Kotlin/JVM, o resultado é JVM bytecode e metadata Kotlin; classes rodam sobre class loading, JIT/AOT, threads e garbage collector da JVM. O standard library e dependencies continuam parte do artefato.

Suspend functions são transformadas em state machines/continuations. A library `kotlinx.coroutines` fornece scopes, dispatchers, cancellation, channels e Flow; coroutine não é sinônimo de thread. Veja [Internals](internals.md).

## Conceitos fundamentais

- `val`/`var`, type inference e expressions;
- nullable types, safe calls, Elvis e smart casts;
- functions, named/default parameters, lambdas e receivers;
- classes, data/value classes, objects e interfaces;
- collections read-only versus mutable;
- generics, variance e star projections;
- exceptions, `Result` com limitações e domain results;
- packages, modules, Gradle/Maven e source sets.

O capítulo [Fundamentos](fundamentals.md) usa exemplos JVM sem esconder diferenças de target.

## Conceitos intermediários

- sealed classes/interfaces e exhaustive `when`;
- extension functions e resolução estática;
- delegation de interface e delegated properties;
- scope functions com uso disciplinado;
- sequences versus eager collections;
- Java interoperability, platform types e SAM conversions;
- suspending APIs, structured concurrency e Flow;
- testes com clocks/dispatchers/dependencies controláveis.

## Conceitos avançados

- inline functions, `reified` type parameters e custo de code size;
- declaration-site/use-site variance;
- contracts e seus limites;
- coroutine context, dispatcher, cancellation e exception propagation;
- channels, shared state, `StateFlow`/`SharedFlow` e backpressure;
- bytecode, boxing de value classes e reflection;
- Multiplatform source sets, `expect`/`actual` e API portability;
- Kotlin/Native memory management e interoperabilidade com Swift/Objective-C;
- compiler plugins/code generation com política de compatibilidade.

## Internals

No target JVM, source Kotlin e Java pode compartilhar o mesmo runtime, mas assinatura Kotlin carrega nullability e outros detalhes em metadata/annotations que Java pode contornar. Lambdas, defaults, extension functions, coroutines e inline constructs possuem representações de bytecode que afetam stack traces, ABI e performance.

No Native, o runtime e GC são próprios; no JS/Wasm, integração e memory semantics mudam. O [capítulo de internals](internals.md) separa garantias da linguagem, transformações do compiler e plataforma.

## Ecossistema

- **Build:** Gradle é o caminho mais comum; Maven também atende Kotlin/JVM.
- **Concurrency:** `kotlinx.coroutines` e Flow.
- **Backend:** Ktor, Spring e bibliotecas JVM.
- **Mobile:** Android, Jetpack Compose e Kotlin Multiplatform.
- **Serialization:** libraries/codegen que exigem schema/versionamento explícitos.
- **Test:** `kotlin.test`, JUnit no JVM e libraries especializadas conforme necessidade.

Não adote um plugin por conveniência isolada. Compiler/Gradle plugins têm acesso ao build, impõem matriz de versões e ampliam supply chain.

## Boas práticas

- torne estados inválidos não representáveis com sealed types e value objects;
- prefira `val`, funções pequenas e side effects nas bordas;
- aceite interfaces mínimas e retorne valores concretos;
- use `?.` quando ausência é válida; não espalhe `!!` para silenciar design incompleto;
- mantenha scopes estruturados e propague cancellation;
- escolha dispatcher pelo tipo de trabalho e isole APIs blocking;
- preserve exceptions de cancellation e causa original;
- exponha Java-friendly API deliberadamente quando houver consumers Java;
- fixe toolchain/dependencies e use build cache apenas com inputs corretos;
- profile antes de trocar collection por sequence ou adicionar `inline`.

## Anti-patterns

- `GlobalScope` ou scopes sem owner/lifecycle;
- capturar `CancellationException` e convertê-la em falha comum;
- `runBlocking` dentro de request handlers/suspend functions;
- lançar coroutine e ignorar `Job`/falha;
- usar `Dispatchers.IO` como correção universal ou criar pools ilimitados;
- cadeias de scope functions que escondem receiver e side effect;
- `!!`, casts e platform types vazando pela camada de domínio;
- data class mutável usada como entity/cache key;
- abstrair APIs platform-specific só para aumentar percentual de shared code;
- benchmark sem warm-up na JVM ou sem considerar allocation/GC.

## Performance

Em JVM, meça warm-up, JIT, allocation rate, heap/GC, CPU e p99. Use JMH para microbenchmarks quando apropriado e um load test para sistema. Sequences evitam intermediários em pipelines grandes, mas têm dispatch/objects e podem perder para collections em dados pequenos.

Coroutines reduzem custo de espera, não o trabalho CPU. Limite concorrência, evite bloquear dispatcher inadequado e monitore queues. Kotlin/Native, Android e Wasm exigem ferramentas e baselines próprios.

## Segurança

Null safety não valida input, autorização ou protocolo. Trate JSON/database/Java como fronteiras: parse, valide e normalize antes do domínio. Platform types (`String!`) exigem checagem explícita quando contrato Java não é confiável.

Use queries parametrizadas, output encoding e proteção a SSRF/path traversal conforme aplicação. Não deserialize types arbitrários. Proteja credentials do Gradle/repositories, verifique dependências/plugins e mantenha JVM, Kotlin e libraries atualizados.

## Testes

- funções puras e value objects com testes unitários;
- adapters JVM/database/network com integração real ou testcontainer quando justificar;
- contracts entre consumer/provider;
- coroutine tests com virtual time e dispatcher controlado;
- concurrency stress tests para races que exemplos determinísticos não cobrem;
- end-to-end para poucos fluxos críticos e target tests no Multiplatform.

Não use `Thread.sleep` para “esperar coroutine” em teste. `runTest` e fakes controláveis tornam tempo/cancellation verificáveis. Teste Java interoperability se a API for pública para Java.

## Observabilidade

Na JVM, combine logs estruturados, Micrometer/OpenTelemetry conforme stack, JFR, metrics de heap/GC/threads e traces. Coroutine pode mudar de thread; thread-local/MDC precisa de context propagation suportada, e nomes de coroutine não substituem correlation ID.

Monitore duração, error rate, saturation do pool/dispatcher, queues e cancellation. Redija PII e evite cardinalidade por user/order ID em labels.

## Exemplos

Uma sealed hierarchy torna o resultado exaustivo:

```kotlin
@JvmInline
value class OrderId private constructor(val value: String) {
    companion object {
        fun parse(raw: String): OrderId {
            require(raw.matches(Regex("ord_[a-z0-9]+"))) { "OrderId inválido" }
            return OrderId(raw)
        }
    }
}

data class Order(val id: OrderId)

sealed interface LookupResult {
    data class Found(val order: Order) : LookupResult
    data object NotFound : LookupResult
    data class Unavailable(val cause: Throwable) : LookupResult
}

fun describe(result: LookupResult): String = when (result) {
    is LookupResult.Found -> "pedido ${result.order.id.value}"
    LookupResult.NotFound -> "não encontrado"
    is LookupResult.Unavailable -> "indisponível: ${result.cause.message}"
}
```

O constructor privado concentra a invariant, mas o adapter de entrada ainda limita tamanho e trata exceptions. Decida se guardar `Throwable` no domínio é aceitável; uma error taxonomy sem stack pode ser melhor entre camadas.

## Exercícios

Os [exercícios](exercises.md) percorrem Beginner, Intermediate, Advanced e Expert. Eles cobrem null safety, collections, generics, Java interop, coroutines, Flow, profiling, Multiplatform e compatibilidade de library.

Entregue testes, Gradle Wrapper, dependency verification/locking quando aplicável e explicação do target.

## Projeto prático

Construa um **processador de pedidos resiliente em Kotlin/JVM**:

- API validada e domain model com money/IDs/estados;
- PostgreSQL ou storage fake com idempotência transacional;
- chamadas concorrentes limitadas a inventory/payment;
- structured concurrency, deadline, cancellation e compensação explícita;
- outbox para eventos ou justificativa de alternativa;
- testes de unidade, integração, contract e failure injection;
- logs, metrics, traces, JFR baseline e runbook;
- threat model e SBOM/dependency policy.

Como extensão, extraia apenas value objects/regras portáveis para um módulo Multiplatform e meça se o compartilhamento simplifica de fato.

## Perguntas de entrevista

1. Qual a diferença entre nullable type e platform type?
2. `val` torna um object imutável?
3. Como extension functions são resolvidas?
4. Quando `inline`/`reified` são úteis e qual o custo?
5. Como declaration-site variance (`out`/`in`) expressa producer/consumer?
6. Como suspend function é executada sem ser uma thread?
7. O que structured concurrency garante sobre lifecycle e falhas?
8. Como cancellation se propaga e por que não deve ser engolida?
9. Como investigar allocation, GC ou dispatcher starvation na JVM?
10. O que pode e não pode ir para `commonMain` em Multiplatform?

Boas respostas diferenciam linguagem, library, compiler e target runtime.

## Comparações

- **Java:** mesma JVM e enorme interoperabilidade; Kotlin reduz ceremony e modela nullability, adicionando compiler/plugin/ABI considerations.
- **Go:** Go favorece toolchain simples e binários; Kotlin oferece types mais expressivos e ecossistema JVM/Android.
- **TypeScript:** ambos têm inference/unions em estilos distintos; TS é estrutural e erased sobre JS, Kotlin é majoritariamente nominal e target-dependent.
- **Python:** Python acelera scripts/dados; Kotlin oferece static types e throughput JVM, com build/runtime mais pesados.

Veja a [comparação geral](../comparison.md).

## Próximos estudos

1. [Fundamentos](fundamentals.md).
2. [JVM, compiler e coroutines internals](internals.md).
3. [Exercícios e projeto](exercises.md).
4. Java/JVM memory model, bytecode, JIT, GC e JFR.
5. structured concurrency, Flow e sistemas distribuídos.
6. Android/Compose ou backend Ktor/Spring conforme objetivo.
7. Multiplatform apenas após dominar os contracts de cada target.

## Livros

- Jemerov, Isakova, Aigner e Elizarov, [*Kotlin in Action, Second Edition*](https://www.manning.com/books/kotlin-in-action-second-edition) — linguagem e práticas modernas.
- Bruce Eckel e Svetlana Isakova, [*Atomic Kotlin*](https://www.atomickotlin.com/) — prática incremental, com material dos autores.

## Papers

- Koval, Alistarh e Elizarov, [*Fast and Scalable Channels in Kotlin Coroutines*](https://doi.org/10.1145/3572848.3577481) — implementação e trade-offs de channels.
- Brockbernd et al., [*Understanding Concurrency Bugs in Real-World Programs with Kotlin Coroutines*](https://doi.org/10.4230/LIPIcs.ECOOP.2024.8) — estudo de padrões reais de falhas.

## Documentação oficial

- [Kotlin documentation](https://kotlinlang.org/docs/home.html)
- [Kotlin language specification](https://kotlinlang.org/spec/)
- [Coroutines guide](https://kotlinlang.org/docs/coroutines-guide.html)
- [Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform.html)
- [Kotlin/Native](https://kotlinlang.org/docs/native-overview.html)

## Outras referências

A curadoria em [Referências](references.md) inclui JVM, Gradle, Java interop, Android, backend, testing, performance e segurança.

---

[← Go](../golang/README.md) · [↑ Linguagens](../README.md) · [→ Fundamentos](fundamentals.md)
