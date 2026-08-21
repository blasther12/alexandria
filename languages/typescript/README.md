# TypeScript

---

[← JavaScript](../javascript/README.md) · [↑ Linguagens](../README.md) · [→ Fundamentos](fundamentals.md)

TypeScript adiciona análise estática gradual ao JavaScript. A trilha ensina a usar tipos para tornar estados inválidos difíceis de representar, sem esquecer que produção executa JavaScript e recebe dados não tipados.

## O que é

TypeScript é uma linguagem e um type checker para JavaScript. Seu sistema de tipos é estrutural, gradual e intencionalmente pragmático; grande parte das anotações é apagada no emit. Código JavaScript válido pode ser adotado incrementalmente, embora nem todo programa JS receba tipos úteis sem trabalho de modelagem.

TypeScript não é um runtime, um schema validator nem uma garantia formal de ausência de bugs.

## Para que serve

- detectar incompatibilidades antes da execução;
- documentar contratos e acelerar navigation/refactoring;
- modelar estados de domínio com unions, generics e narrowing;
- publicar declarations para bibliotecas JavaScript;
- migrar codebases JS de forma incremental;
- compartilhar uma linguagem de tipos entre ferramentas de frontend e backend.

## Quando utilizar

É especialmente valioso em codebases longevas, equipes maiores, bibliotecas públicas e domínios com muitos estados. O custo se paga quando o feedback do checker e editor evita coordenação manual e torna mudanças transversais mais seguras.

## Quando não utilizar

JavaScript pode ser suficiente para scripts curtos, protótipos descartáveis ou artefatos em que build/tooling não se justifica. TypeScript também não resolve requisitos de validação, concorrência ou performance do runtime. Se a equipe compensa cada erro com `any` e assertions, existe build cost sem o principal benefício.

## Como funciona

O compiler constrói source files, resolve modules e declarations, liga symbols, infere/verifica tipos e pode emitir JavaScript/declaration files. Tipos são apagados em runtime; constructs que emitem código precisam ser avaliadas pelo JavaScript produzido.

O sistema usa assignability estrutural: compatibilidade depende principalmente dos members, não do nome declarado. Inference reduz anotações, enquanto control-flow analysis faz narrowing ao longo dos caminhos. Veja [Internals](internals.md).

## Conceitos fundamentais

- annotations e inference contextual;
- primitives, arrays, tuples, object types e functions;
- `type` aliases e `interface`;
- unions, intersections e literal types;
- `unknown`, `never`, `void` e os riscos de `any`;
- narrowing por `typeof`, `in`, discriminants e type guards;
- generics e constraints;
- modules, declaration files e configuração `strict`.

Pratique em [Fundamentos](fundamentals.md).

## Conceitos intermediários

- discriminated unions e exhaustiveness;
- `keyof`, indexed access e `typeof` em type positions;
- utility, mapped, conditional e template literal types;
- overloads versus union/generic;
- variance e function assignability;
- module resolution, package `exports` e `types`;
- runtime validation e transformação nas fronteiras;
- project references e divisão de monorepos.

## Conceitos avançados

- distributive conditional types e como contê-los;
- inferência com `infer` e recursive types com limites;
- nominality simulada por brands/opaque constructors;
- authoring e teste de `.d.ts`;
- compiler/language-service APIs e AST tooling;
- traces de performance do checker;
- migração sem “type coverage theater”;
- design de API que preserva inference sem expor complexidade.

## Internals

O pipeline conceitual contém parse, program/module graph, binding, checking e emit. O checker não executa o programa nem conhece payloads futuros. Assignability é deliberadamente não sound em alguns pontos para compatibilidade e ergonomia com JavaScript.

Tipo declarado, tipo inferido e valor em runtime são camadas diferentes:

```ts
const user = JSON.parse(payload) as { name: string };
// A assertion silencia o checker; não cria nem valida `name`.
```

O capítulo [Internals](internals.md) cobre inference, structural typing, erasure, compiler performance e declarations.

## Ecossistema

- compiler (`tsc`) e language service do projeto TypeScript;
- runtimes e APIs JavaScript: browser, Node.js e outros hosts;
- bundlers/transpilers que podem emitir sem type-checking;
- DefinitelyTyped para declarations comunitárias (`@types/*`);
- validators/code generators para contratos de runtime;
- linters, test runners e API-extractor/documentation tools.

Mantenha uma fonte de verdade para schemas quando dados cruzam rede. Gerar types a partir de OpenAPI/JSON Schema/IDL pode reduzir drift, mas o pipeline também precisa de testes.

## Boas práticas

- ative `strict` em código novo e endureça flags conforme o risco;
- use inference local e anote APIs públicas/fronteiras;
- aceite `unknown`, valide/narrow e só então exponha tipos do domínio;
- modele estados com discriminated unions e faça exhaustiveness check;
- mantenha generics centrados na relação entre entradas e saídas;
- prefira `satisfies` quando quiser verificar sem alargar o tipo inferido;
- limite assertions a adapters auditáveis;
- alinhe `module`/`moduleResolution` ao runtime e ao bundler reais;
- execute type-checking no CI mesmo que outro transpiler faça emit.

## Anti-patterns

- substituir todo erro por `any`, double assertion ou `!`;
- acreditar que `as User` valida JSON;
- criar `BaseRepository<T, K, X...>` sem relações reais entre parâmetros;
- enums/const enums sem avaliar output e interoperabilidade;
- optional properties onde o domínio exige estados mutuamente exclusivos;
- manter types duplicados manualmente em cada lado de uma API;
- usar types recursivos/metaprogramação para exibir habilidade, sacrificando diagnostics;
- misturar configs de runtime, tests e tooling em um único project gigantesco.

## Performance

Existem duas performances diferentes:

1. **runtime:** é a do JavaScript emitido, engine e host;
2. **developer loop:** parse, module resolution, type checking, declaration emit e language service.

Para runtime, profile JavaScript e source maps correspondentes. Para checker, use `--extendedDiagnostics`, `--explainFiles`, `--traceResolution` e `--generateTrace`; reduza unions gigantes, conditional types distributivos e graphs globais apenas com evidência.

## Segurança

Tipos não cruzam trust boundaries. Valide dados, autenticação e autorização no runtime; limite payloads e trate prototype pollution, XSS, injection e SSRF conforme o host. Não confie em `.d.ts` como prova de comportamento de um package.

Proteja source maps, tokens do registry e secrets de build. Fixe compiler/dependencies, revise install scripts e mantenha atualização automatizada. `skipLibCheck` pode reduzir tempo, mas também oculta conflitos nas declarations — documente o trade-off.

## Testes

Combine:

- runtime tests para comportamento do JavaScript;
- compile-time tests para inference e erros esperados de APIs tipadas;
- integração para module resolution, emit e boundaries;
- schema/contract tests para dados externos;
- testes end-to-end para fluxos críticos.

Use `// @ts-expect-error` em teste de tipos apenas quando aquele erro é o contrato; ele falha se o erro desaparecer. Não use `@ts-ignore` como fixture silenciosa.

## Observabilidade

A instrumentação roda em JavaScript. Tipos ajudam a padronizar eventos, attributes e context propagation, mas cardinalidade, PII, sampling e lifecycle são problemas operacionais.

Observe também o toolchain: duração de type-check/build no CI, cache hits, memória do language service e regressões após atualizar TypeScript ou declarations. Gere traces só com cuidado, pois podem conter paths e source.

## Exemplos

Uma discriminated union torna transições visíveis:

```ts
type Payment =
  | { status: "pending"; createdAt: Date }
  | { status: "approved"; transactionId: string }
  | { status: "declined"; reason: string };

function assertNever(value: never): never {
  throw new Error(`estado inesperado: ${JSON.stringify(value)}`);
}

export function message(payment: Payment): string {
  switch (payment.status) {
    case "pending":
      return `aguardando desde ${payment.createdAt.toISOString()}`;
    case "approved":
      return `aprovado: ${payment.transactionId}`;
    case "declined":
      return `recusado: ${payment.reason}`;
    default:
      return assertNever(payment);
  }
}
```

Se um quarto estado entrar na union, o `default` deixa de receber `never` e o checker aponta o local. Dados externos ainda precisam ser convertidos para `Payment` por um parser confiável.

## Exercícios

Resolva a sequência [Beginner → Expert](exercises.md): migrar JS com segurança, modelar estados, construir validator, publicar declarations, medir checker e projetar um client resiliente.

Cada entrega inclui testes runtime e compile time, além de justificativa para assertions e escapes.

## Projeto prático

Construa um **SDK tipado para uma API de pedidos**:

- schemas de request/response validados em runtime;
- client com discriminated errors, timeout, cancellation e paginação async;
- generics somente onde preservam relações úteis;
- package ESM com declaration maps e exports corretos;
- compile-time tests para API pública e integration tests contra servidor fake;
- tracing hooks sem dependência obrigatória de vendor;
- compatibilidade, semantic versioning e migration guide.

O projeto será avaliado pelo JavaScript publicado, não só pela experiência no editor.

## Perguntas de entrevista

1. O que type erasure implica para segurança e reflection?
2. Como structural typing difere de nominal typing?
3. Quando usar `unknown`, `any` e `never`?
4. Como discriminated unions permitem exhaustiveness?
5. O que faz conditional type distribuir sobre union?
6. Qual relação um generic deveria preservar?
7. Por que uma type assertion não converte um valor?
8. Como declaration merging e module augmentation podem ajudar ou ferir manutenção?
9. Como diagnosticar type-check lento em um monorepo?
10. Como publicar package que funciona no runtime e oferece declarations corretas?

Responda com exemplo mínimo, limite do mecanismo e forma de verificar.

## Comparações

- **JavaScript:** TypeScript antecipa parte dos erros e melhora tooling, mas adiciona build/checking e herda todo o runtime JS.
- **Kotlin:** ambos oferecem generics e null-aware types; Kotlin é majoritariamente nominal e mantém runtime metadata diferente na JVM.
- **Go:** types mais simples e compilation para binário; TypeScript oferece modelagem estrutural expressiva e alcance Web.
- **Python:** type hints também são graduais, mas ecossistemas e semântica diferem; nenhum valida dados automaticamente.

Veja a [comparação geral](../comparison.md).

## Próximos estudos

1. JavaScript fundamentals e internals, se houver lacunas.
2. [Fundamentos de TypeScript](fundamentals.md).
3. [Compiler e type system](internals.md).
4. [Exercícios e SDK](exercises.md).
5. schemas/IDL, API design, package publishing e semantic versioning.
6. performance e observabilidade do runtime escolhido.

## Livros

- Boris Cherny, [*Programming TypeScript*](https://www.oreilly.com/library/view/programming-typescript/9781492037644/) — introdução sistemática, confirmando detalhes na documentação atual.
- Dan Vanderkam, [*Effective TypeScript*](https://effectivetypescript.com/) — práticas de modelagem e entendimento do sistema.

## Papers

- Gao et al., [*To Type or Not to Type: On the Effectiveness of Static Typing for JavaScript*](https://www.microsoft.com/en-us/research/publication/to-type-or-not-to-type-on-the-effectiveness-of-static-typing-for-javascript/) — estudo histórico; não extrapole os números de versões antigas para qualquer codebase.
- [Safe & Efficient Gradual Typing for TypeScript](https://www.microsoft.com/en-us/research/wp-content/uploads/2017/08/safets.pdf) — pesquisa sobre garantias além do TypeScript pragmático usado no dia a dia.

## Documentação oficial

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TSConfig Reference](https://www.typescriptlang.org/tsconfig/)
- [TypeScript Design Goals](https://github.com/microsoft/TypeScript/wiki/TypeScript-Design-Goals)

## Outras referências

Veja [Referências](references.md) para release notes, declarations, module resolution, compiler API, segurança e performance.

---

[← JavaScript](../javascript/README.md) · [↑ Linguagens](../README.md) · [→ Fundamentos](fundamentals.md)
