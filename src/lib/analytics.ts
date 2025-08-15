import posthog from 'posthog-js'

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    // Configuración específica para tu app
    capture_pageview: false, // Lo haremos manualmente
    capture_pageleave: true,
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.debug()
    }
  })
}

export { posthog }

// Funciones helper para tu caso específico
export const trackEvent = (event: string, properties?: any) => {
  posthog.capture(event, {
    ...properties,
    timestamp: new Date().toISOString()
  })
}

export const identifyUser = (userId: string, traits?: any) => {
  posthog.identify(userId, traits)
}

export const trackPageView = (pageName: string) => {
  posthog.capture('$pageview', {
    $current_url: window.location.href,
    page_name: pageName
  })
}
