# DDD — exercícios

Use um domínio real ou o caso de reservas de estoque. Toda entrega inclui exemplos concretos e feedback de alguém que conhece o problema; diagramas sem linguagem/exemplos não bastam.

## Beginner

1. Entreviste um especialista por 30 minutos. Colete 15 termos, 5 regras, 3 exceções e 2 ambiguidades; transforme duas em testes de exemplo.
2. Modele `Money` e `DateRange` como Value Objects imutáveis. Teste unidade/moeda, arredondamento, igualdade e intervalo inválido.
3. Diferencie Entity e Value Object em cinco conceitos, sempre declarando contexto e ciclo de vida.

## Intermediate

1. Execute Event Storming de um fluxo: eventos, comandos, atores, políticas, hot spots e sistemas externos. Proponha dois limites alternativos.
2. Implemente Aggregate de reserva com limite de quantidade, expiração e concorrência otimista. Não exponha mutação interna.
3. Crie Repository port + fake + PostgreSQL adapter; rode contrato comum e encontre ao menos uma diferença semântica do fake.

## Advanced

1. Classifique Core/Supporting/Generic com evidências e implicações de build/buy. Apresente o risco de classificação errada.
2. Desenhe Context Map com Customer/Supplier, OHS/Published Language e ACL. Implemente/teste tradução de um modelo legado hostil.
3. Traduza Domain Event para Integration Event, publique por outbox e prove idempotência sob crash/redelivery.

## Expert

1. Compare três limites usando invariantes, change coupling do Git, ownership, latência e autonomia. Implemente um walking skeleton da opção mais arriscada.
2. Evolua um Aggregate sob tráfego: migração expand/contract, compatibilidade de evento, reprocessamento e reconciliação, sem parada global.
3. Facilite revisão do modelo com especialista; registre termos/regras refutados e adapte código, testes e Context Map. Avalie aprendizagem, não aderência ao primeiro desenho.

## Rubrica

- linguagem aparece em conversa, código e teste;
- cada limite explicita modelo, owner, dado e relação;
- Aggregate protege invariante com transação plausível;
- integrações traduzem semântica e declaram consistência/falha;
- abstrações táticas removidas quando não agregam clareza.

---

[← DDD tático](tactical.md) · [↑ Índice](README.md)
