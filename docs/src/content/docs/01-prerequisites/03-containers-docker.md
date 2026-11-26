---
title: Containers & Docker
description: Images, containers, layers, Dockerfiles and registries. The thing Kubernetes runs.
sidebar:
  order: 3
---

Kubernetes doesn't run your code directly; it runs **container images**. If Docker makes sense to you, about half of Kubernetes will too.

## The problem containers solve
"Works on my machine." Your app needs a specific Node version, OS libraries, files, and config. A container image packs **all of it** into one artifact that runs the same everywhere.

## Image vs container

| | Image | Container |
|---|---|---|
| What | A read-only template (filesystem + startup command) | A running instance of an image |
| Analogy | A class / a recipe | An object / a meal |
| Command | `docker build`, `docker images` | `docker run`, `docker ps` |

One image, many containers. **That's how scaling starts**: run the same image 10 times.

## How containers work (just enough)
A container is a normal Linux process with:
- **namespaces**: its own view of processes, network, and filesystem (isolation)
- **cgroups**: limits on CPU and memory (this is what Kubernetes `resources.limits` set)
- **a layered filesystem** built from the image

It's not a VM. There's no second kernel, which is why containers start in milliseconds.

## Reading our Dockerfile

```dockerfile title="lab/app/Dockerfile"
FROM node:22-alpine AS base      # start from an image that already has Node
WORKDIR /app                     # cd /app (creates it)
COPY package.json ./             # each instruction = one cached LAYER
COPY server.js ./
COPY public ./public

FROM base AS dev                 # stage used for live development
CMD ["node", "--watch", "server.js"]

FROM base AS prod                # default production stage
ARG APP_VERSION=1.0              # build-time variable
ENV APP_VERSION=${APP_VERSION}   # runtime env var baked in
USER node                        # don't run as root
EXPOSE 3000                      # documentation: the app listens on 3000
CMD ["node", "server.js"]        # what runs when the container starts
```

**Layers & caching:** Docker caches each step. Put things that change rarely (base image, dependency install) *before* things that change often (your source code) so rebuilds are fast.

**Multi-stage builds:** one Dockerfile, several targets. We use `dev` for Tilt and `prod` for real deployments.

## Registries
Where images live so servers can download them: Docker Hub, GitHub Container Registry (ghcr.io), AWS ECR, Google Artifact Registry. An image name is `registry/repo:tag`, e.g. `ghcr.io/me/demo-app:1.0`.

In the lab we skip the registry: `kind load` copies the image straight into the cluster's nodes.

:::caution[Tags]
Avoid `:latest` in Kubernetes. Use explicit versions (`1.0`, `2.0`, or a git SHA) so you always know what's running and can roll back.
:::

## Essential commands

```bash
docker build -t demo-app:1.0 lab/app        # build
docker images                               # list images
docker run --rm -p 8080:3000 demo-app:1.0   # run (host 8080 -> container 3000)
docker ps                                   # running containers
docker logs <id>; docker exec -it <id> sh   # logs, shell inside
docker stop <id>                            # SIGTERM, then SIGKILL after 10s
```

## Docker Compose vs Kubernetes
Compose runs several containers on **one machine**. Kubernetes runs them across **many machines** and keeps them healthy: it restarts, reschedules, scales, and rolls out updates for you. If you've used Compose, Kubernetes is the multi-machine, self-healing version of the same idea.

:::tip[Try it]
[Lab 1: Build & run the image with Docker](/04-lab/01-docker/)
:::
