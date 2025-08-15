import posthog from 'posthog-js'

// Variables de configuración
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'

// Flag para rastrear si PostHog está inicializado
let isInitialized = false

// Función de inicialización con mejor manejo de errores
const initializePostHog = () => {
  if (typeof window === 'undefined') {
    console.log('[Analytics] Skipping initialization - not in browser environment')
    return false
  }

  if (isInitialized) {
    console.log('[Analytics] Already initialized')
    return true
  }

  if (!POSTHOG_KEY) {
    console.error('[Analytics] NEXT_PUBLIC_POSTHOG_KEY is not defined!')
    console.error('[Analytics] Available env vars:', Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')))
    return false
  }

  try {
    console.log('[Analytics] Initializing PostHog...')
    console.log('[Analytics] Host:', POSTHOG_HOST)
    console.log('[Analytics] Key exists:', !!POSTHOG_KEY)
    console.log('[Analytics] Environment:', process.env.NODE_ENV)
    
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      capture_pageview: false, // Manual control
      capture_pageleave: true,
      persistence: 'localStorage',
      autocapture: {
        dom_event_allowlist: ['click', 'submit'], // Solo capturar clicks y submits
        element_allowlist: ['a', 'button', 'form', 'input', 'select', 'textarea'],
      },
      loaded: (posthog) => {
        console.log('[Analytics] PostHog loaded successfully!')
        if (process.env.NODE_ENV === 'development') {
          posthog.debug()
        }
        // Verificar que realmente está funcionando
        posthog.capture('posthog_initialized', {
          environment: process.env.NODE_ENV,
          host: POSTHOG_HOST,
          timestamp: new Date().toISOString()
        })
      },
      // Callback para errores
      on_xhr_error: (err) => {
        console.error('[Analytics] PostHog XHR error:', err)
      },
      bootstrap: {
        distinctID: undefined, // Dejar que PostHog genere uno
      }
    })
    
    isInitialized = true
    console.log('[Analytics] Initialization complete')
    return true
  } catch (error) {
    console.error('[Analytics] Failed to initialize PostHog:', error)
    return false
  }
}

// Inicializar automáticamente cuando el módulo se carga
if (typeof window !== 'undefined') {
  // Esperar a que el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePostHog)
  } else {
    // DOM ya está listo
    initializePostHog()
  }
}

// Wrapper seguro para PostHog
const safePostHog = {
  capture: (event: string, properties?: any) => {
    if (!isInitialized && typeof window !== 'undefined') {
      console.warn('[Analytics] PostHog not initialized, attempting to initialize...')
      initializePostHog()
    }
    
    if (isInitialized && posthog) {
      try {
        posthog.capture(event, properties)
        console.log('[Analytics] Event captured:', event, properties)
      } catch (error) {
        console.error('[Analytics] Error capturing event:', error)
      }
    } else {
      console.warn('[Analytics] Cannot capture event - PostHog not initialized:', event)
    }
  },
  
  identify: (userId: string, traits?: any) => {
    if (isInitialized && posthog) {
      try {
        posthog.identify(userId, traits)
        console.log('[Analytics] User identified:', userId)
      } catch (error) {
        console.error('[Analytics] Error identifying user:', error)
      }
    }
  },
  
  reset: () => {
    if (isInitialized && posthog) {
      try {
        posthog.reset()
        console.log('[Analytics] PostHog reset')
      } catch (error) {
        console.error('[Analytics] Error resetting:', error)
      }
    }
  }
}

// Exportar la instancia de PostHog para uso directo si es necesario
export { posthog, isInitialized }

// Funciones helper con manejo de errores mejorado
export const trackEvent = (event: string, properties?: any) => {
  const enrichedProperties = {
    ...properties,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    pathname: typeof window !== 'undefined' ? window.location.pathname : undefined,
  }
  
  safePostHog.capture(event, enrichedProperties)
}

export const identifyUser = (userId: string, traits?: any) => {
  safePostHog.identify(userId, traits)
}

export const trackPageView = (pageName?: string) => {
  if (typeof window === 'undefined') return
  
  const properties = {
    $current_url: window.location.href,
    $pathname: window.location.pathname,
    $host: window.location.host,
    $referrer: document.referrer,
    page_name: pageName || document.title,
  }
  
  safePostHog.capture('$pageview', properties)
}

// Función de debug para verificar el estado
export const debugAnalytics = () => {
  console.group('[Analytics Debug]')
  console.log('Initialized:', isInitialized)
  console.log('PostHog Key exists:', !!POSTHOG_KEY)
  console.log('PostHog Host:', POSTHOG_HOST)
  console.log('Environment:', process.env.NODE_ENV)
  console.log('Window available:', typeof window !== 'undefined')
  if (typeof window !== 'undefined' && posthog) {
    console.log('PostHog instance:', posthog)
    console.log('PostHog config:', (posthog as any).config)
  }
  console.groupEnd()
}

// Auto-debug en desarrollo
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as any).debugAnalytics = debugAnalytics
  console.log('[Analytics] Debug function available: window.debugAnalytics()')
}