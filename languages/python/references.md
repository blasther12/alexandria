# Referências de Python

Referências priorizam especificações, documentação oficial, source code e mantenedores. Datas e versões mudam: confirme a documentação correspondente ao interpreter e às bibliotecas do projeto.

## Linguagem e Standard Library

- [Python 3 Documentation](https://docs.python.org/3/) — portal oficial.
- [The Python Language Reference](https://docs.python.org/3/reference/) — sintaxe e semântica.
- [The Python Standard Library](https://docs.python.org/3/library/) — contratos das bibliotecas incluídas.
- [Python Tutorial](https://docs.python.org/3/tutorial/) — introdução mantida pelo projeto.
- [Python HOWTOs](https://docs.python.org/3/howto/) — guias oficiais por tema.
- [Built-in Types](https://docs.python.org/3/library/stdtypes.html) — operações e semântica dos tipos centrais.
- [Data Model](https://docs.python.org/3/reference/datamodel.html) — objects, attributes e special methods.
- [Exceptions](https://docs.python.org/3/library/exceptions.html) — hierarquia e significado.
- [`asyncio`](https://docs.python.org/3/library/asyncio.html) — concorrência assíncrona.
- [`multiprocessing`](https://docs.python.org/3/library/multiprocessing.html) — processos e IPC.
- [`threading`](https://docs.python.org/3/library/threading.html) — threads e observações sobre o GIL.
- [`dis`](https://docs.python.org/3/library/dis.html) — inspeção de bytecode, explicitamente dependente de versão.
- [`gc`](https://docs.python.org/3/library/gc.html) — interface do cyclic Garbage Collector.
- [`tracemalloc`](https://docs.python.org/3/library/tracemalloc.html) — rastreamento de alocações Python.

## Evolução e decisões de design

- [PEP Index](https://peps.python.org/) — índice oficial de Python Enhancement Proposals.
- [PEP 8 — Style Guide for Python Code](https://peps.python.org/pep-0008/)
- [PEP 20 — The Zen of Python](https://peps.python.org/pep-0020/)
- [PEP 257 — Docstring Conventions](https://peps.python.org/pep-0257/)
- [PEP 484 — Type Hints](https://peps.python.org/pep-0484/)
- [PEP 544 — Protocols](https://peps.python.org/pep-0544/)
- [PEP 517 — Build-system independent format](https://peps.python.org/pep-0517/)
- [PEP 518 — Build system requirements](https://peps.python.org/pep-0518/)
- [PEP 621 — Project metadata](https://peps.python.org/pep-0621/)
- [PEP 654 — Exception Groups and `except*`](https://peps.python.org/pep-0654/)
- [PEP 703 — Making the Global Interpreter Lock Optional](https://peps.python.org/pep-0703/)

Uma PEP pode ser aceita, rejeitada, substituída ou ainda provisória. Leia seu status e a documentação da versão antes de assumir disponibilidade.

## CPython e internals

- [CPython source repository](https://github.com/python/cpython) — implementação de referência.
- [Python Developer’s Guide](https://devguide.python.org/) — build, testes e contribuição no CPython.
- [CPython Internals documentation](https://github.com/python/cpython/tree/main/InternalDocs) — notas mantidas junto ao source.
- [Garbage Collector design](https://github.com/python/cpython/blob/main/InternalDocs/garbage_collector.md) — documento mantido junto ao source de CPython.
- [C API Reference](https://docs.python.org/3/c-api/) — integração e extensão de CPython.
- [Python/C API: Thread State and the GIL](https://docs.python.org/3/c-api/init.html#thread-state-and-the-global-interpreter-lock) — regras para extensões.
- [Import system](https://docs.python.org/3/reference/import.html) — semântica do import.

Para detalhes de layout, sempre navegue pelo tag da versão implantada; `main` descreve desenvolvimento corrente.

## Packaging e distribuição

- [Python Packaging User Guide](https://packaging.python.org/) — guia oficial da PyPA.
- [Installing Packages](https://packaging.python.org/en/latest/tutorials/installing-packages/)
- [Packaging Python Projects](https://packaging.python.org/en/latest/tutorials/packaging-projects/)
- [Writing `pyproject.toml`](https://packaging.python.org/en/latest/guides/writing-pyproject-toml/)
- [Core Metadata Specifications](https://packaging.python.org/en/latest/specifications/core-metadata/)
- [Python Package Index](https://pypi.org/) — registry; presença no índice não significa endosso ou segurança.
- [pip documentation](https://pip.pypa.io/)
- [venv documentation](https://docs.python.org/3/library/venv.html)

## Tipagem, testes e qualidade

- [Typing specification](https://typing.python.org/en/latest/spec/) — especificação comum para type checkers.
- [mypy documentation](https://mypy.readthedocs.io/) — documentação do projeto.
- [Pyright documentation](https://microsoft.github.io/pyright/) — documentação do projeto Microsoft.
- [pytest documentation](https://docs.pytest.org/) — fixtures, parametrização e plugins.
- [Hypothesis documentation](https://hypothesis.readthedocs.io/) — property-based testing.
- [coverage.py documentation](https://coverage.readthedocs.io/) — coverage de código.
- [Ruff documentation](https://docs.astral.sh/ruff/) — linter e formatter.

Coverage mede execução, não qualidade de asserts. Type checker reduz classes de erro, mas não valida dados externos nem regras de negócio.

## Performance e observabilidade

- [`timeit`](https://docs.python.org/3/library/timeit.html) — pequenos trechos com cuidados de medição.
- [The Python Profilers](https://docs.python.org/3/library/profile.html) — `cProfile` e `profile`.
- [pyperf](https://pyperf.readthedocs.io/) — toolkit do Python Performance Authority.
- [Python Speed Center](https://speed.python.org/) — benchmarks do projeto CPython.
- [OpenTelemetry Python](https://opentelemetry.io/docs/languages/python/) — instrumentação de traces, metrics e logs.
- [Prometheus Python client](https://prometheus.github.io/client_python/) — biblioteca oficial do projeto Prometheus.
- [Logging HOWTO](https://docs.python.org/3/howto/logging.html) — logging da Standard Library.

## Segurança

- [Python Security](https://www.python.org/dev/security/) — processo para reportar vulnerabilidades.
- [Security considerations for `pickle`](https://docs.python.org/3/library/pickle.html#restricting-globals) — por que dados não confiáveis não devem ser unpickled.
- [`subprocess` security considerations](https://docs.python.org/3/library/subprocess.html#security-considerations)
- [PyPA: Secure installs](https://pip.pypa.io/en/stable/topics/secure-installs/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/) — controles de aplicação independentes de framework.
- [OpenSSF Scorecard](https://securityscorecards.dev/) — sinais automatizados sobre projetos open source; não substitui avaliação humana.

## Livros

- [*Fluent Python, 2nd Edition* — Luciano Ramalho](https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/) — intermediário/avançado; data model, functions, typing e concorrência.
- [*Effective Python* — Brett Slatkin](https://effectivepython.com/) — intermediário; práticas em itens e links oficiais do autor.
- [*Python Cookbook, 3rd Edition* — David Beazley e Brian K. Jones](https://www.oreilly.com/library/view/python-cookbook-3rd/9781449357337/) — intermediário/avançado; receitas acompanhadas de explicações.
- [*Architecture Patterns with Python* — Harry Percival e Bob Gregory](https://www.cosmicpython.com/) — intermediário; domain model, ports/adapters, Unit of Work e eventos; site oficial dos autores.

Verifique a edição contra a versão de Python estudada. Livros antigos podem ensinar ideias duráveis e, ao mesmo tempo, apresentar APIs superadas.

## Papers e artigos primários

- [Array programming with NumPy](https://doi.org/10.1038/s41586-020-2649-2) — Harris et al., *Nature* (2020).
- [SciPy 1.0: fundamental algorithms for scientific computing in Python](https://doi.org/10.1038/s41592-019-0686-2) — Virtanen et al., *Nature Methods* (2020).
- [Faster CPython](https://github.com/faster-cpython) — projetos e discussões primárias de otimização do interpreter.

## Ordem sugerida

1. Tutorial, Built-in Types e Data Model.
2. [Fundamentos](fundamentals.md) com pequenos programas e testes.
3. Packaging User Guide, typing specification e pytest.
4. [Internals](internals.md), `dis`, `gc` e profiling com experimentos.
5. Documentação do framework/domínio escolhido.
6. PEPs e CPython source apenas quando uma decisão exigir profundidade.

## Como avaliar uma referência

- corresponde à versão em produção?
- descreve garantia da linguagem ou detalhe de CPython?
- mede workload representativo e publica método?
- diferencia fato, recomendação e opinião?
- informa limites, segurança e modos de falha?
- aponta para source, PEP ou documentação que sustente a afirmação?

---

[← Exercícios](exercises.md) · [↑ Trilha Python](README.md) · [Visão geral →](README.md)
