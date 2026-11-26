---
title: "Setup: Your Local Cluster"
description: Install the tools and start a 3-node Kubernetes cluster on your laptop.
sidebar:
  order: 0
---

Every lab command runs from the **`lab/`** folder.

## What you need
- **Docker** (already installed and working)
- **kind**: Kubernetes-in-Docker
- **kubectl**: the Kubernetes CLI
- **tilt**: live development (Lab 7)

```bash
cd lab
make tools        # installs kind, kubectl, tilt into ~/.local/bin (no sudo)
```

If your shell can't find them, add this to `~/.bashrc` and open a new terminal:
```bash
export PATH=$HOME/.local/bin:$PATH
```

## One command to get everything running
```bash
make up
```
That runs, in order (each step prints the real command):

| Step | Command | What happens |
|---|---|---|
| `cluster` | `kind create cluster --config kind/cluster.yaml` | 3 Docker containers become 3 Kubernetes nodes |
| `metrics` | `kubectl apply -f …metrics-server…` | Installs CPU/memory metrics (needed for autoscaling) |
| `build` | `docker build --target prod -t demo-app:1.0 app` | Builds our image |
| `load` | `./scripts/kind-load.sh demo-app:1.0` | Copies the image into the nodes (no registry needed) |
| `deploy` | `kubectl apply -f k8s/…` | Namespace, ConfigMap, Deployment, Service, HPA |

Then open **http://localhost:8080**. That's the live visualizer.

## Look around
```bash
docker ps                      # your 3 "servers" are containers: learn-control-plane, learn-worker, learn-worker2
kubectl get nodes -o wide
kubectl get pods -A            # everything running, including the control plane itself
make status                    # our app: deployment, replicaset, pods, service, hpa
```

:::tip[Keep two terminals open]
Terminal 1: `make watch` (live pod list). Terminal 2: run the lab commands. Browser: http://localhost:8080. You'll see each action from three angles.
:::

## Tear down
```bash
make down     # delete the app (namespace)
make clean    # delete the whole cluster
```
