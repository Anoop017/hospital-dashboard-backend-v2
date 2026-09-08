import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Gauge } from 'prom-client';
import {
  METRIC_HOSPITAL_ADMISSIONS_TOTAL,
  METRIC_HOSPITAL_ACTIVE_BEDS,
  METRIC_HOSPITAL_VITALS_ANOMALIES,
} from './metrics.constants';

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric(METRIC_HOSPITAL_ADMISSIONS_TOTAL)
    private readonly admissionsCounter: Counter<string>,
    @InjectMetric(METRIC_HOSPITAL_ACTIVE_BEDS)
    private readonly activeBedsGauge: Gauge<string>,
    @InjectMetric(METRIC_HOSPITAL_VITALS_ANOMALIES)
    private readonly vitalsAnomaliesCounter: Counter<string>,
  ) {}

  recordAdmission(department: string = 'general', status: string = 'admitted') {
    this.admissionsCounter.inc({ department, status });
  }

  setActiveBeds(ward: string, count: number) {
    this.activeBedsGauge.set({ ward }, count);
  }

  recordVitalsAnomaly(vitalType: string, severity: 'warning' | 'critical') {
    this.vitalsAnomaliesCounter.inc({ vital_type: vitalType, severity });
  }
}
