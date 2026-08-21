---
name: architecture-review
description: Assess a system or proposed design against stated quality attributes, constraints, and evolution risks. Use for architecture documents, diagrams, RFCs, or repository-wide boundaries; do not use for a patch-focused code review.
---

# Architecture Review

Evaluate whether the design can meet its stated goals and explain the important
trade-offs. Keep the review tied to the system's actual context rather than a
generic catalog of patterns.

## Establish context

Resolve the system boundary, actors, critical flows, deployment model, scale,
failure assumptions, compliance needs, and expected evolution. Extract the
quality attributes that matter—such as availability, latency, security,
operability, cost, and changeability—and make missing or conflicting goals
visible.

If documentation and implementation disagree, identify the discrepancy and say
which source informed each conclusion. Do not silently treat a diagram as current.

## Analyze the design

Trace representative success and failure paths across component, data, and trust
boundaries. Examine ownership, coupling, dependency direction, state placement,
consistency, capacity limits, rollout compatibility, observability, and recovery.

For every material concern, provide:

- the quality attribute or constraint affected;
- a concrete scenario that exposes the issue;
- the expected impact and evidence or assumption behind it;
- one or more viable mitigations and their costs.

Distinguish a verified defect from a risk, an open question, or an accepted
trade-off. Recommend a pattern only when it addresses a demonstrated force.

## Deliverable

Summarize the system and review scope, then list strengths, prioritized concerns,
unresolved decisions, and recommended next steps. Use a decision table when
multiple alternatives must be compared. Record assumptions that need validation.

## Authorization boundary

Architecture review is read-only unless the user explicitly requests edits. Do
not change code or diagrams, create tickets, approve an RFC, provision resources,
or alter production systems. A design recommendation does not authorize its
implementation.

## Validation and stop conditions

Cross-check conclusions against available code, configuration, metrics, tests,
and decision records. Stop and request the missing artifact when the system
boundary or a decisive constraint cannot be established. Do not invent traffic,
reliability, cost, or compliance requirements; label estimates and assumptions.
