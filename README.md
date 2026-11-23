# Sand Desk — web + demo interactiva

Proyecto estático preparado para publicar en Vercel, sin pasos de compilación.

## Estructura

- `index.html`: landing comercial de Sand Desk, con dashboard de ejemplo y precios.
- `demo.html`: aplicación de demostración interactiva.
- `css/styles.css`: estilos de la landing, incluido el liquid glass.
- `css/demo.css`: estilos de la aplicación.
- `js/landing.js`: animaciones de la landing.
- `js/demo.js`: lógica de la demo, gestión de empresa emisora, empresas cliente y facturas de demostración.
- `assets/logo-mark.svg`: símbolo de Sand Desk.

## Probar en local

Abre `index.html` con un navegador o ejecuta un servidor estático desde esta carpeta, por ejemplo:

```bash
python -m http.server 8000
```

Después abre `http://localhost:8000`.

## Publicar en Vercel

1. Sube todos los archivos y carpetas de este proyecto a un repositorio Git.
2. Importa el repositorio en Vercel.
3. Selecciona **Other** como framework preset, sin build command.
4. Deja la raíz del proyecto como `./` y publica.

La landing estará en `/` y la demo en `/demo.html`.

## Qué funciona en la demo

- Crear clientes y guardar sus datos.
- Registrar entradas de dispositivos y generar órdenes.
- Cambiar el estado de reparación y registrar la salida/entrega.
- Abrir e imprimir comprobantes de recepción/entrega desde el navegador.
- Añadir productos al inventario y registrar entradas/salidas de stock.
- Crear citas y marcarlas como completadas.
- Consultar métricas, evolución de ingresos y estados de órdenes.
- Configurar el perfil fiscal de tu propio taller como emisor A.
- Crear fichas de empresas cliente/destinatarias B con razón social, NIF/CIF, domicilio y contacto.
- Preparar facturas de venta emitidas por A a B y vinculadas a una reparación.
- Guardar una copia de los datos fiscales de emisor y destinatario en cada factura.
- Calcular base imponible, tipo de IVA, cuota y total, tanto con importe IVA incluido como con IVA añadido.
- Asignar numeración demostrativa correlativa por emisor y año, y abrir una vista de impresión.
- Exportar una copia de los datos en JSON y restablecer los datos de ejemplo.

## Importante: alcance de esta versión

Esta es una demo funcional de frontend. Los cambios se guardan con `localStorage` en el navegador que la utiliza; no se sincronizan entre usuarios, ordenadores o móviles. Los datos iniciales son ficticios. Los tickets son comprobantes de servicio no fiscales. El módulo de facturación incluido es una maqueta funcional para probar el flujo, el cálculo de IVA y la impresión; NO es un sistema de facturación fiscal conforme a Veri*Factu/RRSIF y sus documentos no deben usarse como facturas oficiales. No genera registros de alta/anulación, huellas, QR fiscales ni comunicación con la AEAT. No se envían emails ni WhatsApp reales y las citas no se publican todavía en una web externa.

Para convertir Sand Desk en un SaaS multiusuario real, el siguiente paso sería conectar autenticación, base de datos y almacenamiento con un backend (por ejemplo Supabase), definir empresas/usuarios y permisos, y después integrar correo, WhatsApp y facturación según el proveedor elegido.

## Actualización visual — interfaz ampliada y cielo animado

La demo y la landing ahora comparten `js/ambient.js`, que dibuja partículas estelares en movimiento y cometas violetas de forma ligera sobre un canvas. La animación se pausa cuando la pestaña queda en segundo plano y respeta `prefers-reduced-motion`.

La interfaz de la demo también tiene una escala mayor en escritorio: sidebar, navegación, títulos, métricas, tablas, formularios, modales y paneles. Se adapta en tablet y móvil manteniendo la legibilidad.


## Persistencia de datos y actualizaciones de Vercel

La demo utiliza la clave `sanddesk_interactive_demo_v1` de `localStorage`. Publicar una nueva versión del HTML, CSS o JavaScript en Vercel no borra por sí mismo el almacenamiento local del navegador si se mantiene el mismo protocolo, dominio y puerto/origen y no se cambia la clave. Sin embargo, esos datos sólo existen en ese navegador y perfil; no están centralizados ni disponibles automáticamente en otro dispositivo. Se pueden perder si el usuario borra los datos del sitio, cambia de navegador/perfil u origen, o si se restablece la demo. Antes de usarlo con clientes reales, conectar una base de datos, autenticación por taller, permisos y copias de seguridad.

La facturación de producción debe revisarse y adaptarse a los requisitos aplicables del Reglamento de facturación (RD 1619/2012) y, cuando corresponda, del Reglamento de sistemas informáticos de facturación (RD 1007/2023 y normativa de desarrollo). La maqueta no declara cumplimiento fiscal.


## Persistencia cloud con Supabase (opcional, preparada)

La app ahora tiene un adaptador de persistencia cloud. Sin credenciales, funciona en modo local con `localStorage` igual que antes. Cuando configures Supabase, el acceso se protege con autenticación y cada cuenta obtiene su propio espacio de trabajo en la tabla `sanddesk_workspace_data`.

### Activar la nube

1. Crea un proyecto en Supabase.
2. En **SQL Editor**, ejecuta el contenido de `supabase-schema.sql`.
3. En **Project Settings → API**, copia el Project URL y la Publishable key (o la anon key legacy).
4. Pega ambos valores en `js/supabase-config.js`:
   - `url`: el Project URL `https://....supabase.co`.
   - `anonKey`: la publishable/anon key.
5. Activa Email en **Authentication → Providers**. En **Authentication → URL Configuration**, añade tu dominio de Vercel a Site URL y Redirect URLs (y `http://localhost:8000/**` para pruebas locales). Configura la confirmación de correo según cómo quieras gestionar el alta de talleres.
6. Sube los cambios a GitHub y despliega en Vercel.

**Nunca pongas una `service_role` key en el navegador ni en GitHub.** La clave pública del cliente no sustituye la seguridad: la separación de datos se aplica mediante Row Level Security (RLS) en Postgres. El SQL crea políticas para que cada usuario autenticado solo pueda acceder a su fila.

### Qué sucede al publicar cambios

- GitHub/Vercel actualizan los archivos de la aplicación.
- Supabase mantiene los registros en un servicio separado; un nuevo deploy no borra la base de datos.
- Al iniciar sesión, Sand Desk carga el JSON del espacio de trabajo del usuario autenticado.
- Los cambios de clientes, reparaciones, inventario, citas, empresas y facturas se guardan en Supabase.
- En la primera sesión de una cuenta, si el navegador tiene datos locales guardados, la app pregunta si quieres importarlos al nuevo espacio cloud.
- Si no se configura Supabase, se mantiene el modo local: los datos siguen ligados a ese navegador y origen.

### Límite de esta integración inicial

Esta primera conexión cloud guarda el estado de cada taller como un documento JSONB por usuario. Es una forma sencilla de migrar la demo existente sin reescribir sus pantallas. Para producción con varios empleados por taller, roles, auditoría, historial fiscal y operaciones concurrentes, conviene normalizar las tablas (talleres, miembros, clientes, órdenes, líneas, pagos, facturas e inventario) y usar transacciones/RPC para operaciones críticas. La numeración de factura actual sigue siendo demostrativa; la impresión no convierte el módulo en un sistema fiscal homologado ni conforme a Veri*Factu/RRSIF.


## Facturación: emisor y destinatario

El perfil `issuerProfile` contiene los datos del taller autenticado (empresa A), que actúa como vendedor/emisor. El array `companies` contiene empresas cliente (empresa B), que actúan como destinatarias/compradoras. Al crear una factura se selecciona una empresa B y una reparación; la factura guarda una instantánea de los datos de A y B para que un cambio posterior en una ficha no reescriba documentos ya creados.
