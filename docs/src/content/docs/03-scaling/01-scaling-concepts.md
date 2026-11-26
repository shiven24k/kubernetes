---
title: How Scaling Works
description: Vertical vs horizontal, the two layers of scaling, and what makes an app scalable.
sidebar:
  order: 1
---

"Scaling Docker images across servers" means running **more copies of the same image**, spread over **more machines**, with traffic spread across them.

## Vertical vs horizontal

| | Vertical (scale **up**) | Horizontal (scale **out**) |
|---|---|---|
| How | Bigger machine / more CPU & RAM per pod | More pods / more machines |
| Limit | The biggest machine you can buy | Practically none |
| Downtime | Usually a restart | None, since copies are added alongside |
| Failure | One big thing fails | One of many fails, and the rest carry on |
| K8s tool | VPA (Vertical Pod Autoscaler) | **HPA** + Cluster Autoscaler |

Kubernetes is built for **horizontal** scaling.

## The two layers

```
LAYER 1: PODS (how many copies of my app)          ← HPA, kubectl scale
  [pod][pod][pod][pod][pod][pod][pod][pod]
──────────────────────────────────────────────────────────────────
LAYER 2: NODES (how many machines to put them on)  ← Cluster Autoscaler / Karpenter
  [ node 1 ][ node 2 ][ node 3 ]  (+ node 4 when pods don't fit)
```

1. Traffic rises → pods get busy → the **HPA** adds pods.
2. New pods don't fit on existing nodes → they sit **Pending**.
3. The **Cluster Autoscaler** sees Pending pods → asks the cloud for another VM → the scheduler places pods on it.
4. Traffic falls → the HPA removes pods → nodes go idle → the Cluster Autoscaler removes them (and you stop paying for them).

Your local kind cluster has a fixed 3 nodes, so you'll see layer 1 live. Layer 2 needs a cloud provider (or Karpenter / a managed cluster).

## Manual scaling
```bash
kubectl scale deployment/demo --replicas=6 -n demo
# or edit replicas: in the YAML and kubectl apply
```

## What makes an app horizontally scalable
- **Stateless**: no user data in memory or on local disk, so any pod can serve any request. Sessions go to Redis or a DB, uploads to S3.
- **Fast startup**: pods that boot in seconds can absorb a spike.
- **Health endpoints**: readiness so new pods only get traffic when ready.
- **Graceful shutdown**: so scaling *down* doesn't drop requests.
- **Resource requests set**: the scheduler and HPA depend on them.
- **External dependencies can keep up**: 50 pods × 10 DB connections = 500 connections. The database is often the real bottleneck (use connection pooling).

## The 12-factor app
Most of these rules come from [12factor.net](https://12factor.net): config in env vars, logs to stdout, stateless processes, disposability. Apps that follow it tend to work well on Kubernetes without changes.
