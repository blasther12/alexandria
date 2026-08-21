# Requirements — Cadastro de usuário

## Funcionais

- **REQ-01:** aceitar e-mail e senha, normalizar o e-mail e validar input.
- **REQ-02:** criar conta pendente e token de confirmação de uso único.
- **REQ-03:** publicar solicitação de envio sem perder o evento após commit.
- **REQ-04:** confirmar conta somente com token válido, não expirado e não usado.
- **REQ-05:** repetir cadastro/confirmar de forma idempotente sem revelar existência.
- **REQ-06:** após login confirmado, associar progresso local com confirmação do usuário.

## Não funcionais

- **REQ-07:** armazenar senha somente com password hashing apropriado e parâmetros versionados.
- **REQ-08:** resposta de cadastro não deve diferenciar e-mail novo de existente.
- **REQ-09:** limitar tentativas por identidade/sinal de risco sem bloquear globalmente.
- **REQ-10:** 99% das respostas síncronas abaixo de 500 ms, excluindo entrega de e-mail.
- **REQ-11:** registrar audit event sem senha, token ou e-mail em texto claro.
- **REQ-12:** permitir rollback da aplicação sem migration destrutiva.

## Acceptance criteria

```gherkin
Given um e-mail ainda não cadastrado
When o cadastro válido é enviado duas vezes com a mesma chave idempotente
Then uma única conta pendente existe e no máximo um efeito lógico de envio ocorre
```

```gherkin
Given um token expirado ou já utilizado
When a confirmação é solicitada
Then a conta não muda e a resposta não expõe qual condição interna ocorreu
```

## Questões abertas

- Qual janela de expiração atende suporte e risco?
- Qual política legal define retenção de conta nunca confirmada?

---

[← Feature](feature.md) · [↑ Exemplo](feature.md) · [Design →](design.md)
