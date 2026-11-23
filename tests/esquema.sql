create schema if not exists nec;

create table nec.leads (
  id uuid primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  origen text not null check (origen in ('contacto', 'empezar')),
  servicio text,
  nombre text not null,
  email text not null,
  telefono text,
  mensaje text,
  datos jsonb not null default '{}',
  consentimiento boolean not null,
  consentimiento_version text,
  pagina text,
  utm jsonb,
  ip_hash text,
  user_agent text,
  estado text not null default 'nuevo' check (estado in ('nuevo', 'contactado', 'en_curso', 'ganado', 'perdido', 'spam')),
  notas text,
  borrado_en timestamptz
);

create table nec.lead_eventos (
  id bigserial primary key,
  lead_id uuid not null references nec.leads (id),
  created_at timestamptz not null default now(),
  actor text,
  accion text not null,
  detalle jsonb
);

create table nec.accesos_panel (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  usuario text,
  resultado text not null check (resultado in ('ok', 'fallo', 'bloqueado')),
  ip_hash text,
  user_agent text
);
