---
name: security-review
description: Review a defined application, change, or design for exploitable security and privacy weaknesses using evidence and realistic threat paths. Use for explicit security assessments; do not activate for ordinary code quality review.
---

# Security Review

Find credible weaknesses in the requested scope without exceeding the user's
authorization. Prefer demonstrated data and control flows to checklist-only
findings.

## Define the assessment

Confirm the assets, trust boundaries, identities, entry points, deployment
environment, attacker capabilities, and exact artifacts in scope. Determine
whether active testing is authorized; absent explicit permission, use only
read-only inspection and safe local analysis.

## Review

Trace untrusted input through parsing, authorization, storage, interpreters,
outbound requests, logs, and responses. Examine authentication and resource-level
authorization separately. Check secret handling, tenant isolation, cryptographic
use, dependency exposure, unsafe defaults, auditability, and failure behavior
where relevant to the threat model.

For each finding include:

- severity and affected asset;
- prerequisite, attack path, and realistic impact;
- precise supporting evidence and confidence;
- remediation direction and compensating controls;
- a safe way to verify the correction.

Do not claim exploitability from a version number alone. Distinguish confirmed
findings, defense-in-depth improvements, and questions that need more evidence.

## Authorization boundary

Never access accounts, scan hosts, send attack payloads, exfiltrate data, rotate
credentials, modify controls, publish a vulnerability, or contact third parties
unless the user explicitly authorizes that exact action and target. Use synthetic
data for proof of concept. Redact secrets and personal data from notes and output.

## Validation and stop conditions

Reproduce findings only with the least invasive method permitted. Re-check the
full authorization path and confirm a proposed remediation does not move the
weakness elsewhere. Stop active testing immediately on unexpected data access,
service degradation, scope ambiguity, or evidence of a live compromise; preserve
minimal evidence and report the condition without escalating impact.
