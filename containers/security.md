# Segurança de containers e supply chain

## Controles por camada

| Camada | Controles |
| --- | --- |
| source | review, branch protection, secret scanning |
| build | runner isolado, dependências fixadas, secret mounts, provenance |
| imagem | base mínima, SBOM, scan, assinatura, digest |
| registry | IAM, retenção, imutabilidade e audit |
| runtime | non-root, read-only, capabilities mínimas, seccomp/AppArmor/SELinux |
| host | kernel atualizado, runtime protegido e boundary de tenancy apropriada |

## Baseline de runtime

Comece sem capabilities e adicione a necessária; `CAP_SYS_ADMIN` é ampla. Use user namespaces/rootless quando compatível, filesystem read-only com mounts explícitos, `no-new-privileges`, seccomp default e limites de recursos. Não monte socket Docker: ele normalmente equivale a controle do host.

## Provenance e SBOM

SBOM inventaria componentes, mas não prova integridade. Provenance liga source, builder e artefato; assinatura fornece identidade verificável; policy decide quais identidades/digests entram. SLSA organiza níveis/ameaças da supply chain e Sigstore oferece primitives abertas.

## Checklist de threat model

- código dentro do container é confiável? Há execução de plugins de terceiros?
- tenants compartilham kernel e nó?
- quais paths/tokens estão acessíveis após compromise?
- egress permite exfiltração?
- quem pode substituir tag/digest no registry?
- como vulnerabilidade crítica dispara rebuild e rollout?

## Referências

- NIST. [Application Container Security Guide (SP 800-190)](https://csrc.nist.gov/pubs/sp/800/190/final).
- SLSA. [Specification](https://slsa.dev/spec/).
- Sigstore. [Documentation](https://docs.sigstore.dev/).
- Docker. [Security](https://docs.docker.com/engine/security/).

---

[← Docker](docker/README.md) · [↑ Containers](README.md) · [Exercícios →](exercises.md)
