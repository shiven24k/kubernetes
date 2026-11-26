---
title: Troubleshooting
description: A debugging routine that works for almost everything.
sidebar:
  order: 8
---

## The routine
```bash
kubectl get pods -n demo                       # 1. what state?
kubectl describe pod <pod> -n demo             # 2. read EVENTS at the bottom
kubectl logs <pod> -n demo [--previous]        # 3. what did the app say?
kubectl get events -n demo --sort-by=.lastTimestamp
kubectl get endpointslices -n demo             # 4. does the Service have pods?
kubectl exec -it <pod> -n demo -- sh           # 5. poke from inside
```

## Common states
| Symptom | Usual cause | Fix |
|---|---|---|
| `ImagePullBackOff` / `ErrImagePull` | Image not in kind / typo / private registry | `make build load`; check `image:` and `imagePullPolicy: IfNotPresent` |
| `CrashLoopBackOff` | App exits on start | `kubectl logs --previous` |
| `Pending` | No node fits the requests | `describe` → `Insufficient cpu/memory`; lower requests or add nodes |
| `Running` but `0/1` READY | Readiness probe failing | Check probe path/port; `describe` shows probe failures |
| `OOMKilled` | Memory limit too low | Raise `limits.memory` |
| Service gives no response | Selector doesn't match pod labels, or wrong `targetPort` | `kubectl get endpointslices`: empty means a selector problem |
| HPA shows `<unknown>` | metrics-server missing, or no CPU requests | `make metrics`; `kubectl top pods` |

## Lab-specific issues

**`localhost:8080` doesn't respond.** The port mapping is set when the cluster is created. Check `docker ps` shows `0.0.0.0:8080->30080` on `learn-control-plane`. If port 8080 was taken, change `hostPort` in `kind/cluster.yaml` and run `make clean cluster`.

**Images stuck in `ContainerCreating` / pulls hang.** Pull on the host and side-load: `docker pull <image> && ./scripts/kind-load.sh <image>`. The Makefile already does this for metrics-server and busybox.

**`kind load` fails with `content digest … not found`.** This is a known issue with Docker's multi-platform image store, and the reason `scripts/kind-load.sh` exists (it exports only your platform).

**The visualizer shows all traffic on one pod.** Something is reusing connections. The app sends `Connection: close` to prevent this. Check whether a proxy sits in between.
