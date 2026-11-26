---
title: ConfigMaps & Secrets
description: Keep configuration out of your image.
sidebar:
  order: 6
---

**Build once, configure per environment.** The same `demo-app:1.0` image runs in dev, staging and prod. Only config changes.

## ConfigMap: non-sensitive settings
```yaml title="lab/k8s/10-configmap.yaml"
apiVersion: v1
kind: ConfigMap
metadata: { name: demo-config, namespace: demo }
data:
  APP_MESSAGE: "Hello from Kubernetes!"
  APP_COLOR: "#4f8cff"
```

Use it as env vars (all keys at once, or one at a time):
```yaml
envFrom:
  - configMapRef: { name: demo-config }
env:
  - name: COLOR
    valueFrom: { configMapKeyRef: { name: demo-config, key: APP_COLOR } }
```
…or mount it as **files** (good for whole config files like `nginx.conf`):
```yaml
volumes:   [{ name: cfg, configMap: { name: demo-config } }]
volumeMounts: [{ name: cfg, mountPath: /etc/demo }]
```

:::caution[Env vars don't hot-reload]
Editing a ConfigMap does **not** restart pods. Env vars are read at container start. Run `kubectl rollout restart deployment/demo -n demo` to pick up changes. Mounted files *do* update (after up to about a minute), but your app has to re-read them.
:::

## Secret: passwords, tokens, keys
```bash
kubectl create secret generic db -n demo \
  --from-literal=DB_PASSWORD='s3cr3t'
```
```yaml
envFrom: [{ secretRef: { name: db } }]
```

:::danger[Secrets are base64, not encrypted]
`kubectl get secret db -o yaml` shows base64 that anyone can decode. Protect Secrets with RBAC and encryption at rest, and never commit them to git in plain form. Real setups use **Sealed Secrets**, **SOPS**, or **External Secrets Operator** (which pulls from AWS/GCP/Vault).
:::
