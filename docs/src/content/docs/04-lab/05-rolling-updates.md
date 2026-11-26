---
title: "Lab 5: Rolling Updates & Rollback"
description: Ship new versions with zero downtime, then undo them.
sidebar:
  order: 5
---

Keep the visualizer open. Each card shows a **version tag** and a **color**, so you can watch old and new pods swap.

## Update config → rolling update
```bash
make color C='#ff6b6b'
```
This changes an env var in the pod template, so the Deployment creates a new ReplicaSet. Watch the visualizer: red cards appear one by one, blue ones disappear, and the **errors** counter stays at 0.

```bash
kubectl get rs -n demo          # old ReplicaSet scaled to 0, new one at 3
```

## Ship a new image version
```bash
make rollout VERSION=2.0        # builds demo-app:2.0, loads it, runs `kubectl set image`
```
Cards switch from `v1.0` to `v2.0`.

## Roll back
```bash
make history
make undo
```
Back to the previous revision within seconds, because the old ReplicaSet was still there.

## Deploy a broken version (safely)
```bash
kubectl set image deployment/demo app=demo-app:does-not-exist -n demo
kubectl get pods -n demo        # one new pod: ErrImagePull / ImagePullBackOff
```
The visualizer keeps working. With `maxUnavailable: 0`, Kubernetes won't remove a working pod until its replacement is **ready**, and the broken one never becomes ready. The rollout stalls instead of taking you down.
```bash
kubectl rollout status deployment/demo -n demo --timeout=10s   # "exceeded its progress deadline" eventually
make undo
```

## Clean up the drift
`make color` changed the live Deployment directly (imperatively). Reset to what's in git:
```bash
kubectl set env deployment/demo APP_COLOR- -n demo   # remove the override
kubectl apply -f k8s/20-deployment.yaml              # back to demo-app:1.0
```
Read [Zero-downtime deploys → drift](/03-scaling/04-zero-downtime/#imperative-vs-declarative-drift) for why the first line is needed.

## Change the ConfigMap instead
Edit `APP_MESSAGE` in `k8s/10-configmap.yaml`, then:
```bash
kubectl apply -f k8s/10-configmap.yaml
curl -s localhost:8080/api/whoami        # still the OLD message! env vars are read at startup
kubectl rollout restart deployment/demo -n demo
```
