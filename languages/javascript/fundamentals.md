# JavaScript — fundamentos

---

[← Visão geral](README.md) · [↑ JavaScript](README.md) · [→ Internals](internals.md)

O objetivo deste capítulo é desenvolver precisão semântica. Execute cada trecho em um runtime moderno, altere entradas e explique o resultado antes de avançar.

## Ambiente mínimo

Use uma versão suportada do Node.js para os exemplos de terminal. Declare ES modules no `package.json`:

```json
{
  "name": "javascript-lab",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test"
  },
  "engines": {
    "node": ">=22"
  }
}
```

O número é um exemplo de baseline, não uma recomendação eterna. Escolha uma linha suportada, fixe-a no CI e acompanhe [releases do Node.js](https://nodejs.org/en/about/previous-releases).

## Valores, variáveis e tipos

Os primitive values são `undefined`, `null`, boolean, number, bigint, string e symbol. Todo o restante é object; functions são objects chamáveis.

```js
const attempts = 3;
const exact = 9_007_199_254_740_993n;
const label = "ready";
const options = { retries: attempts };

console.log(typeof attempts); // "number"
console.log(typeof null);     // "object": legado histórico
console.log(Array.isArray([]));
```

`const` impede reatribuir o binding, não congela o object:

```js
const config = { timeoutMs: 500 };
config.timeoutMs = 1_000; // permitido
// config = {};           // TypeError/erro de atribuição
```

Use `Object.freeze` apenas sabendo que é shallow. Imutabilidade útil vem de ownership e de produzir novos valores, não de espalhar cópias profundas sem medir.

### Number e precisão

`number` segue IEEE 754 binary64. Inteiros acima de `Number.MAX_SAFE_INTEGER` perdem precisão; dinheiro deve usar inteiro na menor unidade ou uma biblioteca decimal adequada ao domínio.

```js
const cents = 1999;
const taxBasisPoints = 750;
const tax = Math.round((cents * taxBasisPoints) / 10_000);
```

Não misture `bigint` e `number` em aritmética. JSON também não serializa `bigint` automaticamente.

## Igualdade, coerção e ausência

Prefira `===` e `!==` como default. Entenda, contudo, que estruturas da plataforma podem usar outros algoritmos:

```js
NaN === NaN;                // false
Object.is(NaN, NaN);        // true
Object.is(0, -0);           // false
[NaN].includes(NaN);        // true (SameValueZero)
```

`??` escolhe fallback apenas para `null`/`undefined`; `||` também troca `0`, `false` e string vazia:

```js
function pageSize(input) {
  return input ?? 25;
}

console.log(pageSize(0)); // 0: depois valide se é aceitável
```

Distinguir “ausente”, `null`, vazio e zero é decisão de domínio.

## Control flow e pattern pragmático

Guard clauses deixam pré-condições visíveis:

```js
export function percentage(part, total) {
  if (!Number.isFinite(part) || !Number.isFinite(total)) {
    throw new TypeError("part e total devem ser finitos");
  }
  if (total === 0) return null;
  return (part / total) * 100;
}
```

Use `switch` apenas com `break`/`return` claros. JavaScript ainda não fornece exhaustiveness check nativo; testes ou TypeScript podem cobrir estados fechados.

## Collections

### Array

Arrays são sequências indexadas e mutáveis. Escolha operações pelo significado:

```js
const orders = [
  { id: "a", total: 120, paid: true },
  { id: "b", total: 80, paid: false },
  { id: "c", total: 30, paid: true },
];

const revenue = orders
  .filter((order) => order.paid)
  .reduce((sum, order) => sum + order.total, 0);

console.log(revenue); // 150
```

`map` transforma, `filter` seleciona, `some`/`every` perguntam e `reduce` acumula. Um loop explícito pode ser mais claro e alocar menos em hot paths medidos.

### Object, Map e Set

- use object para records com campos conhecidos;
- use `Map` para chaves dinâmicas de qualquer tipo e iteração previsível;
- use `Set` para unicidade e membership;
- use `WeakMap` para associar metadata a objects sem impedir coleta, não como cache observável.

```js
export function indexById(items) {
  const index = new Map();
  for (const item of items) {
    if (index.has(item.id)) throw new Error(`id duplicado: ${item.id}`);
    index.set(item.id, item);
  }
  return index;
}
```

Para dicionário vindo de entrada externa, `Map` costuma evitar colisões com propriedades especiais. Não faça `Object.assign(target, untrusted)` sem política de chaves.

## Functions, scope e closures

Functions capturam bindings do lexical environment:

```js
export function createRateLimiter(limit) {
  let remaining = limit;
  return () => {
    if (remaining === 0) return false;
    remaining -= 1;
    return true;
  };
}
```

Essa closure mantém `remaining` vivo. O recurso é útil para encapsulamento e também pode reter graphs grandes acidentalmente.

### `this`: chamada, não local de declaração

Em uma regular function, `this` depende da forma de chamada; arrow functions capturam o `this` externo e não têm `prototype` construtível.

```js
const counter = {
  value: 0,
  increment() {
    this.value += 1;
  },
};

counter.increment();
```

Não extraia `const inc = counter.increment` esperando preservar o receiver. Prefira APIs que não dependam de binding implícito ou faça `bind` deliberadamente.

## Objects, classes e composição

Classes são syntax sobre mecanismos de prototypes, com semântica própria para private fields e inicialização. Use-as quando identidade e lifecycle forem importantes. Para transformação de dados, funções e composição costumam bastar.

```js
export class Cart {
  #lines = [];

  add(product, quantity) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new RangeError("quantity deve ser positiva");
    }
    this.#lines.push({ product, quantity });
  }

  total() {
    return this.#lines.reduce(
      (sum, { product, quantity }) => sum + product.price * quantity,
      0,
    );
  }
}
```

Private fields são enforced pelo runtime. Uma propriedade `_name` é apenas convenção.

## Iterables e generators

O iterable protocol separa produção de consumo. Generators expressam pipelines lazy:

```js
export function* chunks(items, size) {
  if (!Number.isInteger(size) || size <= 0) throw new RangeError("size inválido");
  for (let i = 0; i < items.length; i += size) {
    yield items.slice(i, i + size);
  }
}
```

Async iterables são úteis para streams, paginação e filas; o consumidor usa `for await...of` e deve poder cancelar/liberar recursos.

## Módulos

```js
// price.js
export function applyDiscount(cents, basisPoints) {
  return cents - Math.round((cents * basisPoints) / 10_000);
}

// checkout.js
import { applyDiscount } from "./price.js";
```

ES modules têm bindings live e avaliação única por module graph/realm. Evite side effects na importação: eles dificultam testes, ordenação e tree shaking.

Use exports explícitos. Deep imports em internals de uma dependência criam acoplamento com paths não públicos.

## Erros

Exceptions servem para falhas que interrompem o fluxo normal. Para estados esperados do domínio, um resultado explícito pode comunicar melhor.

```js
export function parsePort(raw) {
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1 || value > 65_535) {
    return { ok: false, error: "invalid_port" };
  }
  return { ok: true, value };
}
```

Ao reempacotar uma exception, preserve `cause`. Capture apenas quando puder recuperar, contextualizar ou limpar recursos. `finally` não deve mascarar o erro original.

## Promises e I/O

Uma Promise representa eventual settlement, não uma thread. `async` sempre devolve Promise.

```js
export async function fetchJson(url, { timeoutMs = 2_000 } = {}) {
  const signal = AbortSignal.timeout(timeoutMs);
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}
```

Valide o JSON depois. Timeout, retry e idempotência são políticas distintas; não faça retry indiscriminado de operações não idempotentes.

### Concorrência limitada

`Promise.all(items.map(work))` inicia tudo imediatamente. Para entrada grande, use workers lógicos:

```js
export async function mapConcurrent(items, limit, operation) {
  if (!Number.isInteger(limit) || limit < 1) throw new RangeError("limit inválido");
  const output = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      output[index] = await operation(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return output;
}
```

Defina ainda comportamento de falha e cancellation: o exemplo interrompe a espera no primeiro rejection, mas operações já iniciadas continuam se a API não receber um signal.

## I/O e streams

Browser e Node.js expõem APIs diferentes. Prefira processamento incremental para dados grandes. Backpressure significa que o produtor respeita a capacidade do consumidor; sem isso, buffers transformam throughput em memory pressure.

Feche handles e listeners em caminhos de sucesso, erro e cancelamento. Em serviços, implemente graceful shutdown: pare de aceitar trabalho, aguarde um prazo e libere recursos.

## Package management

`package.json` declara metadata e ranges; o lockfile registra a resolução reproduzível para um client. Boas práticas:

- mantenha um único lockfile coerente e use instalação frozen/clean no CI;
- diferencie runtime dependencies de development tooling;
- publique apenas arquivos necessários e defina `exports` para API pública;
- não use ranges amplos sem estratégia de atualização/testes;
- revise lifecycle scripts, proveniência, advisories e pacote antes de instalar;
- não confunda download count com qualidade ou segurança.

## Paradigmas

- **procedural:** passos explícitos, apropriados para orchestration;
- **object-oriented:** objects/prototypes encapsulam estado e comportamento;
- **functional:** funções puras, higher-order functions e composição reduzem state coupling;
- **event-driven/declarative:** handlers e descrições de transformação respondem ao host.

Misture paradigmas por problema, não por identidade. Imutabilidade reduz shared-state bugs, mas copiar estruturas enormes tem custo; ownership claro pode ser suficiente.

## Teste mínimo com `node:test`

```js
import assert from "node:assert/strict";
import test from "node:test";
import { indexById } from "./collections.js";

test("indexById rejeita ids duplicados", () => {
  assert.throws(
    () => indexById([{ id: "a" }, { id: "a" }]),
    /id duplicado/,
  );
});
```

O teste verifica comportamento público, não a estrutura interna do `Map`.

## Checklist de fundamentos

- [ ] Distingo primitive, object, binding e mutabilidade.
- [ ] Sei escolher `Array`, object, `Map` e `Set`.
- [ ] Explico closure, prototype e regras essenciais de `this`.
- [ ] Escrevo ES modules sem side effects ocultos.
- [ ] Modelo falhas esperadas e exceptions inesperadas de forma consistente.
- [ ] Uso Promises com timeout, cancellation e concorrência limitada.
- [ ] Trato packages e dados externos como parte da superfície de segurança.

## Próxima etapa

Estude [Internals](internals.md) e confirme o modelo executando os experimentos. Depois resolva os [exercícios](exercises.md) sem copiar abstrações prontas.

---

[← Visão geral](README.md) · [↑ JavaScript](README.md) · [→ Internals](internals.md)
