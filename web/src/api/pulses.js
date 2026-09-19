import { isUsingMockData, mockService, apiFetch } from './client';

export async function getPulses(params = {}) {
  if (isUsingMockData()) {
    return mockService.getPulses(params);
  }
  const queryString = new URLSearchParams(params).toString();
  return apiFetch(`/api/pulses${queryString ? `?${queryString}` : ''}`);
}

export async function getPulseById(id) {
  if (isUsingMockData()) {
    return mockService.getPulseById(id);
  }
  return apiFetch(`/api/pulses/${id}`);
}
