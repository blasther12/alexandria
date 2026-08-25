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

## Contrato de profundidade

Alexandria não mede qualidade por quantidade de palavras. Um texto longo pode
continuar raso quando apenas enumera conceitos. Profundidade significa permitir
que o leitor **preveja comportamento, tome decisões e investigue falhas**.

Há três papéis editoriais distintos:

### Página de índice

Pode ser curta. Deve explicar o mapa do domínio, a ordem de estudo e por que os
capítulos se conectam. Não precisa repetir o conteúdo dos guias canônicos.

### Guia canônico

É o material principal de um assunto. Deve, quando aplicável, conter:

1. problema concreto e modelo mental;
2. mecanismo interno percorrido passo a passo;
3. garantias, limites e pelo menos uma intuição enganosa;
4. decisões com trade-offs reais e sinais para reconsiderar;
5. caminho crítico de uma operação em produção;
6. modos de falha com sintomas, evidências e mitigação;
7. performance/capacidade com experimento reproduzível;
8. segurança, testes e observabilidade ligados ao mecanismo;
9. exemplo mínimo e contraste com a versão operável;
10. exercícios que produzam evidência de aprendizagem;
11. referências primárias para as principais garantias.

Use [o template de assunto](templates/topic.md) como checklist crítico. Se uma
seção não se aplica, não crie texto artificial só para preenchê-la.

### Codex ou estudo aprofundado

Existe quando um único guia ficaria grande demais ou quando o tema precisa de
uma sequência própria. Deve aprofundar partes do mecanismo, incluir experimentos,
casos de produção, diagnóstico e referências sem duplicar a página canônica.

### Teste rápido de profundidade

Antes de marcar uma página como consolidada, tente responder sem abrir outro
arquivo:

- Consigo desenhar o mecanismo e explicar onde o estado muda?
- Consigo dizer o que acontece quando uma dependência atrasa, duplica ou falha?
- Consigo comparar duas opções sem usar “depende” como resposta final?
- Consigo medir uma hipótese e dizer o que o experimento não prova?
- Sei quais sinais buscaria durante um incidente?
- Sei qual propriedade de segurança precisa ser preservada?
- Há uma fonte primária para confirmar as garantias mais importantes?

Se a maioria das respostas for “não”, o artigo ainda é um mapa ou uma introdução,
não um guia consolidado.

## Níveis curriculares

A [Matriz curricular](CURRICULUM.md) usa quatro níveis. Eles descrevem a
capacidade esperada ao concluir o assunto, não cargo, senioridade ou uma
certificação automática:

| Nível | Evidência esperada |
| --- | --- |
| Beginner | explica o mecanismo, reproduz exemplo e reconhece limites básicos |
| Intermediate | entrega solução testada e lida com erros previsíveis |
| Advanced | diagnostica falhas, mede trade-offs e decide sob restrições reais |
| Expert | projeta, opera e evolui sistemas sob falhas, escala e restrições organizacionais |

Todo **guia canônico** deve ter uma entrada em
[`curriculum/catalog.json`](curriculum/catalog.json) com:

- `level`: Beginner, Intermediate, Advanced ou Expert;
- `prerequisites`: IDs de assuntos que devem vir antes;
- `tracks`: percursos em que o tema participa;
- `profile`: tipo de profundidade esperado (`foundation`, `concept`,
  `implementation`, `architecture`, `operations` ou `comparison`).

O auditor em `scripts/audit_curriculum.py` procura sinais de problema, modelo
mental, mecanismo, garantias, trade-offs, falhas, performance, segurança,
testes, observabilidade, prática e referências conforme o perfil. O resultado é
uma **heurística editorial**, não uma nota. Não adicione palavras-chave vazias
só para melhorar o score; corrija a lacuna conceitual indicada.

## Como adicionar um assunto

1. Crie o diretório no domínio mais próximo; não replique o mesmo guia em dois
   lugares.
2. Use `templates/topic.md` e remova apenas seções realmente inaplicáveis.
3. Adicione o assunto ao índice do domínio e ao `PINAKES.md`.
4. Cadastre nível, pré-requisitos, trilhas e perfil em `curriculum/catalog.json`.
5. Regenere `CURRICULUM.md` e confirme que a matriz continua sem ciclos.
6. Conecte próximos estudos no Atlas ou Pharos.
7. Inclua ao menos um exemplo verificável e um exercício prático.
8. Adicione navegação relativa no rodapé: `← Anterior · ↑ Índice · Próximo →`.

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
feat(postgresql): add transaction isolation exercises
fix(kafka): clarify delivery semantics
ci: validate relative documentation links
```

## Versionamento e releases

Alexandria usa Semantic Versioning e Release Please. O tipo do commit comunica
o impacto sobre o produto educacional:

- `feat(área):` adiciona uma capacidade, trilha, capítulo ou projeto e propõe
  incremento minor;
- `fix(área):` corrige um fato, link, exemplo ou comportamento e propõe patch;
- `docs(área):` registra mudanças editoriais publicáveis e propõe patch;
- `perf:`, `refactor:` e `revert:` registram mudanças publicáveis e propõem
  patch quando não houver impacto maior;
- `tipo!:` ou o footer `BREAKING CHANGE:` indica mudança incompatível em URLs,
  estrutura ou contrato editorial e propõe major;
- `ci:` e `chore:` ficam ocultos do changelog e, isoladamente, não abrem uma
  versão.

Durante o bootstrap, a primeira PR de release propõe `v1.0.0`; os incrementos
acima passam a ser calculados sobre essa versão nas releases seguintes.

Após `main` passar por toda a validação, a automação abre ou atualiza uma pull
request de release em modo draft. Quando o conteúdo estiver pronto, um
mantenedor marca a PR como pronta, revisa os checks e faz o merge; a execução
seguinte cria a tag `vMAJOR.MINOR.PATCH` e a GitHub Release. A própria PR de
release já contém as atualizações de [`CHANGELOG.md`](CHANGELOG.md),
`version.txt` e do manifesto.

O workflow usa `GITHUB_TOKEN` por padrão. Defina o secret opcional
`RELEASE_PLEASE_TOKEN` apenas se a política do repositório exigir que atualizações
automáticas da PR de release executem checks sem aprovação manual. A configuração
do GitHub também precisa permitir que Actions criem pull requests.

## Validação local

```bash
python3 scripts/audit_curriculum.py --check --verify-matrix CURRICULUM.md
python3 scripts/validate_docs.py --require-navigation
python3 scripts/validate_release.py
python3 scripts/validate_mermaid.py
npx --yes markdownlint-cli2 "**/*.md" "#node_modules"
# A CI também verifica URLs externas com lychee.
```

Para gerar uma auditoria Markdown local sem alterar a matriz:

```bash
python3 scripts/audit_curriculum.py --output /tmp/alexandria-curriculum-audit.md
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
