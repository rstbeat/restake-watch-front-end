'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackEvent } from 'lib/analytics';

const THRESHOLDS = [25, 50, 75, 100];

export default function ScrollDepth() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const firedRef = useRef<Record<number, boolean>>({});

  // Reset thresholds on route change
  useEffect(() => {
    firedRef.current = {};
  }, [pathname, searchParams]);

  useEffect(() => {
    const onScroll = () => {
      const body = document.documentElement;
      const scrollTop = body.scrollTop || document.body.scrollTop;
      const scrollHeight = body.scrollHeight || document.body.scrollHeight;
      const clientHeight = window.innerHeight;
      const percent = Math.min(
        100,
        Math.round(((scrollTop + clientHeight) / scrollHeight) * 100),
      );
      for (const t of THRESHOLDS) {
        if (percent >= t && !firedRef.current[t]) {
          firedRef.current[t] = true;
          const query = searchParams?.toString();
          const pagePath = query ? `${pathname}?${query}` : pathname;
          trackEvent('scroll_depth', { percent: t, page_path: pagePath });
        }
      }
    };

    // Initial check for short pages
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname, searchParams]);

  return null;
}


