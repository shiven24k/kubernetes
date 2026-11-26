---
title: Services & Networking
description: One stable address in front of a changing set of pods.
sidebar:
  order: 5
---

Pods come and go, and their IPs change. A **Service** gives them **one stable name + IP** and load-balances across every *ready* pod that matches its label selector.

```yaml title="lab/k8s/30-service.yaml"
apiVersion: v1
kind: Service
metadata: { name: demo, namespace: demo }
spec:
  type: NodePort
  selector: { app: demo }        # route to READY pods with this label
  ports:
    - port: 80                   # the Service's port
      targetPort: 3000           # the container's port
      nodePort: 30080            # exposed on every node
```

## How it works
```
                    Service "demo" (ClusterIP 10.96.x.x:80)
                                 │   kube-proxy rules on every node
            ┌────────────────────┼────────────────────┐
            ▼                    ▼                    ▼
       pod 10.244.1.5:3000  pod 10.244.2.7:3000  pod 10.244.1.9:3000
```
The Service keeps a live list of pod IPs (**EndpointSlices**). Scale up and new pods join the list once ready. A pod fails readiness or dies, and it's removed. You never update anything by hand.

```bash
kubectl get endpointslices -n demo     # see the live pod list behind the Service
```

## Service types
| Type | Reachable from | Typical use |
|---|---|---|
| **ClusterIP** (default) | Inside the cluster only | Service-to-service (API → database) |
| **NodePort** | `<any-node-ip>:30000-32767` | Local labs, simple setups |
| **LoadBalancer** | A public IP from your cloud provider | Exposing a service in the cloud |
| **ExternalName** | DNS alias to something outside | Pointing to a managed DB |

In production you usually expose many services through **one** LoadBalancer + an **Ingress** (see [Ingress](/02-kubernetes/09-ingress/)).

## Service discovery via DNS
Any pod can reach the Service as `http://demo` (same namespace) or `http://demo.demo.svc.cluster.local`. That's how microservices find each other, with no hard-coded IPs.

## Reaching the cluster from your laptop
```bash
kubectl port-forward svc/demo 8081:80 -n demo   # quick tunnel, great for debugging
```
In the lab we also map laptop `:8080` → node `:30080` in `kind/cluster.yaml`.

:::tip[Try it]
[Lab 3: Load balancing & manual scaling](/04-lab/03-load-balancing-scaling/)
:::
