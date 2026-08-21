---
name: incident-analysis
description: Reconstruct a production incident from logs, metrics, changes, and testimony to identify impact, causal factors, and corrective actions. Use for incident timelines, postmortems, and root-cause analysis; do not use to operate an active incident response unless explicitly requested.
---

# Incident Analysis

Produce a blameless, evidence-based account that improves system resilience.
Separate what happened from why it happened and from how recurrence will be
reduced.

## Bound the incident

Confirm the affected service, time window and timezone, customer impact, incident
status, available evidence, and audience. Preserve original timestamps and note
clock skew, missing telemetry, retention gaps, and conflicting accounts.

If the incident is still active, pause retrospective work and surface that active
coordination may be required; do not assume incident-command authority.

## Reconstruct and analyze

Build a timeline of observable events with source and confidence. Correlate
deployments, configuration changes, dependency behavior, alerts, operator
actions, and recovery. Identify the initiating event, propagation path,
contributing conditions, detection gaps, and factors that limited impact.

Avoid single-person blame and vague labels such as "human error." Distinguish
root causal mechanisms from triggers, symptoms, and counterfactuals. When evidence
does not establish causality, state competing explanations and the observation
that would discriminate them.

## Deliverable

Include impact and duration, detection, timeline, causal analysis, response and
recovery, what worked, and prioritized follow-ups. Each action should have a
verifiable outcome; assign an owner or deadline only when supplied or authorized.

## Authorization boundary

Analysis is read-only by default. Do not query production, change alerts, deploy,
roll back, create tickets, assign individuals, or publish the postmortem without
explicit permission. Minimize and redact credentials, personal data, customer
content, and unnecessary identifiers.

## Validation and stop conditions

Cross-check important timestamps and causal claims against at least one primary
artifact when available. Validate action items against the demonstrated failure
mode. Stop if evidence collection risks service impact, violates retention or
privacy constraints, or could overwrite ephemeral evidence; report the gap and
the safest next collection step.
