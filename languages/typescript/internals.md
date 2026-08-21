# TypeScript — internals

---

[← Fundamentos](fundamentals.md) · [↑ TypeScript](README.md) · [→ Exercícios](exercises.md)

Este capítulo explica por que o checker aceita, rejeita ou demora em um programa. A implementação do compiler evolui; o modelo conceitual abaixo é mais estável que nomes internos específicos.

## Pipeline mental

```text
arquivos + tsconfig + declarations de libraries
                 ↓
scanner/parser → syntax trees
                 ↓
binder → symbols e scopes
                 ↓
module resolution + program graph
                 ↓
checker → inference, assignability, control-flow analysis, diagnostics
                 ↓
emit → JavaScript, .d.ts, maps (se configurado)
```

Build tools podem fazer apenas transpilation e pular o checker. Por isso, “o bundle foi gerado” não prova que `tsc --noEmit` passou.

## Syntax, symbols e types

- **node:** elemento sintático em um source file;
- **symbol:** declaração/identidade ligada a um nome em determinado scope;
- **type:** conjunto/modelo que o checker usa para raciocinar sobre valores;
- **signature:** forma de chamada/construção;
- **program:** source graph com opções e libraries.

Um symbol pode reunir múltiplas declarations por declaration merging. Um node não é o mesmo que o type calculado para sua expressão; o mesmo syntax pode receber contextual types distintos.

## Inference

TypeScript combina fontes:

- inicializador e return expressions;
- argumentos e constraints de generics;
- contextual typing vindo do local esperado;
- control flow e discriminants;
- best common type entre candidatos.

```ts
const handlers = [
  (value: string) => value.length,
  (value: string) => Number(value),
];
```

O contexto pode inferir uma assinatura compartilhada. Se uma API exige anotações muito complexas no caller, talvez seu desenho esteja escondendo a relação necessária.

### Widening e freshness

Um literal pode ser preservado ou widened conforme mutabilidade e contexto. `as const` solicita tipos literais/readonly mais estreitos. Object literals “fresh” recebem excess-property checking em certos assignments:

```ts
type Point = { x: number; y: number };

const p1: Point = { x: 1, y: 2, color: "red" }; // diagnóstico
const colored = { x: 1, y: 2, color: "red" };
const p2: Point = colored; // estruturalmente compatível
```

Isso não é inconsistentemente “exact typing”; é um check de ergonomia para provável typo. Faça parsing/whitelisting se campos extras forem risco em runtime.

## Structural typing

Dois valores são compatíveis quando a estrutura requerida está presente, salvo regras especiais como private/protected members.

```ts
type Writer = { write(text: string): void };

const consoleWriter = {
  prefix: "app",
  write(text: string) {
    console.log(this.prefix, text);
  },
};

const writer: Writer = consoleWriter;
```

Benefício: adapters naturais e interoperabilidade com JavaScript. Custo: conceitos diferentes com a mesma representação podem ser misturados; brands e constructors validadores adicionam nominalidade seletiva.

## Assignability, subtyping e soundness

O checker usa relações pragmáticas de assignability. Os [design goals](https://github.com/microsoft/TypeScript/wiki/TypeScript-Design-Goals) explicitam que soundness total não é objetivo. Fontes comuns de confiança excessiva:

- `any` e type assertions;
- array/index access sem flag estrita apropriada;
- mutation/aliasing após narrowing;
- declarations incorretas sobre JavaScript;
- function parameter variance e exceções para métodos;
- lookup que pode retornar ausência, mas cujo tipo foi modelado sem ela;
- interoperabilidade com codegen ou reflection.

“Unsound” aqui não significa inútil. Significa que types reduzem classes de erro, não provam todo comportamento.

### Variance

Considere `Animal` e `Dog extends Animal`:

- um producer de `Dog` pode servir onde se espera producer de `Animal` (covariance);
- um consumer capaz de aceitar todo `Animal` pode servir onde se espera consumer de `Dog` (contravariance);
- um container mutável que lê e escreve tende a precisar invariance.

`strictFunctionTypes` melhora checking de function parameters, com compatibilidades históricas específicas. Desenhe APIs separando leitura e escrita e teste assignments que fazem parte do contrato.

## Control-flow analysis

O checker cria um graph de fluxo e refina tipos após checks, assignments, retornos e branches:

```ts
function length(value: string | readonly unknown[] | null): number {
  if (value === null) return 0;
  return value.length;
}
```

Narrowing precisa permanecer válido. Callbacks, aliasing e mutation podem tornar uma conclusão temporalmente frágil. Copiar o valor validado para um binding local ou modelar dados imutáveis ajuda, mas runtime concorrente/eventos ainda exige invariants reais.

### User-defined guards

```ts
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}
```

O checker confia no predicate. Se a implementação verificar só `Array.isArray`, o contrato fica falso. Trate guards como código de segurança e teste entradas adversariais.

## Type erasure e emit

Annotations, interfaces, aliases e a maioria dos constructs de types não existem no JavaScript emitido:

```ts
interface User { name: string }
const user = payload as User;
```

Após emit, restam assignment e valor de `payload`; nenhuma checagem é inserida. Alguns constructs TypeScript — como certas formas de enum, namespaces ou parameter properties — podem emitir JavaScript. Inspecione output, especialmente para libraries, tree shaking e side effects.

`target` controla transforms/syntax emitida; `lib` controla declarations disponíveis ao checker. Incluir `DOM` em `lib` não instala DOM no runtime.

## Generics por dentro

Generics permitem checar famílias de operações. Type parameters podem ser inferidos a partir de argumentos e contexto; constraints limitam operações permitidas.

```ts
function mapValue<T, U>(value: T, transform: (value: T) => U): U {
  return transform(value);
}
```

No emit usual, não há specialization por `T`/`U`; uma função JavaScript atende todos os casos. Logo, generic não acelera um tipo específico nem permite `new T()` sem receber runtime value/construtor.

## Mapped e indexed access types

```ts
type Events = {
  created: { id: string };
  deleted: { id: string; reason: string };
};

type ListenerMap<T> = {
  [K in keyof T]?: (payload: T[K]) => void;
};
```

O checker itera keys no espaço de tipos. `T[K]` preserva a relação key/value. Ao implementar APIs dinâmicas, loops de runtime podem perder essa correlação e pedir helper bem encapsulado — não espalhe assertions pelo domínio.

## Conditional types

```ts
type UnwrapPromise<T> = T extends PromiseLike<infer U> ? U : T;
type Distributed = UnwrapPromise<Promise<string> | number>; // string | number
```

Um conditional cujo checked type é type parameter nu distribui por union. `[T] extends [U]` impede isso. Distribuição aninhada e unions grandes multiplicam instantiations; aliases nomeados e modelagem mais direta melhoram diagnostics e performance.

## `never` e exhaustiveness

`never` representa ausência de valores possíveis. Após eliminar todos os members de uma discriminated union, resta `never`. Isso oferece feedback de evolução, desde que não exista `default` permissivo nem cast que mascare o estado.

Em runtime, dados novos ainda podem chegar. O parser deve rejeitar ou mapear versões desconhecidas antes de criar a union interna.

## Modules e resolução

TypeScript precisa encontrar source/declaration; o runtime/bundler precisa encontrar JavaScript. Esses algorithms devem estar alinhados.

Fatores relevantes:

- ESM versus CommonJS e extensão no specifier;
- `package.json` `type`, `exports`, `imports` e conditions;
- `module` e `moduleResolution`;
- declaration file escolhido para cada condition;
- aliases `paths`, que não necessariamente transformam output;
- types globais introduzidos por `types`/`typeRoots`.

Use `tsc --traceResolution` quando “funciona no editor” mas não no build/runtime. Teste o package empacotado em consumer mínimo.

## Declaration files

`.d.ts` descreve uma superfície de runtime. Uma declaration correta preserva generics, modules e compatibilidade; uma declaration otimista cria bugs ocultos.

Regras práticas:

- gere declarations a partir do source quando possível;
- não exponha tipos privados/inacessíveis no public API;
- teste exports em ESM/CommonJS targets realmente suportados;
- evite globals e module augmentation salvo integração intencional;
- trate mudança de inference/assignability percebida pelo consumer como possível breaking change;
- use API report/diff em releases de libraries críticas.

DefinitelyTyped é valioso, mas declarations podem divergir da versão instalada do JavaScript.

## Compiler API e language service

Compiler API permite criar programs, percorrer syntax trees e obter diagnostics/types. Language service adiciona operações incrementais de editor. APIs internas não documentadas mudam; para tooling durável, prefira API pública ou protocolos estáveis.

Transformers de AST precisam preservar source maps, comments necessários e semântica de modules. Codemods devem ter fixtures, idempotência e diff revisável.

## Performance do checker

Sintomas: editor lento, CI longo, memória alta ou declarations gigantes. Método:

1. fixe versão e reproduza sem plugins de editor;
2. execute `tsc --extendedDiagnostics`;
3. use `--explainFiles` para arquivos inesperados;
4. use `--traceResolution` para module graph;
5. gere trace em caso reduzido e proteja source/paths;
6. compare antes/depois.

Causas comuns incluem include amplo, globals, versões duplicadas de declarations, unions enormes, conditional types distributivos, inferred return types gigantes e projects mal particionados. Project references ajudam graphs coerentes, mas excesso de projects também custa.

## Incremental builds

Incremental compilation guarda metadata para evitar trabalho repetido. Cache precisa considerar compiler version, config e inputs; cache stale é defeito de correção. Em monorepo, espelhe dependências de packages e impeça import cruzado por path privado.

Meça cold e warm build separadamente. Um ganho local que aumenta complexidade do CI pode não valer.

## Runtime performance

TypeScript não otimiza agressivamente programas como objetivo; quem executa é o JavaScript host. Ao analisar:

- veja o JavaScript e source map do build real;
- inclua transforms do bundler/polyfills;
- diferencie type-check time de runtime latency;
- não espere que annotations especializem código;
- evite constructs com emit surpreendente sem medir bundle/side effects.

## Segurança e trust boundaries

O fluxo seguro é:

```text
bytes não confiáveis → parse com limites → validate → normalize → tipo de domínio
```

Code generation reduz duplicação, mas schema e generator podem divergir. Fixe versões, teste fixtures válidas/inválidas e preserve compatibilidade de protocolo. Type assertions devem aparecer apenas em adapters cuja invariant possa ser revisada.

Compiler plugins, declarations e install scripts são código/suprimento não confiável. Execute builds com secrets mínimos e ambientes isolados.

## Experimentos guiados

### 1. Erasure

Compile interfaces, generic, class com `#private`, enum e `as const` em targets distintos. Faça diff do emit e explique o que existe no runtime.

### 2. Structural surprises

Construa exemplos de excess property, object intermediário, brand e class private member. Classifique quais diferenças são compile-time e runtime.

### 3. Distribution

Implemente conditional type distributivo e não distributivo. Use union crescente e registre diagnostics/time; simplifique sem perder API.

### 4. Module resolution

Crie package mínimo com `exports` conditions e declarations. Use `--traceResolution`, `npm pack` e consumers ESM/CommonJS apenas se ambos forem suportados.

### 5. Unsound boundary

Receba JSON malformado, force `as Domain` e observe a falha tardia. Substitua por parser `unknown → Domain` e compare error locality.

## Checklist de revisão

- [ ] Distingo syntax node, symbol, type, declaration e runtime value.
- [ ] Explico inference, contextual typing, widening e narrowing.
- [ ] Sei por que structural typing e soundness pragmática geram escapes.
- [ ] Prevejo distribuição de conditional type e custo de unions.
- [ ] Verifico module resolution no checker e runtime.
- [ ] Inspeciono declarations e JavaScript publicados.
- [ ] Diagnostico checker com dados, não flags aleatórias.

## Fontes primárias

- [TypeScript Compiler Internals](https://github.com/microsoft/TypeScript/wiki/Architectural-Overview)
- [TypeScript Design Goals](https://github.com/microsoft/TypeScript/wiki/TypeScript-Design-Goals)
- [Type Compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)
- [Type Inference](https://www.typescriptlang.org/docs/handbook/type-inference.html)
- [Module Reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html)
- [Compiler performance guide](https://github.com/microsoft/TypeScript/wiki/Performance)

---

[← Fundamentos](fundamentals.md) · [↑ TypeScript](README.md) · [→ Exercícios](exercises.md)
