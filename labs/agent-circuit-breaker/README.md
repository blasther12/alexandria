# Lab · Agente com budget e circuit breaker

## Objetivo

Construir um loop de agente que pare de forma segura quando não há progresso, orçamento acaba ou uma ferramenta repete a mesma falha.

## Estado mínimo

```json
{
  "step": 0,
  "max_steps": 8,
  "cost_budget": 1.0,
  "last_actions": [],
  "failures_by_tool": {},
  "done": false
}
```

## Loop

Pseudocódigo:

```python
while not state.done:
    if state.step >= state.max_steps:
        escalate("max_steps")
        break

    action = policy(state)

    if circuit_open(action.tool, state):
        escalate("tool_circuit_open")
        break

    result = run(action)
    state = reduce(state, action, result)

    if no_progress(state):
        escalate("no_progress")
        break
```

## Quebrar de propósito

Faça uma tool retornar o mesmo erro três vezes consecutivas.

Sem circuit breaker, observe o agente desperdiçar passos repetindo a mesma ação.

## Recuperar

Implemente:

- contador por ferramenta/erro;
- limite de falhas consecutivas;
- detecção de estado repetido;
- `max_steps`;
- budget de custo;
- evento de escalonamento contendo estado, últimas ações e evidências.

## Evidências

Registre um event log append-only:

```text
step | action | result | cost | state_hash | decision
```

## Perguntas

1. Quando retry é diferente de replanning?
2. Como saber se houve progresso?
3. Qual informação um humano precisa receber no escalonamento?
4. Que ações deveriam exigir aprovação antes da primeira tentativa?

---

[↑ Voltar aos laboratórios](../README.md)
