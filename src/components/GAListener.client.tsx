'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

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

    window.gtag('config', gaId, {
      page_path: pagePath,
    });
  }, [pathname, searchParams]);

  return null;
}


