---
title: Namespaces, Labels & RBAC
description: Organizing and securing a shared cluster.
sidebar:
  order: 10
---

## Namespaces
Folders for resources. Names only have to be unique within a namespace. Use them to separate teams, apps, or environments.

```bash
kubectl get ns
kubectl get pods -n demo
kubectl get pods -A                                 # all namespaces
kubectl config set-context --current --namespace=demo   # stop typing -n demo
kubectl delete ns demo                              # deletes EVERYTHING inside
```

Pair with **ResourceQuota** (a namespace may use at most 10 CPUs) and **NetworkPolicy** (only pods labelled `app=api` may talk to the DB).

## Labels & selectors
Labels are key/value tags, and selectors query them. This loose coupling is how Deployments find their pods, Services find their endpoints, and you find things:
```bash
kubectl get pods -l app=demo
kubectl get pods -l 'env in (prod,staging)'
```

## RBAC: who can do what
```
ServiceAccount / User ──(RoleBinding)──► Role: verbs [get, list, watch] on resources [pods]
```
- **Role** / **RoleBinding**: within one namespace
- **ClusterRole** / **ClusterRoleBinding**: cluster-wide
- Every pod runs as a **ServiceAccount**. Give it the minimum permissions it needs (least privilege).

```bash
kubectl auth can-i delete pods -n demo
kubectl auth can-i --list --as=system:serviceaccount:demo:default -n demo
```
