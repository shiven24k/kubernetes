---
title: Ingress & Gateway API
description: One entry point, HTTP routing to many services.
sidebar:
  order: 9
---

A `LoadBalancer` Service per app means one cloud load balancer (and one bill) per app. An **Ingress** routes HTTP traffic from **one** entry point to many Services, by host and path.

```
                         ┌── host: api.example.com      ──► Service api
internet ──► LB ──► Ingress controller ── path: /        ──► Service web
                         └── path: /admin                ──► Service admin
```

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata: { name: web, namespace: demo }
spec:
  ingressClassName: nginx
  tls: [{ hosts: [example.com], secretName: example-tls }]
  rules:
    - host: example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend: { service: { name: demo, port: { number: 80 } } }
```

## Key points
- An Ingress object is just rules. You need an **Ingress controller** (ingress-nginx, Traefik, HAProxy, cloud-provided) actually running to enforce them.
- It handles **TLS termination**. Pair it with **cert-manager** for free automatic Let's Encrypt certificates.
- It balances **per HTTP request** (L7), unlike a Service (per connection, L4).

## Gateway API, the successor
The newer **Gateway API** (`Gateway` + `HTTPRoute` objects) is more expressive: traffic splitting for canaries, header matching, and a clean split between what the platform team owns and what app teams own. New projects should prefer it. The ideas are the same.
