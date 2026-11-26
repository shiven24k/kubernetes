---
title: Scaling Nodes (Servers)
description: Cluster Autoscaler, Karpenter, and managed Kubernetes.
sidebar:
  order: 3
---

The HPA adds pods; something has to add **machines** when the pods don't fit.

## Cluster Autoscaler
- Watches for pods stuck in **Pending** because no node has room → grows a **node group** (AWS Auto Scaling Group, GCP Managed Instance Group…).
- Watches for nodes that are mostly idle and whose pods can move elsewhere → drains and removes them.
- Decisions are based on **requests**, not actual usage. Another reason to set requests honestly.

## Karpenter
A newer approach (originally AWS, now also Azure and others). Instead of fixed node groups, it looks at the pending pods and launches the **right-sized instance** for them directly. It's faster and often cheaper (it can use spot instances and consolidate).

## Managed Kubernetes
You rarely run the control plane yourself in production:

| Provider | Service | Notes |
|---|---|---|
| AWS | EKS | + Karpenter for nodes |
| Google Cloud | GKE | Autopilot mode manages nodes for you |
| Azure | AKS | |
| DigitalOcean / Linode / Hetzner | DOKS / LKE / k3s | Cheapest for learning in the cloud |

## Keeping apps available during node churn
Nodes get drained for scale-down and upgrades. Protect your app with:
- **PodDisruptionBudget**: "never voluntarily evict below 2 ready pods"
  ```yaml
  apiVersion: policy/v1
  kind: PodDisruptionBudget
  metadata: { name: demo, namespace: demo }
  spec:
    minAvailable: 2
    selector: { matchLabels: { app: demo } }
  ```
- **Topology spread constraints / anti-affinity**: don't put all replicas on one node or one zone.
  ```yaml
  topologySpreadConstraints:
    - maxSkew: 1
      topologyKey: kubernetes.io/hostname
      whenUnsatisfiable: ScheduleAnyway
      labelSelector: { matchLabels: { app: demo } }
  ```

## Local tools for learning
| Tool | What it is |
|---|---|
| **kind** (used here) | Kubernetes nodes as Docker containers. Fast, multi-node, disposable |
| minikube | One VM/container node, lots of addons |
| k3d / k3s | Lightweight Kubernetes, also used for small production setups |
| Docker Desktop / Rancher Desktop / OrbStack | One-click single-node clusters |
