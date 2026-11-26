---
title: Architecture
description: Control plane, nodes, and what happens when you run kubectl apply.
sidebar:
  order: 2
---

A **cluster** is a set of machines (**nodes**) plus a **control plane** that manages them.

```
┌─────────────────────── CONTROL PLANE (the brain) ───────────────────────┐
│  kube-apiserver   ← the ONLY front door. kubectl, controllers, kubelets  │
│                     all talk to it                                       │
│  etcd             ← key-value database holding all desired + actual state│
│  kube-scheduler   ← picks a node for each new pod                        │
│  controller-manager ← runs reconciliation loops (Deployments, nodes, ...)│
└─────────────────────────────────────────────────────────────────────────┘
            │                       │                       │
┌───────── NODE 1 ──────┐ ┌──────── NODE 2 ───────┐ ┌──────── NODE 3 ───────┐
│ kubelet   ← runs pods │ │ kubelet               │ │ kubelet               │
│ container runtime     │ │ containerd            │ │ containerd            │
│ kube-proxy ← Services │ │ kube-proxy            │ │ kube-proxy            │
│ [pod] [pod]           │ │ [pod]                 │ │ [pod] [pod]           │
└───────────────────────┘ └───────────────────────┘ └───────────────────────┘
```

In the lab, `kind` builds exactly this using Docker containers as "machines": `learn-control-plane`, `learn-worker`, `learn-worker2`. Run `docker ps` to see them.

## What happens on `kubectl apply -f deployment.yaml`

1. **kubectl** sends the YAML to the **API server**.
2. The API server validates it and stores it in **etcd**. That's all `apply` does.
3. The **Deployment controller** notices a new Deployment and creates a **ReplicaSet**.
4. The **ReplicaSet controller** notices it wants 3 pods and has 0, so it creates 3 Pod objects (still just records, with no node yet).
5. The **scheduler** notices unscheduled pods and assigns each to a node, based on free CPU/memory, constraints, and spreading.
6. The **kubelet** on each chosen node notices "a pod is assigned to me", tells **containerd** to pull the image and start it, and runs the probes.
7. When the readiness probe passes, the pod's IP is added to the **Service's** endpoints, and **kube-proxy** routes traffic to it.

Nobody calls anybody directly. Every component **watches the API server** and reacts. That's why the system heals itself: if a pod disappears, step 4 happens again automatically.

:::tip[See it yourself]
```bash
kubectl get pods -n kube-system          # the control plane runs as pods too!
kubectl get events -n demo --sort-by=.lastTimestamp   # steps 3-7 as they happen
```
:::
