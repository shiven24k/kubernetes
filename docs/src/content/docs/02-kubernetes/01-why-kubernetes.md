---
title: Why Kubernetes?
description: From one server to many, and the problems that appear along the way.
sidebar:
  order: 1
---

## The story of scaling a web app

**Stage 1: one server.** You `docker run` your image on a VPS. It works, until:
- the server reboots and the app doesn't come back
- traffic grows and one machine isn't enough
- you deploy a bug and need to roll back *fast*

**Stage 2: several servers, by hand.** You run the image on 3 machines behind a load balancer. Now you need to:
- decide which machine runs what (*scheduling*)
- notice when a container or machine dies and replace it (*self-healing*)
- update all copies without downtime (*rolling updates*)
- let services find each other as IPs change (*service discovery*)
- add copies when busy and remove them when quiet (*autoscaling*)
- hand out config and passwords safely (*config & secrets*)

**Stage 3: Kubernetes.** All of the above, automated, driven by YAML you write once.

## Declarative, not imperative

| Imperative (scripts) | Declarative (Kubernetes) |
|---|---|
| "Start 3 containers." | "There should **be** 3 containers." |
| If one dies, nothing happens | If one dies, Kubernetes sees 2 ≠ 3 and starts another |
| You track the state | Kubernetes tracks the state |

This is the **reconciliation loop**, and it's the most important idea in Kubernetes:

```
        ┌──────────────────────────────────────────┐
        ▼                                          │
  observe actual state ──► compare with desired ──► act to close the gap
```

Every feature (Deployments, autoscalers, Services) is a *controller* running this loop for one kind of object.

## When NOT to use Kubernetes
Be honest about it: for a single small app, a PaaS (Fly.io, Render, Railway, Cloud Run) or plain Docker Compose on one VPS is simpler. Kubernetes pays off once you have several services, a team, real scaling needs, or need to avoid lock-in to one cloud.
