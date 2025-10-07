# Guía de Estilaje – Página Facturas

## Propósito
- Unificar criterios visuales y de interacción del listado de facturas para el equipo de producto y desarrollo.
- Servir como referencia rápida para futuras iteraciones de UI, manteniendo coherencia con la identidad de Nioxtec.

## Identidad visual

### Paleta principal
| Token | Valor | Uso principal | Referencia |
| --- | --- | --- | --- |
| Brand (Primario) | `#08b4d8` | Acciones destacadas, resaltes de estado _Pagado_, sombras frías | `frontend/tailwind.config.mjs:27`, `frontend/src/pages/Facturas.jsx:680` |
| Brand Dark (Secundario) | `#0b3c5d` | Gradientes profundos, fondos alternos en materiales brillantes | `frontend/tailwind.config.mjs:27` |
| Background base | `bg-gray-950` con gradiente azul | Lienzo general en modo oscuro | `frontend/src/index.css:14` |
| Superficie principal | `bg-gray-800` + `border-gray-700` | Contenedores DataCard y menús flotantes | `frontend/src/components/DataCard.jsx:47`, `frontend/src/pages/Facturas.jsx:655` |
| Texto primario | `text-gray-100` / `text-white/90` | Titulares y numeraciones | `frontend/src/index.css:14`, `frontend/src/pages/Facturas.jsx:478` |
| Texto secundario | `text-gray-300` / `text-gray-500` | Metadatos, subtítulos y labels móviles | `frontend/src/pages/Facturas.jsx:669` |

### Colores por tipo de documento
- Factura: aro y figura con `border-brand/30`, `bg-brand/15`, icono `text-brand` para reforzar el tono corporativo (`frontend/src/pages/Facturas.jsx:99`).
- Proforma: variaciones índigo (`border-indigo-400/40`, `text-indigo-300`) para diferenciar estados provisional-estructurados sin romper la armonía fría (`frontend/src/pages/Facturas.jsx:113`).
- Rectificativa: gamma ámbar (`border-amber-300/40`, `text-amber-300`) que alerta suavemente sobre cambios/correcciones (`frontend/src/pages/Facturas.jsx:129`).
- Fallback genérico: neutros pizarra (`border-slate-500/40`) garantizan legibilidad en tipos no contemplados (`frontend/src/pages/Facturas.jsx:150`).

## Tipografía y jerarquía
- Fuente global: Inter y fallback del sistema (`frontend/tailwind.config.mjs:12`). Se aplica automáticamente al body en modo oscuro (`frontend/src/index.css:14`).
- Título de página: `text-2xl font-semibold tracking-tight text-white/90` para jerarquía inmediata de sección (`frontend/src/pages/Facturas.jsx:478`).
- Subtítulo de listado: `text-xl font-semibold` alineado con anchura del bloque (`frontend/src/pages/Facturas.jsx:497`).
- Texto de datos: pesos regulares en `text-gray-300` con `truncate` para conservar limpieza en columnas estrechas (`frontend/src/pages/Facturas.jsx:669`).

## Layout y espaciado
- Contenedor global: `main` centrado a `max-w-6xl`, padding `p-4` y separación vertical `space-y-8`, asegurando respiración homogénea en desktop y tablet (`frontend/src/pages/Facturas.jsx:477`).
- Área de contenido: bloques secundarios limitados a `max-w-4xl` para minimizar el ancho de lectura, con `space-y-3` entre encabezado y colección (`frontend/src/pages/Facturas.jsx:495`).
- Cards: DataCard incorpora padding responsivo (`p-2 sm:p-3 md:p-4`) y ajustes específicos `!px-4 !py-3` en Facturas para equilibrar densidad de datos (`frontend/src/components/DataCard.jsx:47`, `frontend/src/pages/Facturas.jsx:655`).
- Grid responsivo: en desktop se despliega malla `md:grid-cols-[minmax(0,2.4fr)_...]` que reparte número/cliente, estado, fecha, total y acciones de forma estable (`frontend/src/pages/Facturas.jsx:662`).

## Componentes clave

### Botón de acción principal
- `NeoGradientButton` ofrece gradiente 90° del azul oscuro al turquesa claro, borde translúcido y partículas luminosas para enfatizar el CTA (`frontend/src/components/NeoGradientButton.jsx:13`).
- Tamaños adaptativos: padding y radio incrementan en `768px` y `1024px`, garantizando proporción adecuada en tablet y desktop (`frontend/src/components/NeoGradientButton.jsx:26`).
- Estados: animación de hover que desplaza highlight, refuerza sombra y activa efectos `PCB`/pulsos energéticos; se fuerza estado "hover" al montar la vista para atraer la atención inicial (`frontend/src/pages/Facturas.jsx:482`, `frontend/src/pages/Facturas.jsx:640`).

### Tarjetas de listado
- Base DataCard con fondo `bg-gray-800`, borde `border-gray-700` y sombra profunda para simular tarjetas de cristal oscuro (`frontend/src/components/DataCard.jsx:47`).
- Fondo texturizado y halo inferior definidos en `.niox-data-card` añaden profundidad sin recargar (`frontend/src/index.css:42`).
- Interacciones: hover incrementa escala a `1.02`, ilumina borde y suaviza fondo manteniendo accesibilidad para usuarios con `prefers-reduced-motion` (`frontend/src/components/DataCard.jsx:47`).

### Identificadores de tipo documental
- Insignias circulares con borde, glow y sombra personalizable según `getInvoiceTypeMeta`, incluyendo iconografía lineal de 20px (`frontend/src/pages/Facturas.jsx:99`).
- El pseudo-elemento adicional aporta brillo difuso (`blur-[12px]`) sin interferir con el contenido (`frontend/src/pages/Facturas.jsx:664`).

### Estado de pago
- Toggle accesible `sr-only` con desplazamiento del thumb de `0.15rem` a `1.5rem`, cambio de borde y fondo cuando la factura pasa a pagada (`frontend/src/pages/Facturas.jsx:680`).
- Etiqueta en `text-[11px] uppercase tracking-wide` reforzada con color corporativo en estado positivo (`frontend/src/pages/Facturas.jsx:697`).

### Menús contextuales y acciones
- Botones flotantes redondos (`h-9 w-9`) con borde `border-gray-700/70` y foco `ring-brand/60` aseguran consistencia entre preview y menú (`frontend/src/pages/Facturas.jsx:706`).
- Dropdown semitransparente `bg-gray-900/95` con blur y sombra cian para reforzar la sensación de vidrio (`frontend/src/pages/Facturas.jsx:720`).
- Acciones alternan colores de estado: azul corporativo para PDF/duplicar, índigo para editar proformas y rojo/verde para operaciones críticas (`frontend/src/pages/Facturas.jsx:732`).

### Paginación
- Botones anteriores/siguientes con fondo `bg-brand` o `bg-brand/20`, transición de escala y desactivación con `opacity-40` (`frontend/src/components/Pagination.jsx:16`).
- Números activos resaltados con sombra proyectada en tono turquesa (`frontend/src/components/Pagination.jsx:32`).

### Modales y superposiciones
- Overlay de previsualización en `bg-black/60` con diálogo `dark:bg-gray-900` y borde inferior tenue (`frontend/src/pages/Facturas.jsx:818`).
- Selector de método de pago emplea tarjeta compacta `bg-gray-900` + `border-gray-700`, inputs con `focus:ring-brand` para coherencia de interacción (`frontend/src/pages/Facturas.jsx:884`).
- `CreateInvoiceModal` hereda parámetros de modo (`mode="edit" | "create"`) manteniendo escalabilidad sin duplicar estilos (`frontend/src/pages/Facturas.jsx:860`).

## Animaciones e interacciones
- Framer Motion gestiona fades y slides con duración base (`MOTION`) y stagger sobre las tarjetas para sensación progresiva (`frontend/src/pages/Facturas.jsx:504`).
- Las animaciones respetan `useReducedMotion` tanto en cards como en overlay (`frontend/src/pages/Facturas.jsx:474`, `frontend/src/components/DataCard.jsx:17`).
- El botón principal sincroniza su estado de hover con la duración del stagger (`frontend/src/pages/Facturas.jsx:640`).

## Accesibilidad y buenas prácticas
- El body fuerza `color-scheme: dark` y mantiene contraste AA entre fondo `gray-950` y textos `gray-100` (`frontend/src/index.css:6`).
- Controles interactivos incluyen `sr-only`, `aria-label` y `aria-expanded` para lectores de pantalla (`frontend/src/pages/Facturas.jsx:684`, `frontend/src/pages/Facturas.jsx:710`).
- El menú contextual se cierra con clic exterior o tecla Escape, evitando estados atrapados (`frontend/src/pages/Facturas.jsx:193`).
- `prefers-reduced-motion` desactiva animaciones globales para usuarios sensibles (`frontend/src/index.css:36`).

## Consideraciones de extensión
- Mantener el rango cromático frío (turquesas, azules profundos) para nuevas acciones; reservar amarillos/ámbar únicamente para estados de advertencia.
- Al añadir variantes de documento, extender `metaMap` reutilizando combinaciones de borde/glow/shadow para garantizar uniformidad (`frontend/src/pages/Facturas.jsx:96`).
- Cualquier nuevo CTA debe reutilizar `NeoGradientButton` o derivar su gradiente/animaciones para preservar la firma visual.
