---
title: Roadmap
description: What to learn, in what order, and why.
sidebar:
  order: 1
---

Kubernetes looks huge because it's usually taught all at once. Taken one layer at a time, each step builds on the one before.

## The one-sentence version

> **Kubernetes is a program that keeps your containers running the way you described them, across many machines, and fixes things when reality drifts from your description.**

Everything else is detail on top of that sentence. You write down what you want ("3 copies of this Docker image, reachable on port 80"), and Kubernetes keeps working to make that true.

## The learning path

| Step | Topic | Why you need it | Time |
|---|---|---|---|
| 1 | [Linux & shell](/01-prerequisites/01-linux-shell/) | Every tool is a CLI, and containers are Linux processes | 1–2 h |
| 2 | [Networking basics](/01-prerequisites/02-networking/) | Ports, DNS, and load balancing are most of what goes wrong | 1–2 h |
| 3 | [Containers & Docker](/01-prerequisites/03-containers-docker/) | Kubernetes runs container images. Learn these first | 3–4 h |
| 4 | [YAML](/01-prerequisites/04-yaml/) | Everything in Kubernetes is described in YAML | 30 min |
| 5 | [Why Kubernetes](/02-kubernetes/01-why-kubernetes/) → [Architecture](/02-kubernetes/02-architecture/) | The mental model | 1 h |
| 6 | Pods → Deployments → Services | The 3 objects you use 90% of the time | 2–3 h |
| 7 | Config, probes, resources, storage, Ingress | Making it production-shaped | 3 h |
| 8 | [Scaling](/03-scaling/01-scaling-concepts/) | Your original question: how do we scale? | 2 h |
| 9 | [Hands-on lab](/04-lab/00-setup/) | Do every lab, and break things on purpose | ~3 h |

:::tip[How to use these docs]
Theory pages end with a **"Try it"** box that points to the matching lab. Read a little, then run it. Watching a pod die and come back on its own teaches more than any diagram.
:::

## The big picture

```
 You write code ─► Docker builds an IMAGE ─► pushed to a REGISTRY
                                                  │
                                                  ▼
 You write YAML ("3 replicas of image X") ─► kubectl apply ─► Kubernetes API
                                                  │
                    ┌─────────────────────────────┼─────────────────────────────┐
                    ▼                             ▼                             ▼
               Node 1 (server)              Node 2 (server)              Node 3 (server)
               [pod] [pod]                   [pod]                        [pod] [pod]
                    ▲                             ▲                             ▲
                    └──────────── Service (one stable address, load-balances) ──┘
                                                  ▲
                                               users
```

## What you'll build

The `lab/` folder (next to these docs) contains:

- **`app/`**: a tiny Node.js web server whose responses say *which pod answered*, plus a **live visualizer** page.
- **`app/Dockerfile`**: how that app becomes an image.
- **`k8s/`**: the YAML that tells Kubernetes how to run it, expose it, and autoscale it.
- **`kind/cluster.yaml`**: a local 3-machine cluster (machines are Docker containers).
- **`Tiltfile`**: live development. Save a file and see it change inside the running pods.
- **`Makefile`**: every command, named. Run `make help`.
