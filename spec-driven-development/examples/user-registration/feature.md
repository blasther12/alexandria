# Feature — Cadastro de usuário

## Problema

Leitores precisam sincronizar progresso entre dispositivos. Hoje não existe
identidade persistente; dados ficam presos ao browser.

## Resultado

Uma pessoa cria conta com e-mail, confirma posse do endereço e passa a entrar
sem perder o progresso local existente.

## Fora de escopo

- login social;
- organizações e papéis administrativos;
- recuperação de senha nesta primeira entrega;
- personalização por modelo de IA.

## Hipóteses

- e-mail será o identificador de login nesta fase;
- confirmação pode chegar em até cinco minutos;
- um progresso local pertence a no máximo uma conta após merge.

## Sinal de sucesso

Pelo menos 90% das tentativas válidas recebem confirmação em cinco minutos, sem
duplicar conta ou expor se um e-mail já está cadastrado na resposta pública.

---

[← SDD](../../README.md) · [↑ Exemplo](feature.md) · [Requirements →](requirements.md)
