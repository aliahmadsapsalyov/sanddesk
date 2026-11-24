# Sand Desk · Arquitectura SaaS (cuenta única por taller)

## Separación de responsabilidades

- **GitHub:** código fuente y cambios de producto.
- **Vercel:** despliega el código de GitHub.
- **Supabase Auth:** identidad y sesión del propietario del taller.
- **Supabase PostgreSQL:** datos operativos persistentes.
- **Supabase Storage:** PDFs y documentos privados.

Los datos de clientes nunca se guardan en GitHub ni forman parte de un deploy de Vercel.

## Decisión de producto

- Una cuenta de usuario por taller (sin gestión de empleados en esta primera versión).
- Al registrarse, un trigger crea un taller vacío asociado a `auth.users.id`.
- Cada taller empieza con la base de datos limpia: no se importan los datos ficticios de la demo.
- Las tablas operativas llevan `workshop_id`; RLS limita el acceso al taller del usuario autenticado.
- Los documentos de facturas guardan una instantánea fiscal del emisor A y del destinatario B para que cambios futuros en las fichas no alteren documentos ya emitidos.

## Tablas

`workshops`, `issuer_profiles`, `customers`, `repairs`, `recipient_companies`, `invoice_counters`, `invoices`, `invoice_lines`, `inventory_items`, `stock_movements`, `appointments`, `tickets`, `audit_events`.

Las reparaciones y clientes están normalizados y tienen índices para búsqueda, filtros y paginación. El módulo `js/supabase-data.js` expone consultas paginadas (por defecto 20 elementos) e historial por cliente. El stock se modifica mediante una función transaccional RPC.

## Demo y datos de ejemplo

`demo.html` y `js/demo.js` conservan el conjunto de datos ficticios para enseñar el producto. Se mantiene como **demo local**, no como espacio de un taller real. No se importan esos ejemplos al registrarse en Supabase. Los nuevos talleres comienzan vacíos.

## Estado de integración

El esquema SQL, el alta Auth (una cuenta → un taller) y la capa de acceso a datos están preparados en este proyecto. La demo visual existente se mantiene intencionadamente sin reescribir sus pantallas ni su estado de ejemplo. Antes de aceptar un cliente de pago todavía hay que conectar sus formularios y vistas a `SandDeskData` (en vez de al estado local), probar cada flujo con dos cuentas distintas y activar las copias de seguridad del proyecto Supabase.

## Seguridad y operaciones

- Solo usar la publishable/anon key en el navegador; nunca `service_role`.
- No desactivar RLS.
- Configurar la URL de producción en Supabase Auth → URL Configuration.
- Activar confirmación de email y recuperación de contraseña.
- Guardar los ficheros en el bucket privado `sanddesk-private`, con rutas que comiencen por el UUID del taller.
- Configurar backups/PITR según el plan y probar una restauración.
- No considerar el módulo de facturación una solución fiscal conforme hasta implementar y validar los requisitos normativos aplicables.
