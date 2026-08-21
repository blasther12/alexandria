# Referências de Go

Esta curadoria prioriza especificações, documentação e source do projeto Go. Verifique a versão usada pelo seu module: runtime, compiler diagnostics e Standard Library evoluem mesmo sob a promessa de compatibilidade.

## Linguagem e toolchain

- [Go Documentation](https://go.dev/doc/) — portal oficial.
- [The Go Programming Language Specification](https://go.dev/ref/spec) — referência normativa.
- [A Tour of Go](https://go.dev/tour/) — introdução interativa oficial.
- [How to Write Go Code](https://go.dev/doc/code) — organização básica de modules/packages.
- [Effective Go](https://go.dev/doc/effective_go) — guia histórico de estilo; o próprio documento avisa que não cobre o ecossistema moderno inteiro.
- [Standard Library](https://pkg.go.dev/std) — API e exemplos por package.
- [Command `go`](https://pkg.go.dev/cmd/go) — referência de build, test, modules e ferramentas.
- [`gofmt`](https://pkg.go.dev/cmd/gofmt) — formatação canônica.
- [`go vet`](https://pkg.go.dev/cmd/vet) — análises oficiais; não é prova de correção.

## Modules, versões e distribuição

- [Go Modules Reference](https://go.dev/ref/mod) — regras normativas de modules, versions e MVS.
- [Managing dependencies](https://go.dev/doc/modules/managing-dependencies)
- [Developing and publishing modules](https://go.dev/doc/modules/developing)
- [Go Module Mirror, Index, and Checksum Database](https://proxy.golang.org/) — serviços públicos operados pelo projeto.
- [Go Wiki: Modules](https://go.dev/wiki/Modules) — material complementar da comunidade Go.

`go.sum` autentica conteúdo conhecido por module/version; não garante qualidade, licença ou ausência de código malicioso.

## Concorrência e memória

- [The Go Memory Model](https://go.dev/ref/mem) — relações de sincronização e data races.
- [Share Memory By Communicating](https://go.dev/blog/codelab-share) — introdução oficial à abordagem por channels.
- [Go Concurrency Patterns: Pipelines and cancellation](https://go.dev/blog/pipelines) — ownership, fechamento e cancellation.
- [Go Concurrency Patterns: Context](https://go.dev/blog/context) — motivação do `context`.
- [`context` package](https://pkg.go.dev/context) — contrato atual e boas práticas.
- [`sync` package](https://pkg.go.dev/sync) — mutexes, once, wait groups e pools.
- [`sync/atomic` package](https://pkg.go.dev/sync/atomic) — operações atômicas e tipos.
- [Data Race Detector](https://go.dev/doc/articles/race_detector) — uso e limitações operacionais.

## Runtime, compiler e Garbage Collector

- [Go source repository](https://go.googlesource.com/go) — fonte primária.
- [Runtime source](https://go.googlesource.com/go/+/refs/heads/master/src/runtime/) — leia pelo tag da versão estudada.
- [Compiler source (`cmd/compile`)](https://go.googlesource.com/go/+/refs/heads/master/src/cmd/compile/)
- [A Guide to the Go Garbage Collector](https://go.dev/doc/gc-guide) — modelo de custo, `GOGC` e memory limit.
- [Diagnostics](https://go.dev/doc/diagnostics) — profiling, tracing, debugging e runtime statistics.
- [Profile-guided optimization](https://go.dev/doc/pgo) — workflow e trade-offs do PGO.
- [Compiler optimization notes](https://github.com/golang/go/wiki/CompilerOptimizations) — wiki do projeto; detalhes podem mudar.
- [`runtime` package](https://pkg.go.dev/runtime) — knobs e métricas do runtime.
- [`runtime/metrics`](https://pkg.go.dev/runtime/metrics) — métricas estáveis definidas pelo runtime.
- [`runtime/trace`](https://pkg.go.dev/runtime/trace) — execution tracing.

Não use `master` para afirmar comportamento da versão em produção; selecione o tag correspondente no repositório.

## Networking, I/O e dados

- [`net/http`](https://pkg.go.dev/net/http) — client e server HTTP.
- [`net`](https://pkg.go.dev/net) — sockets, resolvers e conexões.
- [`io`](https://pkg.go.dev/io) — contratos centrais de streaming.
- [`database/sql`](https://pkg.go.dev/database/sql) — pool e API de banco relacional.
- [`encoding/json`](https://pkg.go.dev/encoding/json) — JSON e suas regras de compatibilidade.
- [`os/exec`](https://pkg.go.dev/os/exec) — execução sem invocar shell implicitamente.
- [HTTP/2 package](https://pkg.go.dev/golang.org/x/net/http2) — extensão mantida pelo projeto Go.

Leia também a documentação do driver: `database/sql` define abstração/pool, mas comportamento de cancellation, tipos e protocolo depende do driver.

## Testes, fuzzing e performance

- [`testing`](https://pkg.go.dev/testing) — tests, benchmarks, fuzz targets e examples.
- [Tutorial: Getting started with fuzzing](https://go.dev/doc/tutorial/fuzz) — fluxo oficial.
- [`net/http/httptest`](https://pkg.go.dev/net/http/httptest) — server e recorder de teste.
- [Profiling Go Programs](https://go.dev/blog/pprof) — introdução oficial a pprof.
- [`runtime/pprof`](https://pkg.go.dev/runtime/pprof) — coleta programática.
- [`net/http/pprof`](https://pkg.go.dev/net/http/pprof) — endpoints; restrinja acesso.
- [Go execution tracer](https://go.dev/blog/execution-traces-2024) — visão oficial do tracer moderno.
- [Coverage for integration tests](https://go.dev/blog/integration-test-coverage) — cobertura além de unit tests.

Benchmarks devem reportar versão, hardware, flags, dataset, concorrência e variação. `ns/op` isolado raramente prevê p99 de um serviço.

## Segurança e supply chain

- [Go Security](https://go.dev/security/) — política, advisories e recursos.
- [Vulnerability Management for Go](https://go.dev/doc/security/vuln/) — database, `govulncheck` e integração.
- [Go Vulnerability Database](https://vuln.go.dev/) — fonte oficial de vulnerabilidades conhecidas no ecossistema.
- [`govulncheck`](https://pkg.go.dev/golang.org/x/vuln/cmd/govulncheck) — análise por símbolos alcançáveis, com limites documentados.
- [`html/template`](https://pkg.go.dev/html/template) — escaping contextual para HTML.
- [`crypto/tls`](https://pkg.go.dev/crypto/tls) — TLS; revise defaults e política da versão.
- [`crypto/subtle`](https://pkg.go.dev/crypto/subtle) — primitives constant-time; prefira protocolos/bibliotecas de alto nível.
- [Go checksum database privacy](https://proxy.golang.org/privacy) — comportamento dos serviços públicos de modules.
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/) — threat-specific controls independentes da linguagem.

## Observabilidade

- [`log/slog`](https://pkg.go.dev/log/slog) — structured logging da Standard Library.
- [OpenTelemetry Go](https://opentelemetry.io/docs/languages/go/) — instrumentação oficial do projeto OpenTelemetry.
- [OpenTelemetry Go repository](https://github.com/open-telemetry/opentelemetry-go) — source e versões.
- [Prometheus Go client](https://prometheus.io/docs/guides/go-application/) — guia oficial do projeto Prometheus.
- [Prometheus client_golang](https://github.com/prometheus/client_golang) — implementação e collectors.

Telemetry não deve expor payloads ou secrets. Evite labels por user/request: cardinalidade é custo e modo de falha.

## Generics e design de APIs

- [Tutorial: Getting started with generics](https://go.dev/doc/tutorial/generics)
- [An Introduction to Generics](https://go.dev/blog/intro-generics)
- [When To Use Generics](https://go.dev/blog/when-generics)
- [Go Code Review Comments](https://go.dev/wiki/CodeReviewComments) — convenções do projeto, não leis universais.
- [Organizing a Go module](https://go.dev/doc/modules/layout) — layouts recomendados por tipo de module.

## Livros

- [*The Go Programming Language* — Alan A. A. Donovan e Brian W. Kernighan](https://www.gopl.io/) — fundamentos e concorrência; excelente modelo mental, com APIs que devem ser conferidas contra Go atual.
- [*Learning Go, 2nd Edition* — Jon Bodner](https://www.oreilly.com/library/view/learning-go-2nd/9781098139285/) — linguagem e práticas modernas.
- [*100 Go Mistakes and How to Avoid Them* — Teiva Harsanyi](https://www.manning.com/books/100-go-mistakes-and-how-to-avoid-them) — bugs de slices, interfaces, concorrência, tests e runtime.
- [*Concurrency in Go* — Katherine Cox-Buday](https://www.oreilly.com/library/view/concurrency-in-go/9781491941294/) — patterns e raciocínio sobre concorrência; valide detalhes de APIs modernas.

Links apontam para autores/editoras; nenhum conteúdo protegido é reproduzido.

## Papers e contexto histórico

- [Go at Google: Language Design in the Service of Software Engineering](https://go.dev/talks/2012/splash.article) — artigo primário de Rob Pike, publicado pelo projeto Go a partir da palestra SPLASH 2012.
- [Communicating Sequential Processes](https://doi.org/10.1145/359576.359585) — C. A. R. Hoare, *Communications of the ACM* (1978).
- [Newsqueak: a language for communicating with mice](https://swtch.com/~rsc/thread/newsqueak.pdf) — Rob Pike; ancestral conceitual dos channels/select.
- [The Implementation of Newsqueak](https://swtch.com/~rsc/thread/squint.pdf) — Rob Pike; implementação de processos comunicantes.

Papers históricos ajudam a entender influências, mas as garantias de Go vêm da specification, Memory Model e documentação da versão.

## Ordem sugerida

1. Tour, Specification por consulta e [Fundamentos](fundamentals.md).
2. Standard Library: `io`, `errors`, `context`, `net/http`, `testing`.
3. Memory Model, pipelines/cancellation e Race Detector.
4. [Internals](internals.md) junto de benchmarks, profiles e execution traces.
5. GC Guide, modules/security e documentação do domínio implantado.
6. Runtime/compiler source somente para uma pergunta concreta e com tag de versão.

## Critérios para avaliar material externo

- distingue contrato da linguagem de detalhe do runtime?
- informa versão e plataforma?
- mede workload, metodologia e variância?
- trata cancellation, limites e cleanup?
- demonstra correção sob Race Detector sem alegar que ele prova ausência de races?
- evita regras absolutas como “channels sempre” ou “zero allocations sempre”?

---

[← Exercícios](exercises.md) · [↑ Trilha Go](README.md) · [Visão geral →](README.md)
