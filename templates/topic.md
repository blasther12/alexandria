# Nome do assunto

> Estado: rascunho | em expansão | consolidado
>
> Este template é um contrato de profundidade, não uma lista de títulos. Remova
> uma seção apenas quando ela realmente não se aplicar e explique a decisão na PR.

## O problema antes da solução

Descreva a situação concreta que faz este assunto existir. Comece por forças,
restrições e sintomas observáveis. Evite abrir com uma definição de dicionário.

Responda:

- qual problema aparece sem esta técnica?
- quem percebe o problema?
- qual propriedade queremos preservar?
- quais restrições mudam a decisão?

## Modelo mental

Explique o menor modelo que permite prever comportamento. Inclua um diagrama
quando relações, fluxo, estado ou causalidade forem importantes.

Ao final desta seção, o leitor deve conseguir desenhar o assunto de memória e
explicar o papel de cada componente.

## Como funciona por dentro

Percorra o caminho de uma operação real, passo a passo. Mostre estado,
transições, estruturas de dados, protocolos, runtime, scheduler, storage ou rede
quando forem relevantes.

Não basta dizer que um componente "gerencia" outro. Explique o mecanismo:
entrada, decisão, mudança de estado, saída e condição de falha.

## Garantias e limites

Separe explicitamente:

- o que é garantido por especificação ou protocolo;
- o que depende de implementação ou configuração;
- o que é apenas convenção do ecossistema;
- o que não pode ser garantido sob determinadas hipóteses.

Inclua pelo menos um caso em que a intuição comum está errada.

## Decisões e trade-offs

Apresente alternativas reais e as forças que mudam a escolha. Evite tabelas em
que uma opção vence todas as colunas.

| Decisão | Favorece | Cobra | Sinal para reconsiderar |
| --- | --- | --- | --- |
| opção A | ... | ... | ... |
| opção B | ... | ... | ... |

## Caminho crítico em produção

Siga uma operação ponta a ponta e responda:

- onde há I/O, fila, lock, alocação ou chamada remota?
- onde existe timeout, retry, cancelamento ou backpressure?
- qual estado pode ficar parcialmente atualizado?
- o que o usuário observa quando algo falha?

## Modos de falha

Inclua pelo menos três falhas plausíveis. Para cada uma, mostre causa, sintoma,
diagnóstico e mitigação.

| Falha | Sintoma | Evidência | Mitigação |
| --- | --- | --- | --- |
| ... | ... | ... | ... |

Diferencie prevenção, detecção, contenção e recuperação.

## Performance e capacidade

Explique a unidade de custo dominante e como ela cresce. Use ordem de grandeza,
complexidade, throughput, latência por percentil, memória, I/O ou custo monetário
conforme o tema.

Inclua um experimento ou benchmark reproduzível e diga o que ele não prova.

## Segurança

Mapeie ativos, trust boundaries, identidade, autorização, dados sensíveis e
abuse cases. Mostre onde um controle precisa estar fora da aplicação ou da
ferramenta estudada.

## Testes e verificação

Mostre como verificar as propriedades importantes:

- teste determinístico do comportamento local;
- integração com dependência real quando necessário;
- contrato ou compatibilidade em fronteiras;
- fault injection para comportamento de falha;
- teste de carga para hipóteses de capacidade.

## Observabilidade

Defina sinais úteis antes de listar ferramentas. Inclua:

- resultado observado pelo usuário;
- indicador de saúde do caminho crítico;
- recurso que pode saturar;
- contexto para explicar uma falha;
- alerta que exigiria ação humana.

## Exemplo mínimo verificável

Forneça um exemplo pequeno que expose o mecanismo central. O leitor deve
conseguir executá-lo, alterar uma hipótese e observar um resultado diferente.

## Exemplo de produção

Mostre como o exemplo muda ao adicionar autenticação, configuração, timeout,
telemetria, lifecycle, concorrência, migração ou deploy. O objetivo é revelar a
distância entre demo e sistema operável.

## Anti-patterns e armadilhas

Para cada armadilha, explique por que parece atraente, em que contexto quebra e
qual evidência permite detectá-la.

## Exercícios

### Beginner

Reproduza o mecanismo central e explique o resultado.

### Intermediate

Altere uma restrição e compare duas soluções com medidas.

### Advanced

Introduza falha, concorrência, escala ou segurança e faça diagnóstico.

### Expert

Projete uma solução sob restrições conflitantes, registre trade-offs e defenda
os gatilhos de revisão.

Cada exercício deve produzir um artefato ou evidência verificável, não apenas
uma resposta conceitual.

## Projeto prático

Defina cenário, requisitos funcionais, atributos de qualidade, milestones,
instrumentação, fault injection e critério de conclusão.

## Perguntas de revisão e entrevista

Prefira perguntas que exigem raciocínio:

- "o que muda se...?"
- "como você provaria...?"
- "qual garantia está faltando...?"
- "qual métrica distinguiria as hipóteses...?"

Inclua uma direção de resposta, não uma frase decorada.

## Comparações

Compare alternativas pela mesma unidade de decisão: workload, garantia,
latência, custo, operação, segurança, reversibilidade e competência da equipe.

## Próximos estudos

Conecte pré-requisitos e temas seguintes. Explique por que a dependência existe.

## Referências

### Livros

Para cada livro, diga qual capítulo ou ideia aprofunda o guia.

### Papers, RFCs e standards

Priorize fontes primárias para garantias e mecanismos.

### Documentação oficial

Registre versão/data quando o comportamento puder mudar.

### Outras referências

Use fontes secundárias para perspectivas, exemplos e visualizações, não para
substituir uma especificação disponível.

## Critério de consolidação

Um guia só deve ser marcado como `consolidado` quando um leitor consegue, usando
a própria página:

- explicar o problema e o mecanismo sem recorrer a slogans;
- prever pelo menos um comportamento de falha;
- comparar alternativas sob restrições explícitas;
- executar um exemplo e um experimento;
- identificar sinais de produção e controles de segurança;
- seguir referências primárias para verificar as principais garantias.

---

[← Anterior](README.md) · [↑ Índice](README.md) · [Próximo →](README.md)
