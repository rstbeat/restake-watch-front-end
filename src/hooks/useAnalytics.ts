import { useEffect, useCallback } from 'react';
import { trackEvent } from '../lib/analytics';

export const useAnalytics = () => {
  const trackRiskInteraction = useCallback((riskType: string, severity: string) => {
    trackEvent('risk_interaction', {
      risk_type: riskType,
      severity: severity,
      timestamp: Date.now()
    });
  }, []);

  const trackNavigation = useCallback((from: string, to: string) => {
    trackEvent('navigation', { from, to });
  }, []);

  return { trackRiskInteraction, trackNavigation };
};
