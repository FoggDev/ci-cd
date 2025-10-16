import { useState, useEffect } from 'react';
import { config } from '@/config/environment';

interface FeatureFlags {
  newDashboard: boolean;
  experimentalEditor: boolean;
  advancedAnalytics: boolean;
}

export function useFeatureFlags(): FeatureFlags {
  const [flags, setFlags] = useState<FeatureFlags>({
    newDashboard: false,
    experimentalEditor: false,
    advancedAnalytics: false,
  });

  useEffect(() => {
    async function fetchFlags() {
      try {
        const response = await fetch(`${config.apiUrl}/feature-flags`);
        const data = await response.json();
        setFlags(data);
      } catch (error) {
        console.error('Failed to fetch feature flags:', error);
        setFlags({
          newDashboard: config.features.enableBetaFeatures,
          experimentalEditor: config.features.enableBetaFeatures,
          advancedAnalytics: config.features.enableAnalytics,
        });
      }
    }

    fetchFlags();
  }, []);

  return flags;
}
