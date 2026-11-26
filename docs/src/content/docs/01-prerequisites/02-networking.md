---
title: Networking Basics
description: IPs, ports, DNS, HTTP and load balancing. Most Kubernetes trouble lives here.
sidebar:
  order: 2
---

## IP addresses and ports
- An **IP** identifies a machine (or, in Kubernetes, a *pod*). `127.0.0.1` / `localhost` is "this machine".
- A **port** identifies a program on that machine. Our app listens on port `3000`.
- `0.0.0.0:3000` means "listen on every network interface". Inside a container you *must* listen on `0.0.0.0`, not `127.0.0.1`, or nothing outside the container can reach you.

## DNS
Turns names into IPs. Kubernetes runs its own DNS server (CoreDNS), so the Service named `demo` in namespace `demo` is reachable from any pod as:

```
demo                          # from the same namespace
demo.demo                     # <service>.<namespace>
demo.demo.svc.cluster.local   # fully qualified
```

Our load generator uses `http://demo/api/burn` because it runs in the same namespace.

## HTTP in 30 seconds
Request = method (`GET`/`POST`) + path (`/api/whoami`) + headers + body. Response = status code (`200` ok, `404` not found, `503` unavailable, `5xx` server broke) + headers + body.

Health checks in Kubernetes are mostly "does `GET /healthz` return 2xx?".

## Load balancing
Put **one address** in front of **many servers**, and spread requests across them. This is the heart of horizontal scaling.

```
           ┌──► server A
client ──► LB ──► server B
           └──► server C
```

:::caution[Connections vs requests]
A Kubernetes Service balances **TCP connections**, not individual HTTP requests. A browser reuses one connection (keep-alive), so all its requests can land on the same pod. Our demo app sends `Connection: close` so every request opens a new connection, which makes the balancing visible. Real systems use an L7 proxy (Ingress / service mesh) for per-request balancing.
:::

## NAT and port forwarding
Mapping "port X here" to "port Y over there". You'll use it constantly:
- `docker run -p 8080:3000`: host 8080 → container 3000
- `kubectl port-forward svc/demo 8080:80`: laptop 8080 → Service 80
- kind's `extraPortMappings`: laptop 8080 → cluster node 30080

## Self-check
- [ ] Why must a containerized server listen on `0.0.0.0`?
- [ ] What does `demo.demo.svc.cluster.local` resolve to?
- [ ] What's the difference between a 503 and a 500?
