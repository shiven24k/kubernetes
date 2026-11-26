---
title: Deployments & ReplicaSets
description: Keep N copies running, update them safely, roll back instantly.
sidebar:
  order: 4
---

A **Deployment** is what you use to run a stateless app. You say *what image* and *how many*; it does the rest.

```
Deployment  (desired: image v2, 3 replicas, update strategy)
   └── ReplicaSet v2  (keeps exactly 3 pods of the v2 template)
         ├── pod
         ├── pod
         └── pod
   └── ReplicaSet v1  (scaled to 0, kept for rollback)
```

## Our Deployment, annotated

```yaml title="lab/k8s/20-deployment.yaml (trimmed)"
apiVersion: apps/v1
kind: Deployment
metadata: { name: demo, namespace: demo }
spec:
  replicas: 3                          # how many pods
  selector:
    matchLabels: { app: demo }         # which pods belong to me
  strategy:
    type: RollingUpdate
    rollingUpdate: { maxSurge: 1, maxUnavailable: 0 }
  template:                            # the pod blueprint
    metadata:
      labels: { app: demo }            # must match the selector
    spec:
      containers:
        - name: app
          image: demo-app:1.0
          envFrom: [{ configMapRef: { name: demo-config } }]
          env:
            - name: POD_NAME           # Downward API: tell the pod its own name
              valueFrom: { fieldRef: { fieldPath: metadata.name } }
```

## Rolling updates
Change anything in `template` (image, env, …) and the Deployment creates a **new ReplicaSet**, then shifts pods over gradually:

```
maxSurge: 1, maxUnavailable: 0, replicas: 3

v1 v1 v1           start
v1 v1 v1 v2        +1 new (surge)        ← waits until v2 is READY
v1 v1 v2           -1 old
v1 v1 v2 v2        +1 new
v1 v2 v2           -1 old
v1 v2 v2 v2
v2 v2 v2           done, with full capacity the whole time
```

The **readiness probe** is what makes this safe. A new pod gets no traffic, and the rollout doesn't continue, until it reports ready. Deploy a broken version and the rollout simply stalls while the old pods keep serving.

## Rollback
```bash
kubectl rollout history deployment/demo -n demo
kubectl rollout undo deployment/demo -n demo            # previous version
kubectl rollout undo deployment/demo --to-revision=2 -n demo
```
Rollback is fast because the old ReplicaSet still exists. It just gets scaled back up.

## Other workload types
| Kind | Use for |
|---|---|
| **Deployment** | Stateless apps (web servers, APIs). 90% of cases |
| **StatefulSet** | Databases and other apps that need stable names and their own disk |
| **DaemonSet** | One pod on *every* node (log collectors, monitoring agents) |
| **Job / CronJob** | Run to completion, once or on a schedule |

:::tip[Try it]
[Lab 5: Rolling updates & rollback](/04-lab/05-rolling-updates/)
:::
