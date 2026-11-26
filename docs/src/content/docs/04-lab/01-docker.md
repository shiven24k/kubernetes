---
title: "Lab 1: Docker First"
description: Build the image and run it with plain Docker before Kubernetes gets involved.
sidebar:
  order: 1
---

Before Kubernetes, make sure you understand what it will be running.

## 1. Run the app with no container at all
```bash
cd lab/app
node server.js
# open http://localhost:3000 — you'll see ONE pod card (your hostname). Ctrl+C to stop.
```

## 2. Build an image
```bash
cd lab
docker build --target prod -t demo-app:1.0 app
docker images demo-app
docker history demo-app:1.0        # the layers
```

## 3. Run containers
```bash
docker run -d --name one -p 3001:3000 demo-app:1.0
docker run -d --name two -p 3002:3000 -e APP_COLOR=#ff6b6b demo-app:1.0
curl -s localhost:3001/api/whoami; echo
curl -s localhost:3002/api/whoami; echo
```
Same image, two containers, different config. Open both in a browser.

## 4. Feel the pain Kubernetes solves
```bash
curl -X POST localhost:3001/api/crash     # the app exits...
docker ps -a --filter name=one            # ...and stays dead (Exited (1))
```
Nothing brought it back, nothing load-balances between `one` and `two`, and running it on another machine is up to you. (`docker run --restart=always` helps with the first problem, on one machine only.)

## 5. Clean up
```bash
docker rm -f one two
```

**Takeaway:** Docker packages and runs. Kubernetes keeps things running across machines.
