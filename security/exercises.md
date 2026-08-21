# Exercícios de segurança

Faça somente em sistemas próprios ou laboratórios explicitamente autorizados. Defina escopo, dados sintéticos, limites e cleanup; não teste terceiros.

## Beginner — threat model

Modele uma API de arquivos: ativos, fluxos, trust boundaries, dez abuse cases, controles, testes e risco residual. Inclua traversal, authorization e malware/zip bomb.

## Intermediate — matriz de autorização

Implemente política para tenant/owner/support/admin. Gere tabela principal×ação×recurso×contexto e testes negativos para list/detail/update/export. Verifique que filtro de lista não vaza contagem.

## Advanced — identidade e secrets

Monte Authorization Code + PKCE em laboratório. Teste state/nonce, redirect URI, issuer/audience, rotação de key e expiração. Troque secret estático por workload identity e execute rotação/revogação.

## Expert — agent com tools

Construa agent que lê documentos não confiáveis e propõe uma alteração, mas não executa sem policy/approval. Injete instrução maliciosa em documento; limite tool schema, diretório, egress, custo e passos; registre audit redigido. Demonstre que autorização pertence à tool boundary.

## Projeto final — secure delivery

Pipeline para API containerizada com threat model, ASVS subset, dependency/secret scan, SBOM, provenance, assinatura, deploy por digest, policy de runtime, OTel redigido, SLO e game day de credencial vazada. Documente falso positivo, exceção temporária e risco residual.

## Rubrica

- escopo/ética 10%; threat model 20%; authorization/data 20%; implementação/testes 20%; supply chain 15%; detecção/resposta 15%.

---

[← Cloud e IA](cloud-and-ai.md) · [↑ Segurança](README.md) · [IA →](../artificial-intelligence/README.md)
