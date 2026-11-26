---
title: Zero-Downtime Deploys
description: Rolling, blue/green and canary, and what each one needs.
sidebar:
  order: 4
---

Scaling also means changing a running system without anyone noticing.

## Checklist for a zero-downtime rolling update
- [x] `readinessProbe` that only passes when the app can actually serve
- [x] `maxUnavailable: 0` (never drop below capacity)
- [x] graceful SIGTERM handling + sensible `terminationGracePeriodSeconds`
- [x] backwards-compatible changes (old and new versions run **at the same time** during a rollout, so DB migrations must work for both)
- [x] `minReplicas ≥ 2` and a PodDisruptionBudget

## Strategies
| Strategy | How | Pros / cons |
|---|---|---|
| **Rolling** (Deployment default) | Replace pods a few at a time | Built in, no extra cost. Two versions run at once |
| **Recreate** | Kill all old pods, then start new | Simple. Causes downtime |
| **Blue/green** | Run full v2 next to v1, switch the Service selector | Instant switch and rollback. Needs 2× capacity |
| **Canary** | Send 5% of traffic to v2, watch metrics, increase | Safest. Needs an Ingress/Gateway/mesh, or Argo Rollouts / Flagger |

## Imperative vs declarative drift
In the lab, `make color` uses `kubectl set env`, an **imperative** change made directly on the cluster. If you later `kubectl apply` your YAML, that extra env var **stays**, because `apply` only manages fields it set itself. The cluster now differs from git.

This is why teams use **GitOps** (Argo CD, Flux): git holds the YAML, a controller applies it, and manual changes are detected and reverted.
