# Linguagens de programação

---

---

[← Início](../README.md) · [↑ Alexandria](../README.md) · [→ Comparação](comparison.md)

Uma linguagem é uma ferramenta de modelagem: ela influencia como expressamos domínio, erros, concorrência e limites de um sistema. Esta trilha ensina cinco linguagens por meio de fundamentos, runtime, prática deliberada e decisões de engenharia — não por listas de sintaxe.

## Trilhas disponíveis

| Linguagem | Melhor ponto de entrada | Diferencial | Trilha |
| --- | --- | --- | --- |
| Python | automação, backend, dados e IA | legibilidade e ecossistema científico | [Python](python/README.md) |
| JavaScript | web, Node.js e aplicações event-driven | linguagem nativa da Web | [JavaScript](javascript/README.md) |
| TypeScript | aplicações JavaScript de médio e grande porte | modelagem estática sobre o ecossistema JS | [TypeScript](typescript/README.md) |
| Go | serviços de rede, cloud e CLIs | simplicidade operacional e concorrência integrada | [Go](golang/README.md) |
| Kotlin | backend JVM, Android e multiplataforma | null safety, interoperabilidade e coroutines | [Kotlin](kotlin/README.md) |

Consulte a [comparação orientada por trade-offs](comparison.md) antes de escolher uma trilha.

## Como estudar

Cada trilha segue o mesmo ciclo:

1. **Ler:** percorra o `README` para formar o mapa mental e estude `fundamentals.md` executando os exemplos.
2. **Explicar:** descreva tipos, modelo de erros e runtime sem consultar as notas.
3. **Praticar:** resolva `exercises.md` por nível. Primeiro faça funcionar; depois teste, meça e revise.
4. **Construir:** entregue o projeto prático da trilha com documentação, CI e observabilidade mínima.
5. **Investigar:** use `internals.md` para relacionar uma decisão no código a CPU, memória, I/O ou scheduler.
6. **Aprofundar:** consulte `references.md`, priorizando especificações e documentação oficial.

O avanço é baseado em evidência, não em tempo. Guarde soluções, benchmarks, post-mortems e decisões em um portfólio.

## Níveis de domínio

| Nível | Evidência esperada |
| --- | --- |
| Beginner | escreve programas pequenos, usa collections, módulos, I/O e trata erros previsíveis |
| Intermediate | estrutura pacotes, testa unidades e integrações, depura e usa concorrência com segurança |
| Advanced | interpreta comportamento do runtime, mede performance, projeta APIs e opera serviços |
| Expert | diagnostica falhas emergentes, lê especificações, avalia trade-offs e orienta evolução técnica |

## Pré-requisitos

- terminal, Git e editor configurado;
- noções de processos, memória, rede e estruturas de dados;
- disposição para executar exemplos e ler mensagens de erro;
- um ambiente isolado por projeto e uma versão suportada da linguagem escolhida.

Se esses temas ainda forem novos, comece por [Fundamentos](../fundamentals/README.md) quando essa trilha estiver disponível. A ausência dessa leitura não impede o início: pesquise cada conceito desconhecido e registre as lacunas.

## Princípios compartilhados

### Correção antes de esperteza

Prefira código explícito, tipos e invariantes visíveis, erros contextualizados e testes que descrevam comportamento. Metaprogramação e abstrações sofisticadas só se pagam quando reduzem complexidade total.

### Medição antes de otimização

Defina um objetivo observável, reproduza a carga, registre um baseline e use profiler. Microbenchmark não substitui teste de carga nem representa automaticamente produção.

### Dependências sob controle

Fixe versões de forma compatível com o package manager, revise código e proveniência, automatize alertas e mantenha o grafo pequeno. Um pacote popular não é necessariamente seguro ou necessário.

### Concorrência com limites

Todo trabalho concorrente precisa de ownership, cancelamento, timeout, backpressure e política de falha. “Async” não torna trabalho CPU-bound mais rápido por si só.

### Produção é parte da linguagem

Aprender inclui logs estruturados, métricas, traces, profiling, configuração, shutdown gracioso e resposta a incidentes. Uma aplicação que não pode ser diagnosticada ainda não está pronta.

## Percursos sugeridos

### Web full stack

JavaScript → TypeScript → protocolos HTTP → segurança web → banco de dados → observabilidade.

### Backend e cloud

Go **ou** Kotlin → redes → APIs → containers → sistemas distribuídos. Python é uma excelente segunda linguagem para automação e ferramentas internas.

### Dados e inteligência artificial

Python → SQL → estatística → engenharia de dados → machine learning → operação de modelos.

### Android e multiplataforma

Kotlin → coroutines → arquitetura de aplicações → Android/Compose → Kotlin Multiplatform quando houver justificativa de produto.

## Como comparar implementações

Implemente o mesmo pequeno serviço em duas linguagens e registre:

- clareza do modelo de domínio e dos erros;
- tempo de build, startup e feedback dos testes;
- memória e throughput sob a mesma carga;
- comportamento em timeout, cancelamento e overload;
- tamanho do artefato, dependências e facilidade de deploy;
- qualidade das ferramentas de profiling e diagnóstico;
- experiência real da equipe.

O objetivo não é eleger uma campeã, mas tornar critérios explícitos. Veja a [matriz completa](comparison.md).

## Checklist de conclusão de uma trilha

- [ ] Consigo explicar tipos, módulos, erros e package management.
- [ ] Consigo prever a saída e o custo aproximado dos exemplos fundamentais.
- [ ] Sei como o runtime representa e executa meu programa.
- [ ] Escrevo testes determinísticos e sei quando usar integração ou property-based testing.
- [ ] Uso profiler e benchmark sem confundir correlação com causa.
- [ ] Trato entrada como não confiável e protejo segredos e dependências.
- [ ] Instrumento uma aplicação com logs, métricas e traces correlacionáveis.
- [ ] Entreguei ao menos um projeto operável e documentei decisões.
- [ ] Resolvi exercícios de todos os níveis e consigo defender as soluções.
- [ ] Sei dizer quando **não** usaria a linguagem.

## Navegação

- [Comparação entre linguagens](comparison.md)
- [Python](python/README.md)
- [JavaScript](javascript/README.md)
- [TypeScript](typescript/README.md)
- [Go](golang/README.md)
- [Kotlin](kotlin/README.md)

<!-- Navegação da trilha -->

---

[← Início](../README.md) · [↑ Alexandria](../README.md) · [→ Comparação](comparison.md)
