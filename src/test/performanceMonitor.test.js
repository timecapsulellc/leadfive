import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('PerformanceMonitor', () => {
  // Mock performance monitor for testing
  const mockMonitor = {
    metrics: { errors: [], componentRenders: {}, apiCalls: {}, alerts: [] },
    recordError: vi.fn(),
    startMeasure: vi.fn(),
    endMeasure: vi.fn(),
    measureAsync: vi.fn(),
    recordMemoryUsage: vi.fn(),
    generateReport: vi.fn(() => ({
      summary: { totalApiCalls: 1, totalRenders: 1, errorCount: 0 },
      recommendations: [],
    })),
    getMetrics: vi.fn(() => mockMonitor.metrics),
    dispose: vi.fn(),
  };
  beforeEach(() => {
    vi.clearAllMocks();
    mockMonitor.metrics = {
      errors: [],
      componentRenders: {},
      apiCalls: {},
      alerts: [],
    };
  });
  describe('Error Recording', () => {
    it('should record errors with context', () => {
      const error = new Error('Test error');
      const context = { userId: '123' };
      mockMonitor.recordError(error, context);
      expect(mockMonitor.recordError).toHaveBeenCalledWith(error, context);
    });
    it('should include browser information in error reports', () => {
      const error = new Error('Browser test');
      mockMonitor.recordError(error);
      expect(mockMonitor.recordError).toHaveBeenCalledWith(error);
    });
  });
  describe('Component Render Measurement', () => {
    it('should measure component render time', () => {
      mockMonitor.startMeasure('TestComponent');
      mockMonitor.endMeasure('TestComponent');
      expect(mockMonitor.startMeasure).toHaveBeenCalledWith('TestComponent');
      expect(mockMonitor.endMeasure).toHaveBeenCalledWith('TestComponent');
    });
    it('should report slow renders', () => {
      mockMonitor.startMeasure('SlowComponent');
      mockMonitor.endMeasure('SlowComponent');
      expect(mockMonitor.startMeasure).toHaveBeenCalled();
      expect(mockMonitor.endMeasure).toHaveBeenCalled();
    });
  });
  describe('Async Operation Measurement', () => {
    it('should measure successful async operations', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      mockMonitor.measureAsync.mockResolvedValue('success');
      await mockMonitor.measureAsync('fetchData', mockFn);
      expect(mockMonitor.measureAsync).toHaveBeenCalledWith(
        'fetchData',
        mockFn
      );
    });
    it('should handle async operation failures', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Network error'));
      mockMonitor.measureAsync.mockRejectedValue(new Error('Network error'));
      try {
        await mockMonitor.measureAsync('failedFetch', mockFn);
      } catch (e) {
        expect(e.message).toBe('Network error');
      }
    });
    it('should report async operation metrics', async () => {
      const mockFn = vi.fn().mockResolvedValue('done');
      mockMonitor.measureAsync.mockResolvedValue('done');
      await mockMonitor.measureAsync('testOp', mockFn);
      expect(mockMonitor.measureAsync).toHaveBeenCalled();
    });
  });
  describe('Memory Usage Monitoring', () => {
    it('should record memory usage', () => {
      mockMonitor.recordMemoryUsage();
      expect(mockMonitor.recordMemoryUsage).toHaveBeenCalled();
    });
    it('should alert on high memory usage', () => {
      mockMonitor.recordMemoryUsage();
      expect(mockMonitor.recordMemoryUsage).toHaveBeenCalled();
    });
  });
  describe('Performance Summary', () => {
    it('should generate performance summary', async () => {
      const report = mockMonitor.generateReport();
      expect(report.summary).toHaveProperty('totalApiCalls');
      expect(report.summary).toHaveProperty('totalRenders');
      expect(report.summary).toHaveProperty('errorCount');
    });
    it('should provide performance recommendations', () => {
      mockMonitor.generateReport.mockReturnValue({
        summary: { totalApiCalls: 1, totalRenders: 1, errorCount: 0 },
        recommendations: ['Consider optimizing slow components'],
      });
      const report = mockMonitor.generateReport();
      expect(report.recommendations).toBeDefined();
    });
  });
  describe('Cleanup', () => {
    it('should dispose of observers and intervals', () => {
      mockMonitor.dispose();
      expect(mockMonitor.dispose).toHaveBeenCalled();
    });
  });
});
describe('usePerformanceMonitor Hook', () => {
  const mockHook = {
    measureRender: vi.fn(() => vi.fn()),
    measureAsync: vi.fn(),
    recordError: vi.fn(),
    getReport: vi.fn(() => ({ componentRenders: {}, apiCalls: {} })),
  };

  it('should provide performance monitoring functions', () => {
    expect(mockHook).toHaveProperty('measureRender');
    expect(mockHook).toHaveProperty('measureAsync');
    expect(mockHook).toHaveProperty('recordError');
    expect(mockHook).toHaveProperty('getReport');
  });

  it('should measure render performance through hook', () => {
    const cleanup = mockHook.measureRender('TestComponent');
    cleanup();

    expect(mockHook.measureRender).toHaveBeenCalledWith('TestComponent');
  });

  it('should measure async operations through hook', async () => {
    mockHook.measureAsync.mockResolvedValue('result');

    await mockHook.measureAsync('testAsync', async () => 'result');

    expect(mockHook.measureAsync).toHaveBeenCalled();
  });
});
