---
title: Health Checks & Resources
description: Probes tell Kubernetes when to send traffic and when to restart. Resources tell it where pods fit.
sidebar:
  order: 7
---

## Probes

| Probe | Question | On failure |
|---|---|---|
| **readiness** | "Should I receive traffic *right now*?" | Removed from the Service (not restarted) |
| **liveness** | "Am I stuck/broken beyond repair?" | Container is **restarted** |
| **startup** | "Have I finished booting yet?" | Holds off the other probes until it succeeds (for slow starters) |

```yaml title="lab/k8s/20-deployment.yaml"
readinessProbe:
  httpGet: { path: /readyz, port: 3000 }
  periodSeconds: 2
  failureThreshold: 1
livenessProbe:
  httpGet: { path: /healthz, port: 3000 }
  initialDelaySeconds: 5
  periodSeconds: 5
```

Our app fakes a 2-second warm-up: `/readyz` returns 503 until it's ready, and again during shutdown. Watch `READY 0/1 → 1/1` in `kubectl get pods -w` after scaling.

:::caution[Common mistake]
Don't make the **liveness** probe check your database. If the DB goes down, every pod fails liveness and gets restarted in a loop, which makes the outage worse. Liveness should only check "is *this process* healthy?" Put dependency checks in readiness, if anywhere.
:::

## Graceful shutdown
When a pod is deleted: it's removed from Service endpoints, *and at the same time* it gets SIGTERM. Because these happen in parallel, a few requests can still arrive after SIGTERM. Good apps:
1. on SIGTERM, start failing readiness
2. keep serving for a few seconds
3. close the server and exit

That's exactly what `process.on('SIGTERM')` in `server.js` does. `terminationGracePeriodSeconds` is the hard deadline before SIGKILL.

## Resource requests & limits

```yaml
resources:
  requests: { cpu: 100m, memory: 64Mi }   # reserved; used for SCHEDULING
  limits:   { cpu: 500m, memory: 128Mi }  # hard ceiling; enforced by cgroups
```

- **CPU** is measured in cores: `1000m` = 1 core, `100m` = 1/10 core.
- **requests**: the scheduler only places a pod on a node with that much *unreserved* capacity. **The autoscaler's "50% CPU" is a percentage of the request.**
- **CPU limit** exceeded → the container is **throttled** (slowed down).
- **Memory limit** exceeded → the container is **OOMKilled** (killed, then restarted).

| Requests vs limits | QoS class | Evicted first under pressure? |
|---|---|---|
| none set | BestEffort | Yes, first |
| requests < limits | Burstable | Middle |
| requests == limits | Guaranteed | Last |

:::tip
Always set requests. Without them the scheduler is guessing and the autoscaler can't work. Watch real usage with `kubectl top pods -n demo`.
:::
