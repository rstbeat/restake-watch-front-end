'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageView, posthog } from '@/lib/analytics';

export default function AnalyticsProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  // Register UTM params and referrer once per session
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const utm_source = searchParams?.get('utm_source') || undefined;
    const utm_medium = searchParams?.get('utm_medium') || undefined;
    const utm_campaign = searchParams?.get('utm_campaign') || undefined;
    const utm_term = searchParams?.get('utm_term') || undefined;
    const utm_content = searchParams?.get('utm_content') || undefined;

    const referrer = document.referrer || undefined;

    const superProps: Record<string, unknown> = {};
    if (utm_source) superProps.utm_source = utm_source;
    if (utm_medium) superProps.utm_medium = utm_medium;
    if (utm_campaign) superProps.utm_campaign = utm_campaign;
    if (utm_term) superProps.utm_term = utm_term;
    if (utm_content) superProps.utm_content = utm_content;
    if (referrer) superProps.referrer = referrer;

    if (Object.keys(superProps).length > 0) {
      posthog.register_once(superProps);
    }
  }, [searchParams]);

  return null;
}
