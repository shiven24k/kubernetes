#!/usr/bin/env bash
# Installs kind, kubectl and tilt into ~/.local/bin (no sudo needed).
set -euo pipefail
BIN="$HOME/.local/bin"
mkdir -p "$BIN"
ARCH=$(uname -m); case "$ARCH" in x86_64) ARCH=amd64;; aarch64|arm64) ARCH=arm64;; esac
OS=$(uname -s | tr '[:upper:]' '[:lower:]')

latest() { curl -fsSLI -o /dev/null -w '%{url_effective}' "https://github.com/$1/releases/latest" | sed 's#.*/tag/##'; }

if ! command -v kubectl >/dev/null; then
  V=$(curl -fsSL https://dl.k8s.io/release/stable.txt)
  echo "-> kubectl $V"
  curl -fsSLo "$BIN/kubectl" "https://dl.k8s.io/release/$V/bin/$OS/$ARCH/kubectl"
  chmod +x "$BIN/kubectl"
fi

if ! command -v kind >/dev/null; then
  V=$(latest kubernetes-sigs/kind)
  echo "-> kind $V"
  curl -fsSLo "$BIN/kind" "https://github.com/kubernetes-sigs/kind/releases/download/$V/kind-$OS-$ARCH"
  chmod +x "$BIN/kind"
fi

if ! command -v tilt >/dev/null; then
  V=$(latest tilt-dev/tilt); N=${V#v}
  TARCH=$([ "$ARCH" = amd64 ] && echo x86_64)
  [ "$ARCH" = arm64 ] && TARCH=arm64
  echo "-> tilt $V"
  curl -fsSL "https://github.com/tilt-dev/tilt/releases/download/$V/tilt.$N.$OS.$TARCH.tar.gz" | tar -xz -C "$BIN" tilt
fi

case ":$PATH:" in *":$BIN:"*) ;; *) echo "!! Add $BIN to your PATH:  echo 'export PATH=\$HOME/.local/bin:\$PATH' >> ~/.bashrc";; esac
echo; kubectl version --client | head -1; kind version; tilt version
