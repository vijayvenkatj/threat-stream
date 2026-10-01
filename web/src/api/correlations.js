import { isUsingMockData, mockService, apiFetch, apiList } from './client';

// Paged Spark correlation rows: {available, data, page, limit, total, total_pages}.
export async function getCorrelations(params = {}) {
  if (isUsingMockData()) return mockService.getCorrelations(params);
  return apiList('/api/correlations', params);
}

// Aggregates for the insight charts: {available, pulses, indicators, categories, ...}.
export async function getCorrelationStats() {
  if (isUsingMockData()) return mockService.getCorrelationStats();
  return apiFetch('/api/correlations/stats');
}
