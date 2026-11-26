---
title: "Lab 7: Live Development with Tilt"
description: Edit code and see it running in Kubernetes pods within seconds.
sidebar:
  order: 7
---

The normal loop is: edit → `docker build` → `kind load` → `kubectl apply` → wait. That's slow. **Tilt** watches your files and **syncs changes straight into the running containers**.

## Start it
```bash
make dev        # removes the HPA (to keep things simple), then runs `tilt up`
```
Press **space** to open the Tilt UI (http://localhost:10350). You'll see the build, the deploy, pod status, and logs from every pod in one place. The app stays at http://localhost:8080.

## How it's wired (`lab/Tiltfile`)
```python
docker_build(
    'demo-app', './app',
    target='dev',                          # Dockerfile stage running `node --watch`
    live_update=[sync('./app', '/app')],   # copy changed files into the pods
)
k8s_yaml([...the same manifests you apply by hand...])
```
- Tilt builds the `dev` stage, loads it into kind, and swaps it into the Deployment's `image:`.
- On save, **live_update** copies changed files into **all 3 pods**, with no rebuild.
- `node --watch` sees `server.js` change and restarts the process. `index.html` is read on every request, so it updates instantly.

## Try it
1. Open `lab/app/public/index.html`, change the `<h1>` text, save, and refresh the browser. Done.
2. In `lab/app/server.js`, add a field to the `/api/whoami` response:
   ```js
   pod: POD, node: NODE, version: VERSION, color: COLOR, message: MESSAGE,
   hello: 'I was live-synced!',
   ```
   Save, then `curl -s localhost:8080/api/whoami`. In the Tilt log you'll see `Container demo-xxx/app updated!` ×3.
3. Edit `k8s/10-configmap.yaml` (e.g. `APP_COLOR`). Tilt re-applies the YAML. Note that pods still need a restart to read env vars, which you can trigger from the Tilt UI.
4. Break `server.js` with a syntax error. Watch the logs in Tilt, fix it, and watch it recover.

## Stop
`Ctrl+C` stops Tilt but leaves things deployed. `tilt down` removes what Tilt created. Go back to the "production" setup with:
```bash
make deploy
```

## Alternatives
**Skaffold** (Google) and **DevSpace** do the same job. Docker Compose's `watch` gives a similar experience without Kubernetes. **Telepresence / mirrord** run your code locally while connecting it to a remote cluster.
