---
title: "Lab 4: Self-Healing"
description: Kill pods, crash processes, and watch Kubernetes repair everything.
sidebar:
  order: 4
---

## Delete a pod
```bash
make chaos           # deletes a random demo pod
```
`make watch` shows a **new pod with a new name** created immediately. The ReplicaSet saw `2 ≠ 3` and fixed it. In the visualizer one card goes **gone** and a fresh one appears.

## Crash the process
Click **Crash a pod** in the visualizer (or `curl -X POST localhost:8080/api/crash`).
This time the pod keeps its name, but `RESTARTS` goes `0 → 1`. The **kubelet** restarted the container *inside* the same pod.

```bash
kubectl logs -n demo <pod-name> --previous    # logs from the crashed container
```

Crash the same pod repeatedly and you'll see `CrashLoopBackOff`: Kubernetes waits 10s, 20s, 40s… between restarts so a broken app doesn't burn the node.

## Kill a whole node
```bash
kubectl get pods -n demo -o wide          # note which pods are on learn-worker2
docker stop learn-worker2                 # "unplug" a server
kubectl get nodes -w                      # NotReady after ~40s
```
After the node is unreachable, its pods are marked for eviction and recreated on `learn-worker`. (This takes a few minutes by default, so be patient.) The Service stops routing to them as soon as they fail readiness.

```bash
docker start learn-worker2                # plug it back in
```

## Delete everything?
```bash
kubectl delete pods -n demo -l app=demo   # all of them at once
```
They all come back. To actually stop the app you delete the **Deployment** (the desired state), not the pods.
