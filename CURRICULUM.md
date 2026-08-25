# Matriz curricular

Esta é a visão canônica de **nível, pré-requisitos e trilhas** da Alexandria.
O nível descreve a capacidade esperada ao concluir o assunto, não senioridade
profissional nem uma promessa de expertise obtida apenas por leitura.

## Níveis

| Nível | Capacidade esperada |
| --- | --- |
| **Beginner** | Explica o mecanismo, reproduz um exemplo e reconhece limites básicos. |
| **Intermediate** | Entrega uma solução testada, conecta componentes e lida com erros previsíveis. |
| **Advanced** | Diagnostica falhas, mede trade-offs e decide sob restrições de produção. |
| **Expert** | Projeta, opera e evolui sistemas sob falhas, escala e restrições organizacionais. |

## Regra de progressão

Uma página não é concluída só porque foi lida. A progressão esperada é:

`compreender → reproduzir → construir → quebrar → observar → recuperar → decidir`

O [auditor de currículo](scripts/audit_curriculum.py) usa sinais editoriais
para apontar páginas que ainda parecem rasas para o nível declarado. O resultado
é uma fila de revisão, não uma nota sobre o leitor.

## Assuntos canônicos

### Fundamentos

| Assunto | Nível | Pré-requisitos | Trilhas |
| --- | --- | --- | --- |
| [Fundamentos de Computação](fundamentals/README.md) | Beginner | Nenhum | Software Engineer, Backend Engineer, Distributed Systems, Software Architect, Platform / Cloud Engineer, AI Engineer |
| [Ciência da Computação](computer-science/README.md) | Beginner | [Fundamentos de Computação](fundamentals/README.md) | Software Engineer, Backend Engineer, Distributed Systems, Software Architect, Platform / Cloud Engineer, AI Engineer |

### Ferramentas

| Assunto | Nível | Pré-requisitos | Trilhas |
| --- | --- | --- | --- |
| [Git](developer-tools/git/README.md) | Beginner | [Fundamentos de Computação](fundamentals/README.md) | Software Engineer, Backend Engineer, Software Architect, Platform / Cloud Engineer, AI Engineer |
| [Vim](developer-tools/vim/README.md) | Beginner | Nenhum | Software Engineer, Backend Engineer, Platform / Cloud Engineer |

### Linguagens

| Assunto | Nível | Pré-requisitos | Trilhas |
| --- | --- | --- | --- |
| [Python](languages/python/README.md) | Beginner | [Fundamentos de Computação](fundamentals/README.md) | Software Engineer, Backend Engineer, Distributed Systems, Software Architect, Platform / Cloud Engineer, AI Engineer |
| [JavaScript](languages/javascript/README.md) | Beginner | [Fundamentos de Computação](fundamentals/README.md) | Software Engineer, Backend Engineer, Distributed Systems, Software Architect, Platform / Cloud Engineer |
| [Go](languages/golang/README.md) | Beginner | [Fundamentos de Computação](fundamentals/README.md) | Software Engineer, Backend Engineer, Distributed Systems, Software Architect, Platform / Cloud Engineer |
| [Kotlin](languages/kotlin/README.md) | Beginner | [Fundamentos de Computação](fundamentals/README.md) | Software Engineer, Backend Engineer, Distributed Systems, Software Architect, Platform / Cloud Engineer |
| [TypeScript](languages/typescript/README.md) | Intermediate | [JavaScript](languages/javascript/README.md) | Software Engineer, Backend Engineer, Software Architect, AI Engineer |

### Engenharia de Software

| Assunto | Nível | Pré-requisitos | Trilhas |
| --- | --- | --- | --- |
| [Engenharia de Software](software-engineering/README.md) | Intermediate | [Fundamentos de Computação](fundamentals/README.md), [Git](developer-tools/git/README.md) | Software Engineer, Backend Engineer, Distributed Systems, Software Architect, Platform / Cloud Engineer, AI Engineer |
| [Princípios de Engenharia](software-engineering/principles.md) | Intermediate | [Engenharia de Software](software-engineering/README.md) | Software Engineer, Backend Engineer, Software Architect |
| [Testing](software-engineering/testing/README.md) | Intermediate | [Engenharia de Software](software-engineering/README.md) | Software Engineer, Backend Engineer, Distributed Systems, Software Architect, Platform / Cloud Engineer, AI Engineer |
| [Spec-Driven Development](spec-driven-development/README.md) | Intermediate | [Engenharia de Software](software-engineering/README.md), [Testing](software-engineering/testing/README.md) | Software Engineer, Backend Engineer, Software Architect, AI Engineer |
| [DDD Estratégico](software-engineering/ddd/strategic.md) | Advanced | [Princípios de Engenharia](software-engineering/principles.md) | Backend Engineer, Software Architect |
| [DDD Tático](software-engineering/ddd/tactical.md) | Advanced | [DDD Estratégico](software-engineering/ddd/strategic.md), [Testing](software-engineering/testing/README.md) | Backend Engineer, Software Architect |
| [System Design](software-engineering/system-design/README.md) | Advanced | [Testing](software-engineering/testing/README.md), [Engenharia de Software](software-engineering/README.md) | Backend Engineer, Distributed Systems, Software Architect, Platform / Cloud Engineer |
| [Estudos de System Design](software-engineering/system-design/case-studies.md) | Expert | [System Design](software-engineering/system-design/README.md) | Software Engineer, Backend Engineer, Distributed Systems, Software Architect, Platform / Cloud Engineer |

### Design

| Assunto | Nível | Pré-requisitos | Trilhas |
| --- | --- | --- | --- |
| [Design Patterns](design-patterns/README.md) | Intermediate | [Princípios de Engenharia](software-engineering/principles.md) | Software Engineer, Backend Engineer, Software Architect |
| [Patterns Criacionais](design-patterns/creational.md) | Intermediate | [Design Patterns](design-patterns/README.md) | Software Engineer, Backend Engineer, Software Architect |
| [Patterns Estruturais](design-patterns/structural.md) | Intermediate | [Design Patterns](design-patterns/README.md) | Software Engineer, Backend Engineer, Software Architect |
| [Patterns Comportamentais](design-patterns/behavioral.md) | Intermediate | [Design Patterns](design-patterns/README.md) | Software Engineer, Backend Engineer, Software Architect |
| [Strategy](design-patterns/strategy.md) | Intermediate | [Design Patterns](design-patterns/README.md) | Software Engineer, Backend Engineer |

### Arquitetura

| Assunto | Nível | Pré-requisitos | Trilhas |
| --- | --- | --- | --- |
| [Arquitetura de Software](architecture/README.md) | Advanced | [Engenharia de Software](software-engineering/README.md), [Testing](software-engineering/testing/README.md) | Backend Engineer, Distributed Systems, Software Architect, Platform / Cloud Engineer |
| [Estilos Arquiteturais](architecture/styles.md) | Advanced | [Arquitetura de Software](architecture/README.md) | Backend Engineer, Software Architect, Platform / Cloud Engineer |
| [Modular Monolith](architecture/modular-monolith/README.md) | Advanced | [Arquitetura de Software](architecture/README.md), [DDD Estratégico](software-engineering/ddd/strategic.md) | Backend Engineer, Software Architect |
| [Clean e Hexagonal](architecture/clean-hexagonal/README.md) | Advanced | [Arquitetura de Software](architecture/README.md), [Princípios de Engenharia](software-engineering/principles.md) | Backend Engineer, Software Architect |
| [Architecture Decision Records](architecture/decision-records.md) | Intermediate | [Engenharia de Software](software-engineering/README.md) | Software Engineer, Backend Engineer, Software Architect, Platform / Cloud Engineer, AI Engineer |
| [Microservices](architecture/microservices/README.md) | Expert | [Arquitetura de Software](architecture/README.md), [Sistemas Distribuídos](distributed-systems/README.md) | Backend Engineer, Distributed Systems, Software Architect, Platform / Cloud Engineer |
| [Event-Driven Architecture](architecture/event-driven/README.md) | Expert | [Arquitetura de Software](architecture/README.md), [Kafka](messaging/kafka/README.md) | Backend Engineer, Distributed Systems, Software Architect |
| [CQRS e Event Sourcing](architecture/cqrs-event-sourcing/README.md) | Expert | [Event-Driven Architecture](architecture/event-driven/README.md), [Transações e Consistência](databases/transactions-and-consistency.md) | Backend Engineer, Distributed Systems, Software Architect |
| [Comparação Arquitetural](architecture/comparison.md) | Expert | [Estilos Arquiteturais](architecture/styles.md), [Sistemas Distribuídos](distributed-systems/README.md) | Software Architect |

### Dados

| Assunto | Nível | Pré-requisitos | Trilhas |
| --- | --- | --- | --- |
| [Comparação de Bancos](databases/comparison.md) | Intermediate | [Fundamentos de Computação](fundamentals/README.md) | Software Engineer, Backend Engineer, Distributed Systems, Software Architect, AI Engineer |
| [PostgreSQL](databases/postgresql/README.md) | Intermediate | [Comparação de Bancos](databases/comparison.md) | Software Engineer, Backend Engineer, Distributed Systems, Software Architect |
| [MongoDB](databases/mongodb/README.md) | Intermediate | [Comparação de Bancos](databases/comparison.md) | Backend Engineer, Software Architect |
| [Redis](databases/redis/README.md) | Intermediate | [Comparação de Bancos](databases/comparison.md) | Backend Engineer, Distributed Systems, Platform / Cloud Engineer, AI Engineer |
| [DynamoDB](databases/dynamodb/README.md) | Advanced | [Comparação de Bancos](databases/comparison.md) | Backend Engineer, Distributed Systems, Software Architect, Platform / Cloud Engineer |
| [Transações e Consistência](databases/transactions-and-consistency.md) | Advanced | [PostgreSQL](databases/postgresql/README.md) | Backend Engineer, Distributed Systems, Software Architect |

### Sistemas Distribuídos

| Assunto | Nível | Pré-requisitos | Trilhas |
| --- | --- | --- | --- |
| [Fundamentos Distribuídos](distributed-systems/fundamentals.md) | Advanced | [Fundamentos de Computação](fundamentals/README.md), [Transações e Consistência](databases/transactions-and-consistency.md) | Backend Engineer, Distributed Systems, Software Architect, Platform / Cloud Engineer |
| [Padrões de Resiliência](distributed-systems/resilience-patterns.md) | Advanced | [Fundamentos Distribuídos](distributed-systems/fundamentals.md) | Backend Engineer, Distributed Systems, Software Architect, Platform / Cloud Engineer |
| [Sistemas Distribuídos](distributed-systems/README.md) | Advanced | [Fundamentos Distribuídos](distributed-systems/fundamentals.md), [Padrões de Resiliência](distributed-systems/resilience-patterns.md) | Backend Engineer, Distributed Systems, Software Architect, Platform / Cloud Engineer |
| [Consenso e Coordenação](distributed-systems/consensus.md) | Expert | [Sistemas Distribuídos](distributed-systems/README.md) | Distributed Systems, Software Architect, Platform / Cloud Engineer |

### Mensageria

| Assunto | Nível | Pré-requisitos | Trilhas |
| --- | --- | --- | --- |
| [Kafka](messaging/kafka/README.md) | Advanced | [Fundamentos Distribuídos](distributed-systems/fundamentals.md) | Backend Engineer, Distributed Systems, Software Architect, Platform / Cloud Engineer |
| [Amazon SQS](messaging/sqs/README.md) | Advanced | [Fundamentos Distribuídos](distributed-systems/fundamentals.md) | Backend Engineer, Distributed Systems, Software Architect, Platform / Cloud Engineer |
| [Kafka versus SQS](messaging/comparison.md) | Advanced | [Kafka](messaging/kafka/README.md), [Amazon SQS](messaging/sqs/README.md) | Backend Engineer, Distributed Systems, Software Architect |

### Infraestrutura

| Assunto | Nível | Pré-requisitos | Trilhas |
| --- | --- | --- | --- |
| [Containers](containers/README.md) | Intermediate | [Fundamentos de Computação](fundamentals/README.md) | Software Engineer, Backend Engineer, Platform / Cloud Engineer, AI Engineer |
| [Docker](containers/docker/README.md) | Intermediate | [Containers](containers/README.md) | Software Engineer, Backend Engineer, Platform / Cloud Engineer, AI Engineer |
| [Segurança de Containers](containers/security.md) | Advanced | [Docker](containers/docker/README.md) | Backend Engineer, Platform / Cloud Engineer |
| [Cloud](cloud/README.md) | Advanced | [Fundamentos de Computação](fundamentals/README.md), [Containers](containers/README.md) | Backend Engineer, Distributed Systems, Software Architect, Platform / Cloud Engineer, AI Engineer |
| [Kubernetes](kubernetes/README.md) | Advanced | [Docker](containers/docker/README.md), [Cloud](cloud/README.md) | Backend Engineer, Distributed Systems, Software Architect, Platform / Cloud Engineer, AI Engineer |
| [Kubernetes Workloads e Networking](kubernetes/workloads-and-networking.md) | Advanced | [Kubernetes](kubernetes/README.md) | Backend Engineer, Distributed Systems, Platform / Cloud Engineer |
| [Kubernetes Operação e Segurança](kubernetes/operations-and-security.md) | Expert | [Kubernetes Workloads e Networking](kubernetes/workloads-and-networking.md), [Observabilidade](observability/README.md), [Segurança](security/README.md) | Platform / Cloud Engineer, Distributed Systems |

### API Gateways

| Assunto | Nível | Pré-requisitos | Trilhas |
| --- | --- | --- | --- |
| [API Gateways](api-gateways/README.md) | Advanced | [Fundamentos Distribuídos](distributed-systems/fundamentals.md), [Segurança](security/README.md) | Backend Engineer, Software Architect, Platform / Cloud Engineer |
| [Kong](api-gateways/kong/README.md) | Advanced | [API Gateways](api-gateways/README.md) | Backend Engineer, Platform / Cloud Engineer |
| [Apigee](api-gateways/apigee/README.md) | Advanced | [API Gateways](api-gateways/README.md) | Backend Engineer, Platform / Cloud Engineer |
| [Kong versus Apigee](api-gateways/kong-vs-apigee.md) | Advanced | [Kong](api-gateways/kong/README.md), [Apigee](api-gateways/apigee/README.md) | Software Architect, Platform / Cloud Engineer |

### Operação

| Assunto | Nível | Pré-requisitos | Trilhas |
| --- | --- | --- | --- |
| [Observabilidade](observability/README.md) | Advanced | [Engenharia de Software](software-engineering/README.md) | Software Engineer, Backend Engineer, Distributed Systems, Software Architect, Platform / Cloud Engineer, AI Engineer |

### Segurança

| Assunto | Nível | Pré-requisitos | Trilhas |
| --- | --- | --- | --- |
| [Segurança](security/README.md) | Advanced | [Engenharia de Software](software-engineering/README.md) | Software Engineer, Backend Engineer, Distributed Systems, Software Architect, Platform / Cloud Engineer, AI Engineer |

### Inteligência Artificial

| Assunto | Nível | Pré-requisitos | Trilhas |
| --- | --- | --- | --- |
| [Fundamentos de IA](artificial-intelligence/fundamentals/README.md) | Beginner | [Fundamentos de Computação](fundamentals/README.md) | AI Engineer |
| [Machine Learning](artificial-intelligence/machine-learning/README.md) | Intermediate | [Fundamentos de IA](artificial-intelligence/fundamentals/README.md) | AI Engineer |
| [Deep Learning](artificial-intelligence/deep-learning/README.md) | Advanced | [Machine Learning](artificial-intelligence/machine-learning/README.md) | AI Engineer |
| [Large Language Models](artificial-intelligence/llm/README.md) | Advanced | [Deep Learning](artificial-intelligence/deep-learning/README.md) | AI Engineer |
| [Generative AI](artificial-intelligence/generative-ai/README.md) | Intermediate | [Fundamentos de IA](artificial-intelligence/fundamentals/README.md) | AI Engineer |

### AI Engineering

| Assunto | Nível | Pré-requisitos | Trilhas |
| --- | --- | --- | --- |
| [AI Engineering](ai-engineering/README.md) | Advanced | [Generative AI](artificial-intelligence/generative-ai/README.md), [Testing](software-engineering/testing/README.md), [Observabilidade](observability/README.md) | AI Engineer |
| [Avaliação de IA](ai-engineering/evaluation.md) | Advanced | [AI Engineering](ai-engineering/README.md) | AI Engineer |
| [Padrões de AI Engineering](ai-engineering/patterns.md) | Expert | [AI Engineering](ai-engineering/README.md), [Avaliação de IA](ai-engineering/evaluation.md) | AI Engineer |
| [Model Context Protocol](ai-engineering/mcp/README.md) | Advanced | [AI Engineering](ai-engineering/README.md), [Segurança](security/README.md) | AI Engineer |
| [Agentes](agents/README.md) | Expert | [Avaliação de IA](ai-engineering/evaluation.md), [Model Context Protocol](ai-engineering/mcp/README.md) | AI Engineer |
| [Skills](skills/README.md) | Intermediate | [Engenharia de Software](software-engineering/README.md) | Software Engineer, AI Engineer |

## Como usar esta matriz

1. Escolha uma trilha no [Atlas](atlas/README.md).
2. Faça o diagnóstico de entrada da trilha.
3. Use esta matriz para resolver pré-requisitos antes de saltar para tópicos avançados.
4. Execute exercícios e projetos do nível correspondente.
5. Consulte a auditoria do CI para localizar conteúdo que ainda precisa de aprofundamento.

A fonte estruturada desta matriz é [`curriculum/catalog.json`](curriculum/catalog.json).
Mudanças manuais neste arquivo são detectadas pelo CI para evitar drift.

---

[← Início](README.md) · [↑ Atlas](atlas/README.md) · [Pinakes →](PINAKES.md)
