# TypeScript — fundamentos

---

[← Visão geral](README.md) · [↑ TypeScript](README.md) · [→ Internals](internals.md)

TypeScript é mais útil quando o tipo comunica uma relação ou exclui um estado inválido. Anotar cada variável sem pensar no domínio produz ruído, não segurança.

## Configuração inicial

Instale TypeScript como development dependency do projeto e fixe a versão no lockfile. Uma base estrita para ESM em Node.js pode ser:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "useUnknownInCatchVariables": true,
    "verbatimModuleSyntax": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["dist"]
}
```

Não copie a configuração sem entender o target. Browser/bundler, Node.js e libraries precisam de combinações de `module`, `moduleResolution`, `lib` e emit diferentes. `strict` agrupa checks importantes, mas outras flags precisam ser escolhidas explicitamente.

Separe type-check de emit quando o bundler transpila:

```text
tsc --noEmit
```

## Paradigmas e efeito do type system

TypeScript herda o runtime multiparadigma do JavaScript: código procedural,
funções de primeira classe e closures, composição de objetos, classes/prototypes
e APIs declarativas continuam executando com a mesma semântica. O checker
acrescenta contratos estáticos, não um novo modelo de objetos em runtime.

- **procedural:** funções e módulos explícitos são adequados a fluxos lineares;
- **orientado a objetos:** classes existem em JavaScript, enquanto interfaces
  TypeScript são estruturais e desaparecem no emit;
- **funcional/composição:** funções, discriminated unions e valores `readonly`
  favorecem transformação explícita; `readonly` é shallow e só compile-time;
- **declarativo:** tipos podem verificar configurações/DSLs, mas framework e
  runtime definem sua execução.

Imutabilidade é decisão de design: `as const`, `Readonly<T>` e readonly arrays
restringem writers conhecidos, mas não congelam o valor nem eliminam aliasing.

## Inference e annotations

Inference local reduz duplicação:

```ts
const retries = 3; // tipo 3 para const em muitos contextos; assignability pode alargar
let status = "pending"; // normalmente string, pois pode ser reatribuído

function total(values: readonly number[]) {
  return values.reduce((sum, value) => sum + value, 0);
}
```

Anote fronteiras públicas quando isso estabiliza a intenção:

```ts
export function percentage(part: number, total: number): number | null {
  return total === 0 ? null : (part / total) * 100;
}
```

O retorno explícito impede uma alteração acidental de contrato. Dentro da função, inference basta.

## Primitive, literal e object types

Use `string`, `number` e `boolean`, não wrappers `String`, `Number`, `Boolean`. Literal types restringem valores:

```ts
type LogLevel = "debug" | "info" | "warn" | "error";

type ServiceConfig = {
  readonly name: string;
  level: LogLevel;
  timeoutMs?: number;
};
```

Uma optional property significa ausência possível, não necessariamente presença com `undefined`; `exactOptionalPropertyTypes` torna essa distinção mais precisa.

Object types não são exact by default. Excess-property checks ajudam em object literals, mas uma variável pode possuir campos extras e continuar assignable. Segurança não deve depender de remoção implícita de dados.

## `type` e `interface`

Ambos descrevem shapes. `interface` suporta declaration merging e extensão; `type` expressa unions, tuples e aliases gerais.

```ts
interface Clock {
  now(): Date;
}

type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };
```

Escolha uma convenção simples. Declaration merging é útil para extensão intencional de APIs e perigoso quando altera globals implicitamente.

## Arrays, tuples e readonly

```ts
type Coordinate = readonly [latitude: number, longitude: number];

function first<T>(items: readonly T[]): T | undefined {
  return items[0];
}
```

`readonly` impede mutação por aquela referência no compile time; não congela o array no runtime e é shallow. Com `noUncheckedIndexedAccess`, acesso indexado lembra que a posição talvez não exista.

## Unions e intersections

Union significa “um destes”; intersection exige compatibilidade com todos:

```ts
type Draft = { state: "draft"; content: string };
type Published = { state: "published"; content: string; publishedAt: Date };
type Article = Draft | Published;

type Audited = { createdBy: string; createdAt: Date };
type AuditedArticle = Article & Audited;
```

Não use intersection para “sobrescrever” propriedade incompatível; o resultado pode virar `never`. Prefira `Omit<Base, "field"> & { field: NewType }` apenas quando essa composição reflete o contrato.

## Narrowing

O checker acompanha control flow:

```ts
export function render(article: Article): string {
  if (article.state === "published") {
    return `${article.content} (${article.publishedAt.toISOString()})`;
  }
  return `${article.content} (rascunho)`;
}
```

Mecanismos comuns:

- `typeof` para primitives;
- `Array.isArray` e `instanceof` quando a identidade de runtime é confiável;
- `in` para propriedades;
- discriminant literal;
- predicate (`value is T`) ou assertion function.

Um type guard escrito incorretamente engana o checker. Teste sua implementação como parser.

## `unknown`, `any`, `never` e `void`

| Tipo | Uso |
| --- | --- |
| `unknown` | valor ainda não validado; exige narrowing |
| `any` | escape que desativa checks e se propaga; isole em adapter |
| `never` | caminho impossível/que não retorna; útil para exhaustiveness |
| `void` | retorno cujo valor não é usado; não significa sempre “retorna undefined” em assignability |

```ts
function assertNever(value: never): never {
  throw new Error(`valor inesperado: ${String(value)}`);
}
```

Evite `any[]` e `Record<string, any>` em boundaries. Comece com `unknown`.

## `null` e `undefined`

Com `strictNullChecks`, ausência faz parte do tipo. Não abuse de non-null assertion:

```ts
function requireEnv(env: Record<string, string | undefined>, key: string): string {
  const value = env[key];
  if (value === undefined || value === "") {
    throw new Error(`configuração ausente: ${key}`);
  }
  return value;
}
```

`value!` apenas remove a dúvida do checker. Prefira provar a invariant ou centralizar uma assertion function.

## Functions

```ts
type Comparator<T> = (left: T, right: T) => number;

export function sorted<T>(items: readonly T[], compare: Comparator<T>): T[] {
  return [...items].sort(compare);
}
```

Parâmetros opcionais e defaults modelam chamadas distintas. Para APIs com formas realmente diferentes, overloads podem melhorar o caller, mas a implementação precisa cobrir todas e não fica automaticamente validada em runtime.

Prefira union quando retorno não muda com a entrada; use overload/generic quando existe relação útil.

## Generics e constraints

Um generic preserva informação:

```ts
function getProperty<T extends object, K extends keyof T>(object: T, key: K): T[K] {
  return object[key];
}

const user = { id: 1, name: "Ada" };
const name = getProperty(user, "name"); // string
```

Se um type parameter aparece uma única vez, talvez não relacione nada e um tipo concreto/`unknown` seja melhor. Constraints limitam operações, não validam o valor no runtime.

### Variance em uma frase

Variance descreve como assignability de `T` se transfere para containers/functions. Producers tendem a covariância; consumers, contravariância. Mutabilidade mistura as duas e pede invariância conceitual. TypeScript mantém algumas concessões pragmáticas, então teste APIs sensíveis.

## Utility e mapped types

Mapped types transformam propriedades:

```ts
type OptionalExcept<T, K extends keyof T> =
  Partial<Omit<T, K>> & Pick<T, K>;
```

Built-ins úteis incluem `Pick`, `Omit`, `Partial`, `Required`, `Readonly`, `Record`, `Parameters`, `ReturnType` e `Awaited`. Eles transformam tipos, não valores. `Readonly<User>` não chama `Object.freeze`.

## Conditional types e `infer`

```ts
type ElementOf<T> = T extends readonly (infer Item)[] ? Item : never;
type Item = ElementOf<readonly string[]>; // string
```

Quando `T` nu é um type parameter, conditional types distribuem sobre unions. Envolver os lados em tuples (`[T] extends [U]`) evita distribuição quando necessário. Tipos recursivos profundos ou unions combinatórias podem degradar diagnostics e performance.

## Template literal types

```ts
type Entity = "user" | "order";
type EventName = `${Entity}.created` | `${Entity}.deleted`;
```

São úteis para vocabulários finitos. Não tente representar toda string possível do mundo real no type system; runtime parsers permanecem necessários.

## `as const` e `satisfies`

```ts
type Route = { method: "GET" | "POST"; path: `/${string}` };

const routes = {
  health: { method: "GET", path: "/health" },
  create: { method: "POST", path: "/orders" },
} satisfies Record<string, Route>;
```

`satisfies` verifica compatibilidade preservando um tipo inferido mais específico. `as const` torna literais readonly/narrow; nenhuma das duas opções valida input externo.

## Classes e nominalidade seletiva

Public members participam estruturalmente. Private/protected members criam compatibilidade ligada à declaração; JavaScript `#private` também possui privacidade no runtime.

Para IDs que não devem ser misturados, use constructor/parser e brand escondida:

```ts
declare const userIdBrand: unique symbol;
export type UserId = string & { readonly [userIdBrand]: true };

export function parseUserId(value: string): UserId {
  if (!/^usr_[a-z0-9]+$/.test(value)) throw new Error("UserId inválido");
  return value as UserId;
}
```

A assertion fica confinada no constructor que realmente valida a invariant.

## Runtime validation

```ts
type User = { id: UserId; name: string };

export function parseUser(value: unknown): User {
  if (typeof value !== "object" || value === null) throw new Error("object esperado");
  const record = value as Record<string, unknown>;
  if (typeof record.id !== "string" || typeof record.name !== "string") {
    throw new Error("campos de user inválidos");
  }
  return { id: parseUserId(record.id), name: record.name };
}
```

O cast para `Record<string, unknown>` permite inspeção, não afirma `User`. Para schemas complexos, uma biblioteca pode reduzir boilerplate; meça tamanho, performance, error reporting e source of truth.

## Errors como domínio

Para falhas esperadas, unions comunicam resultado:

```ts
type LookupError =
  | { kind: "not_found"; id: UserId }
  | { kind: "unavailable"; retryable: boolean; cause: unknown };

type LookupResult = Result<User, LookupError>;
```

Exceptions continuam apropriadas para quebrar fluxo. `catch` recebe `unknown` sob configuração estrita: faça narrowing antes de acessar `message`.

## Modules e imports de tipos

```ts
import type { User } from "./user.js";
import { parseUser } from "./user.js";
```

O specifier precisa funcionar no JavaScript/runtime após emit. `paths` ajuda resolução do checker, mas não reescreve imports para o runtime por si só. Teste o artefato publicado em ambiente limpo.

## Package management e declarations

- TypeScript é dependency de desenvolvimento do projeto, não instalação global implícita;
- `@types/*` descreve libraries que não distribuem declarations próprias;
- `types`/`exports` devem apontar para arquivos realmente publicados;
- declaration maps melhoram navigation, mas podem expor paths/source;
- uma mudança em `.d.ts` pode ser breaking mesmo com JavaScript idêntico;
- consumers podem usar compiler versions e module resolvers diferentes: declare suporte.

## Testes runtime e compile time

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { parseUserId } from "./user.js";

test("rejeita prefixo inválido", () => {
  assert.throws(() => parseUserId("42"), /inválido/);
});

const valid = parseUserId("usr_42");
// @ts-expect-error ids arbitrários não são UserId
const invalid: typeof valid = "42";
```

Compile-time tests não substituem execução. Execute `tsc --noEmit` e o test runner no CI.

## Checklist de fundamentos

- [ ] Uso inference local e anoto contratos públicos deliberadamente.
- [ ] Modelo estados com unions em vez de combinações opcionais inválidas.
- [ ] Recebo `unknown` e valido dados antes do domínio.
- [ ] Sei quando generic preserva uma relação.
- [ ] Distingo readonly compile-time de imutabilidade runtime.
- [ ] Entendo mapped/conditional types e limite sua complexidade.
- [ ] Alinho module resolution ao ambiente que executará o emit.
- [ ] Testo tanto types quanto comportamento.

---

[← Visão geral](README.md) · [↑ TypeScript](README.md) · [→ Internals](internals.md)
