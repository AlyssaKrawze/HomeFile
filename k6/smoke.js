import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE = __ENV.BASE_URL || 'http://localhost:3000';

const routes = ['/login', '/signup', '/guide', '/terms', '/privacy'];

export default function () {
  for (const route of routes) {
    const res = http.get(`${BASE}${route}`);
    check(res, { [`${route} status 200`]: (r) => r.status === 200 });
  }
  sleep(1);
}
