# Papers fundamentais

O objetivo não é ler todo paper do início ao fim. Comece por problema, modelo e
garantias; depois confronte avaliação e limitações com a implementação real.

## Sistemas e dados

| Paper | Por que está aqui |
| --- | --- |
| [Time, Clocks, and the Ordering of Events in a Distributed System](https://lamport.azurewebsites.net/pubs/time-clocks.pdf) — Leslie Lamport | estabelece happens-before e logical clocks |
| [Paxos Made Simple](https://lamport.azurewebsites.net/pubs/paxos-simple.pdf) — Leslie Lamport | núcleo de consenso explicado pelo autor |
| [In Search of an Understandable Consensus Algorithm (Raft)](https://raft.github.io/raft.pdf) — Ongaro e Ousterhout | decomposição de consenso com foco em compreensibilidade |
| [Dynamo: Amazon's Highly Available Key-value Store](https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf) — DeCandia et al. | consistent hashing, sloppy quorum e disponibilidade em um sistema real |
| [Bigtable: A Distributed Storage System for Structured Data](https://research.google/pubs/bigtable-a-distributed-storage-system-for-structured-data/) — Chang et al. | modelo wide-column e arquitetura de armazenamento distribuído |
| [Spanner: Google's Globally-Distributed Database](https://research.google/pubs/spanner-googles-globally-distributed-database/) — Corbett et al. | transações globais e uso explícito de incerteza de clock |
| [The Google File System](https://research.google/pubs/the-google-file-system/) — Ghemawat, Gobioff e Leung | desenho orientado a workload e falha esperada |
| [MapReduce](https://research.google/pubs/mapreduce-simplified-data-processing-on-large-clusters/) — Dean e Ghemawat | modelo de processamento distribuído e tolerância a falhas |
| [Kafka: a Distributed Messaging System for Log Processing](https://cwiki.apache.org/confluence/download/attachments/27822226/Kafka-netdb-06-2011.pdf) — Kreps, Narkhede e Rao | paper original hospedado pelo Apache Kafka; complemente com o design atual |

## Arquitetura e design

| Paper | Por que está aqui |
| --- | --- |
| [On the Criteria To Be Used in Decomposing Systems into Modules](https://dl.acm.org/doi/10.1145/361598.361623) — David Parnas | information hiding como critério de decomposição |
| [Out of the Tar Pit](https://curtclifton.net/papers/MoseleyMarks06a.pdf) — Moseley e Marks | complexidade acidental, estado e controle |
| [A Note on Distributed Computing](https://waldo.scholars.harvard.edu/publications/note-distributed-computing) — Waldo et al. | por que chamadas remotas não são locais; página do autor com o relatório original |
| [End-To-End Arguments in System Design](https://web.mit.edu/Saltzer/www/publications/endtoend/endtoend.pdf) — Saltzer, Reed e Clark | posicionamento de garantias nas extremidades do sistema |

## Inteligência Artificial

| Paper | Por que está aqui |
| --- | --- |
| [Attention Is All You Need](https://arxiv.org/abs/1706.03762) — Vaswani et al. | arquitetura Transformer original |
| [BERT](https://arxiv.org/abs/1810.04805) — Devlin et al. | pretraining bidirecional para representação |
| [Language Models are Few-Shot Learners](https://arxiv.org/abs/2005.14165) — Brown et al. | scaling e in-context learning em modelos autoregressivos |
| [Retrieval-Augmented Generation](https://arxiv.org/abs/2005.11401) — Lewis et al. | combinação de memória paramétrica e índice recuperável |
| [Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155) — Ouyang et al. | instruction tuning e feedback humano em um pipeline específico |

## Leitura crítica

Registre pergunta, premissas, mecanismo, garantia, workload, baseline, ameaça à
validade e o que mudou desde a publicação. “O paper mostra” só vale dentro do
experimento e das condições descritas.

---

[← Livros](books.md) · [↑ Library](README.md) · [RFCs →](rfcs.md)
