import { mockPulses } from './mockData';

// Helper to flatten indicators from pulses
const getAllIndicators = () => {
  return mockPulses.flatMap((pulse) =>
    (pulse.indicators || []).map((ind) => ({
      ...ind,
      PulseID: ind.PulseID || pulse.id,
      PulseName: ind.PulseName || pulse.name,
    }))
  );
};

export const mockService = {
  // Statistics Overview
  getOverviewStats: async () => {
    const indicators = getAllIndicators();
    const activeIndicators = indicators.filter((i) => i.is_active === 1).length;
    const inactiveIndicators = indicators.filter((i) => i.is_active === 0).length;

    return {
      total_pulses: mockPulses.length,
      total_indicators: indicators.length,
      active_indicators: activeIndicators,
      inactive_indicators: inactiveIndicators,
      unique_adversaries: new Set(mockPulses.map((p) => p.adversary).filter(Boolean)).size,
      unique_indicator_types: new Set(indicators.map((i) => i.type)).size,
    };
  },

  // Indicator Types Breakdown
  getIndicatorTypesStats: async () => {
    const indicators = getAllIndicators();
    const typeCounts = {};
    indicators.forEach((ind) => {
      const type = ind.type || 'Other';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    return typeCounts;
  },

  // Malware Families Breakdown
  getMalwareStats: async () => {
    const counts = {};
    mockPulses.forEach((pulse) => {
      (pulse.malware_families || []).forEach((family) => {
        counts[family] = (counts[family] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  },

  // Targeted Countries Breakdown
  getCountriesStats: async () => {
    const counts = {};
    mockPulses.forEach((pulse) => {
      (pulse.targeted_countries || []).forEach((country) => {
        counts[country] = (counts[country] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  },

  // Targeted Industries Breakdown
  getIndustriesStats: async () => {
    const counts = {};
    mockPulses.forEach((pulse) => {
      (pulse.industries || []).forEach((ind) => {
        counts[ind] = (counts[ind] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  },

  // Common Tags Frequency
  getTagsStats: async () => {
    const counts = {};
    mockPulses.forEach((pulse) => {
      (pulse.tags || []).forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  },

  // Get Pulses with search, filter, sort, pagination
  getPulses: async ({
    search = '',
    tlp = '',
    adversary = '',
    country = '',
    malware = '',
    tag = '',
    sortBy = 'created',
    order = 'desc',
    page = 1,
    limit = 10,
  } = {}) => {
    let filtered = [...mockPulses];

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.adversary && p.adversary.toLowerCase().includes(q)) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (tlp) {
      filtered = filtered.filter((p) => p.tlp.toLowerCase() === tlp.toLowerCase());
    }

    if (adversary) {
      filtered = filtered.filter((p) => p.adversary === adversary);
    }

    if (country) {
      filtered = filtered.filter((p) => (p.targeted_countries || []).includes(country));
    }

    if (malware) {
      filtered = filtered.filter((p) => (p.malware_families || []).includes(malware));
    }

    if (tag) {
      filtered = filtered.filter((p) => (p.tags || []).includes(tag));
    }

    // Sorting
    filtered.sort((a, b) => {
      let valA = a[sortBy] || '';
      let valB = b[sortBy] || '';
      if (sortBy === 'indicators') {
        valA = (a.indicators || []).length;
        valB = (b.indicators || []).length;
      }
      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });

    const total = filtered.length;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return {
      data: paginated,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit) || 1,
    };
  },

  // Get single pulse by ID
  getPulseById: async (id) => {
    const pulse = mockPulses.find((p) => p.id === id);
    if (!pulse) {
      throw new Error(`Pulse with ID ${id} not found`);
    }
    return pulse;
  },

  // Get Indicators with search, filters, pagination
  getIndicators: async ({
    search = '',
    type = '',
    status = '',
    pulseId = '',
    sortBy = 'created',
    order = 'desc',
    page = 1,
    limit = 10,
  } = {}) => {
    let indicators = getAllIndicators();

    if (search) {
      const q = search.toLowerCase();
      indicators = indicators.filter(
        (i) =>
          i.indicator.toLowerCase().includes(q) ||
          i.title.toLowerCase().includes(q) ||
          (i.description && i.description.toLowerCase().includes(q))
      );
    }

    if (type) {
      indicators = indicators.filter((i) => i.type.toLowerCase() === type.toLowerCase());
    }

    if (status !== '' && status !== null && status !== undefined) {
      const activeVal = status === 'active' || status === '1' || status === 1 ? 1 : 0;
      indicators = indicators.filter((i) => i.is_active === activeVal);
    }

    if (pulseId) {
      indicators = indicators.filter((i) => i.PulseID === pulseId);
    }

    // Sorting
    indicators.sort((a, b) => {
      let valA = a[sortBy] || '';
      let valB = b[sortBy] || '';
      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });

    const total = indicators.length;
    const start = (page - 1) * limit;
    const paginated = indicators.slice(start, start + limit);

    return {
      data: paginated,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit) || 1,
    };
  },

  // Get single indicator by ID
  getIndicatorById: async (id) => {
    const numericId = parseInt(id, 10);
    const indicator = getAllIndicators().find((i) => i.id === numericId || i.id === id);
    if (!indicator) {
      throw new Error(`Indicator with ID ${id} not found`);
    }
    return indicator;
  },
};
