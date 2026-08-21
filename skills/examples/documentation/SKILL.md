---
name: documentation
description: Create or update repository documentation grounded in the current code, configuration, and stated audience. Use for guides, references, tutorials, and documentation repairs; do not use for source-code changes whose main purpose is behavior.
---

# Documentation

Produce documentation that lets the intended reader complete a real task or
understand a maintained contract without guessing.

## Establish the target

Identify the audience, document type, scope, prerequisites, and source of truth.
Inspect nearby documents for navigation, terminology, formatting, and command
conventions. Verify behavior against current code, configuration, CLI help, tests,
or authoritative specifications; do not copy stale examples forward.

## Write

Put the reader's outcome first. Keep conceptual explanation separate from exact
procedures and reference material. Use complete, safe commands with explicit
working context, and ensure examples are internally consistent. Link to the most
specific maintained destination and avoid duplicating facts likely to drift.

Preserve existing information architecture unless the user asks for a redesign.
Update indexes or reciprocal navigation when the new page would otherwise be
orphaned.

## Validate

Run documented local commands or the safest representative subset. Check relative
links, anchors, code fences, formatting, navigation, and repository-provided
documentation tooling. Clearly mark pseudocode, illustrative output, platform
assumptions, and steps that could not be verified.

## Authorization boundary

Documentation work does not authorize changing product behavior, generating
credentials, publishing a site, posting externally, or editing unrelated pages.
Use placeholders for secrets and destructive identifiers. Ask before running a
documented operation that could mutate remote or production state.

## Stop conditions

Stop and request the missing source of truth when contradictory behavior cannot
be resolved or the requested instructions would be unsafe. Do not fabricate
options, outputs, benchmarks, compatibility claims, citations, or successful
validation.
