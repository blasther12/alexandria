# JavaScript

---

[← Python](../python/README.md) · [↑ Linguagens](../README.md) · [→ Fundamentos](fundamentals.md)

JavaScript é a linguagem da Web e um runtime ecosystem muito além do browser. A trilha parte da semântica de ECMAScript, separa linguagem de APIs do host e chega a concorrência, segurança e operação em produção.

## O que é

JavaScript é uma linguagem dinâmica, garbage-collected, baseada em prototypes e com funções de primeira classe. ECMAScript define a linguagem; browsers, Node.js e outros hosts fornecem event loops, timers, rede, arquivos e interfaces de plataforma.

Essa distinção importa: `Promise` pertence à linguagem, enquanto `fetch`, DOM e filesystem são APIs do ambiente e variam em disponibilidade e comportamento.

## Para que serve

- interfaces Web e Progressive Web Apps;
- APIs, BFFs, realtime gateways e automação com Node.js;
- funções serverless e edge runtimes;
- aplicações mobile/desktop por frameworks cross-platform;
- extensões, CLIs, build tools e embedded scripting.

## Quando utilizar

Use quando o browser for um target, quando o produto depender do ecossistema Web ou quando uma carga I/O-bound se beneficiar do modelo event-driven. Também é uma escolha pragmática quando o time consegue compartilhar tooling e conhecimento entre frontend e backend.

## Quando não utilizar

Considere outra ferramenta quando houver hard real-time, computação numérica CPU-bound sem bibliotecas/workers adequados, restrições severas de runtime ou quando o domínio exigir garantias estáticas que a equipe não pretende obter com TypeScript e runtime validation. Evite Node.js para bloquear o event loop com processamento pesado; separar o worker pode ser melhor do que trocar todo o sistema.

## Como funciona

O source é parseado por uma engine, que cria representações internas, interpreta ou compila código e otimiza hot paths. Um host agenda jobs e tarefas de I/O; a engine executa JavaScript em uma call stack por agent. Promise reactions entram na microtask queue e são drenadas nos checkpoints definidos pelo host.

Engines modernas, como V8, usam JIT compilation e garbage collectors sofisticados, mas esses mecanismos não fazem parte do contrato de ECMAScript. Veja [Internals](internals.md).

## Conceitos fundamentais

- valores primitivos, objects e coerção;
- `const`, `let`, lexical scope e closures;
- arrays, `Map`, `Set` e iterables;
- functions, methods, `this` e prototype chain;
- control flow, `Error` e `try`/`catch`/`finally`;
- ES modules com `import`/`export`;
- Promises, `async`/`await` e I/O do host.

Pratique esses tópicos em [Fundamentos](fundamentals.md).

## Conceitos intermediários

- property descriptors, getters/setters e composition;
- iterators, generators e async iterators;
- cancellation com `AbortSignal`, timeouts e limite de concorrência;
- module resolution, package exports e semantic versioning;
- testes de unidade, integração e contrato;
- serialização, streams e backpressure;
- DOM/event delegation no browser ou streams/process lifecycle no Node.js.

## Conceitos avançados

- ECMAScript execution contexts, realms e jobs;
- memory retention, weak references e GC observável apenas indiretamente;
- workers, transferable objects e paralelismo;
- profiling de CPU/heap e análise de event-loop lag;
- metaprogramação com `Proxy`/`Reflect` e seus custos;
- desenho de APIs assíncronas canceláveis e resistentes a overload;
- leitura da especificação e processo de proposals do TC39.

## Internals

Três camadas explicam o comportamento:

1. **ECMAScript:** semântica de valores, objetos, execution contexts, modules e Promise jobs.
2. **Engine:** parser, bytecode/interpreter, JIT, object layouts e garbage collector.
3. **Host:** event loop, timers, I/O, workers e APIs como DOM ou filesystem.

Não use detalhes do V8 como garantia universal. Use-os para diagnóstico no runtime escolhido. O capítulo [Internals](internals.md) constrói esse modelo com experimentos.

## Ecossistema

- **Browser:** DOM, Web APIs, DevTools, Web Workers e Service Workers.
- **Server:** Node.js e runtimes alternativos com compatibilidades próprias.
- **Packages:** npm registry e clients que entendem `package.json`/lockfiles.
- **Quality:** formatter, linter, test runner, bundler e type checker quando necessário.

Adote a menor toolchain que satisfaça o produto. Cada etapa de build adiciona capacidade e também tempo, configuração e risco de supply chain.

## Boas práticas

- use ES modules e declare o suporte de runtime;
- prefira `const`, igualdade estrita e funções pequenas com dependências explícitas;
- valide toda fronteira externa; `JSON.parse` devolve dados, não confiança;
- modele erros operacionais, preserve `cause` e não descarte stack traces;
- limite fan-out, propague cancellation e defina timeouts;
- mantenha side effects nas bordas e lógica de domínio testável no centro;
- fixe dependências com lockfile, automatize atualizações e reduza packages triviais;
- meça antes de otimizar e registre SLOs antes de escolher métricas.

## Anti-patterns

- confiar em truthiness quando `0`, `""` ou `false` são valores válidos;
- misturar callbacks, Promises e eventos sem uma política de erro;
- usar `forEach(async () => ...)` esperando que o caller aguarde;
- criar Promises manualmente para APIs que já retornam Promise;
- disparar concorrência ilimitada com `Promise.all` sobre entrada arbitrária;
- engolir exceptions ou rejeições e continuar em estado desconhecido;
- usar `eval`, `new Function` ou merge ingênuo de objetos não confiáveis;
- otimizar para detalhes de engine sem profile reproduzível.

## Performance

Primeiro descubra se o limite é CPU, memória, rede, storage ou fila. Para browser, observe Core Web Vitals e long tasks; para servidor, meça throughput, p95/p99, event-loop lag, heap e GC. Faça warm-up quando o objetivo inclui JIT e compare builds equivalentes.

Evite bloquear o event loop. Divida trabalho, use streaming/backpressure ou workers para CPU. Objects estáveis podem ajudar engines, mas clareza e algoritmo correto têm impacto maior que “truques de JIT”.

## Segurança

- trate DOM injection com APIs seguras e uma Content Security Policy; não concatene HTML não confiável;
- valide schema, tamanho, encoding e autorização no servidor;
- não passe entrada ao shell, `eval`, paths ou queries sem APIs parametrizadas e políticas explícitas;
- proteja contra prototype pollution ao fazer merges e dicionários;
- nunca envie secrets para bundles de cliente;
- revise lifecycle, scripts de instalação e dependências transitivas;
- mantenha runtime e packages corrigidos e produza inventário/SBOM quando aplicável.

OWASP e as políticas do host complementam a linguagem; veja [Referências](references.md).

## Testes

Use a pirâmide como heurística, não dogma:

- testes unitários para regras puras e casos de borda;
- testes de integração para banco, rede, modules e timers reais;
- contract tests para fronteiras entre serviços;
- end-to-end para poucos fluxos críticos;
- property-based/fuzzing para parsers e invariantes quando o risco justificar.

Controle relógio, random e I/O por interfaces. Não faça mock de tudo: um mock que não representa a dependência dá falsa confiança. O test runner embutido do Node.js é suficiente para muitos projetos; ferramentas adicionais devem resolver uma necessidade concreta.

## Observabilidade

Produza logs estruturados com timestamp, severity, operation e correlation ID, sem PII ou tokens. Meça taxa, erros, duração e saturação; propague trace context em chamadas assíncronas. Capture unhandled rejections/uncaught exceptions para diagnóstico, mas trate o processo potencialmente inconsistente e faça shutdown controlado.

Em Node.js, combine métricas de aplicação com event-loop delay, heap, GC e handles. No browser, use `Performance` APIs e telemetria com sampling e privacidade.

## Exemplos

Este exemplo faz I/O cancelável, valida a fronteira e preserva a causa do erro:

```js
export async function loadUser(id, { signal, fetchImpl = fetch } = {}) {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new TypeError("id deve ser um inteiro positivo");
  }

  let response;
  try {
    response = await fetchImpl(`/api/users/${id}`, { signal });
  } catch (error) {
    throw new Error(`falha ao consultar user ${id}`, { cause: error });
  }

  if (!response.ok) {
    throw new Error(`upstream respondeu ${response.status}`);
  }

  const value = await response.json();
  if (typeof value?.name !== "string") {
    throw new TypeError("resposta inválida: name ausente");
  }
  return { id, name: value.name };
}
```

O optional chaining evita uma exception, mas a checagem explícita é que valida o contrato. Em produção, prefira um schema validator centralizado para payloads complexos.

## Exercícios

A trilha contém desafios [Beginner, Intermediate, Advanced e Expert](exercises.md). Cada solução deve incluir testes, explicação de complexidade, casos de erro e instruções de execução.

Comece reimplementando `groupBy`, avance para uma fila assíncrona limitada e termine diagnosticando retenção de memória e projetando um serviço resiliente.

## Projeto prático

Construa um **agregador de status de dependências**:

- API recebe uma lista limitada de endpoints autorizados;
- executa checks com timeout, cancellation e limite de concorrência;
- expõe estado agregado e stream de atualizações;
- possui cache com TTL, graceful shutdown e tratamento de falha parcial;
- inclui testes unitários, integração com servidor fake e load test;
- emite logs estruturados, métricas RED e traces;
- entrega threat model, runbook e uma análise de profile.

Evite transformar o exercício em SSRF: use allowlist de hosts, bloqueie redes reservadas e não siga redirects indiscriminadamente.

## Perguntas de entrevista

1. Qual a diferença entre linguagem, engine e host?
2. Como lexical scope e closure afetam lifetime de memória?
3. Quando `===`, `Object.is` e SameValueZero divergem?
4. O que acontece entre resolver uma Promise e executar seu handler?
5. Por que `await` em loop pode ser correto — e quando limita throughput?
6. Como impor backpressure a milhares de operações?
7. Qual a diferença entre concorrência no event loop e paralelismo em workers?
8. Como investigar event-loop lag e memory leak sem adivinhar?
9. Como evitar prototype pollution e DOM-based XSS?
10. Quando escolher JavaScript em vez de TypeScript, Go ou Python?

Uma boa resposta explicita contexto, mecanismo, trade-off e forma de verificar.

## Comparações

- **TypeScript:** adiciona análise estática e apaga tipos ao emitir JavaScript; não muda o runtime nem valida rede.
- **Python:** ambos são dinâmicos e produtivos; Python domina dados/IA, enquanto JavaScript é nativo no browser.
- **Go:** oferece tipos estáticos, goroutines e binários; JavaScript oferece alcance Web e flexibilidade de runtime.
- **Kotlin:** possui null safety e ecossistema JVM/Android; JavaScript costuma ter menor barreira na Web.

Consulte a [comparação completa](../comparison.md).

## Próximos estudos

1. [Fundamentos](fundamentals.md)
2. [Internals](internals.md)
3. [Exercícios e projeto](exercises.md)
4. TypeScript e runtime validation
5. HTTP, browser security, Node.js streams e distributed systems
6. profiling e observabilidade no host escolhido

## Livros

- *JavaScript: The Definitive Guide*, David Flanagan — referência abrangente; consulte a [página da editora](https://www.oreilly.com/library/view/javascript-the-definitive/9781491952016/).
- *You Don't Know JS Yet*, Kyle Simpson — série disponível legalmente no [repositório do autor](https://github.com/getify/You-Dont-Know-JS).

Mais critérios e títulos em [Referências](references.md).

## Papers

- [The Essence of JavaScript](https://doi.org/10.1007/978-3-642-14107-2_7) formaliza uma linguagem central para raciocinar sobre semântica.

Papers ajudam a entender fundamentos; a especificação vigente continua sendo a fonte normativa.

## Documentação oficial

- [ECMAScript Language Specification](https://tc39.es/ecma262/)
- [MDN JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [Node.js documentation](https://nodejs.org/api/)
- [V8 documentation](https://v8.dev/docs)

## Outras referências

Veja a curadoria comentada em [Referências](references.md), incluindo segurança, performance, compatibilidade e ferramentas.

---

[← Python](../python/README.md) · [↑ Linguagens](../README.md) · [→ Fundamentos](fundamentals.md)
