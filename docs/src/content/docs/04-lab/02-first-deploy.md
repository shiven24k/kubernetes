---
title: "Lab 2: First Deployment"
description: Apply the manifests one by one and see each object appear.
sidebar:
  order: 2
---

`make up` did this all at once. Here it is slowly, so you see each piece.

```bash
make down                                  # start from an empty namespace
kubectl apply -f k8s/00-namespace.yaml
kubectl apply -f k8s/10-configmap.yaml
kubectl get configmap demo-config -n demo -o yaml
```

In another terminal, watch pods appear:
```bash
make watch
```

Now create the Deployment:
```bash
kubectl apply -f k8s/20-deployment.yaml
```
In the watch terminal: `Pending → ContainerCreating → Running`, with `READY 0/1` for ~2s (our fake warm-up, so readiness fails), then `1/1`.

```bash
kubectl get deploy,rs,pods -n demo -o wide   # see the Deployment → ReplicaSet → Pods chain
kubectl describe pod -n demo -l app=demo | grep -A12 Events
```

The browser shows nothing yet because there's **no Service**. Add it:
```bash
kubectl apply -f k8s/30-service.yaml
kubectl get endpointslices -n demo           # the pod IPs behind the Service
```
Open http://localhost:8080. Three pod cards, traffic split between them.

## Explore
```bash
make logs                                       # logs from all pods, prefixed with pod name
kubectl exec -it -n demo deploy/demo -- sh      # shell in a pod
  wget -qO- http://demo/api/whoami              # call the Service by DNS name from inside
  exit
kubectl get pod -n demo -l app=demo -o yaml | less   # the full spec + status
```

Finish by adding the autoscaler back: `kubectl apply -f k8s/40-hpa.yaml`.
