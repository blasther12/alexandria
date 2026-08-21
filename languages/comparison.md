# Comparação entre linguagens

---

[← Mapa de linguagens](README.md) · [↑ Alexandria](../README.md) · [→ Python](python/README.md)

Esta comparação é um ponto de partida para decisões, não um ranking. Versão do runtime, bibliotecas, arquitetura, carga, ambiente e maturidade da equipe podem inverter resultados. Faça um protótipo representativo e meça antes de assumir.

## Visão geral

| Característica | Python | JavaScript | TypeScript | Go | Kotlin |
| --- | --- | --- | --- | --- | --- |
| Sistema de tipos | dinâmico e forte; type hints graduais | dinâmico e fraco em algumas coerções | estático gradual, estrutural; apagado no runtime | estático, nominal na maioria dos tipos; interfaces estruturais | estático, majoritariamente nominal, com null safety |
| Paradigmas | procedural, OO e funcional | procedural, prototype-based, funcional e event-driven | os mesmos de JS, com modelagem por tipos | procedural, composição, interfaces e CSP-inspired concurrency | OO, funcional, declarativo via DSLs |
| Runtime principal | CPython VM | engines ECMAScript, como V8; browser ou Node.js | JavaScript após transpilation | binário nativo com Go runtime | JVM; também Native, JS e Wasm conforme target |
| Concorrência | threads, `asyncio`, processes; GIL no CPython tradicional | event loop, Promises, workers | igual a JavaScript | goroutines, channels e synchronization primitives | threads e coroutines; modelo depende do target |
| Paralelismo CPU | processes, native extensions e configurações/implementações sem GIL | Worker Threads/Web Workers | igual a JavaScript | goroutines sobre múltiplas OS threads | threads/dispatchers na JVM; workers conforme target |
| Memória | automática; reference counting + cyclic GC no CPython | automática; GC da engine | igual a JavaScript | automática; tracing GC, stacks crescentes | GC da JVM ou gerenciamento do runtime do target |
| Performance típica | menor throughput CPU puro; excelente quando delega a código nativo ou é I/O-bound | JIT competitivo em cargas estáveis; warm-up e pauses importam | igual ao JavaScript emitido | startup rápido, baixa sobrecarga e throughput previsível | JIT da JVM com alto throughput; warm-up e memória maiores |
| Produtividade | muito alta para scripts, dados e protótipos | alta e universal na Web | alta em codebases grandes quando tipos são bem modelados | alta por simplicidade e toolchain uniforme | alta por expressividade e ecossistema JVM |
| Curva inicial | baixa | baixa para começar; semântica possui armadilhas | moderada; exige JS + sistema de tipos | baixa a moderada | moderada, sobretudo coroutines/JVM |
| Segurança de tipos | opcional e não imposta pelo runtime | baixa, salvo validação e disciplina | alta no compile time, limitada nas fronteiras e por escapes | alta no compile time; `nil` ainda exige cuidado | alta, com null safety; interoperabilidade pode introduzir platform types |
| Package management | `pip`, ambientes virtuais; `pyproject.toml` | `npm` e compatíveis; `package.json` | mesmo ecossistema JS | Go modules | Gradle/Maven; metadata do Kotlin |
| Deploy | runtime + ambiente/artefato, container ou empacotador | runtime + bundle/dependências | build TS + runtime JS | geralmente um binário por target | JAR/runtime JVM ou binário/artefato por target |

## Adequação por domínio

Legenda: **forte** = escolha comum com ecossistema maduro; **viável** = funciona, mas há trade-offs relevantes; **nicho** = costuma exigir motivo específico.

| Domínio | Python | JavaScript | TypeScript | Go | Kotlin |
| --- | --- | --- | --- | --- | --- |
| Backend | forte | forte | forte | forte | forte |
| Frontend web | nicho (transpilers/Wasm) | forte | forte | nicho (Wasm) | viável via Kotlin/JS |
| Mobile | viável com frameworks específicos | viável com frameworks cross-platform | forte no mesmo ecossistema cross-platform | nicho | forte em Android; viável multiplataforma |
| Data engineering | forte | viável | viável | forte em infraestrutura/pipelines | forte no ecossistema JVM |
| IA/ML | forte | viável para inferência/web | viável para inferência/web | viável para serving/infra | viável, especialmente JVM/Android |
| Cloud tooling | forte | forte | forte | forte | forte |
| CLI | forte | viável | viável | forte | viável |
| Microsserviços | forte para I/O e integração | forte para I/O | forte para I/O e grandes equipes | forte em serviços eficientes | forte em domínios JVM |
| Computação CPU-bound | viável com native code/processes | viável com workers/native add-ons | igual a JS | forte | forte na JVM |
| Serverless | forte, atento a cold start | forte | forte | forte, artefatos pequenos | viável; cold start JVM pede avaliação |

“Forte” não significa automaticamente melhor. Por exemplo, Python domina experimentação em ML, mas um serviço de inferência pode usar Go para orchestration ou Kotlin no Android; TypeScript pode reduzir defeitos de integração, mas não valida JSON externo sozinho.

## Trade-offs por eixo

### Tipos e modelagem

- **Python:** type hints aumentam feedback e documentação, mas continuam opcionais. Ferramentas diferentes podem interpretar detalhes de modo distinto.
- **JavaScript:** máxima flexibilidade e feedback rápido; coerções, shapes mutáveis e contratos implícitos aumentam custo de evolução.
- **TypeScript:** unions, generics e narrowing modelam estados com precisão. Complexidade excessiva de tipos piora mensagens de erro e tempo de compilação.
- **Go:** o sistema pequeno favorece leitura e builds rápidos. Não possui a expressividade algébrica de Kotlin/TypeScript, e interfaces implícitas podem esconder contratos acidentais.
- **Kotlin:** sealed hierarchies, generics e null safety expressam invariantes. Interoperabilidade Java e casts inseguros abrem brechas.

Em todas elas, dados externos exigem runtime validation. Compile-time types não autenticam, autorizam nem saneiam entrada.

### Concorrência e paralelismo

| Necessidade | Pergunta decisiva | Tendências |
| --- | --- | --- |
| milhares de operações I/O | há backpressure e cancelamento? | event loop de JS/TS, `asyncio`, goroutines e Kotlin coroutines funcionam bem |
| CPU intensiva | o trabalho roda em paralelo de verdade? | Go/Kotlin têm caminho direto; Python/JS usam processes, workers ou native code |
| shared state | quem possui o estado? | channels/actors/imutabilidade reduzem coordenação, mas não eliminam races lógicas |
| baixa latência | GC e scheduler cabem no budget? | precisa de benchmark no runtime, heap e carga reais |

Async melhora utilização durante espera; não reduz magicamente ciclos de CPU. Concorrência sem limites transforma pico de tráfego em exaustão de memória ou conexões.

### Performance e operação

- **Go** costuma oferecer startup e distribuição simples; seu GC e runtime continuam relevantes em caudas de latência.
- **Kotlin/JVM** aproveita JIT e observabilidade madura; warm-up, heap e tuning aumentam a superfície operacional.
- **JavaScript/TypeScript** se beneficiam de JIT e I/O assíncrono; bloquear o event loop degrada todas as requisições daquele processo.
- **Python** maximiza velocidade de desenvolvimento e usa extensões nativas em ecossistemas-chave; chamadas Python CPU-bound e pressão de objetos merecem profiling.

Compare p50, p95 e p99, throughput, memória, CPU, startup e custo de build/deploy. Um benchmark que mede apenas loop aritmético raramente decide uma arquitetura.

### Ecossistema e supply chain

Ecossistemas grandes aceleram entregas e ampliam a superfície de ataque. Antes de adotar uma dependência, avalie:

- mantenedores, licença, releases e política de segurança;
- dependências transitivas e scripts executados na instalação;
- compatibilidade de runtime e cadência de atualização;
- capacidade de substituir ou internalizar a função;
- geração de SBOM, lockfile/checksums e atualização automatizada.

Go incorpora checksums e módulos na toolchain; JVM possui repositórios e build tools maduros; npm e PyPI têm enorme variedade. Nenhum mecanismo dispensa revisão e resposta a vulnerabilidades.

## Escolha orientada por contexto

### Perguntas antes da decisão

1. Onde o software precisa executar: browser, JVM existente, dispositivo, função ou binário mínimo?
2. A carga é I/O-bound, CPU-bound, memory-bound ou uma combinação conhecida?
3. Qual é o SLO e qual orçamento de latência, memória e cold start existe?
4. Quais bibliotecas e integrações são realmente necessárias?
5. O time domina runtime, testes, profiling e operação dessa opção?
6. O modelo de tipos ajuda a representar o domínio ou só adiciona cerimônia?
7. Como serão patching, supply chain, deploy, rollback e diagnóstico?
8. Qual é o custo de manter a decisão por cinco anos?

### Cenários ilustrativos

- **Dashboard no browser e API BFF:** TypeScript ponta a ponta pode compartilhar conceitos e tooling, mas não compartilhe cegamente entidades internas nem confie em tipos para validar a rede.
- **Pipeline científico experimental:** Python reduz distância entre hipótese e resultado; isole hot paths medidos em operações vetorizadas ou componentes especializados.
- **Agente de infraestrutura distribuído como binário:** Go favorece cross-compilation e footprint operacional; confirme requisitos de integração nativa e latência de GC.
- **Domínio financeiro em plataforma JVM:** Kotlin combina tipos expressivos e bibliotecas Java; valide startup, interoperabilidade e disciplina de coroutines.
- **Widget público sem build obrigatório:** JavaScript moderno pode ser a solução mais simples; TypeScript é decisão do processo de desenvolvimento, não requisito do consumidor.

## Experimento comparativo

Construa em duas linguagens um serviço que recebe lotes, valida dados, consulta uma API lenta e persiste um resumo. Imponha timeout, limite de concorrência e idempotency key.

Meça com a mesma máquina e dataset:

```text
correctness: casos aceitos/rejeitados e comportamento em retry
delivery:    tempo de implementação, build, teste e deploy
runtime:     req/s, p95/p99, CPU, RSS, allocations e startup
resilience:  overload, cancelamento, falha parcial e shutdown
operation:   qualidade de logs, métricas, traces e profiling
```

Documente decisões em um ADR. Se a conclusão for “ambas atendem; escolha pela experiência do time”, isso é um resultado válido.

## Fontes para uma avaliação responsável

- [Python Language Reference](https://docs.python.org/3/reference/)
- [ECMAScript Language Specification](https://tc39.es/ecma262/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [The Go Programming Language Specification](https://go.dev/ref/spec)
- [Kotlin Language Specification](https://kotlinlang.org/spec/)

Versões evoluem. Consulte release notes e execute o experimento no target efetivamente usado.

---

[← Mapa de linguagens](README.md) · [↑ Alexandria](../README.md) · [→ Python](python/README.md)
