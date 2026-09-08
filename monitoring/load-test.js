import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 25 },  // Ramp up to 25 virtual users
    { duration: '1m', target: 100 },   // Spike to 100 virtual users
    { duration: '30s', target: 0 },    // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.05'],    // Error rate must stay below 5%
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000/api/v1';

export default function () {
  const routes = [
    '/health',
    '/doctors',
    '/departments',
    '/appointments',
    '/patients',
  ];

  const route = routes[Math.floor(Math.random() * routes.length)];
  const res = http.get(`${BASE_URL}${route}`);

  check(res, {
    'status is 200 or 401': (r) => r.status === 200 || r.status === 401,
  });

  sleep(Math.random() * 0.5 + 0.1);
}
