---
name: debugging
description: Diagnose a reproducible software failure by narrowing hypotheses with runtime evidence and reporting the root cause. Use for bugs, crashes, incorrect behavior, and flaky failures; do not use when the request is solely to implement a known fix.
---

# Debugging

Determine the earliest incorrect state and explain the causal chain from trigger
to symptom. Do not mistake a plausible correlation for the root cause.

## Reproduce and bound

Capture expected behavior, actual behavior, inputs, environment, version, timing,
and the smallest known reproducer. Inspect recent changes and relevant logs while
preserving the user's working state. If reproduction is unsafe or expensive, use
existing evidence and say what remains uncertain.

## Investigate

Form a small set of discriminating hypotheses. For each experiment, state what
result would support or reject the hypothesis, then prefer the least invasive
observable check. Trace backward from the symptom through state transitions,
boundaries, and invariants until the first divergence is found.

Keep durable facts separate from hypotheses. Avoid changing several variables at
once, suppressing errors, or adding retries before the failure mode is understood.

## Result

Report:

- a minimal reproduction or the evidence examined;
- the root cause and causal chain;
- affected versions, inputs, or environments;
- confidence and remaining unknowns;
- a focused fix direction and regression-test scenario.

## Authorization boundary

Diagnosis is read-only unless the user asks for a fix. Temporary local
instrumentation must not be committed or left behind without permission. Do not
restart shared services, alter production data, enable verbose logging on live
systems, or access external environments without explicit authorization.

## Validation and stop conditions

Validate the root cause by predicting and observing a changed outcome, using a
safe local experiment when possible. Stop when the next experiment could destroy
evidence, expose sensitive data, affect other users, or require unavailable
production access. If no root cause is proven, provide the strongest bounded
hypothesis and the next discriminating observation instead of claiming certainty.
