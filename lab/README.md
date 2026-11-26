# Kubernetes lab

Hands-on companion to the docs in `../docs`. Everything runs locally on a 3-node
[kind](https://kind.sigs.k8s.io/) cluster.

```bash
make tools    # install kind, kubectl, tilt into ~/.local/bin
make up       # cluster + metrics-server + build + load + deploy
make open     # http://localhost:8080 — the live visualizer
make help     # every other command
```

| Path | What |
|---|---|
| `app/server.js` | Zero-dependency Node server; every response says which pod answered |
| `app/public/index.html` | Live visualizer: pods, traffic share, versions, crash button |
| `app/Dockerfile` | Multi-stage: `dev` (Tilt, `node --watch`) and `prod` |
| `k8s/` | Namespace, ConfigMap, Deployment, Service, HPA, load generator |
| `kind/cluster.yaml` | 1 control plane + 2 workers, localhost:8080 → NodePort 30080 |
| `Tiltfile` | Live development: `make dev` |
| `scripts/` | Tool installer, platform-safe `kind load` helper |
