# Learn Kubernetes by Watching It Work

A hands-on, self-paced course that takes you from **Docker basics** to **autoscaling a real app across multiple servers**, all on your own laptop.

Read a short page, run one command, and **watch it happen** in a live visualizer: traffic spreading across pods, pods dying and coming back, versions rolling out with zero downtime, and the cluster scaling from 3 to 10 copies under load.

```
 ┌─────────────── docs/ ───────────────┐      ┌──────────────── lab/ ────────────────┐
 │  33 pages of guides (Astro Starlight)│ ───► │  real app + real 3-node cluster      │
 │  prerequisites → core → scaling      │      │  live visualizer at localhost:8080   │
 └──────────────────────────────────────┘      └──────────────────────────────────────┘
```

---

## Table of contents

- [Features](#features)
- [Who is this for?](#who-is-this-for)
- [Requirements](#requirements)
- [Quick start](#quick-start)
- [What's inside](#whats-inside)
- [The learning path](#the-learning-path)
- [The labs](#the-labs)
- [Command reference](#command-reference)
- [Live development with Tilt](#live-development-with-tilt)
- [How the demo app works](#how-the-demo-app-works)
- [Troubleshooting](#troubleshooting)
- [Cleaning up](#cleaning-up)
- [Contributing](#contributing)

---

## Features

**📚 A complete written guide**
- **Prerequisites first:** Linux & shell, networking (ports, DNS, load balancing), containers & Docker, YAML
- **Kubernetes core:** architecture, Pods, Deployments, Services, ConfigMaps & Secrets, probes & resources, storage & StatefulSets, Ingress, namespaces & RBAC
- **Scaling, in depth:** vertical vs horizontal, the Horizontal Pod Autoscaler (with the math), adding servers with Cluster Autoscaler / Karpenter, zero-downtime deploy strategies
- **Reference:** `kubectl` cheat sheet, glossary, next steps and certification paths
- Full-text search, dark mode and mobile layout, from [Astro Starlight](https://starlight.astro.build)

**🧪 A real lab that runs on your machine**
- **A 3-node Kubernetes cluster** (1 control plane + 2 workers) built with [kind](https://kind.sigs.k8s.io/). No cloud account, no cost
- **Live visualizer:** a web page showing which pod answered each request, its node and version, and its share of traffic, with an event log
- **Chaos buttons:** crash a pod from the browser and watch Kubernetes heal it
- **Real autoscaling:** an in-cluster load generator makes the HPA scale from 3 to 10 pods
- **Rolling updates & rollback** you can watch card by card in the visualizer
- **Live development with [Tilt](https://tilt.dev):** save a file and it's running inside every pod within seconds, with no rebuild
- **One `Makefile`** that wraps every step. Each target prints the real `kubectl`/`docker` command it runs, so you learn the actual tools

**🛠 Built to be read**
- A zero-dependency demo app (~120 lines of Node.js), heavily commented
- Every Kubernetes manifest annotated line by line
- Every lab was tested end to end on a real cluster

---

## Who is this for?

- Developers who know how to write an app but have never deployed one to Kubernetes
- People who have used Docker and want to know *"how do we scale this across servers?"*
- Anyone preparing for **KCNA** or **CKAD** who wants hands-on practice

No prior Kubernetes knowledge is needed. Basic terminal comfort helps, and the prerequisites section covers the rest.

---

## Requirements

| Tool | Needed for | Install |
|---|---|---|
| **Docker** | Building images and running the kind cluster | [docs.docker.com/get-docker](https://docs.docker.com/get-docker/) |
| **Node.js 20+** | The docs site | [nodejs.org](https://nodejs.org/) |
| **make**, **curl** | Lab commands | Usually preinstalled on Linux/macOS |
| kind, kubectl, tilt | The cluster and live dev | Installed for you by `make tools` |

**Hardware:** about 4 GB of free RAM and 2+ CPU cores. Tested on Linux (Fedora). macOS works the same way with Docker Desktop / OrbStack. On Windows, use WSL2.

---

## Quick start

```bash
# 1. Get the code
git clone https://github.com/shiven24k/kubernetes.git
cd kubernetes

# 2. Start the docs → http://localhost:4321
cd docs
npm install
npm run dev

# 3. In a second terminal, start the lab → http://localhost:8080
cd lab
make tools     # installs kind, kubectl, tilt into ~/.local/bin (no sudo)
make up        # creates the cluster, builds & deploys the app (~2-3 min first time)
make open      # opens the live visualizer
```

> If your shell can't find `kubectl`/`kind`/`tilt` after `make tools`, add this to `~/.bashrc` (or `~/.zshrc`) and open a new terminal:
> ```bash
> export PATH=$HOME/.local/bin:$PATH
> ```

Then open the docs at **Start Here → Roadmap** and follow along.

---

## What's inside

```
.
├── docs/                         # The guide (Astro Starlight)
│   └── src/content/docs/
│       ├── 00-start/             # Roadmap
│       ├── 01-prerequisites/     # Linux, networking, Docker, YAML
│       ├── 02-kubernetes/        # Core concepts (10 pages)
│       ├── 03-scaling/           # Scaling pods, nodes, zero-downtime
│       ├── 04-lab/               # Step-by-step labs (setup + 8 labs)
│       └── 05-reference/         # Cheat sheet, glossary, next steps
│
└── lab/                          # The hands-on part
    ├── app/
    │   ├── server.js             # Demo app (zero dependencies)
    │   ├── public/index.html     # Live visualizer
    │   └── Dockerfile            # Multi-stage: dev (Tilt) + prod
    ├── k8s/
    │   ├── 00-namespace.yaml
    │   ├── 10-configmap.yaml
    │   ├── 20-deployment.yaml    # replicas, rolling update, probes, resources
    │   ├── 30-service.yaml       # NodePort → localhost:8080
    │   ├── 40-hpa.yaml           # autoscaling 2–10 pods at 50% CPU
    │   └── load-generator.yaml   # in-cluster traffic generator
    ├── kind/cluster.yaml         # 1 control plane + 2 workers
    ├── scripts/
    │   ├── install-tools.sh      # kind + kubectl + tilt, no sudo
    │   └── kind-load.sh          # platform-safe image loading into kind
    ├── Tiltfile                  # live development config
    └── Makefile                  # every command, named
```

---

## The learning path

| # | Section | Topics | Time |
|---|---|---|---|
| 1 | **Prerequisites** | Linux & shell · networking · containers & Docker · YAML | 5–8 h |
| 2 | **Kubernetes core** | Why K8s · architecture · Pods · Deployments · Services · config & secrets · probes & resources · storage · Ingress · namespaces & RBAC | 6–8 h |
| 3 | **Scaling** | Vertical vs horizontal · HPA · Cluster Autoscaler & Karpenter · zero-downtime deploys | 2 h |
| 4 | **Hands-on lab** | 8 labs (below) | ~3 h |
| 5 | **Reference** | `kubectl` cheat sheet · glossary · next steps | — |

Theory pages end with a **"Try it"** link to the matching lab.

---

## The labs

| Lab | What you do | What you'll see |
|---|---|---|
| **Setup** | `make up` | 3 Docker containers become a Kubernetes cluster |
| **1. Docker first** | Build and run the image with plain Docker | Why Docker alone isn't enough: a crashed container stays dead |
| **2. First deployment** | Apply manifests one by one | Deployment → ReplicaSet → Pods, then the Service connects them |
| **3. Load balancing & scaling** | `make scale N=8`, then overfill the nodes | New pods join only once ready, and `Insufficient cpu` when nodes are full |
| **4. Self-healing** | `make chaos`, the crash button, stopping a whole node | Pods replaced, containers restarted, workloads moved to another node |
| **5. Rolling updates** | `make color`, `make rollout VERSION=2.0`, `make undo`, a broken image | Cards change version one by one with zero errors, and a bad deploy stalls safely |
| **6. Autoscaling** | `make load-on` / `make load-off` | The HPA goes from 3 to 10 pods, then scales back down |
| **7. Live dev with Tilt** | `make dev`, then edit code | Your change is running in all pods within seconds |
| **8. Troubleshooting** | A debugging routine | How to read `describe`, `logs`, events and endpoints |

---

## Command reference

Run all commands from `lab/`. `make help` lists them.

| Command | Description |
|---|---|
| `make tools` | Install kind, kubectl, tilt into `~/.local/bin` |
| `make up` | Everything: cluster + metrics-server + build + load + deploy |
| `make open` | Open the live visualizer (http://localhost:8080) |
| `make status` | Overview of deployment, replicasets, pods, service, HPA |
| `make watch` | Live-watch pods |
| `make logs` | Stream logs from all app pods |
| `make scale N=6` | Scale manually (remove the HPA first, or it will override you) |
| `make chaos` | Delete a random pod |
| `make load-on` / `make load-off` | Start/stop the load generator |
| `make color C=#ff6b6b` | Rolling update by changing config |
| `make rollout VERSION=2.0` | Build and roll out a new image version |
| `make history` / `make undo` | Rollout history / roll back |
| `make dev` | Live development with Tilt (UI at http://localhost:10350) |
| `make down` | Delete the app (keeps the cluster) |
| `make clean` | Delete the whole cluster |

**Ports used:** `4321` docs · `8080` app/visualizer · `10350` Tilt UI

---

## Live development with Tilt

```bash
cd lab
make dev
```

Press **space** to open the Tilt UI. Then edit any file in `lab/app/`:

- **`public/index.html`**: refresh the browser and your change is live
- **`server.js`**: synced into every pod, and `node --watch` restarts the process automatically
- **`k8s/*.yaml`**: Tilt re-applies the manifests

Behind the scenes, Tilt builds the Dockerfile's `dev` stage and uses `live_update` to copy changed files into the running containers instead of rebuilding the image. Press `Ctrl+C` to stop, and run `make deploy` to go back to the production image.

---

## How the demo app works

`lab/app/server.js` is a dependency-free Node.js server designed to make Kubernetes behavior visible:

| Endpoint | Purpose |
|---|---|
| `GET /` | The live visualizer page |
| `GET /api/whoami` | Pod name, node, version, color and message (via the Downward API + ConfigMap) |
| `GET /api/burn?ms=200` | Burns CPU, used to trigger the autoscaler |
| `POST /api/crash` | Exits the process, used to demonstrate self-healing |
| `GET /healthz` | Liveness probe |
| `GET /readyz` | Readiness probe: fails during a 2s warm-up and during shutdown |

It also:
- sends `Connection: close` so every request can hit a different pod, which makes Service load balancing visible
- handles `SIGTERM` gracefully (fails readiness, drains, exits), like a production app should
- runs as a non-root user in the `prod` image

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `kubectl: command not found` | `export PATH=$HOME/.local/bin:$PATH` |
| Nothing on `localhost:8080` | Check `docker ps` shows `0.0.0.0:8080->30080`. If 8080 is taken, change `hostPort` in `kind/cluster.yaml` and run `make clean up` |
| Pods stuck in `ContainerCreating` or pulls hang | `docker pull <image> && ./scripts/kind-load.sh <image>` |
| `kind load` fails with `content digest … not found` | Use `./scripts/kind-load.sh` (the Makefile already does) |
| HPA shows `<unknown>` | Wait about a minute after `make up`, then check `kubectl top pods -n demo` |
| `make scale` "doesn't work" | The HPA is resetting it. Run `kubectl delete hpa demo -n demo` first |

The docs have a full [Troubleshooting page](docs/src/content/docs/04-lab/08-troubleshooting.md).

---

## Cleaning up

```bash
cd lab
make down     # remove the app, keep the cluster
make clean    # delete the cluster entirely (frees ~1–2 GB RAM)
```

To remove the tools as well: `rm ~/.local/bin/{kind,kubectl,tilt}`.

---

## Contributing

Contributions are welcome, especially:

- fixes for unclear explanations or typos
- new labs (Ingress, Redis for shared state, PodDisruptionBudgets, Kustomize overlays…)
- testing on macOS / Windows (WSL2) and reporting what differs
- translations

**To work on the docs:** `cd docs && npm run dev`. Pages are plain Markdown in `docs/src/content/docs/`, and sidebar order comes from each page's `sidebar.order` frontmatter.

**Before opening a PR:**
1. `cd docs && npm run build` passes
2. If you changed the lab, run it against a fresh cluster (`make clean up`) and walk through the affected labs
3. Keep the demo app dependency-free

Found a bug or a confusing explanation? Please open an issue. If something confused you, it will confuse others too.

---

## Acknowledgements

Built with [Kubernetes](https://kubernetes.io), [kind](https://kind.sigs.k8s.io/), [Tilt](https://tilt.dev), [metrics-server](https://github.com/kubernetes-sigs/metrics-server) and [Astro Starlight](https://starlight.astro.build).
