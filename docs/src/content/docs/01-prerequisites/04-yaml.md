---
title: YAML in 10 Minutes
description: The format every Kubernetes object is written in.
sidebar:
  order: 4
---

YAML is JSON with less punctuation. **Indentation is meaning**: use spaces, never tabs.

```yaml
# a map (key: value)
name: demo
replicas: 3
enabled: true
color: "#4f8cff"        # quote strings with special chars like # or :

# a nested map
metadata:
  name: demo
  labels:
    app: demo

# a list (each item starts with "- ")
ports:
  - containerPort: 3000
  - containerPort: 9090

# a list of maps
containers:
  - name: app
    image: demo-app:1.0

# inline (flow) style, same meaning
labels: { app: demo }
args: ["--port", "3000"]

# multi-line string
script: |
  echo line one
  echo line two
---
# "---" separates multiple documents in one file
```

## Every Kubernetes object has the same shape

```yaml
apiVersion: apps/v1        # which API group/version defines this kind
kind: Deployment           # what type of object
metadata:                  # name, namespace, labels
  name: demo
  namespace: demo
spec:                      # WHAT YOU WANT (desired state)
  replicas: 3
status:                    # WHAT IS (filled in by Kubernetes, never by you)
  readyReplicas: 3
```

That `spec` vs `status` split is the core idea of Kubernetes: you write `spec`, controllers work to make `status` match it.

:::tip
`kubectl explain deployment.spec.strategy` documents any field from your terminal.
:::
