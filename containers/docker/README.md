# Docker

Docker combina build de imagens, distribuição e execução de containers. O valor é um contrato operacional repetível; o risco é esconder sistema operacional, rede e supply chain atrás de comandos simples.

Imagem é manifesto/configuração mais layers content-addressed distribuídas por registry. Container adiciona camada gravável copy-on-write sobre a imagem: primeira escrita pode copiar bloco/arquivo conforme storage driver, e dados somem ao remover o container. Escreva alto volume em volume apropriado. Registry exige autenticação, retenção, scanning e promoção por digest.

## Layers, copy-on-write e registries

Cada instrução relevante do build cria filesystem diff reutilizável; o digest identifica conteúdo. Ao alterar arquivo existente durante execução, o storage driver faz **copy-up** para a writable layer antes da escrita. Isso preserva imagem, mas adiciona overhead e mantém arquivo copiado mesmo se só parte mudou. Remover arquivo em layer posterior cria marcador/whiteout; não reduz bytes da layer anterior. Por isso secret copiado e apagado em outra instrução continua recuperável—use secret mount e multi-stage.

Registry armazena manifests, configs e blobs; tag é ponteiro mutável, digest é identidade imutável. Pipeline publica uma vez, verifica scan/assinatura/provenance e promove o mesmo digest. Configure IAM por repositório, TLS, retenção/garbage collection e proteção contra overwrite; replica/mirror precisa política de freshness e trust. Cliente faz pull apenas de blobs ausentes, beneficiando cache de layers compartilhadas.

## Dockerfile de produção

```dockerfile
# syntax=docker/dockerfile:1
FROM golang:1.25 AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod go mod download
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -o /out/api ./cmd/api

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/api /api
USER nonroot:nonroot
EXPOSE 8080
ENTRYPOINT ["/api"]
```

Fixe base por digest quando reprodução/auditoria exigir e automatize atualização. Multi-stage remove toolchain do runtime. `.dockerignore` reduz contexto e vazamento. Cache/secret mounts do BuildKit não devem virar layers.

## Runtime

- exec form preserva sinais; shell form cria camada e parsing extra;
- `HEALTHCHECK` responde a uma pergunta específica, não prova saúde sistêmica;
- publish de porta expõe host; rede bridge fornece DNS entre serviços;
- bind mount acopla host; named volume é gerenciado pelo engine;
- limite memória/CPU/PIDs e teste shutdown dentro do grace period;
- logs vão a stdout/stderr com política de rotação no runtime.

Docker Compose descreve serviços, redes, volumes, configs e dependencies para desenvolvimento/testes locais. `depends_on` modela ordem/condição suportada, não transforma dependência em disponível para sempre: aplicação ainda precisa timeout/retry. Perfis e override files evitam manifesto duplicado; não use Compose como substituto automático de um scheduler de produção.

## Build eficiente

Ordene layers do estável ao volátil; copie manifestos e baixe dependências antes do source. Evite package-manager cache na imagem final. Não use `latest` como identidade. Gere SBOM, escaneie vulnerabilidades com contexto (exploitability/reachability) e assine artefatos conforme política.

Performance depende de syscall, filesystem/network virtualization, cgroups, NUMA e limites do host. Meça no container com limites reais; não conclua por tamanho da imagem. Overlay filesystem pode piorar write-heavy workloads, e CPU throttling pode elevar p99 mesmo com média baixa.

## Debug

Inspecione `docker image history`, `docker inspect`, eventos, stats, rede e processos. Imagem minimalista pode não ter shell: use debug container/namespace controlado, sem transformar produção em imagem cheia de ferramentas.

## Anti-patterns

- secret em `ARG`, `ENV`, layer ou build context;
- executar como root e adicionar `--privileged` para “funcionar”;
- instalar/atualizar pacote ao iniciar;
- volume para sobrescrever código em produção;
- depender da ordem do Compose sem readiness/retry;
- copiar `.git`, credenciais ou todo monorepo.

## Referências oficiais

- Docker. [Build best practices](https://docs.docker.com/build/building/best-practices/).
- Docker. [Dockerfile reference](https://docs.docker.com/reference/dockerfile/).
- Docker. [Storage](https://docs.docker.com/engine/storage/).
- OCI. [Image specification](https://github.com/opencontainers/image-spec).
- OCI. [Distribution specification](https://github.com/opencontainers/distribution-spec).

---

[← Containers](../README.md) · [↑ Containers](../README.md) · [Segurança →](../security.md)
