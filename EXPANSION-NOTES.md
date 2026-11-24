# Sand Desk — expansión multi-sector

## Páginas
- `index.html`: landing general de gestión de negocio.
- `moviles.html`: landing vertical para talleres de móviles; conserva su estructura y experiencia.
- `demo.html`: dashboard demo de móviles, con su lógica y sus datos locales existentes; el perfil visible aparece como `Admin`.
- `mecanico.html`: landing mecánica con la misma estructura, ritmo visual y sistema de animaciones que `moviles.html`, manteniendo la composición de cristales 3D y la identidad azul noche.
- `demo-mecanico.html`: dashboard independiente para taller mecánico, con módulos de órdenes de trabajo, vehículos, clientes, recambios, citas, facturación e informes. Incluye turismos y furgonetas, matrículas, kilometraje, combustible y estados de reparación.

## Interacciones
- La demo mecánica permite cambiar de sección, buscar y filtrar órdenes, vehículos, clientes y recambios, crear órdenes de trabajo, añadir citas y registrar recambios.
- Los cambios de la demo mecánica se guardan en el navegador mediante almacenamiento local, con una clave separada de la demo de móviles.
- El dashboard mecánico es independiente de la landing y conserva su propia estructura, datos locales y perfil `Admin`.
- La demo móvil sigue usando `demo.html` y conserva su lógica y su conjunto de datos de ejemplo.
- En la landing mecánica, los CTA de demo llevan a `demo-mecanico.html`.

## Datos y nube
- Ambas demos funcionan con datos ficticios/locales. No se activa Supabase ni se cambia la arquitectura cloud.
- La demo mecánica usa `sanddesk_garage_demo_v1` en `localStorage`, independiente de `sanddesk_interactive_demo_v1` de la demo móvil.

## Publicación
Sube el contenido completo de esta carpeta a la raíz del repositorio GitHub conectado a Vercel. Las rutas son `/moviles.html`, `/mecanico.html`, `/demo.html` y `/demo-mecanico.html`.


## v10 — navegación, separación de sectores y tema mecánico
- Inicio desde las landings sectoriales vuelve a `index.html#inicio`.
- El showcase de tres experiencias permanece solo en la landing principal; se elimina de `moviles.html`.
- La landing principal adopta el hero con vídeo CloudFront indicado y tipografías Manrope, Cabin, Instrument Serif e Inter.
- El taller mecánico pasa a una identidad midnight navy / azul acero tanto en la landing como en la demo.
- El dashboard mecánico enlaza su marca directamente a Inicio; la demo móvil mantiene su propio dashboard.

## v12 — Continuidad visual de la landing principal

- Se retiró la imagen remota `dash-glow` que dibujaba un rectángulo oscuro detrás del dashboard. El halo se genera ahora con pseudo-elementos y gradientes CSS, sin backing rectangular ni dependencia de una imagen externa.
- El vídeo de la landing principal se prolonga más allá del hero y se desvanece gradualmente detrás del dashboard para evitar un corte horizontal brusco.
- Se reforzaron los gradientes ambientales violetas a lo largo de la landing principal, incluyendo dashboard, precios, showcase, contacto y footer, con ajustes para móvil.
- Se corrigieron destinos internos inexistentes: “Servicios” de la landing principal ahora lleva a `#soluciones`; los enlaces de “Funciones” e “Inventario” de la landing móvil vuelven al dashboard de su página.
- No se modificaron `demo.html`, `moviles.html`, `demo-mecanico.html` ni `mecanico.html`.


## v13 — Landing mecánica alineada con la landing de móviles

- `mecanico.html` adopta la misma estructura de landing que `moviles.html`: navegación tipo pill, hero centrado, sección visual principal, tarjetas de funciones, precios, contacto y footer.
- Se trasladan los efectos de entrada del hero y navegación, aparición progresiva al hacer scroll, hover de tarjetas, partículas/cometas de los planes y animación de cifras.
- La sección visual principal conserva los paneles de cristal facetado con Three.js, reflejos iridiscentes, inclinación con el cursor y elevación al pasar el ratón.
- La identidad mecánica permanece en negro y azul oscuro/azul acero; los brillos y acentos violetas del tema móvil se sustituyen por tonos azules en esta landing.
- Navegación móvil con menú desplegable accesible y enlaces a la landing principal, landing móvil y demo mecánica.
- Los CTA de esta landing llevan exclusivamente a `demo-mecanico.html`.
- No se modifican `moviles.html`, `demo.html` ni `demo-mecanico.html`. El dashboard de mecánica sigue siendo independiente.

## v14 — Refresh del dashboard mecánico

- Se ha actualizado únicamente `demo-mecanico.html` en su presentación: bloque de ingresos y estado al principio, indicadores KPI debajo, y actividad/agenda después.
- Se han añadido `css/mechanic-demo-enhanced.css` y `js/mechanic-demo-effects.js` para superficies glass con más blur, luces ambientales, reflejo reactivo al cursor, reveal on-scroll, animación de barras y microinteracciones.
- Los ingresos usan un acento verde sutil; el resto del panel conserva la paleta azul noche / acero.
- `js/mechanic-demo.js` solo añade la sincronización del importe principal de ingresos con el valor KPI. La lógica de órdenes, vehículos, clientes, inventario, citas y facturas se conserva.
- `demo.html`, `moviles.html`, `mecanico.html`, `index.html` y los demás recursos sectoriales no se han modificado en esta actualización.
- Se respeta `prefers-reduced-motion` y se limita el overflow horizontal en móvil.


## v15 — dashboard mecánico ampliado y más nítido
- Aumentado el ancho total disponible del dashboard y ampliada la columna lateral para aprovechar monitores grandes.
- Incrementados tamaños de títulos, cifras, gráficos, KPIs, tablas y controles para mejorar la lectura.
- Reducido el desenfoque del fondo de los paneles Liquid Glass; se conservan transparencia, reflejos, bordes y sombras.
- Eliminado el filtro blur de las animaciones de entrada y de revelado para que textos y gráficos no aparezcan borrosos.
- Ajustados los tamaños para desktop, tablet y móvil.
- Cambios limitados a `demo-mecanico.html` y `css/mechanic-demo-enhanced.css`; no se han modificado los dashboards ni las landings restantes.


## v16 — logotipos de marcas en la demo mecánica
- Añadidos los logotipos proporcionados de Audi, Mercedes-Benz, Mitsubishi, Fiat, Peugeot, BMW y Kia en `assets/brands/`.
- Añadida una sección de marcas en el resumen de `demo-mecanico.html`.
- Integrados los logotipos correspondientes en las filas de vehículos y órdenes cuando la marca coincide; las demás conservan su icono genérico.
- No se han modificado `demo.html`, `moviles.html`, `mecanico.html` ni otras landings.


## v17 — Escala ampliada del dashboard mecánico

- Añadida `css/mechanic-demo-scale.css`, cargada únicamente en `demo-mecanico.html`.
- Se amplió tipografía, espaciado, tarjetas de vehículos, tablas, filas, filtros, controles, fichas y formularios de la zona central.
- La barra lateral se dejó deliberadamente intacta.
- Se mantuvo scroll horizontal contenido dentro de tablas para pantallas estrechas y se ajustaron los tamaños en tablet/móvil.
- Sin cambios en el dashboard móvil, las landings ni el dashboard móvil de reparaciones.


## v18 — Conversion landing and sector capability sections
- Main landing: horizontal technology ticker, manual-vs-dashboard comparison with animated falling notifications, pain-point cards, interactive indicative savings calculator, FAQ, audit CTA and audit modal.
- Audit form fields: name, email, phone, company, optional website, team size and optional goal; opens WhatsApp to +34 642 008 801 with the completed details prefilled (user must review/send).
- Added a hover shimmer to the main navbar Auditoría action.
- Mechanic and mobile landings: updated sector-specific capability mosaics in the dark glass Sand Desk theme.
- No demo dashboard files were edited in this pass.
