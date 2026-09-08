/**
 * Hospital API Traffic Simulator
 * Runs zero-dependency concurrent requests against the NestJS backend to showcase
 * live Prometheus metrics and Grafana dashboards.
 *
 * Usage:
 *   node monitoring/simulate-traffic.js
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3042/api/v1';
const DURATION_SECONDS = parseInt(process.env.DURATION || '60', 10);
const CONCURRENCY = parseInt(process.env.CONCURRENCY || '10', 10);

const ENDPOINTS = [
  { method: 'GET', path: '/health', weight: 3 },
  { method: 'GET', path: '/doctors', weight: 4 },
  { method: 'GET', path: '/departments', weight: 3 },
  { method: 'GET', path: '/appointments', weight: 2 },
  { method: 'GET', path: '/patients', weight: 2 },
  { method: 'GET', path: '/metrics', weight: 1 },
  { method: 'GET', path: '/non-existent-route', weight: 1 }, // Intentionally generates 404s for error tracking
];

function pickEndpoint() {
  const totalWeight = ENDPOINTS.reduce((sum, ep) => sum + ep.weight, 0);
  let random = Math.random() * totalWeight;
  for (const ep of ENDPOINTS) {
    if (random < ep.weight) return ep;
    random -= ep.weight;
  }
  return ENDPOINTS[0];
}

async function sendRequest() {
  const ep = pickEndpoint();
  const url = `${BASE_URL}${ep.path}`;
  const start = Date.now();
  try {
    const res = await fetch(url, {
      method: ep.method,
      headers: { 'Accept': 'application/json' },
    });
    const duration = Date.now() - start;
    return { status: res.status, duration, path: ep.path };
  } catch (err) {
    return { status: 0, duration: Date.now() - start, error: err.message, path: ep.path };
  }
}

async function worker(stopTime, stats) {
  while (Date.now() < stopTime) {
    const res = await sendRequest();
    stats.total++;
    if (res.status >= 200 && res.status < 400) stats.success++;
    else if (res.status >= 400 && res.status < 500) stats.clientErrors++;
    else stats.serverErrors++;

    // Random jitter 20-100ms
    await new Promise((r) => setTimeout(r, Math.random() * 80 + 20));
  }
}

async function main() {
  console.log(`\n======================================================`);
  console.log(`🏥 Starting Hospital API Observability Traffic Simulator`);
  console.log(`🎯 Target: ${BASE_URL}`);
  console.log(`👥 Concurrency: ${CONCURRENCY} workers | ⏱️  Duration: ${DURATION_SECONDS}s`);
  console.log(`======================================================\n`);

  const stopTime = Date.now() + DURATION_SECONDS * 1000;
  const stats = { total: 0, success: 0, clientErrors: 0, serverErrors: 0 };

  const interval = setInterval(() => {
    const remaining = Math.max(0, Math.round((stopTime - Date.now()) / 1000));
    const rps = (stats.total / (DURATION_SECONDS - remaining || 1)).toFixed(1);
    process.stdout.write(
      `\r[${remaining}s left] Total: ${stats.total} | 2xx/3xx: ${stats.success} | 4xx: ${stats.clientErrors} | 5xx: ${stats.serverErrors} | ~${rps} req/s   `
    );
  }, 1000);

  const workers = Array.from({ length: CONCURRENCY }, () => worker(stopTime, stats));
  await Promise.all(workers);
  clearInterval(interval);

  console.log(`\n\n✅ Load simulation complete! Check Grafana at http://localhost:3005\n`);
}

main().catch(console.error);
