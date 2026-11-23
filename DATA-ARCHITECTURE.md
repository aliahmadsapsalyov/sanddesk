# Sand Desk — dónde viven los datos

```text
GitHub (código HTML/CSS/JS)
          │ push
          ▼
       Vercel
   publica la web
          │
          │ HTTPS + Supabase Auth
          ▼
  Supabase Postgres
  sanddesk_workspace_data
  (datos persistentes por user_id)
```

El repositorio contiene código y configuración pública del cliente, no los datos del taller. Los datos se escriben en Supabase y sobreviven a los despliegues. Cada usuario autenticado accede solo a su propio registro gracias a RLS.

No guardes la base de datos como `data.json` dentro del repositorio: un deploy de Vercel no es una base de datos persistente ni un almacenamiento de escritura. Tampoco incluyas nunca una `service_role` key en el frontend.

## Datos de facturación (rol de cada parte)

- `issuerProfile`: datos fiscales del taller autenticado. Es la empresa A, que vende y emite la factura.
- `companies`: empresas cliente/destinatarias. Son las empresas B que compran al taller A.
- `invoices`: facturas de venta. Cada factura nueva guarda una instantánea fiscal del emisor A y del destinatario B, además del identificador de reparación y desglose de base, IVA y total.

La aplicación incluye una migración de compatibilidad: los perfiles de empresa sin rol creados por la versión antigua se interpretan como perfiles emisores antiguos. El primero pasa a `issuerProfile`; las empresas antiguas adicionales se conservan en `legacyIssuerProfiles` y no se muestran por error como clientes B. Las empresas creadas en la nueva versión se guardan con `role: "invoice_recipient"`.
