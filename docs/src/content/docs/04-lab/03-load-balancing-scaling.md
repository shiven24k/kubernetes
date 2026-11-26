---
title: "Lab 3: Load Balancing & Scaling"
description: Scale by hand and watch traffic spread across new pods.
sidebar:
  order: 3
---

Open **http://localhost:8080** and keep `make watch` running.

## Load balancing
Every card is a pod. The bars show each pod's share of traffic, roughly equal because the Service picks a pod for each new connection.

From the terminal:
```bash
for i in $(seq 30); do curl -s localhost:8080/api/whoami | grep -o '"pod":"[^"]*"'; done | sort | uniq -c
```

Notice the `node:` line on each card: pods are spread over `learn-worker` and `learn-worker2`. The scheduler did that.

## Scale out by hand
The HPA owns the replica count, so pause it for this lab:
```bash
kubectl delete hpa demo -n demo
make scale N=8
```
Watch: 5 new pods appear, warm up (`0/1`), become ready (`1/1`), and **only then** show up in the visualizer. That's the readiness probe at work.

## Scale in
```bash
make scale N=2
```
Pods go `Terminating`. Each gets SIGTERM, fails readiness, finishes requests, and exits. The visualizer marks them **gone** with no errors.

## Too big to fit?
Each kind node is a container sharing your laptop's CPUs. Check how much each node offers:
```bash
kubectl get nodes -o custom-columns=NAME:.metadata.name,CPU:.status.allocatable.cpu,MEM:.status.allocatable.memory
```
Make each pod *request* 2 full CPUs (the limit must be raised too, since requests can never exceed limits), then ask for more pods than can fit:
```bash
kubectl set resources deployment/demo -n demo --requests=cpu=2 --limits=cpu=2
make scale N=12
kubectl get pods -n demo | grep Pending
kubectl get events -n demo --field-selector reason=FailedScheduling | tail -3
```
You'll see `Insufficient cpu` on the Pending pods. Also notice that many **old** (100m) pods are still `Running` and the app never went down. The resource change started a rollout, and with `maxUnavailable: 0` Kubernetes won't remove old pods until their replacements are ready. The new ones can't even be scheduled, so the rollout just waits. The scheduler goes by **requests**, not actual usage, and the workers are fully booked. (The control-plane node has a *taint* that keeps app pods off it.) In the cloud, a Cluster Autoscaler would now add a machine.

Put the original resources back by re-applying the YAML:
```bash
kubectl apply -f k8s/20-deployment.yaml
```

## Restore
```bash
kubectl apply -f k8s/40-hpa.yaml
```
