# Segurança de aplicações e APIs

## Threat model leve

Desenhe fluxo de dados, stores, processos, atores e trust boundaries. Use STRIDE como prompt (spoofing, tampering, repudiation, information disclosure, denial of service, elevation), não como prova de completude. Acrescente abuse cases de negócio: cupom infinito, scraping, fraude e mass assignment.

## Controles por classe

| Risco | Controle principal |
| --- | --- |
| injection | APIs parametrizadas, allowlist para estrutura e menor privilégio |
| XSS | output encoding contextual, templates seguros, CSP em profundidade |
| CSRF | SameSite + token/origin conforme fluxo; não confundir com CORS |
| SSRF | destinos permitidos, parser/redirect/DNS robustos e egress control |
| path traversal | IDs opacos ou canonicalização + confinamento |
| deserialization | formatos simples, schema e nenhum tipo executável não confiável |
| broken access control | autorização server-side em cada objeto/ação |
| resource exhaustion | limites de tamanho, tempo, concorrência e custo |

CORS é uma política aplicada por browsers que decide quais origens podem ler respostas; não autentica, não autoriza e não protege APIs de clientes não-browser. Permita origens/métodos/headers mínimos, não reflita `Origin` arbitrário com credentials e trate preflight/cache corretamente.

## Input e output

Valide tipo, formato, tamanho, cardinalidade e relacionamento no boundary. Normalização Unicode/canonicalização deve ocorrer uma vez antes da decisão correspondente. Prepared statements separam dado de SQL; não protegem identificador dinâmico. Encoding é específico do sink: HTML, atributo, URL, JavaScript e shell são contextos diferentes.

## Criptografia

Use TLS atual e validação de certificado; não crie algoritmo. Passwords usam password hashing com salt e parâmetros calibrados (Argon2id conforme orientação vigente), não encryption reversível. AEAD fornece confidencialidade/integridade; nonce/key reuse pode quebrar segurança. Defina geração, armazenamento, rotação, revogação e destruição de chaves.

## API

Autorização object-level e function-level é explícita. Limite paginação, filtros e GraphQL depth/cost. Não faça bind de payload direto a entidade privilegiada. Erros não revelam internals. Idempotency keys têm owner/payload binding. Webhooks exigem assinatura, timestamp/replay window e idempotência.

## Testes

Unit tests de policy matrix; integration tests com identidades reais; fuzz/property tests para parsers; SAST/SCA/DAST como camadas com triagem. Teste negativos: outro tenant, role inferior, token revogado, parâmetro duplicado, body comprimido e concorrência.

## Referências

- OWASP. [Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/).
- OWASP. [Cheat Sheet Series](https://cheatsheetseries.owasp.org/).
- IETF. [TLS 1.3 — RFC 8446](https://www.rfc-editor.org/rfc/rfc8446.html).

---

[← Segurança](README.md) · [↑ Segurança](README.md) · [Identidade e autorização →](identity-and-access.md)
