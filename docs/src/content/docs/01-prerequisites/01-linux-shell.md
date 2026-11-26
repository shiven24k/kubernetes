---
title: Linux & the Shell
description: The minimum Linux you need for containers and Kubernetes.
sidebar:
  order: 1
---

Containers are just **Linux processes** with extra isolation, and every Kubernetes tool is a command-line program, so some shell comfort pays off.

## Commands you'll use constantly

```bash
pwd; ls -la; cd dir          # where am I, what's here, move
cat file; less file          # read files
grep -r "text" .             # search
ps aux | grep node           # running processes
kill <pid>; kill -9 <pid>    # stop a process (SIGTERM vs SIGKILL)
curl -s localhost:8080       # make an HTTP request
env; export FOO=bar          # environment variables
which kubectl; echo $PATH    # where a command lives
```

## Concepts that matter for containers

### Processes and signals
When Kubernetes stops a container it sends **SIGTERM** ("please shut down"), waits a grace period (default 30s), then sends **SIGKILL** (immediate death). A well-behaved app catches SIGTERM and finishes its in-flight requests. Our demo app does this; see `process.on('SIGTERM')` in `lab/app/server.js`.

### Exit codes
`0` means success; anything else means failure. If a container's main process exits, the container is dead and Kubernetes restarts it. You'll see `RESTARTS` go up in `kubectl get pods`.

### Environment variables
The standard way to configure containers: the same image runs in dev and prod with different env vars. Kubernetes injects them from ConfigMaps and Secrets.

### stdout / stderr
Containers should log to **stdout**, not files. `kubectl logs` reads exactly that.

### Files, users, permissions
Containers should run as a **non-root user** where possible. Our Dockerfile uses `USER node`.

## Self-check
- [ ] I can find a process by name and kill it
- [ ] I know the difference between SIGTERM and SIGKILL
- [ ] I can set an env var and read it from a program
- [ ] I can `curl` an HTTP endpoint and read the response
