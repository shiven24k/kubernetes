---
title: Storage & StatefulSets
description: Pods are disposable. Data must not be.
sidebar:
  order: 8
---

A container's filesystem is wiped when it restarts. For data that must survive, you attach **volumes**.

## The storage chain
```
Pod ──uses──► PersistentVolumeClaim (PVC)  "I need 1Gi, ReadWriteOnce"
                    │ bound to
                    ▼
              PersistentVolume (PV)        an actual disk (EBS, GCE PD, local path…)
                    ▲ created on demand by
              StorageClass                 "how to make disks" (provisioner)
```

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata: { name: data, namespace: demo }
spec:
  accessModes: [ReadWriteOnce]       # one node can mount read-write
  resources: { requests: { storage: 1Gi } }
---
# in the pod spec:
volumes:      [{ name: data, persistentVolumeClaim: { claimName: data } }]
volumeMounts: [{ name: data, mountPath: /var/lib/data }]
```
kind ships a `standard` StorageClass that creates folders on the node, so you can try this in the lab.

## Other volume types
- `emptyDir`: scratch space that lives as long as the pod (cache, temp files)
- `configMap` / `secret`: config as files
- `hostPath`: a node's directory (avoid this, since it ties you to one node)

## StatefulSets
For databases and clustered systems where each replica needs a **stable identity**:
- stable names: `db-0`, `db-1`, `db-2` (not random suffixes)
- each replica gets **its own PVC** that follows it if it moves
- ordered startup and shutdown

## Scaling and state
Horizontal scaling is easy for **stateless** apps, where any pod can serve any request. Keep your web tier stateless: put sessions in Redis, files in object storage (S3), and data in a database. Scaling databases is a separate, harder problem. Many teams use a managed DB (RDS, Cloud SQL) and run only stateless apps on Kubernetes.
