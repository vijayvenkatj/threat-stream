import { isUsingMockData, mockService, apiFetch } from './client';

// The Go server wraps lists as {data: [...]}; the UI takes the bare list.
const rows = async (endpoint) => (await apiFetch(endpoint)).data;

export async function getOverviewStats() {
  if (isUsingMockData()) return mockService.getOverviewStats();
  return apiFetch('/api/stats/overview');
}

export async function getIndicatorTypesStats() {
  if (isUsingMockData()) return mockService.getIndicatorTypesStats();
  const list = await rows('/api/stats/indicator-types');
  return Object.fromEntries(list.map(({ type, count }) => [type, count]));
}

export async function getMalwareStats() {
  if (isUsingMockData()) return mockService.getMalwareStats();
  return rows('/api/stats/malware');
}

export async function getCountriesStats() {
  if (isUsingMockData()) return mockService.getCountriesStats();
  return rows('/api/stats/countries');
}

export async function getIndustriesStats() {
  if (isUsingMockData()) return mockService.getIndustriesStats();
  return rows('/api/stats/industries');
}

export async function getTagsStats() {
  if (isUsingMockData()) return mockService.getTagsStats();
  return rows('/api/stats/tags');
}
