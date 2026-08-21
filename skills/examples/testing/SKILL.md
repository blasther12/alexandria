---
name: testing
description: Design, add, or repair automated tests for a specified behavior or regression using the repository's existing test strategy. Use when the requested deliverable is test code or a test plan; do not use for general implementation work with incidental tests.
---

# Testing

Create tests that demonstrate observable behavior and fail for the defect or
missing contract they are meant to guard.

## Identify the contract

Resolve the target behavior from public interfaces, requirements, bug evidence,
and existing tests. Inspect the test framework, fixtures, naming conventions,
helpers, and CI commands before adding new structure. Preserve the distinction
between a product defect and an outdated expectation.

## Choose the test level

Use the lowest-cost level that exercises the relevant boundary without mocking
away the behavior under test. Cover meaningful state transitions, boundary
values, failures, retries, authorization, or concurrency only when they belong to
the contract. Reuse stable fixtures and deterministic seams; avoid time, network,
randomness, and global-state dependencies unless they are controlled.

For a regression, first confirm the new test fails for the expected reason on the
unfixed behavior when safely possible. Assertions should describe externally
meaningful outcomes rather than private implementation details.

## Validate

Run the focused test repeatedly when flakiness is plausible, then run the nearest
relevant suite. Confirm collection or discovery includes the new test. Report the
commands, results, and any broader suite that could not be executed.

## Authorization boundary

A request to add or repair tests authorizes changes to scoped test code and its
local fixtures. Do not change production behavior merely to make a test pass,
regenerate unrelated snapshots, rewrite broad suites, update CI policy, or access
live services unless the user explicitly requests it.

## Stop conditions

Stop and surface the conflict when the intended contract cannot be determined,
the test requires destructive or billable external effects, or failures reveal
unrelated user changes. Do not weaken assertions, skip tests, or add arbitrary
delays to obtain a green result.
