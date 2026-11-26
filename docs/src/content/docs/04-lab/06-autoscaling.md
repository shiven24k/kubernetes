---
title: "Lab 6: Autoscaling Under Load"
description: Hammer the app and watch the HPA go from 3 pods to 10, and back.
sidebar:
  order: 6
---

This is the answer to "how do we scale?", running live.

## Setup: three windows
```bash
# terminal 1
kubectl get hpa -n demo --watch
# terminal 2
make watch
# browser
http://localhost:8080
```
Check that metrics work: `kubectl top pods -n demo` should show numbers. If it says *metrics not available*, wait a minute after `make up`.

## Generate load
```bash
make load-on
```
This starts a `busybox` pod inside the cluster that calls `http://demo/api/burn?ms=200` in 4 parallel loops. Each call burns 200 ms of CPU.

## What you'll see (about 1–3 minutes)
```
NAME   REFERENCE         TARGETS          MINPODS MAXPODS REPLICAS
demo   Deployment/demo   cpu: 3%/50%      2       10      3
demo   Deployment/demo   cpu: 379%/50%    2       10      3     ← load hits
demo   Deployment/demo   cpu: 254%/50%    2       10      10    ← ceil(3 × 379/50) = 23, capped at max 10
demo   Deployment/demo   cpu: 188%/50%    2       10      10
```
(Real output from building this lab.) New pods appear, warm up, join the Service, and the visualizer fills up with cards. CPU per pod drops as the work is shared.

```bash
kubectl describe hpa demo -n demo | tail -8    # "New size: 10; reason: cpu resource utilization above target"
kubectl top pods -n demo
```

:::note
Even at 10 pods CPU stays above 50%, because 4 loops doing nothing but CPU work will always keep pods busy. Raise `maxReplicas` in `k8s/40-hpa.yaml` and re-apply to see it go further, until the nodes run out of requested CPU (Lab 3).
:::

## Remove load
```bash
make load-off
```
After the 30s stabilization window (300s by default in real clusters), the HPA scales back down to `minReplicas: 2`. Scaling down is deliberately slower than scaling up.

## Browser load
The **Browser CPU load** button sends burn requests from your browser. Browsers cap parallel connections, so it's gentler. Try it with `minReplicas` and watch the HPA react a little.

## Experiments
- Change `averageUtilization` to `20` and re-apply. Does it scale higher?
- Lower the CPU **limit** to `200m` in the Deployment. Pods get throttled, so requests get slower.
- Set `minReplicas: 1`. What happens to availability during `make chaos`?
