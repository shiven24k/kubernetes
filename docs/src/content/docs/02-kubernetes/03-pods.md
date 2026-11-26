---
title: Pods
description: The smallest thing Kubernetes runs.
sidebar:
  order: 3
---

A **Pod** is one or more containers that share a network IP and can share storage. Usually it's **one container per pod**.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: hello
  labels: { app: hello }
spec:
  containers:
    - name: app
      image: demo-app:1.0
      ports: [{ containerPort: 3000 }]
```

## Key facts
- **Pods are disposable (cattle, not pets).** They get a random name and a new IP each time. Never depend on a specific pod.
- **You almost never create pods directly.** A bare pod that dies stays dead. You create a *Deployment*, which creates and replaces pods for you.
- Each pod gets its **own IP**, and containers inside it talk over `localhost`.
- **Labels** (`app: demo`) are how everything else finds pods. Services and Deployments select pods by label, not by name.

## Pod lifecycle
`Pending` (waiting for a node or image) → `ContainerCreating` → `Running` → `Succeeded`/`Failed`. Watch out for:
- `CrashLoopBackOff`: the container keeps exiting, and Kubernetes waits longer between each restart.
- `ImagePullBackOff` / `ErrImagePull`: wrong image name, or a private registry with no credentials.
- `Pending` for a long time: no node has enough CPU/memory free.

## Multi-container pods (sidecars)
Sometimes a helper container rides along, such as a log shipper or a proxy. They share the network and lifecycle. **Init containers** run to completion *before* the main container starts (e.g. wait for the database, run migrations).

## Commands
```bash
kubectl get pods -n demo -o wide           # which node, which IP
kubectl describe pod <name> -n demo        # events: the first place to debug
kubectl logs <name> -n demo [-f] [--previous]
kubectl exec -it <name> -n demo -- sh      # shell inside
```
