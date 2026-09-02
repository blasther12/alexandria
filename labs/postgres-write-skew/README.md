# Lab · PostgreSQL write skew

## Objetivo

Reproduzir uma anomalia de concorrência e observar como o nível de isolamento altera o resultado.

## Pré-requisitos

- Docker;
- cliente `psql` ou duas sessões SQL.

## Subir PostgreSQL

```bash
docker run --rm --name alex-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 postgres:17
```

Crie a tabela:

```sql
CREATE TABLE doctors (
  id integer primary key,
  name text not null,
  on_call boolean not null
);
INSERT INTO doctors VALUES (1, 'A', true), (2, 'B', true);
```

A invariante é: **pelo menos um médico precisa permanecer de plantão**.

## Experimento

Abra duas sessões. Em ambas:

```sql
BEGIN ISOLATION LEVEL REPEATABLE READ;
SELECT count(*) FROM doctors WHERE on_call = true;
```

Se ambas observarem `2`, faça simultaneamente:

Sessão A:

```sql
UPDATE doctors SET on_call = false WHERE id = 1;
COMMIT;
```

Sessão B:

```sql
UPDATE doctors SET on_call = false WHERE id = 2;
COMMIT;
```

Verifique a invariante.

## Quebrar de propósito

O objetivo é terminar com zero médicos de plantão mesmo sem duas transações alterarem a mesma linha.

## Recuperar

Repita usando:

```sql
BEGIN ISOLATION LEVEL SERIALIZABLE;
```

Observe que uma transação pode abortar para preservar serializabilidade.

## Evidências

Registre:

- resultado de cada sessão;
- nível de isolamento;
- erro de serialização, se ocorrer;
- por que lock apenas na linha alterada não protege a invariante global.

## Perguntas

1. Qual é a diferença entre conflito de escrita e conflito lógico?
2. A aplicação deve retryar automaticamente uma transação serializable abortada?
3. Como você modelaria essa invariante em outro banco?
