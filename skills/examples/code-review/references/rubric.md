# Review rubric

Use only the sections relevant to the patch.

## Correctness

- Trace success, empty, invalid, concurrent, retry and partial-failure paths.
- Check invariants across transactions and asynchronous boundaries.
- Compare boundary conditions with the documented API, schema or protocol.

## Security and privacy

- Follow untrusted input to interpreters, paths, queries, templates and logs.
- Verify authentication is not confused with resource-level authorization.
- Check secret handling, tenant isolation, minimization and irreversible effects.

## Reliability and concurrency

- Look for missing cancellation, unbounded work, races and non-idempotent retry.
- Confirm timeout budgets and failure behavior at dependency boundaries.
- Check compatibility during rollout when versions or schemas coexist.

## Performance

- Report complexity only when reachable scale or a measured hot path makes it
  material.
- Inspect query shape, allocation, fan-out, batching and backpressure.

## Tests

- Tests should fail for the defect they claim to prevent.
- Prioritize state transitions, public behavior and realistic boundaries over
  implementation-detail assertions.
- Note missing tests when they leave a material branch or regression unguarded.

## Severity

- **P0:** broad catastrophic impact requiring immediate stop.
- **P1:** likely serious correctness, security or data-loss defect.
- **P2:** real defect with bounded impact or trigger.
- **P3:** low-impact defect worth correcting; not a style preference.
