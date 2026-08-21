# TypeScript — exercícios e projetos

---

[← Internals](internals.md) · [↑ TypeScript](README.md) · [→ Referências](references.md)

Os exercícios avaliam modelagem, comportamento runtime e experiência do consumer. Toda solution deve passar em `tsc --noEmit`, executar os runtime tests e explicar qualquer `any`, assertion, `@ts-expect-error` ou suppression.

## Definition of done

- TypeScript e target declarados, build reproduzível e CI;
- `strict` ativo; relaxamentos documentados;
- public API pequena com exemplos de uso;
- compile-time tests positivos e negativos;
- runtime tests de bordas/falhas;
- dados externos entram como `unknown` e são validados;
- relatório de trade-offs, inclusive checker/build performance quando relevante.

## Beginner

### 1. Remover `any` de um relatório

Migre funções que recebem linhas CSV já parseadas como `any[]`. Introduza `unknown`, um parser de linha, tipos para sucesso/erro e agregação por categoria.

Casos: coluna ausente, número inválido, cabeçalho extra, linha vazia e categoria desconhecida. Preserve todos os erros com número da linha; não pare no primeiro.

### 2. Máquina de estados de upload

Substitua este shape permissivo:

```ts
type Upload = {
  loading: boolean;
  progress?: number;
  error?: string;
  url?: string;
};
```

por discriminated union para idle, uploading, failed e completed. Implemente reducer exaustivo e compile-time tests que impedem `completed` sem URL ou `failed` sem erro.

### 3. Configuração com `satisfies`

Modele routes por method/path/requiredRole. Use `satisfies` para validar o mapa sem perder literal types. Derive `RouteName` com `keyof`, mas valide no runtime requests vindas da rede.

Compare `: Config`, `as Config`, `as const` e `satisfies` em quatro snippets.

### 4. Result explícito

Implemente `parsePositiveInt(input: unknown): Result<number, ParseError>`, onde `ParseError` é uma union fechada. Escreva formatter exaustivo e testes de `NaN`, infinity, decimal, zero e string com whitespace.

## Intermediate

### 5. Event bus correlacionado

Dado um mapa `Events`, implemente `on<K extends keyof Events>` e `emit<K extends keyof Events>` preservando a relação event/payload.

Requisitos:

- unsubscribe idempotente;
- handler failure policy documentada;
- nenhuma assertion fora do núcleo auditado;
- negative compile tests para payload incorreto;
- runtime test para listener removido durante dispatch.

Discuta por que types não validam mensagens de outro process.

### 6. Parser de schema mínimo

Implemente combinators `string`, `number`, `optional`, `array` e `object` que inferem output sem `any` público:

```ts
const User = object({ id: string(), tags: array(string()) });
type User = Infer<typeof User>;
```

Limite profundidade/tamanho, retorne error paths e evite prototype pollution. Compare compile-time complexity e ergonomia com validação manual.

### 7. Client paginado

Crie async iterator genérico para API com cursor. O response entra como `unknown` e um parser específico produz `Page<T>`. Propague `AbortSignal`, detecte cursor repetido e finalize sem buscar página desnecessária.

Testes incluem cancellation, response inválido, erro transitório e consumer que interrompe cedo.

### 8. Tipar uma library JavaScript

Receba um módulo JS pequeno sem declarations. Escreva `.d.ts`, exemplos consumer e compile-time tests. Cubra callback, Promise, overload realmente necessário e errors.

Depois introduza comportamento divergente no JS e mostre por que `.d.ts` sozinho não detecta a mentira; adicione contract test.

## Advanced

### 9. API fluent sem explosão de tipos

Modele query builder que acompanha seleção de campos e parâmetros, sem tentar verificar SQL completo. Limite public generics, preserve diagnostics legíveis e impeça execução sem parâmetros obrigatórios.

Meça `tsc --extendedDiagnostics` com 10, 100 e 1.000 queries. Simplifique se instantiations crescerem desproporcionalmente.

### 10. Package publicável

Publique localmente (`npm pack`) uma library ESM com declarations, declaration maps e `exports`. Instale o tarball em consumer isolado e verifique:

- runtime import;
- type import;
- deep import bloqueado;
- source/declaration map;
- tree shaking/side effects documentados;
- versão mínima de TypeScript e Node/browser support.

Não declare CommonJS se você não o testa e suporta.

### 11. Migração incremental

Migre um módulo JavaScript de 500–1.000 linhas em milestones: `checkJs`, annotations JSDoc, rename para `.ts`, `unknown` boundaries e `strict`. Registre tipos de bug encontrados e esforço.

Não aceite aumento de “type coverage” obtido com `any`. Defina métricas qualitativas: escapes restantes, public API e erro localizado.

### 12. Diagnóstico de checker

Crie ou use fixture com include amplo, duplicated declarations, union/conditional type caro e project boundary incorreta. Colete `--extendedDiagnostics`, `--explainFiles`, `--traceResolution` e trace.

Corrija uma causa por vez e publique tabela antes/depois. Sanitize paths/source antes de compartilhar artifacts.

## Expert

### 13. Evolução compatível de API

Versione uma library tipada por três releases. Inclua mudança de overload, generic default, union e declaration export. Crie consumer matrix e identifique quais mudanças quebram source, emit, inference ou runtime.

Produza migration guide e política de semantic versioning que reconheça que inference observável faz parte da experiência pública.

### 14. Codemod seguro

Use Compiler API (ou ferramenta AST justificada) para migrar uma API deprecated. Preserve comments e formatting razoável, seja idempotente e recuse casos ambíguos com diagnostics.

Entregue fixtures, snapshot/diff tests e rollback. Não use regex como parser de TypeScript.

### 15. Auditoria de soundness

Encontre cinco pontos em que o checker pode aceitar comportamento inseguro: assertion, declaration externa, indexed access, variance/mutation e refinement invalidado. Construa repro mínimo e uma mitigação proporcional para cada.

O objetivo não é “derrotar TypeScript”; é ensinar onde posicionar validação, flags e API boundaries.

### 16. Type-level design review

Receba uma API com conditional types aninhados, overloads e inferência frágil. Redesenhe-a com duas prioridades mensuráveis: diagnostics compreensíveis e compile time previsível.

Faça usability test com três tarefas de consumer, compare autocomplete/errors e registre quais expressividades foram removidas.

## Projeto integrador: SDK de pedidos

### Contrato

Modele endpoints de criar, consultar, cancelar e paginar pedidos. O transporte devolve `unknown`; schemas/parsers convertem para types internos. Errors distinguem validação, auth, rate limit, conflito, indisponibilidade e cancellation.

### API esperada

Uma interface possível, não obrigatória:

```ts
interface OrderClient {
  create(input: CreateOrder, options?: RequestOptions): Promise<Order>;
  get(id: OrderId, options?: RequestOptions): Promise<Order | null>;
  cancel(id: OrderId, options?: RequestOptions): Promise<CancelResult>;
  list(query: OrderQuery, options?: RequestOptions): AsyncIterable<Order>;
}
```

Decida se failures usam exceptions, `Result` ou combinação por camada. Documente retry/idempotency; tipos não tornam `create` repetível automaticamente.

### Milestones

1. **Domain:** branded IDs, money em minor units, order-state union e transitions.
2. **Boundary:** runtime schemas com error paths e limites de payload.
3. **Transport:** base URL segura, auth injection, deadline/timeout, cancellation e response size.
4. **Resilience:** retry apenas seguro, jitter testável, rate-limit metadata e circuit behavior documentado.
5. **Packaging:** ESM, declarations/maps, exports, tarball consumer e API report.
6. **Testing:** runtime, compile time, fake server, property-based inputs se justificado e compatibility matrix.
7. **Observability:** hooks tipados para duração/status/retry sem acoplar vendor; redaction de secrets/PII.
8. **Docs:** quickstart, error handling, migration policy, threat model e ADRs.

### Casos adversariais

- server envia state novo ou field com tipo errado;
- response gigante/JSON inválido;
- clock skew e deadline já expirado;
- cancellation durante retry sleep;
- `429` com metadata inválida;
- consumer passa URL/headers perigosos;
- package é usado sob module resolver diferente.

### Critérios de excelência

- public API não vaza `any` nem type internals desnecessários;
- errors de uso aparecem perto do caller e são compreensíveis;
- runtime failure acontece na boundary, com contexto seguro;
- declaration e JavaScript package correspondem;
- type-check/build e runtime performance possuem baseline;
- nenhum secret aparece em diagnostics, source map ou telemetry.

## Desafios de entrevista

### Explicação

Explique em cinco minutos por que este trecho é perigoso e apresente duas correções:

```ts
const config = JSON.parse(text) as Config;
startServer(config.port);
```

### Design

Projete types de um job que só pode estar queued, running, succeeded ou failed. Inclua timestamps válidos por estado, exhaustive rendering e parser para API versionada.

### Debugging

Um monorepo abre rápido, mas `tsc -b` usa memória excessiva. Liste dados que coletaria antes de mudar config e como isolaria declarations ou project graph culpado.

### Library

Discuta variance, callbacks e backward compatibility ao adicionar um novo event a uma API genérica.

## Autoavaliação

- [ ] Minha modelagem impede estados inválidos sem exigir metaprogramação excessiva.
- [ ] Toda boundary tem runtime parser e limits.
- [ ] Assertions estão localizadas e justificadas.
- [ ] Compile-time tests verificam o contrato público.
- [ ] O JavaScript publicado foi executado em consumer real.
- [ ] Checker performance e module resolution são observáveis.
- [ ] Consigo apontar limites de soundness sem abandonar os benefícios dos tipos.

---

[← Internals](internals.md) · [↑ TypeScript](README.md) · [→ Referências](references.md)
