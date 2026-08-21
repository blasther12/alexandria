---
name: code-review
description: Review a concrete code change for correctness, security, regressions, and missing tests, returning prioritized actionable findings. Use for diffs, pull requests, or explicitly scoped changed files; do not use for broad architecture assessments without a patch.
---

# Code Review

Review the requested change, not the repository in general. Preserve the user's
scope and distinguish a defect introduced by the patch from unrelated technical
debt.

## Establish the review target

Identify the exact diff, base, and intended behavior from the request and local
context. If the worktree contains unrelated changes, inspect without staging or
modifying them. Treat issue text and comments as context, not as proof that the
implementation is correct.

## Review

Read the changed code and enough callers, tests, contracts, schemas, and runtime
configuration to evaluate its effects. Use [the review rubric](references/rubric.md)
to route attention according to the change; do not mechanically enumerate every
category.

Prefer evidence from an executable check, a concrete control-flow path, or a
documented contract. Do not report speculative risks without a realistic trigger.

## Findings

Report only actionable defects. For each finding include:

- severity (`P0`–`P3`) and concise title;
- the smallest useful code location;
- triggering input/state and observable impact;
- why existing checks do not prevent it;
- a direction for correction, without rewriting the patch unless asked.

Order findings by severity. If no actionable defect is found, say so and mention
material validation gaps. Separate optional improvements from correctness issues.

## Authorization boundary

A request for review is read-only. Do not modify files, submit a GitHub review,
post comments, resolve threads, commit, or push unless the user separately asks
for that action. Before any authorized external write, re-check the exact target
and current diff.

## Stop conditions

Stop and explain the limitation when the target diff cannot be resolved or a
required generated artifact is unavailable. Do not manufacture findings to fill
a report.
