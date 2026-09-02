# Sistema de aprendizagem do Alexandria

O Alexandria é uma biblioteca temática, não uma grade escolar. A interface web usa o conteúdo versionado no repositório para oferecer múltiplas formas de navegação e evidência de aprendizado.

## Camadas

```text
Tema
└── Tópico
    └── Capítulo
        ├── internals
        ├── diagrama
        ├── exemplo
        ├── failure modes
        ├── prática progressiva
        ├── notas
        └── domínio
```

## Trilhas

`docs/learning-map.json` contém trilhas opcionais por objetivo:

- Backend e APIs;
- Arquitetura e Sistemas Distribuídos;
- Platform Engineering e SRE;
- AI Engineering;
- Agentes e Sistemas Autônomos;
- Engenharia de Software de ponta a ponta.

Elas dão direção sem alterar a organização principal por temas.

## Grafo

O mesmo arquivo registra:

- `prerequisites`: contexto recomendado antes de um tema;
- `related`: assuntos conectados que reaparecem com outra função.

A página **Mapa** mostra essas relações.

## Capítulos

Cada item de `focus` em `docs/data.json` possui uma página em:

```text
#/chapter/<theme-id>/<index>
```

O motor `docs/assets/chapters-v2.js` adiciona internals específicos para tópicos centrais. `chapter-meta.js` acrescenta tempo estimado, nível e contexto recomendado.

## Níveis de domínio

Cada capítulo possui três critérios independentes:

1. **Consigo explicar** — modelo mental correto sem depender do nome da ferramenta;
2. **Consigo implementar** — versão pequena, observável e testável;
3. **Consigo diagnosticar** — provocar falha, localizar causa e recuperar.

Esses estados ficam em `localStorage` e podem ser exportados junto das notas.

## Notas

O caderno local usa:

```text
alexandria-chapter-notes-v1
alexandria-mastery-v1
```

A página **Notas** permite export/import em JSON.

## Busca global

A busca indexa:

- temas;
- capítulos;
- decisões/trade-offs;
- laboratórios sugeridos;
- referências.

A intenção é permitir procurar por problema ou conceito, não apenas pelo nome de uma seção.

## Diagramas

Capítulos possuem um diagrama Mermaid do mecanismo. O Mermaid é carregado sob demanda. Se a biblioteca externa estiver indisponível, a notação textual continua visível como fallback.

## Labs reproduzíveis

`labs/` contém experimentos versionados. `docs/labs.json` expõe os labs na interface em `#/labs` e nos temas relacionados.

A regra é:

```text
executar → observar → quebrar → recuperar → explicar
```

Um lab não é concluído apenas quando o happy path funciona.

## Referências

`docs/learning-map.json` transforma referências oficiais conhecidas em links clicáveis. Prefira documentação oficial, RFCs, papers e especificações antes de conteúdo secundário.

## Status editorial

Cada tema possui:

```json
{
  "status": "reviewed",
  "lastReviewed": "2026-09-02",
  "reviewEveryDays": 90
}
```

O CI falha quando a revisão ultrapassa a cadência configurada. Conteúdos de IA/cloud/observabilidade usam cadências menores que fundamentos mais estáveis.

## CI

O deploy valida:

- catálogo e profundidade;
- fontes Codex existentes;
- capítulos;
- grafo e trilhas;
- status editorial;
- busca, notas e domínio;
- metadados de capítulo;
- labs reproduzíveis;
- JSON/JavaScript/CSS necessários para a interface.

## Como adicionar conteúdo

Consulte o manual global:

<https://github.com/blasther12/blasther12.github.io/blob/main/CONTENT-GUIDE.md>
