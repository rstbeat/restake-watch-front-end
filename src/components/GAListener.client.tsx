'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageView } from '@/lib/analytics';

type GoogleTagFunction = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: GoogleTagFunction;
  }
}

export default function GAListener() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const gaId = process.env.NEXT_PUBLIC_GA_ID;
    if (!window.gtag || !gaId) return;

    const queryString = searchParams?.toString();
    const pagePath = queryString ? `${pathname}?${queryString}` : pathname;

    trackPageView(pagePath);
  }, [pathname, searchParams]);

  return null;
}


