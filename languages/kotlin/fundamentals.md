# Kotlin — fundamentos

---

[← Visão geral](README.md) · [↑ Kotlin](README.md) · [→ Internals](internals.md)

Os exemplos assumem Kotlin/JVM quando usam APIs Java. Marque sempre o target: syntax compartilhada não garante library, threading ou performance iguais.

## Projeto mínimo

Prefira Gradle Wrapper versionado. Com version catalog, a estrutura do `build.gradle.kts` pode ser:

```kotlin
plugins {
    alias(libs.plugins.kotlin.jvm)
}

kotlin {
    jvmToolchain(21)
}

dependencies {
    testImplementation(kotlin("test"))
}

tasks.test {
    useJUnitPlatform()
}
```

O catalog precisa fixar uma combinação compatível de Kotlin/Gradle/plugins. O JDK 21 é apenas exemplo de baseline: escolha e teste a versão suportada pelo produto. Rode `./gradlew test` e `./gradlew build` em CI, não dependa da instalação global do IDE.

## Bindings e tipos

`val` cria referência somente leitura; `var`, referência reatribuível:

```kotlin
val serviceName: String = "orders"
var attempts = 0 // Int inferido
attempts += 1
```

`val` não torna o object profundamente imutável:

```kotlin
val tags = mutableListOf("new")
tags += "paid" // a referência é a mesma; o conteúdo mudou
```

Prefira valores e collections read-only na public API. Ainda assim, uma `List<T>` pode ser view de backing collection mutável; faça defensive copy quando crossing trust/ownership boundaries.

Tipos numéricos não têm widening implícito arbitrário:

```kotlin
val count: Int = 10
val total: Long = count.toLong()
```

Use `Long` na menor unidade para money simples e defina overflow/rounding. `Double` não representa decimal financeiro exatamente.

## Null safety

`String` exclui `null`; `String?` inclui:

```kotlin
fun displayName(raw: String?): String {
    val normalized = raw?.trim()?.takeIf { it.isNotEmpty() }
    return normalized ?: "anonymous"
}
```

Ferramentas:

- safe call `?.`;
- Elvis `?:`;
- safe cast `as?`;
- `let` para operar sobre valor não nulo, com moderação;
- `requireNotNull`/`checkNotNull` para invariants;
- `!!` lança se a suposição estiver errada e deve ser raro/auditável.

Smart casts dependem de o compiler provar estabilidade. Uma property mutável/aberta pode mudar entre check e uso.

## Expressions e control flow

`if`, `when` e `try` produzem valores:

```kotlin
fun feeBasisPoints(tier: String): Int = when (tier) {
    "standard" -> 250
    "premium" -> 100
    "internal" -> 0
    else -> error("tier desconhecido: $tier")
}
```

Use sealed types quando o conjunto é domínio fechado; string solta é adequada apenas na boundary antes do parsing.

Loops usam ranges, iterables ou sequences:

```kotlin
for ((index, value) in values.withIndex()) {
    println("$index=$value")
}
```

Evite criar ranges/materializações enormes sem necessidade.

## Funções

Kotlin oferece expression bodies, default/named parameters, local functions, lambdas e higher-order functions:

```kotlin
fun retryDelayMillis(
    attempt: Int,
    baseMillis: Long = 100,
    capMillis: Long = 5_000,
): Long {
    require(attempt >= 0) { "attempt negativo" }
    val multiplier = 1L shl attempt.coerceAtMost(20)
    return (baseMillis * multiplier).coerceAtMost(capMillis)
}
```

Overflow precisa ser avaliado mesmo com `coerceAtMost`; o limite de shift do exemplo mantém a multiplicação em faixa razoável apenas se `baseMillis` também for limitado pelo caller/domain.

### Extension functions

```kotlin
fun String.toOrderId(): OrderId = OrderId.parse(this)
```

Extensions são resolvidas estaticamente e não alteram a classe. Evite extensions genéricas demais que poluem autocomplete ou parecem methods com acesso privilegiado.

### Functions com receiver e DSL

Receivers permitem APIs declarativas, mas receivers aninhados podem tornar referências ambíguas. Use `@DslMarker`, scopes curtos e validação ao construir o resultado.

## Classes e objects

```kotlin
data class Product(
    val sku: String,
    val unitPriceCents: Long,
) {
    init {
        require(sku.isNotBlank()) { "sku vazio" }
        require(unitPriceCents >= 0) { "preço negativo" }
    }
}

class Cart {
    private val lines = mutableListOf<Pair<Product, Int>>()

    fun add(product: Product, quantity: Int) {
        require(quantity > 0) { "quantity deve ser positiva" }
        lines += product to quantity
    }

    fun totalCents(): Long = lines.sumOf { (product, quantity) ->
        Math.multiplyExact(product.unitPriceCents, quantity.toLong())
    }
}
```

`data class` gera igualdade/cópia/component functions com base nas properties do primary constructor. Não a use automaticamente para entity mutável ou objeto com identity distinta.

`object` declara singleton. Estado global mutável dentro dele dificulta isolamento, concorrência e testes.

## Interfaces, composição e delegation

```kotlin
interface Clock {
    fun now(): java.time.Instant
}

class AuditedClock(
    private val delegate: Clock,
    private val onRead: (java.time.Instant) -> Unit,
) : Clock {
    override fun now(): java.time.Instant = delegate.now().also(onRead)
}
```

Kotlin também oferece delegation com `: Interface by delegate`. Composição deixa lifecycle/dependencies explícitos e evita hierarquias profundas. Inheritance continua útil quando existe substituição real e API preparada para extensão.

## Sealed hierarchies

```kotlin
sealed interface Payment {
    data class Pending(val id: String) : Payment
    data class Approved(val id: String, val authorization: String) : Payment
    data class Declined(val id: String, val reason: String) : Payment
}

fun Payment.isTerminal(): Boolean = when (this) {
    is Payment.Pending -> false
    is Payment.Approved, is Payment.Declined -> true
}
```

`when` exaustivo sinaliza novos states no compile time. Um payload remoto desconhecido precisa ser tratado pelo parser antes de virar `Payment`.

## Collections

```kotlin
val paidTotal = orders
    .asSequence()
    .filter { it.paid }
    .map { it.totalCents }
    .sum()
```

Principais interfaces: `List`, `Set`, `Map` e variantes `Mutable*`. Operations como `map`/`filter` em collections criam resultados eager; `Sequence` é lazy e pode evitar intermediários. Para coleções pequenas ou pipeline curto, overhead da sequence pode ser maior. Meça hot paths.

Evite `groupBy` quando cada grupo reter listas enormes e você só precisa de agregação; `groupingBy(...).fold(...)` ou loop explícito pode reduzir memória.

## Generics

```kotlin
interface Source<out T> {
    fun next(): T?
}

interface Sink<in T> {
    fun accept(value: T)
}
```

`out` marca producer/covariance; `in`, consumer/contravariance. Mutable containers normalmente não podem ser covariantes com segurança.

Type arguments são erased na JVM na maioria dos casos. Inline functions com `reified` podem acessar class/token do call site:

```kotlin
inline fun <reified T> Any?.isInstanceOf(): Boolean = this is T
```

Reification não recupera todos os nested generic arguments apagados e aumenta code duplication por inline.

## Exceptions e resultados

Kotlin não exige checked exceptions. Defina uma política por boundary:

```kotlin
sealed interface ParsePortResult {
    data class Valid(val port: Int) : ParsePortResult
    data class Invalid(val reason: String) : ParsePortResult
}

fun parsePort(raw: String?): ParsePortResult {
    val value = raw?.toIntOrNull()
    return if (value != null && value in 1..65_535) {
        ParsePortResult.Valid(value)
    } else {
        ParsePortResult.Invalid("port fora da faixa")
    }
}
```

Use `require` para argumento do caller, `check` para estado interno e domain result para falha esperada. Ao contextualizar exception, preserve `cause`. Nunca use exception message como contrato de protocolo.

`kotlin.Result` é útil em algumas APIs internas, mas sealed error types comunicam taxonomy e payloads com mais precisão.

## Packages, visibility e modules

`package` organiza nomes; directory costuma espelhar, mas não define, o package. `internal` limita visibility ao Kotlin module (uma unidade de compilation), não a um Gradle subproject conceitual sem configuração correspondente.

Use `public` API deliberada e evite expor implementation types. Module boundaries devem refletir direção de dependência; friend paths e reflection quebram encapsulamento e merecem justificativa.

## I/O

No JVM, use APIs que fecham recursos:

```kotlin
import java.nio.file.Files
import java.nio.file.Path

fun countNonBlank(path: Path): Long =
    Files.newBufferedReader(path).useLines { lines ->
        lines.count { it.isNotBlank() }.toLong()
    }
```

Defina charset, tamanho máximo, symlink/path policy e error handling conforme trust boundary. `use`/`useLines` garantem fechamento no fluxo síncrono; resource lifecycle assíncrono exige ownership explícito.

## Coroutines

Dependem de `kotlinx.coroutines`. Structured concurrency mantém children no scope:

```kotlin
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope

suspend fun loadDashboard(id: String): Dashboard = coroutineScope {
    val profile = async { loadProfile(id) }
    val orders = async { loadOrders(id) }
    Dashboard(profile.await(), orders.await())
}
```

Se um child falha, o scope cancela siblings conforme o builder/context. Cancellation é cooperativa e usa `CancellationException`; suspend functions precisam propagar, e CPU loops devem checar cancellation/yield conforme necessário.

`async` só deve ser usado para concorrência real. Se uma operação depende da anterior, código sequencial é mais claro. Limite fan-out com semaphore/dispatcher/worker design apropriado.

### Flow

`Flow<T>` representa stream assíncrono cold por default. Operators executam em contexto conforme regras próprias; buffering muda backpressure e ordering. Colete em scope com lifecycle, trate exception/cancellation e teste producers lentos/rápidos.

## Java interoperability

Java declarations sem nullability confiável viram platform types, nos quais o compiler permite usos nullable ou não nullable. Normalize na boundary:

```kotlin
fun javaUserName(user: LegacyUser): String =
    requireNotNull(user.name) { "LegacyUser.name retornou null" }
```

Outras decisões: checked exceptions não são impostas ao Kotlin; default args não viram overloads Java automaticamente; `@JvmOverloads`, `@JvmStatic`, wildcards e names devem ser usados para consumer real, não por hábito.

## Package management e build

- fixe Gradle Wrapper, Kotlin plugin, JDK toolchain e repository policy;
- prefira `mavenCentral()`/repositories autorizados e evite repositórios dinâmicos;
- use version catalog ou convenção central sem esconder versões;
- dependency locking/verification melhoram reprodução e integridade;
- separe `implementation` de `api` para controlar ABI/transitives;
- monitore configuration/execution time e cache correctness;
- nunca coloque credentials no source ou em logs de build.

## Testes

```kotlin
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class ProductTest {
    @Test
    fun `rejeita preço negativo`() {
        assertFailsWith<IllegalArgumentException> {
            Product("book", -1)
        }
    }

    @Test
    fun `calcula total em cents`() {
        val cart = Cart()
        cart.add(Product("book", 1_500), 2)
        assertEquals(3_000, cart.totalCents())
    }
}
```

No JVM, `kotlin.test` integra-se a runners como JUnit. Para coroutines, use `kotlinx-coroutines-test`/`runTest` e injete dispatcher/clock. Teste artefato e target reais em Multiplatform.

## Paradigmas

- **procedural:** orchestration explícita;
- **OO:** encapsulamento, interfaces e interoperabilidade JVM;
- **functional:** funções, transformations, immutability e sealed results;
- **declarative:** type-safe builders/Compose/Gradle DSL;
- **composition:** delegation e pequenas interfaces.

Scope functions (`let`, `run`, `with`, `apply`, `also`) não são paradigmas. Escolha pela intenção e evite nesting que esconda o receiver.

## Checklist de fundamentos

- [ ] Distingo `val` de immutability e `List` de backing mutável.
- [ ] Modelo ausência sem `!!` e normalize platform types.
- [ ] Uso sealed hierarchy para estados fechados.
- [ ] Entendo variance e erasure no target JVM.
- [ ] Fecho recursos e modelo erros por boundary.
- [ ] Uso coroutines com scope, cancellation e limites.
- [ ] Sei quais APIs são Kotlin comum e quais pertencem à JVM.
- [ ] Build/test não dependem do IDE.

---

[← Visão geral](README.md) · [↑ Kotlin](README.md) · [→ Internals](internals.md)
