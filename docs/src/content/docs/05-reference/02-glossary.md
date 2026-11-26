---
title: Glossary
description: Every term in one place.
sidebar:
  order: 2
---

| Term | Meaning |
|---|---|
| **Cluster** | Control plane + nodes, managed as one |
| **Node** | A machine (VM, bare metal, or a container in kind) that runs pods |
| **Control plane** | API server, etcd, scheduler, controller-manager |
| **kubelet** | Agent on every node that starts pods and runs probes |
| **Pod** | Smallest deployable unit: 1+ containers sharing an IP |
| **ReplicaSet** | Keeps N identical pods running |
| **Deployment** | Manages ReplicaSets for rolling updates and rollbacks |
| **StatefulSet** | Like a Deployment, but with stable names and per-pod storage |
| **DaemonSet** | One pod per node |
| **Job / CronJob** | Run-to-completion work, once or on a schedule |
| **Service** | Stable name/IP that load-balances across ready pods |
| **EndpointSlice** | The live list of pod IPs behind a Service |
| **Ingress / Gateway** | HTTP routing from outside into Services |
| **ConfigMap / Secret** | Config and sensitive data, injected as env or files |
| **PV / PVC / StorageClass** | Disk, a claim on disk, how to make disks |
| **Namespace** | Folder for resources |
| **Label / Selector** | Tags, and queries over them. How objects find each other |
| **Probe** | Health check: readiness, liveness, startup |
| **requests / limits** | Reserved resources / hard ceiling |
| **HPA / VPA** | Horizontal / vertical pod autoscaler |
| **Cluster Autoscaler / Karpenter** | Adds/removes nodes |
| **PDB** | PodDisruptionBudget: minimum pods during voluntary disruptions |
| **Taint / Toleration** | Node says "keep off"; pod says "I can handle it" |
| **Affinity / Topology spread** | Rules for where pods should (not) land |
| **Controller** | A loop that makes actual state match desired state |
| **Operator** | A custom controller encoding ops knowledge (e.g., for Postgres) |
| **CRD** | Custom Resource Definition: teach Kubernetes new object kinds |
| **Helm** | Package manager: templated YAML "charts" |
| **Kustomize** | Patch-based YAML variants per environment (built into kubectl) |
| **GitOps** | Git as source of truth, applied by Argo CD / Flux |
| **kind** | Kubernetes IN Docker. Local clusters |
| **Tilt** | Live-update dev loop for Kubernetes |
