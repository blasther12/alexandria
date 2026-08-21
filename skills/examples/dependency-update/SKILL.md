---
name: dependency-update
description: Update explicitly scoped software dependencies while preserving compatibility and reproducible builds. Use for manifest or lockfile upgrades and security-version bumps; do not use to publish packages or perform unrelated modernization.
---

# Dependency Update

Produce the smallest dependency change that satisfies the requested version,
compatibility, or security objective.

## Establish the baseline

Identify the package manager, workspace boundaries, manifests, lockfiles, runtime
constraints, registry configuration, and current test commands. Inspect the
existing worktree so unrelated user changes are preserved. Resolve whether the
request targets one package, a dependency family, or all dependencies; do not
broaden it implicitly.

## Update

Consult authoritative release notes or migration guidance when the target version
can change APIs, configuration, runtime support, or data formats. Use the
repository's package manager and retain its lockfile. Avoid hand-editing generated
lock data when the package manager can produce it.

Review the resulting manifest and lockfile diff for unexpected packages, source
or registry changes, script additions, major transitive shifts, and duplicate
versions. Make only compatibility edits required by the requested update.

## Validate

Run the narrowest relevant checks first, followed by the repository's normal
install integrity, build, type, test, and lint checks as applicable. Verify the
resolved version from the lockfile or package-manager output, not merely the
manifest constraint. Report skipped checks and why they could not run.

## Authorization boundary

A dependency-update request authorizes scoped local manifest, lockfile, and
necessary compatibility edits. It does not authorize changing registries,
credentials, lifecycle-script policy, unrelated dependencies, release tags,
package publication, deployment, commits, or pushes unless separately requested.

## Stop conditions

Stop before proceeding when the package source changes unexpectedly, integrity
verification fails, a required credential is unavailable, generated changes are
far broader than the declared scope, or migration requires a product decision.
Do not bypass signature, checksum, or lockfile protections to force an update.
