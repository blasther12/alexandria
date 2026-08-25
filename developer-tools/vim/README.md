# Vim

Vim é uma linguagem modal de edição. Em vez de memorizar centenas de atalhos, combine **operador + quantidade + movimento/text object** e repita mudanças com `.`. O objetivo é expressar a intenção sobre texto.

## Modelo mental

Pense no Vim menos como “editor com atalhos” e mais como uma pequena linguagem.

- **Normal mode** escolhe o que fazer e onde fazer.
- **Insert mode** insere texto literal.
- **Operadores** são verbos: delete, change, yank.
- **Movimentos e text objects** são substantivos/alvos: word, parágrafo, aspas, parênteses.
- **Contagens** repetem a intenção.
- **`.`** repete a última mudança.

Por isso `ci"` pode ser lido como “change inside quotes”. Aprender essa gramática é mais valioso que decorar comandos isolados.

## Modos

| Modo | Responsabilidade | Entrada/saída típica |
| --- | --- | --- |
| Normal | navegar e compor comandos | `Esc` retorna; operadores iniciam ações |
| Insert | inserir texto literal | `i`, `a`, `o`; `Esc` encerra a mudança |
| Visual | selecionar quando a composição não basta | `v`, `V`, `Ctrl-v` |
| Command-line | busca, substituição, arquivos e configuração | `:`, `/`, `?` |

Ficar em Normal não é competição: termine uma intenção em Insert e volte quando quiser compor outra edição.

## Movimento elementar

No modo Normal, `h` move um caractere à esquerda, `l` à direita, `j` uma linha lógica abaixo e `k` uma linha lógica acima. `gj`/`gk` seguem linhas visuais quando o texto quebra na tela. Pratique `h j k l` para não depender das setas, mas não segure uma tecla por longas distâncias: contagens, `w b e`, `f`/`t`, `%`, busca, marks e text objects expressam destinos com mais precisão.

## Gramática

```text
[register] [count] operator [count] motion-or-text-object
```

- operadores: `d` delete, `c` change, `y` yank, além de formatação;
- movimentos: `w`, `b`, `e`, `0`, `$`, `gg`, `G`, `%`, `f<char>`, `t<char>`;
- text objects: `iw`/`aw`, `i"`/`a"`, `i(`/`a(`, `ip`/`ap`;
- quantidades se multiplicam: `2d3w` remove seis words.

Exemplos:

| Comando | Leitura por intenção |
| --- | --- |
| `dw` | delete até o próximo início de word |
| `ci"` | change dentro das aspas |
| `dap` | delete um parágrafo incluindo separador |
| `yi(` | yank dentro dos parênteses |
| `dt,` | delete até antes da próxima vírgula |

Prefira text objects quando a intenção é estrutural: `ci"` continua útil mesmo se o cursor mudou dentro da string.

## O que a gramática garante e o que não garante

A composição de comandos dá **previsibilidade local**: se você entende operador e alvo, consegue prever qual região textual será afetada. Isso não significa que o comando compreenda sintaxe da linguagem de programação. `ci(` trabalha com delimitadores, não com AST; macros repetem teclas, não intenção semântica.

Para refactors estruturais, LSP ou ferramentas de linguagem podem ser mais seguras. Vim é excelente para edição textual precisa, mas não substitui compiler, formatter, testes ou refactoring engine.

Essa distinção evita usar macros para mudanças que exigem compreensão semântica.

## Busca, substituição e repetição

- `/pattern`, `n` e `N` navegam matches;
- `:%s/old/new/gc` substitui com confirmação no buffer;
- `*`/`#` buscam a palavra sob o cursor;
- `.` repete a última mudança; desenhe mudanças para serem repetíveis;
- `q{register}...q` grava macro, `@{register}` executa, `@@` repete.

Uma macro boa começa em estado previsível, termina pronta para a próxima linha e falha cedo quando o padrão não existe. Teste em poucas ocorrências antes de usar uma contagem grande; undo continua sendo sua rede.

## Registers, marks e jumps

Deletes podem sobrescrever o unnamed register. Use registers nomeados (`"ay`), black-hole (`"_d`) e clipboard conforme configuração. Marks (`ma`, `` `a ``) preservam posição; jumplist (`Ctrl-o`/`Ctrl-i`) percorre navegação sem confundir com mudanças (`g;`/`g,`).

## Buffers, windows e tabs

- **buffer** é texto carregado;
- **window** é uma viewport sobre buffer;
- **tab page** é um layout de windows.

Fechar uma window não necessariamente apaga o buffer. Use `:ls`, `:buffer`, `:split`, `:vsplit` e `:tabnew` entendendo essa separação; não trate tab como equivalente rígido a arquivo.

## Undo como árvore

O histórico do Vim não precisa ser imaginado apenas como pilha linear. Após desfazer e editar novamente, versões alternativas podem continuar na undo tree. `:undolist` e comandos relacionados ajudam a navegar.

Isso muda o comportamento durante experimentos: desfazer e tentar outra abordagem não significa necessariamente perder a versão anterior imediatamente. Ainda assim, Git continua sendo a ferramenta de versionamento durável; undo não é backup.

## Quickfix e feedback de ferramentas

Quickfix transforma resultados externos em navegação estruturada. Compilador, linter ou busca pode preencher uma lista de erros e permitir avançar com `:cnext`/`:cprev`.

Esse fluxo conecta edição a feedback:

```text
editar → executar teste/linter → quickfix → navegar erro → corrigir → repetir
```

A produtividade não vem apenas de digitar menos, mas de reduzir o tempo entre hipótese e feedback.

## Configuração e plugins

Comece com defaults, `:help` e poucos mappings que resolvam atrito observado. Plugins adicionam capacidades, mas também startup, updates, conflitos e uma camada que pode esconder o modelo. Registre configuração e fixe versões quando reprodutibilidade importar.

Uma configuração saudável deve ser explicável. Se remover um plugin torna o editor inutilizável porque você não sabe mais qual primitive ele substituiu, a camada de abstração ficou opaca.

## Performance e diagnóstico

Se startup ou edição ficar lenta, não adivinhe. Meça.

- compare inicialização sem configuração/plugin;
- use profiling disponível na implementação;
- carregue plugins sob demanda quando apropriado;
- investigue autocmds e LSPs que executam em eventos frequentes;
- diferencie latência do editor de latência de language server externo.

Uma configuração pequena e previsível costuma ser melhor base de aprendizado que dezenas de plugins instalados de uma vez.

## Exercícios progressivos

### Beginner

Edite um parágrafo usando apenas movimentos `w b e 0 $`, `d c y`, undo e `.`. Narre cada comando como verbo + objeto.

### Intermediate

Altere argumentos, strings e blocos com text objects; navegue um arquivo usando `f`, `t`, `%`, busca e jumplist sem manter teclas direcionais pressionadas.

### Advanced

Normalize 20 linhas com uma macro tolerante a variação e uma substituição com capture groups. Verifique o diff antes de salvar.

### Expert

Use quickfix alimentado por testes/linter, crie uma operação repetível e compare tempo, erros e reversibilidade contra edição manual.

## Laboratório de 30 minutos

Pegue um arquivo de código com funções repetitivas.

1. Navegue apenas com busca, `f/t`, `%` e text objects.
2. Faça uma mudança com `ciw` ou `ci"` e repita com `.`.
3. Use uma macro para uma transformação estritamente textual.
4. Rode formatter/testes e carregue erros no quickfix.
5. Desfaça a mudança e tente uma alternativa.
6. Confira o resultado com `git diff`.

A meta é perceber a fronteira entre edição textual, feedback automático e versionamento.

## Próximos estudos

`operatorfunc`, quickfix/location lists, autocommands, LSP, terminal, profiling de startup e a documentação da implementação que você usa, Vim ou Neovim.

## Documentação oficial

- [Vim documentation](https://www.vim.org/docs.php)
- [Vim help files online](https://vimhelp.org/)
- Dentro do editor: `:help user-manual`, `:help motion.txt`, `:help change.txt`.

---

[← Git](../git/README.md) · [↑ Ferramentas](../README.md) · [Projetos →](../../projects/README.md)
