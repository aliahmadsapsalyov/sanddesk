-- Sand Desk: persistencia cloud por cuenta de taller (Supabase Postgres)
-- Ejecuta todo este archivo en Supabase > SQL Editor.
-- Cada cuenta autenticada solo puede leer/escribir su propia fila.

create table if not exists public.sanddesk_workspace_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default jsonb_build_object(
    'clients', '[]'::jsonb,
    'repairs', '[]'::jsonb,
    'inventory', '[]'::jsonb,
    'appointments', '[]'::jsonb,
    'movements', '[]'::jsonb,
    'companies', '[]'::jsonb,
    'issuerProfile', 'null'::jsonb,
    'invoices', '[]'::jsonb
  ),
  updated_at timestamptz not null default now()
);

alter table public.sanddesk_workspace_data enable row level security;

grant select, insert, update, delete on public.sanddesk_workspace_data to authenticated;

drop policy if exists "Taller: leer su propio espacio" on public.sanddesk_workspace_data;
drop policy if exists "Taller: crear su propio espacio" on public.sanddesk_workspace_data;
drop policy if exists "Taller: actualizar su propio espacio" on public.sanddesk_workspace_data;
drop policy if exists "Taller: borrar su propio espacio" on public.sanddesk_workspace_data;

create policy "Taller: leer su propio espacio"
  on public.sanddesk_workspace_data for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Taller: crear su propio espacio"
  on public.sanddesk_workspace_data for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Taller: actualizar su propio espacio"
  on public.sanddesk_workspace_data for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Taller: borrar su propio espacio"
  on public.sanddesk_workspace_data for delete to authenticated
  using ((select auth.uid()) = user_id);

create index if not exists sanddesk_workspace_updated_at_idx
  on public.sanddesk_workspace_data (updated_at desc);
