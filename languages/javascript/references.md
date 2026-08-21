# JavaScript — referências

---

[← Exercícios](exercises.md) · [↑ JavaScript](README.md) · [→ TypeScript](../typescript/README.md)

Curadoria em ordem de autoridade. Consulte a versão compatível com seu target; exemplos de engine ou host não substituem a especificação. Links revisados em 2026-08-21.

## Especificações e padrões

- [ECMAScript Language Specification (ECMA-262)](https://tc39.es/ecma262/) — fonte normativa da linguagem.
- [ECMAScript Internationalization API (ECMA-402)](https://tc39.es/ecma402/) — `Intl`, locale e formatação internacional.
- [TC39 proposals](https://github.com/tc39/proposals) — estágios das propostas; recursos antes de Stage 4 não são parte estável da linguagem.
- [HTML Standard: Event loops](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops) — tasks, microtasks e rendering no host Web.
- [Web IDL](https://webidl.spec.whatwg.org/) — como interfaces Web são descritas e expostas a ECMAScript.
- [URL Standard](https://url.spec.whatwg.org/) — parsing/canonicalização de URLs; relevante para segurança e interoperabilidade.

## Linguagem

- [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide) — percurso didático mantido pela comunidade MDN.
- [MDN JavaScript Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference) — referência prática de built-ins e sintaxe.
- [MDN: Equality comparisons and sameness](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Equality_comparisons_and_sameness) — `===`, SameValue e SameValueZero.
- [MDN: Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures) — lexical environment e casos de uso.
- [MDN: Inheritance and the prototype chain](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain) — modelo prototype-based.
- [MDN: Iterators and generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_generators) — protocolos de iteração.
- [MDN: Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) — ES modules no ambiente Web.

MDN é excelente ponte para a especificação, mas não é a norma. Quando comportamento de borda decide a correção, siga os links de specifications e tests.

## Runtime e internals

- [V8 documentation](https://v8.dev/docs) — build, tracing, profiling e embedding da engine.
- [V8 blog](https://v8.dev/blog) — explicações versionadas de GC, performance e features; trate detalhes como implementação.
- [Node.js documentation](https://nodejs.org/api/) — APIs do runtime.
- [Node.js: Event loop, timers and `nextTick`](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick) — modelo específico do host.
- [Node.js: Don't block the event loop](https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop) — riscos de CPU e inputs patológicos.
- [Node.js: Using Heap Snapshot](https://nodejs.org/en/learn/diagnostics/memory/using-heap-snapshot) — diagnóstico de retenção e cuidados ao coletar snapshots.
- [MDN: Memory management](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Memory_management) — reachability, GC e memória.
- [MDN: Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) — agents para trabalho em background no browser.
- [Node.js Worker Threads](https://nodejs.org/api/worker_threads.html) — paralelismo no host Node.js.

## Browser e compatibilidade

- [MDN Web APIs](https://developer.mozilla.org/en-US/docs/Web/API) — APIs oferecidas pelo browser.
- [MDN Browser Compatibility Data](https://github.com/mdn/browser-compat-data) — dados de suporte usados pela documentação.
- [web-platform-tests](https://web-platform-tests.org/) — suíte compartilhada de interoperabilidade Web.
- [ECMAScript Test262](https://github.com/tc39/test262) — suíte de conformidade da linguagem.

Defina uma support matrix explícita e teste nos targets; transpilation e polyfills resolvem problemas diferentes.

## Node.js, modules e packages

- [Node.js ECMAScript modules](https://nodejs.org/api/esm.html) — resolução e interoperabilidade ESM.
- [Node.js packages](https://nodejs.org/api/packages.html) — `type`, `exports` e `imports`.
- [npm: `package.json`](https://docs.npmjs.com/cli/configuring-npm/package-json) — campos do manifesto.
- [npm: lockfiles](https://docs.npmjs.com/cli/configuring-npm/package-lock-json) — resolução reproduzível e formato.
- [npm security best practices](https://docs.npmjs.com/about-audit-reports) — audit reports e limitações operacionais.
- [semantic versioning](https://semver.org/) — convenção usada por grande parte do ecossistema.

Escolher npm, pnpm, Yarn ou outro client é uma decisão de projeto. Padronize versão e lockfile; não mantenha lockfiles concorrentes.

## Testes e qualidade

- [Node.js test runner](https://nodejs.org/api/test.html) — runner embutido, mocks, coverage e execução.
- [Node.js assert](https://nodejs.org/api/assert.html) — assertions embutidas.
- [ESLint documentation](https://eslint.org/docs/latest/) — static analysis configurável.
- [Prettier documentation](https://prettier.io/docs/) — formatter opinativo.

Ferramentas comunitárias mudam. Escolha por requisitos, fixe versões e mantenha configuração pequena.

## Performance e observabilidade

- [Performance Timeline](https://w3c.github.io/performance-timeline/) — modelo padrão de performance entries.
- [MDN Performance APIs](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API) — medição no browser.
- [Node.js Performance Hooks](https://nodejs.org/api/perf_hooks.html) — timing e event-loop monitoring no Node.js.
- [Node.js `AsyncLocalStorage`](https://nodejs.org/api/async_context.html) — contexto assíncrono para correlação.
- [OpenTelemetry JavaScript](https://opentelemetry.io/docs/languages/js/) — instrumentação de traces, metrics e logs conforme suporte.
- [Chrome DevTools: Performance](https://developer.chrome.com/docs/devtools/performance/) — profiling no Chromium.

## Segurança

- [OWASP Cross Site Scripting Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) — output encoding e sinks seguros.
- [OWASP DOM based XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html) — riscos específicos do DOM.
- [OWASP Prototype Pollution Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Prototype_Pollution_Prevention_Cheat_Sheet.html) — mitigação de chaves e prototypes.
- [OWASP Node.js Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html) — hardening de serviços Node.js.
- [Node.js security policy](https://github.com/nodejs/node/security/policy) — releases e reporte de vulnerabilidades do runtime.
- [MDN Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) — defesa em profundidade no browser.

Cheat sheets são guias; um threat model do produto continua necessário.

## Livros

- David Flanagan, [*JavaScript: The Definitive Guide*, 7th ed.](https://www.oreilly.com/library/view/javascript-the-definitive/9781491952016/) — linguagem e APIs fundamentais.
- Kyle Simpson, [*You Don't Know JS Yet*](https://github.com/getify/You-Dont-Know-JS) — escopo, objects, types e mecanismos; edição aberta mantida pelo autor.
- Marijn Haverbeke, [*Eloquent JavaScript*](https://eloquentjavascript.net/) — introdução com projetos; leitura online autorizada pelo autor.
- Eric Elliott, [*Programming JavaScript Applications*](https://www.oreilly.com/library/view/programming-javascript-applications/9781491950289/) — composição e arquitetura; confronte recomendações com práticas atuais.

Livros envelhecem em tooling e APIs. Use-os para modelos duráveis e confirme detalhes na documentação vigente.

## Papers e semântica

- Arjun Guha, Claudiu Saftoiu e Shriram Krishnamurthi, [*The Essence of JavaScript*](https://doi.org/10.1007/978-3-642-14107-2_7) — uma core language para estudar semântica.
- Sergio Maffeis, John C. Mitchell e Ankur Taly, [*An Operational Semantics for JavaScript*](https://doi.org/10.1007/978-3-540-89330-1_16) — formalização de uma versão da linguagem; leia no contexto histórico.
- Andreas Rossberg, [*WebAssembly Core Specification*](https://www.w3.org/TR/wasm-core-2/) — relevante na fronteira entre JavaScript e código Wasm; é uma especificação, não substituto para aprender JS.

Papers sobre versões antigas não descrevem todos os recursos atuais, mas tornam explícitos conceitos que tutoriais frequentemente simplificam.

## Cursos e prática oficiais

- [MDN Learn Web Development](https://developer.mozilla.org/en-US/docs/Learn_web_development) — currículo Web com exercícios.
- [Node.js Learn](https://nodejs.org/en/learn) — guias do projeto Node.js.
- [Test262 contribution guide](https://github.com/tc39/test262/blob/main/CONTRIBUTING.md) — prática de casos de conformidade a partir da especificação.

## Estratégia de leitura

1. MDN Guide + [Fundamentos](fundamentals.md).
2. Node.js Learn ou Web APIs conforme o host.
3. [Internals](internals.md) junto de event-loop e memory docs.
4. Test262/standards para dúvidas de semântica.
5. Profiler, benchmarks e documentação de segurança durante o projeto.

Registre versão e data ao citar comportamento de host. Links “Latest” são úteis para estudo, não para justificar um sistema congelado em versão anterior.

---

[← Exercícios](exercises.md) · [↑ JavaScript](README.md) · [→ TypeScript](../typescript/README.md)
