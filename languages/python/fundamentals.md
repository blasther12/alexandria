# Fundamentos de Python

Este capítulo constrói um modelo mental da linguagem. Execute os exemplos em um ambiente isolado e altere-os: prever o resultado antes de rodar é parte do exercício.

## Preparação do ambiente

Confira a versão, crie um virtual environment e instale o projeto em vez de alterar o Python do sistema:

```bash
python3 --version
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
```

Em Windows PowerShell, a ativação é `.venv\Scripts\Activate.ps1`. Prefira `python -m pip` para garantir que `pip` pertence ao mesmo interpreter.

Um projeto moderno começa com `pyproject.toml`:

```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "inventory-service"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = []
```

`pyproject.toml` padroniza metadata e configuração, mas não é necessariamente um lockfile. Aplicações devem registrar versões reproduzíveis com a ferramenta escolhida; bibliotecas costumam declarar intervalos compatíveis.

## Names, objects e tipos

Uma atribuição liga um name a um object:

```python
original = [1, 2]
alias = original
copy = original.copy()

alias.append(3)
assert original == [1, 2, 3]
assert copy == [1, 2]
assert alias is original       # identidade
assert copy == [1, 2]          # igualdade de valor
```

Use `is` para singletons como `None`, não para comparar valores. Tipos centrais:

| Tipo | Mutável | Uso |
| --- | --- | --- |
| `int`, `float`, `Decimal` | não | números; escolha semântica e precisão |
| `str`, `bytes` | não | texto Unicode e bytes respectivamente |
| `list` | sim | sequência ordenada e variável |
| `tuple` | não | registro/sequência estável |
| `dict` | sim | mapa que preserva ordem de inserção |
| `set`, `frozenset` | depende | unicidade e operações de conjunto |

`bool` é subtipo de `int`, mas código de domínio deve evitar depender dessa curiosidade. Para dinheiro, use inteiros na menor unidade ou `Decimal`; `float` implementa ponto flutuante binário:

```python
from decimal import Decimal

assert 0.1 + 0.2 != 0.3
assert Decimal("0.1") + Decimal("0.2") == Decimal("0.3")
```

## Controle de fluxo e pattern matching

Python usa indentação significativa. Loops iteram sobre iterables, não sobre índices por padrão:

```python
orders = [{"id": "o-1", "total": 120}, {"id": "o-2", "total": 40}]

for position, order in enumerate(orders, start=1):
    if order["total"] >= 100:
        print(position, order["id"])
```

`match` compara estrutura, não apenas valor:

```python
def route(event: dict[str, object]) -> str:
    match event:
        case {"type": "order.created", "id": str(order_id)}:
            return f"create:{order_id}"
        case {"type": "order.cancelled", "id": str(order_id)}:
            return f"cancel:{order_id}"
        case _:
            raise ValueError("evento desconhecido")
```

Pattern matching é útil para protocolos fechados; para regras que crescem independentemente, dispatch explícito costuma ser mais fácil de estender e observar.

## Collections e complexidade

Escolha a collection pela operação dominante:

- membership em `set`/`dict` é O(1) amortizado; em `list`, O(n);
- append no fim de `list` é O(1) amortizado; inserção no começo desloca elementos;
- `collections.deque` oferece append/pop eficiente nas duas pontas;
- `heapq` mantém priority queue;
- `Counter` e `defaultdict` reduzem boilerplate, mas não substituem um modelo de domínio claro.

```python
from collections import Counter

def top_errors(lines: list[str], limit: int = 3) -> list[tuple[str, int]]:
    codes = (line.split()[1] for line in lines if line.startswith("ERROR "))
    return Counter(codes).most_common(limit)
```

Comprehensions são boas para transformação curta. Se houver múltiplos efeitos, branches ou tratamento de erro, use um loop nomeado.

## Funções e contratos

Funções são objetos e closures capturam names do escopo externo:

```python
from collections.abc import Callable

def minimum(amount: int) -> Callable[[int], bool]:
    def accepts(value: int) -> bool:
        return value >= amount
    return accepts

accepts_batch = minimum(10)
assert accepts_batch(12)
```

Parâmetros `*` e `/` tornam a API deliberada:

```python
def connect(host: str, /, *, timeout: float = 1.0, tls: bool = True) -> None:
    ...

connect("db.internal", timeout=2.0)
```

Evite default mutável:

```python
def append_tag(tag: str, tags: list[str] | None = None) -> list[str]:
    result = [] if tags is None else list(tags)
    result.append(tag)
    return result
```

Copiar a entrada explicita que a função não a altera. Em hot paths, o custo da cópia pode justificar outro contrato — documente-o e teste-o.

## Tipagem gradual

Type hints ajudam ferramentas; CPython não os impõe automaticamente:

```python
from typing import Protocol

class Clock(Protocol):
    def unix_seconds(self) -> int: ...

def expired(deadline: int, clock: Clock) -> bool:
    return clock.unix_seconds() >= deadline
```

`Protocol` expressa structural subtyping: qualquer objeto compatível serve, sem inheritance nominal. Nas bordas, dados externos ainda exigem validação runtime. Evite `Any` como rota de fuga silenciosa; prefira `object`, narrowing e tipos precisos.

## Objetos, dataclasses e composição

Use class quando identidade, invariantes ou comportamento justificarem. Para value objects:

```python
from dataclasses import dataclass

@dataclass(frozen=True, slots=True)
class Money:
    cents: int
    currency: str

    def __post_init__(self) -> None:
        if self.cents < 0:
            raise ValueError("cents deve ser não negativo")

    def add(self, other: "Money") -> "Money":
        if self.currency != other.currency:
            raise ValueError("moedas incompatíveis")
        return Money(self.cents + other.cents, self.currency)
```

`frozen=True` reduz mutações acidentais, não cria segurança absoluta contra todo estado interno mutável. `slots=True` pode reduzir memória, mas restringe atributos dinâmicos e requer atenção em inheritance.

Python também suporta estilo procedural e funcional. Funções puras e composição são excelentes para domínio; OOP é útil para objetos com ciclo de vida; generators são declarativos para pipelines. Misture paradigmas pelo problema, não por identidade da linguagem.

## Exceptions e cleanup

Exceptions devem carregar contexto acionável e ser capturadas no nível que sabe recuperar:

```python
class InventoryUnavailable(RuntimeError):
    pass

def reserve(repository, sku: str, quantity: int) -> None:
    if quantity <= 0:
        raise ValueError("quantity deve ser positivo")
    try:
        repository.reserve(sku, quantity)
    except repository.TransientError as exc:
        raise InventoryUnavailable(sku) from exc
```

`raise ... from ...` preserva a causa. Não capture `BaseException`: `KeyboardInterrupt` e `SystemExit` precisam normalmente atravessar. `finally` executa cleanup; context managers tornam esse protocolo reutilizável:

```python
from pathlib import Path

with Path("events.jsonl").open("a", encoding="utf-8") as stream:
    stream.write('{"type":"started"}\n')
```

## Iterables, iterators e generators

Um iterable produz iterator; um iterator mantém estado e é consumido. Generator functions usam `yield`:

```python
from collections.abc import Iterator
from pathlib import Path

def nonempty_lines(path: Path) -> Iterator[str]:
    with path.open(encoding="utf-8") as stream:
        for line in stream:
            if stripped := line.strip():
                yield stripped
```

O arquivo permanece aberto enquanto o generator estiver ativo. Consumidores devem finalizar a iteração ou fechar o generator; esse lifetime implícito é um trade-off de APIs lazy.

## Módulos, packages e imports

Estrutura mínima:

```text
inventory-service/
├── pyproject.toml
├── src/inventory/__init__.py
├── src/inventory/service.py
└── tests/test_service.py
```

O layout `src/` evita importar acidentalmente o source checkout em vez do pacote instalado. Imports absolutos facilitam busca; imports relativos são úteis dentro de um package coeso. Não execute trabalho pesado, rede ou configuração global no import: testes, CLIs e workers importam módulos em contextos diferentes.

Proteja entry points:

```python
def main() -> int:
    print("inventory ready")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
```

## I/O, serialização e boundaries

Texto precisa de encoding explícito. `bytes` não é texto:

```python
from pathlib import Path
import json

def load_config(path: Path) -> dict[str, object]:
    raw = path.read_text(encoding="utf-8")
    data = json.loads(raw)
    if not isinstance(data, dict):
        raise ValueError("config deve ser um objeto JSON")
    return data
```

JSON parseado continua sem esquema. Valide campos, limites e tipos antes de criar objetos de domínio. Escrita crítica pode precisar de arquivo temporário, `fsync` e rename atômico; `write_text` sozinho não oferece durabilidade contra crash.

## Concorrência essencial

- **Threads:** apropriadas para I/O bloqueante; compartilham memória e exigem sincronização.
- **`asyncio`:** muitas conexões com stack async; cooperação exige que cada task ceda controle.
- **Processes:** paralelismo CPU-bound; IPC, startup e serialização custam.

```python
import asyncio

async def fetch_all(client, urls: list[str]) -> list[bytes]:
    semaphore = asyncio.Semaphore(20)

    async def fetch(url: str) -> bytes:
        async with semaphore:
            async with asyncio.timeout(2):
                return await client.get(url)

    async with asyncio.TaskGroup() as group:
        tasks = [group.create_task(fetch(url)) for url in urls]
    return [task.result() for task in tasks]
```

O semaphore é backpressure local; o timeout limita cada chamada; `TaskGroup` relaciona lifetime e falhas. Ainda faltam retry seletivo, jitter e um limite global de trabalho — decisões dependentes do protocolo.

## Checklist de uma entrega pequena

- [ ] tipos e invariantes nas fronteiras;
- [ ] errors específicos e cleanup garantido;
- [ ] timeout em I/O remoto;
- [ ] teste do happy path e de falhas relevantes;
- [ ] log sem secrets e com correlation ID;
- [ ] dependências declaradas e ambiente reproduzível;
- [ ] custo de coleção/algoritmo compatível com os dados;
- [ ] documentação da decisão que surpreenderá o próximo mantenedor.

## Próximo passo

Leia [Internals](internals.md) para entender por que essas construções têm seus custos e, depois, aplique-as nos [Exercícios](exercises.md).

---

[← Visão geral](README.md) · [↑ Trilha Python](README.md) · [Internals →](internals.md)
