import { isUsingMockData, mockService, apiFetch } from './client';

export async function getIndicators(params = {}) {
  if (isUsingMockData()) {
    return mockService.getIndicators(params);
  }
  const queryString = new URLSearchParams(params).toString();
  return apiFetch(`/api/indicators${queryString ? `?${queryString}` : ''}`);
}

export async function getIndicatorById(id) {
  if (isUsingMockData()) {
    return mockService.getIndicatorById(id);
  }
  return apiFetch(`/api/indicators/${id}`);
}
