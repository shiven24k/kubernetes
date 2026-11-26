// Zero-dependency Node.js server built to make Kubernetes behaviour visible.
// Every response says WHICH pod answered, so you can watch load balancing,
// scaling, rolling updates and self-healing happen live in the browser.
const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const PORT = Number(process.env.PORT || 3000);
const POD = process.env.POD_NAME || os.hostname();   // injected by the Downward API in k8s
const NODE = process.env.NODE_NAME || 'local';        // which worker machine we run on
const VERSION = process.env.APP_VERSION || 'dev';
const COLOR = process.env.APP_COLOR || '#4f8cff';
const MESSAGE = process.env.APP_MESSAGE || 'Hello from Kubernetes!';
const STARTED = Date.now();
const STARTUP_DELAY_MS = Number(process.env.STARTUP_DELAY_MS || 2000);

let ready = false;           // flips true after a fake "warm-up" -> readiness probe
let shuttingDown = false;    // flips true on SIGTERM -> stop receiving new traffic
let requests = 0;

setTimeout(() => { ready = true; log('ready to receive traffic'); }, STARTUP_DELAY_MS);

function log(msg) {
  console.log(`${new Date().toISOString()} [${POD}] ${msg}`);
}

function send(res, status, body, type = 'application/json') {
  res.writeHead(status, {
    'Content-Type': type,
    'Cache-Control': 'no-store',
    // Force a new TCP connection per request. Kubernetes Services balance
    // CONNECTIONS, not requests, so without this a browser's keep-alive
    // connection would stick to one pod and hide the load balancing.
    'Connection': 'close',
  });
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
}

// Burn CPU for ~ms milliseconds. Used to trigger the Horizontal Pod Autoscaler.
function burn(ms) {
  const end = Date.now() + ms;
  let x = 0;
  while (Date.now() < end) x += Math.sqrt(Math.random());
  return x;
}

const server = http.createServer((req, res) => {
  requests++;
  const url = new URL(req.url, 'http://x');

  switch (url.pathname) {
    case '/':
      // Read on every request so live-sync (Tilt) changes show up instantly.
      return fs.readFile(path.join(__dirname, 'public', 'index.html'), 'utf8', (err, html) =>
        err ? send(res, 500, { error: err.message }) : send(res, 200, html, 'text/html'));

    case '/api/whoami':
      return send(res, 200, {
        pod: POD, node: NODE, version: VERSION, color: COLOR, message: MESSAGE,
        uptimeSec: Math.round((Date.now() - STARTED) / 1000), requests,
      });

    case '/api/burn': {
      const ms = Math.min(Number(url.searchParams.get('ms') || 100), 2000);
      burn(ms);
      return send(res, 200, { pod: POD, burnedMs: ms });
    }

    case '/api/crash':
      // Simulates a bug that kills the process. Kubernetes will restart it.
      if (req.method !== 'POST') return send(res, 405, { error: 'use POST' });
      log('crash requested -> exiting with code 1');
      send(res, 200, { pod: POD, crashing: true });
      return setTimeout(() => process.exit(1), 100);

    case '/healthz':   // liveness: "is the process alive?"
      return send(res, 200, { ok: true });

    case '/readyz':    // readiness: "should I get traffic right now?"
      return ready && !shuttingDown
        ? send(res, 200, { ready: true })
        : send(res, 503, { ready: false });

    default:
      return send(res, 404, { error: 'not found' });
  }
});

server.listen(PORT, () => log(`listening on :${PORT} version=${VERSION}`));

// Kubernetes sends SIGTERM before killing a pod. Fail readiness first so the
// Service stops sending us traffic, then finish in-flight requests and exit.
process.on('SIGTERM', () => {
  log('SIGTERM received -> graceful shutdown');
  shuttingDown = true;
  setTimeout(() => server.close(() => process.exit(0)), 3000);
});
