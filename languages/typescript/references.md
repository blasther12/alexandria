# TypeScript — referências

---

[← Exercícios](exercises.md) · [↑ TypeScript](README.md) · [→ Go](../golang/README.md)

Use a documentação da versão fixada no projeto e suas release notes. Handbook explica o modelo; o compiler e seus tests são a referência final para casos não especificados formalmente. Links revisados em 2026-08-21.

## Comece aqui

- [TypeScript for the New Programmer](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html) — relação entre JavaScript e TypeScript.
- [The Basics](https://www.typescriptlang.org/docs/handbook/2/basic-types.html) — primitives, annotations, inference e strictness.
- [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) — unions, aliases, interfaces e assertions.
- [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) — control-flow analysis e guards.
- [More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html) — signatures, generics, overloads e assignability.
- [Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html) — properties, tuples, readonly e structural composition.

Execute os exemplos em um projeto `strict`; o Playground pode usar compiler/options diferentes do seu build.

## Type system

- [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html) — type parameters, inference e constraints.
- [`keyof`](https://www.typescriptlang.org/docs/handbook/2/keyof-types.html) e [indexed access](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html) — relações entre keys e values.
- [`typeof` in type contexts](https://www.typescriptlang.org/docs/handbook/2/typeof-types.html) — derivar tipo de declarations.
- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html) — distribuição e `infer`.
- [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html) — transformar properties.
- [Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html) — vocabulários de strings finitos.
- [Type Compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html) — structural typing e pontos pragmáticos.
- [Type Inference](https://www.typescriptlang.org/docs/handbook/type-inference.html) — contextual e best-common-type inference.
- [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html) — transforms built-in.

## Configuração

- [TSConfig Reference](https://www.typescriptlang.org/tsconfig/) — índice oficial de compiler options.
- [`strict`](https://www.typescriptlang.org/tsconfig/strict.html) — família de checks estritos.
- [`noUncheckedIndexedAccess`](https://www.typescriptlang.org/tsconfig/noUncheckedIndexedAccess.html) — ausência em index signatures/access.
- [`exactOptionalPropertyTypes`](https://www.typescriptlang.org/tsconfig/exactOptionalPropertyTypes.html) — ausência versus `undefined` explícito.
- [`useUnknownInCatchVariables`](https://www.typescriptlang.org/tsconfig/useUnknownInCatchVariables.html) — errors de `catch` como `unknown`.
- [Project References](https://www.typescriptlang.org/docs/handbook/project-references.html) — build mode e graphs de projects.
- [Compiler Options in MSBuild](https://www.typescriptlang.org/docs/handbook/compiler-options-in-msbuild.html) — relevante apenas para esse ambiente.

Não existe `tsconfig` universal. Comece pelo runtime e formato de módulo que executará o output.

## Modules e packages

- [Modules — Theory](https://www.typescriptlang.org/docs/handbook/modules/theory.html) — host, output e resolution.
- [Modules — Reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html) — comportamento por mode.
- [Modules — Choosing Compiler Options](https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html) — opções por cenário.
- [Modules — Reference for Library Authors](https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html#im-writing-a-library) — ponto de partida para publicação; teste o tarball.
- [Node.js packages](https://nodejs.org/api/packages.html) — contrato runtime de `type`/`exports`/`imports`.
- [npm `package.json`](https://docs.npmjs.com/cli/configuring-npm/package-json) — manifest e publicação.

`paths` não muda automaticamente o JavaScript emitido. Alinhe checker, bundler e runtime.

## Declaration files

- [Declaration Files — Introduction](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html) — propósito de `.d.ts`.
- [Library Structures](https://www.typescriptlang.org/docs/handbook/declaration-files/library-structures.html) — identificar shape de módulos.
- [Do's and Don'ts](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html) — erros comuns na publicação.
- [Publishing declaration files](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html) — packaging de types.
- [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) — declarations comunitárias e processo de contribuição.
- [`@ts-expect-error`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-9.html#ts-expect-error-comments) — negative compile test localizado.

Uma declaration é uma promessa sobre runtime. Valide-a contra o package e versões suportadas.

## Compiler e language service

- [Architectural Overview](https://github.com/microsoft/TypeScript/wiki/Architectural-Overview) — camadas conceituais do compiler.
- [Using the Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API) — programs, AST e emit.
- [Using the Language Service API](https://github.com/microsoft/TypeScript/wiki/Using-the-Language-Service-API) — tooling incremental.
- [TypeScript Compiler source](https://github.com/microsoft/TypeScript) — implementação, issues e tests.
- [TypeScript Design Goals](https://github.com/microsoft/TypeScript/wiki/TypeScript-Design-Goals) — pragmatismo, erasure e non-goals.
- [TypeScript FAQ](https://github.com/microsoft/TypeScript/wiki/FAQ) — decisões recorrentes e limites do sistema.

APIs internas não publicadas não têm compatibilidade garantida.

## Releases e compatibilidade

- [TypeScript release notes](https://www.typescriptlang.org/docs/handbook/release-notes/overview.html) — mudanças por versão.
- [TypeScript blog](https://devblogs.microsoft.com/typescript/) — anúncios do time.
- [Roadmap](https://github.com/microsoft/TypeScript/wiki/Roadmap) — direção, não contrato de entrega.
- [Breaking Changes](https://github.com/microsoft/TypeScript/wiki/Breaking-Changes) — incompatibilidades conhecidas.

Teste upgrade com o graph e consumer reais. Uma inference “melhor” pode revelar dependência em comportamento anterior.

## Performance do toolchain

- [Compiler Performance](https://github.com/microsoft/TypeScript/wiki/Performance) — estrutura de projects, diagnostics e mitigação.
- [Performance Tracing](https://github.com/microsoft/TypeScript/wiki/Performance-Tracing) — geração/análise de traces.
- [`extendedDiagnostics`](https://www.typescriptlang.org/tsconfig/extendedDiagnostics.html) — tempos e contagens do compiler.
- [`explainFiles`](https://www.typescriptlang.org/tsconfig/explainFiles.html) — por que arquivos entram no program.
- [`traceResolution`](https://www.typescriptlang.org/tsconfig/traceResolution.html) — diagnóstico de module resolution.
- [`incremental`](https://www.typescriptlang.org/tsconfig/incremental.html) — metadata para builds incrementais.

Traces podem conter source e paths sensíveis; sanitize antes de compartilhar.

## JavaScript runtime, testes e observabilidade

- [ECMAScript specification](https://tc39.es/ecma262/) — semântica do output.
- [Node.js documentation](https://nodejs.org/api/) — runtime comum no backend/tooling.
- [Node.js test runner](https://nodejs.org/api/test.html) — opção embutida para runtime tests.
- [OpenTelemetry JavaScript](https://opentelemetry.io/docs/languages/js/) — instrumentação no runtime JavaScript.
- [JavaScript internals desta trilha](../javascript/internals.md) — event loop, JIT, workers e GC.

Escolha test runner por target. Compile-time fixtures continuam necessárias mesmo que runtime tests cubram comportamento.

## Runtime validation e segurança

- [OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html) — allowlists e validação sintática/semântica.
- [OWASP Node.js Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html) — hardening de backend JS/TS.
- [OWASP Third Party JavaScript Management](https://cheatsheetseries.owasp.org/cheatsheets/Third_Party_Javascript_Management_Cheat_Sheet.html) — scripts/dependências de terceiros.
- [npm audit reports](https://docs.npmjs.com/about-audit-reports) — advisories, sem substituir revisão e threat model.

Validators populares são dependências comunitárias e evoluem; avalie schema support, error paths, bundle, manutenção e geração de types antes de escolher.

## Livros

- Boris Cherny, [*Programming TypeScript*](https://www.oreilly.com/library/view/programming-typescript/9781492037644/) — do básico a APIs tipadas.
- Dan Vanderkam, [*Effective TypeScript*](https://effectivetypescript.com/) — práticas e modelos mentais; confira a edição e versão cobertas.
- Josh Goldberg, [*Learning TypeScript*](https://www.oreilly.com/library/view/learning-typescript/9781098110321/) — introdução guiada ao checker e ao tooling.

## Papers e pesquisa

- Gao, Bird e Barr, [*To Type or Not to Type: On the Effectiveness of Static Typing for JavaScript*](https://www.microsoft.com/en-us/research/publication/to-type-or-not-to-type-on-the-effectiveness-of-static-typing-for-javascript/) — estudo empírico histórico com TypeScript/Flow de versões antigas.
- Rastogi et al., [*Safe & Efficient Gradual Typing for TypeScript*](https://www.microsoft.com/en-us/research/wp-content/uploads/2017/08/safets.pdf) — sistema experimental que explora garantias além do TypeScript comum.
- [Gradual Typing Embedded Securely in JavaScript](https://www.microsoft.com/en-us/research/wp-content/uploads/2017/08/tsstar.pdf) — pesquisa sobre enforcement na fronteira tipada/dinâmica.
- [Static TypeScript](https://www.microsoft.com/en-us/research/wp-content/uploads/2019/09/static-typescript-draft2.pdf) — compiler restrito para outra classe de targets; não descreve o emit padrão de toda aplicação TypeScript.

Leia metodologia, versão da linguagem e população antes de generalizar resultados.

## Roteiro de leitura

1. Handbook Basics → Everyday Types → Narrowing.
2. [Fundamentos](fundamentals.md) e exercícios Beginner/Intermediate.
3. Generics → type manipulation → modules/declarations.
4. [Internals](internals.md), design goals e compiler performance.
5. Runtime JavaScript, segurança e package consumer tests durante o projeto.

---

[← Exercícios](exercises.md) · [↑ TypeScript](README.md) · [→ Go](../golang/README.md)
