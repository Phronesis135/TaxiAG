import { HealthService } from './health.service';

describe('HealthService.summarize', () => {
  it('is ok only when postgres and redis are both reachable', () => {
    expect(HealthService.summarize(true, true)).toBe('ok');
    expect(HealthService.summarize(true, false)).toBe('degraded');
    expect(HealthService.summarize(false, true)).toBe('degraded');
    expect(HealthService.summarize(false, false)).toBe('degraded');
  });
});
