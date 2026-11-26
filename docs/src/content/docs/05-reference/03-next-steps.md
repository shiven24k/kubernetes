---
title: Next Steps
description: Where to go after the lab.
sidebar:
  order: 3
---

## Packaging & environments
- **Kustomize**: base YAML plus small patches for dev/staging/prod. Try `kubectl apply -k`.
- **Helm**: install third-party software (`helm install ingress-nginx …`) and package your own apps as charts.

## Production concerns
- **Ingress + cert-manager**: real domains with HTTPS.
- **Observability**: Prometheus + Grafana (metrics), Loki (logs), OpenTelemetry (traces). Start with `kube-prometheus-stack` via Helm.
- **GitOps**: Argo CD or Flux. Push YAML to git and the cluster updates itself.
- **CI/CD**: build image → push to registry → update the tag in git → GitOps deploys.
- **Security**: RBAC, NetworkPolicies, Pod Security Standards (`restricted`), image scanning (Trivy), non-root containers.
- **Advanced scaling**: KEDA (queue-based, scale to zero), VPA recommendations, Karpenter.

## Practice ideas using this lab
1. Add a **Redis** Deployment + Service and make the app count total hits across all pods (shared state!).
2. Install **ingress-nginx** in kind and route `/` to the demo app through an Ingress.
3. Add a **PodDisruptionBudget**, then `kubectl drain learn-worker --ignore-daemonsets` and watch it hold.
4. Write a **Kustomize** overlay that sets `replicas: 1` for dev and `5` for prod.
5. Deploy to a real cloud cluster (DigitalOcean / GKE Autopilot). The same YAML works.

## Certifications (optional)
- **KCNA**: concepts, multiple choice. A good first goal.
- **CKAD**: hands-on, for developers. Most of this lab is CKAD material.
- **CKA**: hands-on, for cluster administrators.

## Resources
- [kubernetes.io/docs](https://kubernetes.io/docs/): official docs and tutorials
- [kind.sigs.k8s.io](https://kind.sigs.k8s.io/) · [docs.tilt.dev](https://docs.tilt.dev/)
- *Kubernetes Up & Running* (book)
- [killercoda.com](https://killercoda.com/): free in-browser Kubernetes playgrounds
