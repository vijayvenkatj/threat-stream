import { isUsingMockData, mockService, apiFetch } from './client';

export async function getOverviewStats() {
  if (isUsingMockData()) {
    return mockService.getOverviewStats();
  }
  return apiFetch('/api/stats/overview');
}

export async function getIndicatorTypesStats() {
  if (isUsingMockData()) {
    return mockService.getIndicatorTypesStats();
  }
  return apiFetch('/api/stats/indicator-types');
}

export async function getMalwareStats() {
  if (isUsingMockData()) {
    return mockService.getMalwareStats();
  }
  return apiFetch('/api/stats/malware');
}

export async function getCountriesStats() {
  if (isUsingMockData()) {
    return mockService.getCountriesStats();
  }
  return apiFetch('/api/stats/countries');
}

export async function getIndustriesStats() {
  if (isUsingMockData()) {
    return mockService.getIndustriesStats();
  }
  return apiFetch('/api/stats/industries');
}

export async function getTagsStats() {
  if (isUsingMockData()) {
    return mockService.getTagsStats();
  }
  return apiFetch('/api/stats/tags');
}
