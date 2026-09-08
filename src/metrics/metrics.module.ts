import { Global, Module } from '@nestjs/common';
import {
  PrometheusModule,
  makeCounterProvider,
  makeHistogramProvider,
  makeGaugeProvider,
} from '@willsoto/nestjs-prometheus';
import {
  METRIC_HTTP_REQUESTS_TOTAL,
  METRIC_HTTP_REQUEST_DURATION_SECONDS,
  METRIC_HOSPITAL_ADMISSIONS_TOTAL,
  METRIC_HOSPITAL_ACTIVE_BEDS,
  METRIC_HOSPITAL_VITALS_ANOMALIES,
} from './metrics.constants';
import { MetricsInterceptor } from './metrics.interceptor';
import { MetricsService } from './metrics.service';

const httpRequestCounterProvider = makeCounterProvider({
  name: METRIC_HTTP_REQUESTS_TOTAL,
  help: 'Total number of HTTP requests processed by the API',
  labelNames: ['method', 'route', 'status_code', 'status_class'],
});

const httpRequestDurationProvider = makeHistogramProvider({
  name: METRIC_HTTP_REQUEST_DURATION_SECONDS,
  help: 'Duration of HTTP requests in seconds (RED Method)',
  labelNames: ['method', 'route', 'status_code', 'status_class'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

const hospitalAdmissionsProvider = makeCounterProvider({
  name: METRIC_HOSPITAL_ADMISSIONS_TOTAL,
  help: 'Total number of patient admissions in the hospital',
  labelNames: ['department', 'status'],
});

const hospitalActiveBedsProvider = makeGaugeProvider({
  name: METRIC_HOSPITAL_ACTIVE_BEDS,
  help: 'Current count of occupied beds by ward',
  labelNames: ['ward'],
});

const hospitalVitalsAnomaliesProvider = makeCounterProvider({
  name: METRIC_HOSPITAL_VITALS_ANOMALIES,
  help: 'Count of vitals anomalies detected (ICU & Wards)',
  labelNames: ['vital_type', 'severity'],
});

@Global()
@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
  providers: [
    httpRequestCounterProvider,
    httpRequestDurationProvider,
    hospitalAdmissionsProvider,
    hospitalActiveBedsProvider,
    hospitalVitalsAnomaliesProvider,
    MetricsInterceptor,
    MetricsService,
  ],
  exports: [
    MetricsInterceptor,
    MetricsService,
    httpRequestCounterProvider,
    httpRequestDurationProvider,
    hospitalAdmissionsProvider,
    hospitalActiveBedsProvider,
    hospitalVitalsAnomaliesProvider,
  ],
})
export class MetricsModule {}
