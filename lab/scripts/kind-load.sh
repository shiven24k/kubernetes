#!/usr/bin/env bash
# Load a local Docker image into every kind node.
# Plain `kind load docker-image` can fail with Docker's multi-platform image
# store ("content digest ... not found"), so we export only our platform.
set -euo pipefail
IMAGE=$1; CLUSTER=${2:-learn}
PLATFORM=linux/$(docker version -f '{{.Server.Arch}}')
TAR=$(mktemp --suffix=.tar)
trap 'rm -f "$TAR"' EXIT
docker save --platform "$PLATFORM" -o "$TAR" "$IMAGE"
kind load image-archive "$TAR" --name "$CLUSTER"
echo "loaded $IMAGE into kind cluster '$CLUSTER'"
