# Sand Desk · Landing + demo + base SaaS Supabase

Este proyecto conserva la landing y la demo visual con sus ejemplos ficticios. Además incorpora una arquitectura relacional preparada para la futura versión comercial con Supabase.

## Archivos

- `index.html`: landing pública.
- `demo.html`: demo interactiva con datos ficticios locales; se conserva como escaparate y no se migra a la base de datos.
- `css/` y `assets/`: estilos y recursos.
- `js/demo.js`: lógica actual de la demo y sus datos de ejemplo (no se ha reemplazado por datos vacíos).
- `supabase-schema.sql`: esquema relacional para una base de datos nueva y vacía.
- `js/supabase-config.js`: configuración pública vacía.
- `js/supabase-auth.js`: funciones de alta, inicio/cierre de sesión y lectura del taller.
- `js/supabase-data.js`: capa de consultas CRUD, búsquedas paginadas, historial, stock y documentos.
- `DATA-ARCHITECTURE.md`: decisiones y estado de integración.

## Arquitectura

GitHub almacena código. Vercel publica el código. Supabase almacena los datos de cada taller. Un nuevo deploy no borra PostgreSQL ni los ficheros del bucket.

La primera versión comercial usa **una cuenta por taller**. El trigger SQL crea un taller vacío al registrarse un usuario nuevo. No se insertan clientes ni reparaciones de ejemplo.

## Preparar Supabase

1. Crea un proyecto nuevo en Supabase.
2. Abre SQL Editor y ejecuta `supabase-schema.sql` completo.
3. En Project Settings → API, copia Project URL y Publishable key (o anon key legacy).
4. Pega esos dos valores en `js/supabase-config.js`. No uses nunca la `service_role` key en el frontend.
5. En Authentication → URL Configuration, añade el dominio de Vercel a Site URL y Redirect URLs.
6. Configura el proveedor Email, confirmación de correo y recuperación de contraseña.
7. Configura backups y prueba una restauración antes de guardar datos de clientes reales.

## Importante: demo vs producto cloud

La demo `demo.html` conserva su modo local y sus datos ficticios para que puedas enseñarla sin crear una cuenta ni vaciar los ejemplos. Los módulos `supabase-auth.js` y `supabase-data.js` son la base de integración cloud. **La demo actual no se debe presentar todavía como un dashboard comercial sincronizado con Supabase**: falta conectar cada formulario, listado, edición, impresión y flujo de facturación a la capa relacional y hacer pruebas de aislamiento. La arquitectura no importa automáticamente los datos de ejemplo.

## Búsqueda de grandes historiales

`SandDeskData.listRepairs()` y `listCustomers()` consultan páginas de 20 registros por defecto, devuelven el total y aceptan búsqueda/filtros. `customerHistory()` consulta el historial de un cliente sin descargar todos los tickets del taller.

## Seguridad

- Todas las tablas operativas tienen RLS.
- El taller se resuelve desde `auth.uid()`; el navegador no puede escoger libremente el `workshop_id` de otra tienda.
- El bucket de documentos es privado y limita el acceso a la carpeta UUID del taller.
- La clave pública es apta para frontend con RLS correctamente aplicada. La `service_role` es secreta.

## Publicar en Vercel

Sube el contenido de esta carpeta a la raíz del repositorio, incluyendo `css/`, `js/` y `assets/`. Vercel despliega el código; Supabase permanece independiente. No subas copias de bases de datos ni datos de clientes a GitHub.

## Facturación

El esquema conserva snapshots del emisor A y del destinatario B, líneas, bases imponibles e IVA. Esto no convierte por sí solo el módulo en un sistema fiscal conforme: antes de emitir facturas oficiales habrá que implementar y validar los requisitos normativos y técnicos aplicables.
