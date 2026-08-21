# Kotlin — referências

---

[← Exercícios](exercises.md) · [↑ Kotlin](README.md) · [→ Comparação](../comparison.md)

Priorize a documentação do target e da versão fixada. Kotlin/JVM, Native, JS e Wasm compartilham linguagem, mas não runtime, libraries nem perfil operacional. Links revisados em 2026-08-21.

## Linguagem e especificação

- [Kotlin Language Specification](https://kotlinlang.org/spec/) — gramática e semântica formal disponível.
- [Basic syntax](https://kotlinlang.org/docs/basic-syntax.html) — tour inicial.
- [Idioms](https://kotlinlang.org/docs/idioms.html) — padrões concisos; escolha legibilidade sobre densidade.
- [Coding conventions](https://kotlinlang.org/docs/coding-conventions.html) — estilo oficial.
- [Keyword and operator reference](https://kotlinlang.org/docs/keyword-reference.html) — consulta de syntax.
- [Kotlin evolution principles](https://kotlinlang.org/docs/kotlin-evolution-principles.html) — source, binary e behavioral compatibility; complemente com o guia da release usada.
- [What's new](https://kotlinlang.org/docs/whatsnew.html) — índice de releases; confirme versão do projeto.

## Types e modelagem

- [Basic types](https://kotlinlang.org/docs/basic-types.html) — numbers, booleans, characters, strings e arrays.
- [Null safety](https://kotlinlang.org/docs/null-safety.html) — nullable types e fontes restantes de NPE.
- [Classes](https://kotlinlang.org/docs/classes.html) e [data classes](https://kotlinlang.org/docs/data-classes.html) — modelo OO e generated members.
- [Sealed classes and interfaces](https://kotlinlang.org/docs/sealed-classes.html) — closed hierarchies/exhaustiveness.
- [Inline value classes](https://kotlinlang.org/docs/inline-classes.html) — representation e boxing considerations.
- [Generics](https://kotlinlang.org/docs/generics.html) — declaration/use-site variance e projections.
- [Extensions](https://kotlinlang.org/docs/extensions.html) — resolução estática e scope.
- [Delegation](https://kotlinlang.org/docs/delegation.html) e [delegated properties](https://kotlinlang.org/docs/delegated-properties.html) — composition/protocols.
- [Inline functions](https://kotlinlang.org/docs/inline-functions.html) — non-local returns e reified parameters.
- [Type-safe builders](https://kotlinlang.org/docs/type-safe-builders.html) — DSLs e `@DslMarker`.

## Collections e I/O

- [Collections overview](https://kotlinlang.org/docs/collections-overview.html) — read-only/mutable interfaces.
- [Collection operations](https://kotlinlang.org/docs/collection-operations.html) — transformations, filters e grouping.
- [Sequences](https://kotlinlang.org/docs/sequences.html) — lazy pipelines e overhead.
- [Ranges and progressions](https://kotlinlang.org/docs/ranges.html) — iteration contracts.
- [Java I/O/NIO documentation](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/nio/file/package-summary.html) — APIs do target JVM; ajuste para o JDK suportado.

APIs Java não existem automaticamente em `commonMain`/Native/JS.

## Java/JVM interoperability

- [Calling Java from Kotlin](https://kotlinlang.org/docs/java-interop.html) — platform types, checked exceptions, SAM e signatures.
- [Calling Kotlin from Java](https://kotlinlang.org/docs/java-to-kotlin-interop.html) — desenho de APIs Java-friendly.
- [Mapping Kotlin to Java](https://kotlinlang.org/docs/java-to-kotlin-interop.html) — use as ponto de partida e inspecione bytecode/signatures.
- [Java Virtual Machine Specification](https://docs.oracle.com/javase/specs/jvms/se21/html/) — class files, bytecode e runtime JVM (edição ligada ao JDK 21).
- [Java Language Specification, Memory Model](https://docs.oracle.com/javase/specs/jls/se21/html/jls-17.html) — threads, happens-before e data races.
- [JDK `javap`](https://docs.oracle.com/en/java/javase/21/docs/specs/man/javap.html) — inspeção de class files.

Se o projeto usa outro JDK, consulte sua edição da especificação/API.

## Coroutines e Flow

- [Coroutines overview](https://kotlinlang.org/docs/coroutines-overview.html) — suporte de linguagem versus `kotlinx.coroutines`.
- [Coroutines basics](https://kotlinlang.org/docs/coroutines-basics.html) — suspension, scopes e builders.
- [Coroutines guide](https://kotlinlang.org/docs/coroutines-guide.html) — índice completo.
- [Cancellation and timeouts](https://kotlinlang.org/docs/cancellation-and-timeouts.html) — cooperação e cleanup.
- [Coroutine context and dispatchers](https://kotlinlang.org/docs/coroutine-context-and-dispatchers.html) — scheduling/context.
- [Exception handling](https://kotlinlang.org/docs/exception-handling.html) — propagation, handlers e supervision.
- [Shared mutable state and concurrency](https://kotlinlang.org/docs/shared-mutable-state-and-concurrency.html) — confinement, atomics e mutex.
- [Asynchronous Flow](https://kotlinlang.org/docs/flow.html) — cold flow, operators, buffering e exceptions.
- [`kotlinx.coroutines` API](https://kotlinlang.org/api/kotlinx.coroutines/) — contratos da library.
- [`kotlinx.coroutines` source](https://github.com/Kotlin/kotlinx.coroutines) — implementation, issues e changelog.

Leia a documentação correspondente à versão fixada de `kotlinx.coroutines`; comportamento operacional evolui.

## Build e dependências

- [Configure a Gradle project](https://kotlinlang.org/docs/gradle-configure-project.html) — Kotlin Gradle plugin, toolchains e dependencies.
- [Gradle best practices for Kotlin](https://kotlinlang.org/docs/gradle-best-practices.html) — configuração e performance.
- [Kotlin Gradle plugin compilation and caches](https://kotlinlang.org/docs/gradle-compilation-and-caches.html) — incremental compilation e reports.
- [Gradle Kotlin DSL](https://docs.gradle.org/current/userguide/kotlin_dsl.html) — build scripts tipados.
- [Gradle dependency locking](https://docs.gradle.org/current/userguide/dependency_locking.html) — reproducible dependency resolution.
- [Gradle dependency verification](https://docs.gradle.org/current/userguide/dependency_verification.html) — checksums/signatures e trust bootstrap.
- [Gradle toolchains](https://docs.gradle.org/current/userguide/toolchains.html) — JDK declarativo.
- [Maven Kotlin plugin](https://kotlinlang.org/docs/maven.html) — alternativa para Kotlin/JVM.

Gradle Wrapper e plugin versions fazem parte do source. Builds executam código de plugins: use least privilege no CI.

## Testing

- [`kotlin.test`](https://kotlinlang.org/api/core/kotlin-test/) — API multiplataforma de assertions/tests.
- [`kotlinx-coroutines-test`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-test/) — virtual time e test dispatchers.
- [JUnit 5 User Guide](https://junit.org/junit5/docs/current/user-guide/) — runner/ecossistema comum no JVM.
- [Gradle test execution](https://docs.gradle.org/current/userguide/java_testing.html) — suites, filters e reports no JVM.
- [Java Compatibility Kit (`jcstress`)](https://github.com/openjdk/jcstress) — harness OpenJDK para concurrency tests JVM.

Use real dispatcher/database/network em testes de integração selecionados; virtual time não reproduz races de threads automaticamente.

## Performance e diagnóstico JVM

- [Java Flight Recorder](https://docs.oracle.com/en/java/javase/21/jfapi/) — API/eventos JFR; use tooling da sua distribuição JDK.
- [JDK Mission Control](https://www.oracle.com/java/technologies/jdk-mission-control.html) — análise de recordings JFR.
- [JMH](https://github.com/openjdk/jmh) — harness OpenJDK para microbenchmarks JVM.
- [async-profiler](https://github.com/async-profiler/async-profiler) — profiler comunitário amplamente usado para CPU/allocation/locks.
- [Gradle performance](https://docs.gradle.org/current/userguide/performance.html) — build profiling, cache e configuration.
- [Kotlin/JVM compiler options](https://kotlinlang.org/docs/compiler-reference.html) — target e flags; não ative opção desconhecida por tentativa.

Capture versions, flags, container limits e warm-up. Profiles/dumps podem conter informação sensível.

## Observabilidade

- [OpenTelemetry Java](https://opentelemetry.io/docs/languages/java/) — instrumentação JVM aplicável a serviços Kotlin/JVM.
- [OpenTelemetry semantic conventions](https://opentelemetry.io/docs/specs/semconv/) — nomes/attributes padronizados.
- [Ktor OpenTelemetry](https://ktor.io/docs/server-opentelemetry.html) — integração quando Ktor é o framework escolhido.
- [Spring Boot observability](https://docs.spring.io/spring-boot/reference/actuator/observability.html) — integração quando Spring é o framework escolhido.
- [Kotlin coroutine debugging](https://kotlinlang.org/docs/coroutine-context-and-dispatchers.html#debugging-coroutines-and-threads) — nomes/context e tooling básico.

Framework instrumentation não decide SLO, sampling, cardinalidade ou redaction pelo produto.

## Segurança

- [OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html) — validation na boundary.
- [OWASP Deserialization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Deserialization_Cheat_Sheet.html) — riscos de types arbitrários.
- [OWASP SSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html) — outbound requests.
- [OWASP Java Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Java_Security_Cheat_Sheet.html) — riscos do ecossistema JVM.
- [Gradle dependency verification](https://docs.gradle.org/current/userguide/dependency_verification.html) — integridade de dependencies/plugins.
- [Kotlin security policy](https://github.com/JetBrains/kotlin/security/policy) — reporte de vulnerabilidades do projeto.

Null safety e sealed types reduzem erros internos; autenticação, autorização, crypto, serialization e resource limits continuam separados.

## Android

- [Kotlin for Android](https://developer.android.com/kotlin) — documentação Android oficial.
- [Android app architecture](https://developer.android.com/topic/architecture) — lifecycle, UI/data layers e recomendações.
- [Jetpack Compose](https://developer.android.com/compose) — UI declarativa.
- [Android coroutines best practices](https://developer.android.com/kotlin/coroutines/coroutines-best-practices) — lifecycle, dispatchers e testing no Android.
- [Android performance](https://developer.android.com/topic/performance) — profiling e requisitos mobile.

Mobile tem lifecycle, battery, memory e privacy constraints que um backend JVM não possui.

## Backend JVM

- [Ktor documentation](https://ktor.io/docs/welcome.html) — framework JetBrains baseado em coroutines.
- [Spring Framework Kotlin](https://docs.spring.io/spring-framework/reference/languages/kotlin.html) — suporte Kotlin no ecossistema Spring.
- [Spring Boot Kotlin](https://docs.spring.io/spring-boot/reference/features/kotlin.html) — configuração e plugins do Boot.
- [Kotlin server-side overview](https://kotlinlang.org/docs/server-overview.html) — panorama oficial, não benchmark comparativo.

Framework choice deve seguir requirements, operação, ecosystem do time e benchmark representativo.

## Multiplatform, Native, JS e Wasm

- [Kotlin Multiplatform overview](https://kotlinlang.org/docs/multiplatform.html) — targets e modelo de compartilhamento.
- [Multiplatform project structure](https://kotlinlang.org/docs/multiplatform-discover-project.html) — source sets e dependencies.
- [`expect` and `actual`](https://kotlinlang.org/docs/multiplatform-expect-actual.html) — declarações platform-specific.
- [Kotlin/Native overview](https://kotlinlang.org/docs/native-overview.html) — compilation e interop.
- [Kotlin/Native memory management](https://kotlinlang.org/docs/native-memory-manager.html) — allocator e GC do target.
- [Kotlin/Native Objective-C/Swift interop](https://kotlinlang.org/docs/native-objc-interop.html) — boundary Apple.
- [Kotlin/JS overview](https://kotlinlang.org/docs/js-overview.html) — JavaScript target e ecosystem.
- [Kotlin/Wasm overview](https://kotlinlang.org/docs/wasm-overview.html) — target e maturidade documentada.

Consulte a stability/maturity da versão atual antes de comprometer produto a um target.

## Serialization e libraries oficiais

- [`kotlinx.serialization`](https://github.com/Kotlin/kotlinx.serialization) — plugin/library de serialization multiplataforma.
- [`kotlinx-datetime`](https://github.com/Kotlin/kotlinx-datetime) — date/time multiplataforma.
- [`kotlinx-io`](https://github.com/Kotlin/kotlinx-io) — I/O multiplataforma conforme estabilidade/versionamento do projeto.

Codegen/plugins têm matriz com compiler. Fixe versões e teste unknown/missing fields, limites e compatibility.

## Livros

- Dmitry Jemerov, Svetlana Isakova, Sebastian Aigner e Roman Elizarov, [*Kotlin in Action, Second Edition*](https://www.manning.com/books/kotlin-in-action-second-edition) — linguagem, coroutines e ecossistema.
- Bruce Eckel e Svetlana Isakova, [*Atomic Kotlin*](https://www.atomickotlin.com/) — aprendizagem por pequenos exercícios.
- Marcin Moskala, [*Kotlin Coroutines: Deep Dive*](https://kt.academy/book/coroutines) — complemento especializado; confronte detalhes com a documentação/version do library.

## Papers

- Nikita Koval, Dan Alistarh e Roman Elizarov, [*Fast and Scalable Channels in Kotlin Coroutines*](https://doi.org/10.1145/3572848.3577481) — algorithm, cancellation e avaliação de channels.
- Bob Brockbernd et al., [*Understanding Concurrency Bugs in Real-World Programs with Kotlin Coroutines*](https://doi.org/10.4230/LIPIcs.ECOOP.2024.8) — estudo open access de bugs de concorrência.
- Vyacheslav Mikhailov et al., [*ReduKtor: How We Stopped Worrying About Bugs in Kotlin Compiler*](https://arxiv.org/abs/1909.07331) — redução de programas para compiler testing.

Papers medem versões/workloads específicos. Leia metodologia e não transforme resultado em regra universal.

## Roteiro de leitura

1. Basic syntax → null safety → classes/functions/collections.
2. [Fundamentos](fundamentals.md) + exercícios Beginner/Intermediate.
3. Generics/sealed/inline + Java interop.
4. Coroutines guide + [Internals](internals.md) + labs de cancellation.
5. JVM/JFR/JMH ou docs do target escolhido.
6. Multiplatform apenas com domínio e pelo menos dois targets testados.

---

[← Exercícios](exercises.md) · [↑ Kotlin](README.md) · [→ Comparação](../comparison.md)
