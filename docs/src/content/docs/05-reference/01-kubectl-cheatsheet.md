---
title: kubectl Cheat Sheet
description: The commands you'll actually use.
sidebar:
  order: 1
---

```bash
# context & namespace
kubectl config get-contexts
kubectl config use-context kind-learn
kubectl config set-context --current --namespace=demo

# look
kubectl get pods|deploy|rs|svc|hpa|nodes|all [-n ns | -A] [-o wide|yaml|json] [-w]
kubectl get pods -l app=demo --show-labels
kubectl describe <kind> <name>
kubectl explain deployment.spec.template.spec.containers
kubectl api-resources                      # every kind the cluster knows

# apply / delete (declarative)
kubectl apply -f file.yaml | -f dir/
kubectl diff -f dir/                       # what WOULD change
kubectl delete -f file.yaml

# generate YAML instead of writing it from scratch
kubectl create deployment web --image=nginx --replicas=2 --dry-run=client -o yaml
kubectl expose deployment web --port=80 --dry-run=client -o yaml

# scale & roll
kubectl scale deploy/demo --replicas=5
kubectl autoscale deploy/demo --min=2 --max=10 --cpu-percent=50
kubectl set image deploy/demo app=demo-app:2.0
kubectl rollout status|history|undo|restart deploy/demo

# debug
kubectl logs <pod> [-c container] [-f] [--previous] [--since=10m]
kubectl logs -l app=demo --prefix -f
kubectl exec -it <pod> -- sh
kubectl port-forward svc/demo 8081:80
kubectl top pods|nodes
kubectl get events --sort-by=.lastTimestamp
kubectl debug -it <pod> --image=busybox --target=app   # ephemeral debug container

# handy
kubectl get pods -o custom-columns=NAME:.metadata.name,NODE:.spec.nodeName,IP:.status.podIP
kubectl get pod <pod> -o jsonpath='{.status.podIP}'
```

:::tip[Quality of life]
`alias k=kubectl`, enable shell completion (`source <(kubectl completion bash)`), and try **k9s**, a terminal UI for clusters that pairs well with this lab.
:::
