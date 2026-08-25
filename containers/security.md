# Segurança de containers e supply chain

Segurança de containers não é “rodar scan na imagem”. O problema real é reduzir o
que um atacante consegue alcançar **antes do build, durante a distribuição e
depois que o processo já está executando**. Um container comprometido continua
sendo código controlado por alguém dentro de um kernel compartilhado; a pergunta
importante é quais fronteiras continuam válidas quando isso acontece.

## Modelo mental: várias fronteiras, uma cadeia

Pense no artefato como uma cadeia de confiança:

```text
source → build → imagem → registry → deploy → runtime → host → dependências
```

Uma defesa forte em uma camada não corrige automaticamente outra. Imagem
assinada não impede uma aplicação vulnerável. Processo `non-root` não protege um
host cujo runtime expõe o socket Docker. SBOM não prova que o binário veio do
source declarado. A arquitetura precisa combinar controles independentes.

| Camada | Estado protegido | Controles principais |
| --- | --- | --- |
| source | código e intenção | review, branch protection, secret scanning |
| build | processo de produção | runner isolado, pinning, secret mounts, provenance |
| imagem | conteúdo executável | base mínima, SBOM, scan, assinatura, digest |
| registry | distribuição | IAM, retenção, imutabilidade, audit |
| deploy | identidade do artefato | policy por digest, assinatura e provenance |
| runtime | processo comprometido | non-root, read-only, capabilities, seccomp, limits |
| host | kernel e runtime | patching, hardening, isolamento de tenancy |
| rede/dados | blast radius | egress, identidade, autorização e criptografia |

A garantia desejada é defesa em profundidade: a falha de um controle não deve
transformar imediatamente execução de código no container em controle do host,
do cluster ou de outros tenants.

## Threat model antes do checklist

Comece pelos ativos e caminhos de ataque. Pergunte:

- código dentro do container é totalmente confiável ou executa plugins/uploads?
- quem consegue modificar Dockerfile, workflow, dependências e lockfiles?
- runners de CI compartilham credenciais ou workspace entre builds?
- tenants compartilham kernel e nó?
- quais tokens, sockets, mounts e metadata endpoints ficam acessíveis após RCE?
- egress permite exfiltração para qualquer destino?
- quem consegue substituir uma tag no registry?
- um rollback pode reintroduzir uma imagem vulnerável?
- como uma CVE crítica dispara rebuild, teste e rollout?
- qual evidência existe para dizer **qual source produziu qual digest**?

O threat model muda conforme o ambiente. Um job efêmero de CI, um SaaS
multi-tenant e um serviço interno no mesmo cluster não merecem a mesma política.

## Isolamento por dentro

Container não é uma VM pequena. O processo usa o kernel do host e recebe uma
visão limitada do sistema por namespaces e cgroups.

### Namespaces

Namespaces separam visões de PID, mount, network, IPC, UTS e, quando usado, user
IDs. Eles reduzem visibilidade e colisão, mas não criam uma barreira de kernel
independente. Uma vulnerabilidade no kernel pode atravessar o isolamento.

User namespaces permitem mapear `root` dentro do namespace para um UID sem
privilégio no host. Rootless containers reduzem a autoridade do daemon/runtime,
mas têm limitações de networking, storage e integrações que precisam ser testadas.

### Linux capabilities

O modelo tradicional de root concentra privilégios. Capabilities quebram parte
dessa autoridade em unidades como `CAP_NET_BIND_SERVICE` e `CAP_CHOWN`. A regra
operacional deve ser **drop all, add only what is proven necessary**.

`CAP_SYS_ADMIN` é especialmente perigosa por agregar operações muito amplas. Se
uma aplicação “precisa” dela, trate isso como sinal de revisão arquitetural.

### seccomp, AppArmor e SELinux

Seccomp limita syscalls que o processo pode invocar. AppArmor e SELinux aplicam
políticas de acesso além de UID/GID. Eles são camadas diferentes: reduzir
capabilities não substitui syscall filtering, e syscall filtering não substitui
controle de arquivos, devices e sockets.

Uma política muito permissiva quase não protege; uma política restritiva sem
observabilidade quebra aplicações de forma opaca. Faça rollout gradual e registre
negações para distinguir ataque de incompatibilidade legítima.

## Baseline de runtime

Um baseline razoável para workloads comuns é:

- executar como usuário sem privilégio e UID explícito;
- remover capabilities por padrão;
- usar filesystem root read-only e volumes apenas onde escrita é necessária;
- habilitar `no-new-privileges`;
- manter seccomp default ou perfil mais restrito validado;
- limitar CPU, memória, PIDs e espaço temporário;
- impedir mounts de host sem justificativa explícita;
- não expor socket Docker/containerd à aplicação;
- montar secrets como arquivos/identidade de workload, não na imagem;
- restringir egress conforme dependências conhecidas.

Montar `/var/run/docker.sock` normalmente equivale a entregar controle do host,
porque o cliente pode pedir ao daemon um container privilegiado com mounts do
filesystem do nó. “Está dentro de um container” não torna esse socket seguro.

## Imagens e superfície de ataque

Imagem mínima reduz pacotes, CVEs e ferramentas disponíveis ao atacante, mas
“distroless” não é automaticamente seguro. Você ainda precisa saber:

- de onde veio a base;
- quando foi atualizada;
- quais bibliotecas foram copiadas no multi-stage build;
- se a aplicação depende de certificados, timezone ou libc específicos;
- como depurar sem instalar ferramentas na imagem de produção.

Prefira builds reproduzíveis e imagens endereçadas por digest. Tags são nomes
mutáveis; digest identifica conteúdo. Fixar digest aumenta previsibilidade, mas
cria responsabilidade de atualização: pin eterno transforma correção de supply
chain em dívida silenciosa.

## Secrets durante build e runtime

Nunca use `ARG`/`ENV` para material sensível quando ele pode aparecer em layers,
metadados ou histórico. BuildKit secret mounts e mecanismos equivalentes fornecem
segredo apenas durante a etapa necessária.

No runtime, prefira identidade curta de workload e credenciais rotacionáveis.
Mesmo quando o segredo vem de um secret manager, uma aplicação comprometida pode
usá-lo enquanto estiver válido. Portanto, o objetivo não é “esconder o secret do
processo”, e sim limitar escopo, duração, destino e capacidade associada.

## SBOM, provenance e assinatura

Esses mecanismos respondem perguntas diferentes:

- **SBOM:** quais componentes declarados compõem o artefato?
- **provenance:** qual source, builder e processo produziram o artefato?
- **assinatura:** qual identidade afirma algo sobre aquele digest?
- **policy:** quais identidades, builders e propriedades são aceitas no deploy?

SBOM sozinha não prova integridade. Assinar uma imagem vulnerável apenas autentica
quem assinou. Provenance ajuda a detectar artefato produzido fora do pipeline
esperado, mas depende da confiança no builder e na proteção das identidades.

SLSA organiza ameaças e níveis de integridade da supply chain. Sigstore fornece
primitivas para assinatura e verificação com identidades. O desenho útil é
encadear source protegido → builder autorizado → provenance → digest → policy de
admissão.

## Dependências e vulnerabilidades

Scanner compara componentes conhecidos com bases de vulnerabilidade. Ele não
prova explorabilidade e não encontra toda classe de defeito. Priorize por:

1. exposição do componente no runtime;
2. presença real no artefato final;
3. caminho alcançável pelo atacante;
4. severidade e exploitability;
5. existência de fix;
6. compensating controls;
7. criticidade do workload.

A política precisa distinguir “CVE presente” de “risco aceitável temporariamente”.
Exceções devem ter owner, justificativa, prazo e sinal de reavaliação.

## Segurança do registry e deploy

Registry é parte da fronteira de produção. Proteja push/delete, habilite audit,
retenha artefatos necessários para rollback e evite tags sobrescrevíveis em
releases. O deploy deve referenciar digest quando a imutabilidade importa.

Uma admission policy pode rejeitar:

- imagem sem assinatura/provenance exigida;
- registry não autorizado;
- workload privilegiado;
- `hostNetwork`, `hostPID` ou host mounts fora de allowlist;
- usuário root;
- capabilities proibidas;
- ausência de limites relevantes.

Política demasiado rígida sem caminho de exceção incentiva bypass. Exceção
precisa ser auditável e temporária, não uma porta lateral permanente.

## Rede, identidade e movimento lateral

Após RCE, o atacante passa a usar a identidade e a conectividade do workload.
Reduza blast radius com:

- autorização de serviço para serviço baseada em identidade;
- NetworkPolicy/firewall para ingress e egress;
- acesso mínimo a bancos, filas e buckets;
- tokens de curta duração;
- proteção de metadata endpoints;
- segmentação de tenants de maior risco.

mTLS protege identidade e transporte, mas não decide se uma ação de negócio é
autorizada. Autenticação entre workloads não substitui autorização no domínio.

## Performance e custo dos controles

Segurança também consome recursos. Scans e assinatura afetam tempo de build;
policy engines adicionam latência ao admission; criptografia e service identity
consomem CPU; limites muito baixos causam throttling ou OOM.

A decisão correta não é desligar controles quando aparecem custos, e sim medir:

- duração do pipeline por etapa;
- cache hit de scanner e builders;
- tempo de admission;
- CPU/latência adicionada por sidecars ou proxies;
- taxa de OOM/throttling após aplicar limites;
- tempo entre publicação de correção e rollout completo.

Controles que tornam deploy impraticável tendem a ser contornados. Otimize o
pipeline sem remover a propriedade de segurança.

## Observabilidade de segurança

Colete sinais que respondam a perguntas operacionais:

- quais workloads executam digest não aprovado?
- houve tentativa de container privilegiado?
- quais syscalls/policies foram negadas?
- qual workload iniciou egress inesperado?
- quais imagens contêm vulnerabilidade crítica explorável?
- há secrets acessados por identidade incomum?
- qual build produziu o digest em execução?

Correlacione eventos de CI, registry, admission, runtime e cloud IAM. Um alerta
sem contexto de workload, digest, owner e ação recomendada vira ruído.

## Modos de falha e resposta a incidente

### Imagem comprometida no registry

1. bloqueie novos deploys do digest/tag;
2. identifique workloads em execução;
3. preserve evidências de build/provenance;
4. revogue credenciais potencialmente acessadas;
5. gere novo artefato a partir de source confiável;
6. faça rollout e confirme remoção do digest antigo;
7. investigue como o artefato entrou no registry.

### RCE dentro do container

Assuma que arquivos, env, tokens e rede acessíveis ao processo foram expostos.
Verifique criação de processos, conexões, syscalls anômalas, uso de credenciais e
movimento lateral. Reiniciar o pod remove o processo, não necessariamente a causa.

### Vulnerabilidade de kernel/runtime

A fronteira comprometida é o host. Priorize patch/drain, avalie workloads que
compartilharam o nó e use isolamento mais forte para tenants com ameaça maior.

## Testes de segurança

Teste a política, não apenas a existência do YAML:

- tente iniciar como root e confirme rejeição quando proibido;
- solicite capability proibida;
- escreva no root filesystem read-only;
- tente egress para destino não autorizado;
- injete imagem sem assinatura em ambiente de teste;
- valide que secret de build não aparece em layer/histórico;
- force uma CVE bloqueante conhecida em fixture controlada;
- execute restore/rollback usando apenas digests permitidos.

Use testes negativos no CI e ambientes efêmeros. Não faça exploração destrutiva
em produção sem escopo e controles explícitos.

## Laboratório progressivo

### Beginner

Construa uma imagem simples, rode como root e depois como UID sem privilégio.
Compare processos, permissões e arquivos graváveis.

### Intermediate

Aplique `read-only`, drop de capabilities, limites de PIDs/memória e egress
restrito. Registre cada quebra e a menor permissão necessária.

### Advanced

Gere SBOM e provenance, assine o digest e implemente policy que bloqueia artefato
não aprovado. Simule exceção temporária com owner e expiração.

### Expert

Modele um incidente: RCE em workload com token de cloud. Desenhe blast radius,
telemetria, revogação, rebuild, rotação, recovery e ações preventivas. Compare
container compartilhando kernel com isolamento por VM/microVM para o mesmo risco.

## Anti-patterns

- tratar `latest` como release imutável;
- instalar `curl`, shell e package manager “para emergências” sem estratégia;
- executar tudo privilegiado para evitar problemas de permissão;
- permitir egress irrestrito e confiar apenas em firewall de entrada;
- armazenar segredo na imagem;
- aceitar scan verde como prova de segurança;
- assinar artefato sem verificar identidade/provenance no deploy;
- abrir exceção de policy sem owner nem expiração;
- compartilhar host com tenants incompatíveis com a mesma ameaça.

## Referências

- NIST. [Application Container Security Guide (SP 800-190)](https://csrc.nist.gov/pubs/sp/800/190/final).
- SLSA. [Specification](https://slsa.dev/spec/).
- Sigstore. [Documentation](https://docs.sigstore.dev/).
- Docker. [Security](https://docs.docker.com/engine/security/).

---

[← Docker](docker/README.md) · [↑ Containers](README.md) · [Exercícios →](exercises.md)
