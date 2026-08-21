# Contribuindo com Alexandria

Obrigado por ajudar a preservar conhecimento de Engenharia de Software. A
contribuição ideal melhora uma rota de aprendizagem: corrige um fato, explica um
mecanismo, adiciona prática verificável ou conecta assuntos que antes estavam
isolados.

## Antes de escrever

1. Localize o tema no [Pinakes](PINAKES.md) e sua posição no
   [Atlas](atlas/README.md).
2. Verifique issues e o [Roadmap](ROADMAP.md) para evitar trabalho duplicado.
3. Defina leitor, pré-requisitos e capacidade observável ao final da página.
4. Escolha o [template](templates/README.md) apropriado.
5. Para mudanças grandes, proponha um RFC; para decisões duradouras, um ADR.

## Regra editorial

Todo guia deve responder, quando aplicável:

- O que é e por que existe?
- Que problema resolve e quais premissas assume?
- Como funciona internamente?
- Quando usar e quando evitar?
- Quais trade-offs e alternativas existem?
- Como escala, falha, é observado, testado e protegido?

Evite afirmações absolutas como “X é sempre mais rápido” ou “Y é a melhor
arquitetura”. Dê o contexto, a métrica e o custo da decisão. Diferencie
garantias do protocolo, comportamento de uma implementação e convenções do
ecossistema.

## Como adicionar um assunto

1. Crie o diretório no domínio mais próximo; não replique o mesmo guia em dois
   lugares.
2. Use `templates/topic.md` e remova apenas seções realmente inaplicáveis.
3. Adicione o assunto ao índice do domínio e ao `PINAKES.md`.
4. Conecte pré-requisitos e próximos estudos no Atlas ou Pharos.
5. Inclua ao menos um exemplo verificável e um exercício prático.
6. Adicione navegação relativa no rodapé: `← Anterior · ↑ Índice · Próximo →`.

Uma página de índice pode ser breve; um Codex marcado como completo não pode ser
apenas um sumário ou lista de links.

## Referências

Antes de adicionar uma referência, confirme título, autoria e URL. Priorize:

1. documentação oficial e standards;
2. livros reconhecidos, sempre na página do autor ou editor;
3. papers e RFCs na fonte original;
4. artigos de autores ou organizações responsáveis pelo sistema;
5. conteúdo comunitário apenas para complementar outra perspectiva.

Não enlace cópias não autorizadas, mirrors de procedência incerta ou PDFs de
livros protegidos. Explique em uma frase o que a fonte acrescenta. Informe data
ou versão quando o comportamento puder mudar.

## Como adicionar um livro

- Edite [BOOKS.md](BOOKS.md) na categoria correta.
- Registre título, autor(es), dificuldade, motivo da leitura e link oficial.
- Se o livro altera uma sequência, atualize `books/reading-paths/`.
- Não reproduza capítulos, diagramas ou trechos extensos.

## Exercícios e projetos

Use `templates/exercise.md` ou `templates/project.md`. Todo exercício precisa de
ação e evidência; uma pergunta de definição isolada não basta. Especifique:

- cenário e restrições;
- artefato esperado;
- critérios verificáveis, sem revelar toda a solução;
- pistas opcionais e extensões;
- nível: Beginner, Intermediate, Advanced ou Expert.

Projetos precisam ainda de milestones, requisitos não funcionais, observação de
falhas e critério de conclusão.

## Pull request

- Faça mudanças coesas e descreva a lacuna de aprendizagem resolvida.
- Liste fontes verificadas e decisões editoriais relevantes.
- Não misture formatação global com conteúdo novo.
- Marque afirmações ainda incertas; não as apresente como fato.
- Confirme que os links relativos funcionam também no GitHub.

Use commits semânticos, por exemplo:

```text
docs: add postgres transaction isolation exercises
docs: clarify kafka delivery semantics
ci: validate relative documentation links
```

## Validação local

```bash
python3 scripts/validate_docs.py --require-navigation
python3 scripts/validate_mermaid.py
npx --yes markdownlint-cli2 "**/*.md" "#node_modules"
npx --yes prettier --check "**/*.{md,yml,yaml,json}"
# A CI também verifica URLs externas com lychee.
```

`validate_mermaid.py` requer `mmdc` (pacote
`@mermaid-js/mermaid-cli`). Os verificadores locais não substituem revisão
factual nem a checagem externa de links executada no CI.

## Idioma e estilo

Escreva em português brasileiro, preservando termos técnicos em inglês quando
forem a forma corrente. Defina o termo na primeira ocorrência. Prefira frases
diretas, diagramas que esclareçam relações e exemplos pequenos que exponham o
mecanismo.

Ao contribuir, você concorda com o [Código de Conduta](CODE_OF_CONDUCT.md) e
licencia conteúdo e código nos termos descritos em [Licenciamento](LICENSES.md).

---

[← Início](README.md) · [↑ Início](README.md) · [Roadmap →](ROADMAP.md)
