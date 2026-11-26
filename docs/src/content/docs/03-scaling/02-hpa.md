---
title: Horizontal Pod Autoscaler
description: Add and remove pods automatically based on load.
sidebar:
  order: 2
---

The **HPA** is a controller that periodically (every 15s) reads metrics and adjusts a Deployment's `replicas`.

```yaml title="lab/k8s/40-hpa.yaml"
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: { name: demo, namespace: demo }
spec:
  scaleTargetRef: { apiVersion: apps/v1, kind: Deployment, name: demo }
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target: { type: Utilization, averageUtilization: 50 }
  behavior:
    scaleDown: { stabilizationWindowSeconds: 30 }
```

## The formula
```
desiredReplicas = ceil( currentReplicas × currentMetric / targetMetric )
```
Example: 3 pods averaging **150%** of their CPU request with a target of **50%** → `ceil(3 × 150/50)` = **9 pods**.

"Utilization" is relative to **requests**: our pods request `100m`, so 50% = 50 millicores average.

## What it needs
1. **metrics-server** installed (it collects CPU/memory from each kubelet). The lab installs it with `make metrics`.
2. **CPU requests** on the containers. Without them you get `<unknown>` targets.

## Behaviour and tuning
- **Scale up is fast**, **scale down is slow** (5-minute stabilization window by default) to avoid flapping. We shortened it to 30s so you can watch it in the lab.
- The HPA **owns** `replicas`. If you `kubectl scale` while an HPA is active, it will put the number back. Don't also hard-code `replicas` that fights it in GitOps.
- `minReplicas ≥ 2` keeps you available while one pod restarts.

## Beyond CPU
- **Memory**: works the same way, but many runtimes never give memory back, so it's often a poor signal.
- **Custom metrics** (requests/sec, latency) via Prometheus Adapter.
- **KEDA**: event-driven autoscaling on queue length (Kafka, RabbitMQ, SQS), cron schedules, and more, including **scale to zero**.
- **VPA** (Vertical Pod Autoscaler): recommends or sets better requests/limits. Don't let it and the HPA both act on CPU for the same Deployment.

## Watching it
```bash
kubectl get hpa -n demo --watch
kubectl describe hpa demo -n demo     # events show each scaling decision and why
kubectl top pods -n demo
```

:::tip[Try it]
[Lab 6: Autoscaling under load](/04-lab/06-autoscaling/). You'll watch 3 pods become 10.
:::
