---
name: Ambient Clarity
colors:
  surface: '#f7f9ff'
  surface-dim: '#d7dae0'
  surface-bright: '#f7f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f4fa'
  surface-container: '#ebeef4'
  surface-container-high: '#e5e8ee'
  surface-container-highest: '#dfe3e8'
  on-surface: '#181c20'
  on-surface-variant: '#414754'
  inverse-surface: '#2d3135'
  inverse-on-surface: '#eef1f7'
  outline: '#727785'
  outline-variant: '#c1c6d6'
  surface-tint: '#005bc0'
  primary: '#005bbf'
  on-primary: '#ffffff'
  primary-container: '#1a73e8'
  on-primary-container: '#ffffff'
  inverse-primary: '#adc7ff'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#845300'
  on-tertiary: '#ffffff'
  tertiary-container: '#a66900'
  on-tertiary-container: '#ffffff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc7ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004493'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f7f9ff'
  on-background: '#181c20'
  surface-variant: '#dfe3e8'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.03em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-tablet: 1.5rem
  gutter-desktop: 2rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style
The design system pairs consumer-grade utility with immediate cognitive legibility. Built for real-time telemetry, environmental updates, and on-demand interfaces, it balances technical precision with warmth. The aesthetic draws directly from advanced Material 3 surfaces and progressive consumer applications: generous spatial rhythm, rounded containment, and non-distracting visual heirarchies.

Key stylistic pillars:
- **Atmospheric & Airy:** Surfaces breathe. Negative space functions as a structural element to isolate dense data clusters into consumable visual bites.
- **Supportive Precision:** Critical metrics and status telemetry are presented through pastel badges, high-contrast typography, and gentle spatial containers, never visual alarms or loud structural borders.
- **Tactile Softness:** Elements employ exaggerated organic curvature (pill tags, rounded container modules) to feel approachable, tactile, and responsive.

## Colors
The color architecture relies on a pure, warm-tinted base coupled with expressive, functional accents.

- **Primary (`#1A73E8`):** The signature electric cobalt. Anchors interactive focal points, selected states, and navigational highlights.
- **Secondary (`#0D9488`):** Deep spearmint. Delivers balanced, positive reinforcement for active sensors and positive status confirmations.
- **Tertiary (`#F59E0B`):** Warm amber. Reserved for pending states, attention highlights, and ambient weather telemetry.
- **Neutral (`#5F6368`):** Google slate. Balances body text, low-emphasis metadata, and inactive structural outlines.

### Semantic Tonal Badges & Alert Backdrops
Telemetry alerts rely on low-saturation, luminous pastel containers paired with deeply saturated type:
- **Positive / Mint:** Background `#ECFDF5`, foreground label `#065F46`.
- **Informative / Sky:** Background `#EFF6FF`, foreground label `#1E40AF`.
- **Warning / Peach:** Background `#FFF7ED`, foreground label `#9A3412`.
- **Critical / Gentle Coral:** Background `#FEF2F2`, foreground label `#991B1B`.

Surfaces are tiered from pure background `#F8FAFD` to pristine surface modules `#FFFFFF`, avoiding harsh structural boundary rules.

## Typography
The system blends the rounded geometry of **Plus Jakarta Sans** for prominent headers with the structural clarity of **Inter** for dense telemetry, lists, and form inputs.

- **Numerics & Display Values:** Quantitative measures (temperatures, travel times, critical metrics) utilize `display-lg` with tight tracking (`-0.03em`) to anchor dashboards.
- **Hierarchy Separation:** Section categories and cards employ uppercase tracking only on `label-sm` variants. All titles rely on sentence case to sustain an open, approachable posture.
- **Mobile Readability:** Viewport downscaling occurs dynamically on `display-lg` and `headline-lg` to prevent line-wrapping of continuous multi-digit status readouts.

## Layout & Spacing
A fluid 4-column (mobile), 8-column (tablet), and 12-column (desktop) responsive framework guides layout positioning.

- **Component Padding:** Never crowd content within containers. Metric cards require an internal padding of `space-lg` (24px) to retain an open, expansive presence.
- **Section Breaks:** Modules separate vertically via `space-xl` (40px) to preserve distinct visual units without requiring hard dividers.
- **Edge Restraint:** Mobile margins are fixed at `1rem` (16px) to maximize touch target space while ensuring elements never bleed directly into system safe zones.

## Elevation & Depth
Depth is produced through subtle tonal layering, frosted backdrops, and diffused luminescence rather than structured grey drop shadows.

- **Level 0 (Canvas):** Base background tinted with soft atmospheric slate-blue (`#F8FAFD`).
- **Level 1 (Card & Module Surface):** Pristine white (`#FFFFFF`) with ultra-soft ambient displacement: `box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05)`.
- **Level 2 (Floating Modals & Sheets):** Elevated white (`#FFFFFF`) elevated by `box-shadow: 0 12px 32px -4px rgba(26, 115, 232, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)`.
- **Translucent Overlays (Sticky Navbars & Filter Bars):** `rgba(255, 255, 255, 0.82)` matched with `backdrop-filter: blur(16px) saturate(180%)`. Border outlines are restricted to hairline alpha strokes: `1px solid rgba(255, 255, 255, 0.6)`.

## Shapes
A pill-shaped, hyper-curved geometry defines all elements, removing rigid digital angles in favor of organic shapes:

- **Buttons & Chips:** Completely circular pill styling (`border-radius: 9999px`).
- **Cards & Data Modules:** Smooth continuous corners matching `rounded-2xl` (16px) for nested widgets and `rounded-3xl` (24px to 32px) for primary surface wrappers.
- **Bottom Sheets & Drawers:** High-radius top crowning (`border-radius: 28px 28px 0 0`).

## Components

### Buttons
- **Primary:** Full pill container (`border-radius: 9999px`), background `#1A73E8`, label white `label-lg`, with `padding: 0.875rem 1.75rem`. Hover triggers a brightness shift and gentle lift: `0 6px 20px rgba(26, 115, 232, 0.28)`.
- **Tonal (Secondary):** Background `#EFF6FF`, text `#1A73E8`, zero border. Ideal for low-friction secondary actions.
- **Ghost:** Background transparent, text `#5F6368`, with active tap state `#F1F5F9`.

### Chips & Filter Pills
- **Filter Chips:** Pill shapes with `padding: 0.5rem 1rem`. Inactive state: white background, `border: 1px solid #E2E8F0`, text `#475569`. Active state: `#1A73E8` background, text `#FFFFFF`, zero border, accompanied by a soft glow.
- **Telemetry Badges:** Compact pill format (`padding: 0.25rem 0.75rem`), using the pastel semantic token pairing (e.g., `#ECFDF5` background with `#065F46` label).

### Cards
- Constructed with `#FFFFFF` background, `border-radius: 1.5rem` (24px), `padding: 1.5rem`, and Level 1 soft ambient drop shadow.
- Dividers within cards are discouraged; data groupings must be segmented using negative spacing (`space-md`) or tinted sub-containers (`#F8FAFD`).

### Form Inputs & Search Fields
- Fully rounded (`border-radius: 9999px`) or ultra-soft (`border-radius: 1rem`).
- Default state: `#F1F5F9` solid fill, zero border, placeholder text `#94A3B8`.
- Focus state: Surface turns `#FFFFFF`, bordered by `2px solid #1A73E8`, with an outer ring blur: `0 0 0 4px rgba(26, 115, 232, 0.12)`.

### Selection Controls
- **Radio & Checkbox:** Curved selection targets with a default border `2px solid #CBD5E1`. Checked state transitions instantly to `#1A73E8` fill with an animated inner white icon or dot.
- **Switches:** Pill track with internal margin padding for a pure white spherical thumb elevated by ambient elevation.