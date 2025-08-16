### Dashboards y Funnels propuestos para PostHog

Este documento define 3 dashboards y 2 funnels listos para crear en PostHog. Puedes crearlos vía UI (recomendado) o con la API (incluyo payloads de ejemplo).

---

## 1) Dashboard: Product Overview
Objetivo: vista general de uso y navegación.

Incluye estos Insights (todos en un mismo dashboard):
- Total Page Views (por `page_name`)
  - Tipo: Trends (Line/Bar)
  - Evento: `$pageview`
  - Breakdown: `page_name`
- Platform Usage
  - Tipo: Trends (Bar)
  - Evento: `platform_change`
  - Métrica: conteo
  - Propiedad: `to_platform`
- Tab Navigation Flow (conteo por tab destino)
  - Tipo: Trends (Bar)
  - Evento: `tab_navigation`
  - Breakdown: `to_tab`
- Section Engagement
  - Tipo: Trends (Bar)
  - Evento: `section_viewed`
  - Breakdown: `section`
- Session Duration (promedio)
  - Tipo: Trends (Number/Bar)
  - Evento: `session_ended`
  - Aggregation: Average of property `duration_ms`
  - Unit: ms (opcional: crear fórmula `duration_ms / 1000`)

---

## 2) Dashboard: Engagement & Conversion
Objetivo: medir interacción con contenido y CTAs.

Insights:
- Research Banner Clicks
  - Tipo: Trends (Line/Bar)
  - Evento: `research_paper_clicked`
  - Breakdown: `paper_name`
- Funding CTA Clicks
  - Tipo: Trends (Line/Bar)
  - Evento: `funding_cta_clicked`
  - Breakdown: `source`
- Twitter & Learn More Clicks
  - Tipo: Trends (Bar)
  - Eventos: `twitter_link_clicked`, `learn_more_cta_clicked` (series separadas)
- Metric Viewed (Concentration Bars)
  - Tipo: Trends (Bar)
  - Evento: `metric_viewed`
  - Breakdown: `metric_name` (ej. operator_concentration_bar, ...)
- Filters Usage
  - Tipo: Trends (Bar)
  - Evento: `filter_applied`
  - Breakdown: `filter_type` (y opcional `filter_value`)

---

## 3) Dashboard: Data Health & Performance
Objetivo: salud de datos y tiempos.

Insights:
- Data Load Time (histograma)
  - Tipo: Trends/Histogram
  - Evento: `data_loaded`
  - Métrica: average/percentiles de `load_time_ms`
  - Breakdown: `data_type` (eth_price, operators, restakers)
- Data Errors por tipo
  - Tipo: Trends (Bar)
  - Evento: `data_error`
  - Breakdown: `data_type`
- Load Success Rate
  - Tipo: Formula (p.ej. `data_loaded / (data_loaded + data_error)` por `data_type`)
- Record Count por data_type
  - Tipo: Trends (Bar)
  - Evento: `data_loaded`
  - Aggregation: Average of `record_count`
  - Breakdown: `data_type`

---

## Funnel 1: Navigation Depth
Objetivo: medir profundidad de análisis.

Pasos (order matters):
1) `$pageview` (condición `page_name = /` o home)
2) `tab_navigation` → `to_tab IN [operators, restakers]`
3) Detalle abierto:
   - `operator_analysis` (action = expand) OR `whale_analysis` (action = expand)
4) Acción final:
   - `data_export` (export_type = csv) OR `funding_cta_clicked`

Breakdowns recomendados: `utm_source`, `utm_campaign`, `platform` (de `platform_change` previo) o `section`.

---

## Funnel 2: Funding Conversion
Objetivo: medir conversión a Funding desde cualquier origen.

Pasos:
1) `$pageview`
2) `funding_cta_clicked`

Breakdowns: `utm_source`, `section`, `user_type`.

Ventana de conversión: 7 días.

---

## Creación por UI (recomendado)
1) En PostHog → Dashboards → New Dashboard → usa los nombres arriba y añade cada Insight con los filtros indicados.
2) Para Funnels: Insights → Funnels → define los pasos con los eventos y condiciones listadas y guarda.

---

## (Opcional) Creación por API
Rellena tus datos y ejecuta con `curl` o tu cliente preferido.

Variables:
- `POSTHOG_HOST`: `https://app.posthog.com` o `https://eu.posthog.com`
- `PERSONAL_API_KEY`: tu clave personal (no la project API key)
- `PROJECT_ID`: id del proyecto

Ejemplo: crear un Insight (trends) para Funding CTA clicks
```bash
curl -X POST "$POSTHOG_HOST/api/projects/$PROJECT_ID/insights/" \
  -H "Authorization: Bearer $PERSONAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Funding CTA Clicks by Source",
    "filters": {
      "events": [
        {"id": "funding_cta_clicked", "name": "funding_cta_clicked", "type": "events"}
      ],
      "breakdown": "source",
      "insight": "TRENDS"
    }
  }'
```

Ejemplo: crear un Funnel (Funding Conversion)
```bash
curl -X POST "$POSTHOG_HOST/api/projects/$PROJECT_ID/insights/" \
  -H "Authorization: Bearer $PERSONAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Funding Conversion Funnel",
    "filters": {
      "insight": "FUNNELS",
      "funnel_window_interval": 7,
      "funnel_window_interval_unit": "day",
      "events": [
        {"id": "$pageview", "name": "$pageview", "type": "events"},
        {"id": "funding_cta_clicked", "name": "funding_cta_clicked", "type": "events"}
      ]
    }
  }'
```

Repite el patrón para cada Insight/Funnel del documento.

---

## Notas
- Usa `utm_*` y `referrer` como breakdowns en dashboards de marketing.
- Mantén nombres y propiedades en snake_case.
- Ajusta períodos (últimos 7/28 días) según tu tráfico.
