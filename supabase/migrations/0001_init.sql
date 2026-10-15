-- Bela Flor Nails: schema inicial
-- Rodar no Supabase SQL Editor (ou `supabase db push`).

create extension if not exists btree_gist;

-- ---------------------------------------------------------------- perfis
create type user_role as enum ('owner', 'staff', 'client');

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  phone text,
  role user_role not null default 'client',
  created_at timestamptz not null default now()
);

create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone');
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

create or replace function is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'owner');
$$;

create or replace function my_role() returns user_role
language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid();
$$;

-- ---------------------------------------------------------------- negócio
create table settings (
  id int primary key default 1 check (id = 1),
  business_name text not null,
  tagline text,
  address text,
  whatsapp text,
  instagram text,
  facebook text,
  min_notice_hours int not null default 2,
  max_days_ahead int not null default 45,
  cancel_notice_hours int not null default 12,
  slot_step_min int not null default 30,
  commission_default numeric(5,2) not null default 0
);

create table professionals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bio text,
  photo_url text,
  commission_pct numeric(5,2) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text not null default 'Unhas',
  duration_min int not null check (duration_min > 0),
  price numeric(10,2) not null check (price >= 0),
  active boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table professional_services (
  professional_id uuid references professionals on delete cascade,
  service_id uuid references services on delete cascade,
  primary key (professional_id, service_id)
);

-- weekday: 0 = domingo ... 6 = sábado
create table working_hours (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references professionals on delete cascade,
  weekday int not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null check (end_time > start_time)
);

create table time_off (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references professionals on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null check (ends_at > starts_at),
  reason text
);

-- ---------------------------------------------------------------- agenda
create type appointment_status as enum ('confirmed', 'completed', 'cancelled', 'no_show');
create type payment_method as enum ('pix', 'cash', 'credit', 'debit');

create table appointments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references profiles on delete set null,
  client_name text not null,
  client_phone text not null,
  client_email text,
  professional_id uuid not null references professionals,
  service_id uuid not null references services,
  starts_at timestamptz not null,
  ends_at timestamptz not null check (ends_at > starts_at),
  status appointment_status not null default 'confirmed',
  price numeric(10,2) not null,
  payment_method payment_method,
  notes text,
  created_at timestamptz not null default now(),
  -- impede dois atendimentos sobrepostos para a mesma profissional
  constraint no_overlap exclude using gist (
    professional_id with =,
    tstzrange(starts_at, ends_at) with &&
  ) where (status in ('confirmed', 'completed'))
);
create index on appointments (starts_at);

create table expenses (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  description text,
  amount numeric(10,2) not null check (amount >= 0),
  spent_on date not null default current_date,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- RLS
alter table profiles enable row level security;
alter table settings enable row level security;
alter table professionals enable row level security;
alter table services enable row level security;
alter table professional_services enable row level security;
alter table working_hours enable row level security;
alter table time_off enable row level security;
alter table appointments enable row level security;
alter table expenses enable row level security;

create policy "own profile" on profiles for select using (id = auth.uid() or is_owner());
create policy "update own profile" on profiles for update using (id = auth.uid()) with check (role = my_role());
create policy "owner manages profiles" on profiles for all using (is_owner());

-- catálogo público
create policy "public read" on settings for select using (true);
create policy "public read" on professionals for select using (active or is_owner());
create policy "public read" on services for select using (active or is_owner());
create policy "public read" on professional_services for select using (true);
create policy "public read" on working_hours for select using (true);

create policy "owner write" on settings for all using (is_owner());
create policy "owner write" on professionals for all using (is_owner());
create policy "owner write" on services for all using (is_owner());
create policy "owner write" on professional_services for all using (is_owner());
create policy "owner write" on working_hours for all using (is_owner());
create policy "owner all" on time_off for all using (is_owner());
create policy "owner all" on expenses for all using (is_owner());

create policy "client reads own" on appointments for select using (client_id = auth.uid() or is_owner());
create policy "owner all" on appointments for all using (is_owner());
-- clientes agendam/cancelam via RPC (book_appointment / cancel_appointment)

-- ---------------------------------------------------------------- horários livres
create or replace function get_available_slots(p_service uuid, p_professional uuid, p_date date)
returns setof timestamptz
language plpgsql stable security definer set search_path = public as $$
declare
  s settings;
  dur int;
  wh record;
  slot timestamptz;
  tz text := 'America/Sao_Paulo';
begin
  select * into s from settings where id = 1;
  select duration_min into dur from services where id = p_service and active;
  if dur is null then return; end if;
  if p_date > (now() at time zone tz)::date + s.max_days_ahead then return; end if;

  for wh in
    select start_time, end_time from working_hours
    where professional_id = p_professional and weekday = extract(dow from p_date)
  loop
    slot := (p_date + wh.start_time) at time zone tz;
    while slot + make_interval(mins => dur) <= (p_date + wh.end_time) at time zone tz loop
      if slot >= now() + make_interval(hours => s.min_notice_hours)
        and not exists (
          select 1 from appointments a
          where a.professional_id = p_professional
            and a.status in ('confirmed', 'completed')
            and tstzrange(a.starts_at, a.ends_at) && tstzrange(slot, slot + make_interval(mins => dur)))
        and not exists (
          select 1 from time_off t
          where t.professional_id = p_professional
            and tstzrange(t.starts_at, t.ends_at) && tstzrange(slot, slot + make_interval(mins => dur)))
      then
        return next slot;
      end if;
      slot := slot + make_interval(mins => s.slot_step_min);
    end loop;
  end loop;
end $$;

create or replace function book_appointment(
  p_service uuid, p_professional uuid, p_starts_at timestamptz,
  p_name text, p_phone text, p_notes text default null, p_email text default null
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  svc services;
  new_id uuid;
begin
  select * into svc from services where id = p_service and active;
  if svc.id is null then raise exception 'Serviço indisponível'; end if;
  if coalesce(trim(p_name), '') = '' or coalesce(trim(p_phone), '') = '' then
    raise exception 'Nome e telefone são obrigatórios';
  end if;
  if not exists (
    select 1 from get_available_slots(p_service, p_professional, (p_starts_at at time zone 'America/Sao_Paulo')::date) t
    where t = p_starts_at
  ) then
    raise exception 'Horário não está mais disponível';
  end if;

  insert into appointments (client_id, client_name, client_phone, client_email, professional_id, service_id, starts_at, ends_at, price, notes)
  values (auth.uid(), trim(p_name), trim(p_phone), nullif(trim(p_email), ''), p_professional, p_service,
          p_starts_at, p_starts_at + make_interval(mins => svc.duration_min), svc.price, p_notes)
  returning id into new_id;
  return new_id;
end $$;

create or replace function cancel_appointment(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  a appointments;
  hrs int;
begin
  select * into a from appointments where id = p_id and client_id = auth.uid();
  if a.id is null then raise exception 'Agendamento não encontrado'; end if;
  select cancel_notice_hours into hrs from settings where id = 1;
  if a.starts_at < now() + make_interval(hours => hrs) then
    raise exception 'Cancelamento precisa de % horas de antecedência', hrs;
  end if;
  update appointments set status = 'cancelled' where id = p_id;
end $$;

grant execute on function get_available_slots, book_appointment to anon, authenticated;
grant execute on function cancel_appointment to authenticated;

-- realtime na agenda
alter publication supabase_realtime add table appointments;
