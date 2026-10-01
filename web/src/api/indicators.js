import { isUsingMockData, mockService, apiFetch, apiList } from './client';

export async function getIndicators(params = {}) {
  if (isUsingMockData()) {
    return mockService.getIndicators(params);
  }
  return apiList('/api/indicators', params);
}

export async function getIndicatorById(id) {
  if (isUsingMockData()) {
    return mockService.getIndicatorById(id);
  }
  return apiFetch(`/api/indicators/${id}`);
}
