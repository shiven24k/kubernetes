# Every target prints the real command it runs — read them, that's the lesson.
CLUSTER ?= learn
NS      ?= demo
VERSION ?= 1.0
IMAGE   := demo-app:$(VERSION)
METRICS_VERSION ?= v0.9.1
METRICS_IMAGE   := registry.k8s.io/metrics-server/metrics-server:$(METRICS_VERSION)
export PATH := $(HOME)/.local/bin:$(PATH)

.PHONY: help tools cluster metrics build load deploy up open status watch logs scale \
        load-on load-off rollout color undo history chaos dev down clean

help:          ## Show all commands
	@grep -E '^[a-z-]+:.*##' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  make %-10s %s\n", $$1, $$2}'

tools:         ## Install kind, kubectl, tilt into ~/.local/bin
	./scripts/install-tools.sh

cluster:       ## Create a 3-node local cluster (1 control plane + 2 workers)
	kind get clusters | grep -qx $(CLUSTER) || kind create cluster --config kind/cluster.yaml
	kubectl wait --for=condition=Ready nodes --all --timeout=180s
	kubectl get nodes -o wide

metrics:       ## Install metrics-server (needed for `kubectl top` and autoscaling)
	# Pull on the host + side-load into kind: faster and avoids flaky in-node pulls.
	docker pull $(METRICS_IMAGE)
	./scripts/kind-load.sh $(METRICS_IMAGE) $(CLUSTER)
	kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/download/$(METRICS_VERSION)/components.yaml
	kubectl -n kube-system patch deployment metrics-server -p '{"spec":{"template":{"spec":{"containers":[{"name":"metrics-server","imagePullPolicy":"IfNotPresent"}]}}}}'
	kubectl -n kube-system patch deployment metrics-server --type=json \
	  -p '[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]'
	kubectl -n kube-system rollout status deployment/metrics-server --timeout=300s

build:         ## Build the Docker image (VERSION=1.0)
	docker build --target prod --build-arg APP_VERSION=$(VERSION) -t $(IMAGE) app

load:          ## Copy the image into the kind nodes (instead of pushing to a registry)
	docker pull -q busybox:1.36 && ./scripts/kind-load.sh busybox:1.36 $(CLUSTER)
	./scripts/kind-load.sh $(IMAGE) $(CLUSTER)

deploy:        ## Apply all manifests in k8s/ (except the load generator)
	kubectl apply -f k8s/00-namespace.yaml
	kubectl apply -f k8s/10-configmap.yaml -f k8s/20-deployment.yaml -f k8s/30-service.yaml -f k8s/40-hpa.yaml
	kubectl -n $(NS) rollout status deployment/demo

up: cluster metrics build load deploy  ## Everything: cluster + metrics + build + load + deploy
	@echo; echo "Open http://localhost:8080"

open:          ## Open the live visualizer
	xdg-open http://localhost:8080 2>/dev/null || echo "Open http://localhost:8080"

status:        ## One-shot overview of everything in the namespace
	kubectl -n $(NS) get deploy,rs,pods,svc,hpa -o wide

watch:         ## Live-watch pods (Ctrl+C to stop)
	kubectl -n $(NS) get pods -o wide --watch

logs:          ## Stream logs from ALL demo pods
	kubectl -n $(NS) logs -l app=demo -f --prefix --max-log-requests 20

scale:         ## Manually scale: make scale N=6  (HPA may override it!)
	kubectl -n $(NS) scale deployment/demo --replicas=$(N)

load-on:       ## Start the in-cluster load generator (triggers autoscaling)
	kubectl apply -f k8s/load-generator.yaml
	@echo "Now run: kubectl -n $(NS) get hpa --watch"

load-off:      ## Stop the load generator
	kubectl -n $(NS) delete -f k8s/load-generator.yaml --ignore-not-found

rollout:       ## Rolling update to a new image: make rollout VERSION=2.0
	$(MAKE) build load VERSION=$(VERSION)
	kubectl -n $(NS) set image deployment/demo app=$(IMAGE)
	kubectl -n $(NS) annotate deployment/demo kubernetes.io/change-cause="image $(IMAGE)" --overwrite
	kubectl -n $(NS) rollout status deployment/demo

color:         ## Rolling update via config: make color C=#ff6b6b
	kubectl -n $(NS) set env deployment/demo APP_COLOR='$(C)'
	kubectl -n $(NS) annotate deployment/demo kubernetes.io/change-cause="color $(C)" --overwrite
	kubectl -n $(NS) rollout status deployment/demo

undo:          ## Roll back to the previous version
	kubectl -n $(NS) rollout undo deployment/demo
	kubectl -n $(NS) rollout status deployment/demo

history:       ## Show rollout history
	kubectl -n $(NS) rollout history deployment/demo

chaos:         ## Delete a random demo pod and watch it be replaced
	@P=$$(kubectl -n $(NS) get pods -l app=demo -o name | shuf -n1); echo "deleting $$P"; kubectl -n $(NS) delete $$P --wait=false

dev:           ## Live development with Tilt (UI on http://localhost:10350)
	kubectl delete -f k8s/40-hpa.yaml --ignore-not-found
	tilt up

down:          ## Delete the lab's resources (keeps the cluster)
	-tilt down 2>/dev/null
	kubectl delete namespace $(NS) --ignore-not-found

clean:         ## Delete the whole cluster
	kind delete cluster --name $(CLUSTER)
