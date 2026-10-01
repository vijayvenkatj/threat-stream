import { isUsingMockData, mockService, apiFetch, apiList } from './client';

export async function getPulses(params = {}) {
  if (isUsingMockData()) {
    return mockService.getPulses(params);
  }
  return apiList('/api/pulses', params);
}

export async function getPulseById(id) {
  if (isUsingMockData()) {
    return mockService.getPulseById(id);
  }
  return apiFetch(`/api/pulses/${id}`);
}
