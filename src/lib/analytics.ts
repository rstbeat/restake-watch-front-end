// Ligero wrapper para enviar eventos a Google Analytics con gtag

type GoogleTagFunction = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: GoogleTagFunction;
  }
}

export function trackEvent(eventName: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag !== 'function') return;

  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!gaId) return;

  window.gtag('event', eventName, {
    // "send_to" no es obligatorio para GA4 si ya configuraste gtag('config', GA_ID)
    // Lo omitimos para evitar confusiones.
    ...(process.env.NODE_ENV !== 'production' ? { debug_mode: true } : {}),
    ...params,
  });
}

export function trackPageView(path: string): void {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag !== 'function') return;

  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!gaId) return;

  window.gtag('config', gaId, {
    page_path: path,
    ...(process.env.NODE_ENV !== 'production' ? { debug_mode: true } : {}),
  });
}

export function setUserProperties(properties: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag !== 'function') return;
  window.gtag('set', 'user_properties', properties);
}

export function trackSearch(category: string, searchTerm: string): void {
  if (!searchTerm) return;
  trackEvent('search', {
    category,
    search_term: searchTerm,
    search_term_length: searchTerm.length,
  });
}


