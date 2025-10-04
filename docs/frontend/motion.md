# Guía de Motion (propuesta)

Objetivos: coherencia entre vistas, feedback sutil, evitar mareo.
Tokens: ver `src/styles/motion.js` (durations: short/base/long; easings: standard/out).
Patrones:
  - Página: y=12px + fade, 0.35s, ease standard.
  - Pop (modales/menus): scale .96 -> 1, 0.20–0.35s.
  - Hover: scale 1.02 / active .98, transición en transform/opacity.
Accesibilidad: `prefers-reduced-motion` aplicado en CSS global.
Dónde aplicar: botones primarios, cards, modales, toasts, tooltips.

