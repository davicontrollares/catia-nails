-- Duração variável: o serviço pode levar de duration_min até duration_max_min.
-- A agenda reserva o máximo; ao encerrar o atendimento mais cedo, o resto do horário volta a ficar livre.
alter table services add column duration_max_min int;
alter table services add constraint services_duration_max_check
  check (duration_max_min is null or duration_max_min >= duration_min);

-- A reserva passa a usar o tempo máximo de cada serviço.
create or replace function book_appointment_multi(
  p_services uuid[], p_professional uuid, p_starts_at timestamptz,
  p_name text, p_phone text, p_email text default null, p_notes text default null
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  total_min int;
  total_price numeric(10,2);
  label text;
  first_service uuid;
  new_id uuid;
begin
  if p_services is null or array_length(p_services, 1) is null then
    raise exception 'Escolha pelo menos um serviço';
  end if;
  if coalesce(trim(p_name), '') = '' or coalesce(trim(p_phone), '') = '' then
    raise exception 'Nome e telefone são obrigatórios';
  end if;

  select sum(coalesce(duration_max_min, duration_min)), sum(price), string_agg(name, ' + ' order by sort), (array_agg(id order by sort))[1]
    into total_min, total_price, label, first_service
  from services where id = any(p_services) and active;

  if total_min is null or (select count(*) from services where id = any(p_services) and active) <> array_length(p_services, 1) then
    raise exception 'Algum serviço não está disponível';
  end if;

  if not exists (
    select 1 from get_slots_for_duration(p_professional, (p_starts_at at time zone 'America/Sao_Paulo')::date, total_min) t
    where t = p_starts_at
  ) then
    raise exception 'Horário não está mais disponível';
  end if;

  insert into appointments (client_id, client_name, client_phone, client_email, professional_id, service_id,
                            service_label, starts_at, ends_at, price, notes)
  values (auth.uid(), trim(p_name), trim(p_phone), nullif(trim(p_email), ''), p_professional, first_service,
          label, p_starts_at, p_starts_at + make_interval(mins => total_min), total_price, p_notes)
  returning id into new_id;

  insert into appointment_services (appointment_id, service_id, price, duration_min)
  select new_id, id, price, coalesce(duration_max_min, duration_min) from services where id = any(p_services);

  return new_id;
end $$;

-- Lista de espera: cliente quer um dia lotado e é avisada quando abrir uma brecha.
create table waitlist (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  client_phone text not null,
  client_email text,
  service_ids uuid[] not null default '{}',
  wanted_date date,
  notes text,
  notified_at timestamptz,
  created_at timestamptz not null default now()
);
alter table waitlist enable row level security;
create policy "owner all" on waitlist for all using (is_owner());

create or replace function join_waitlist(
  p_name text, p_phone text, p_email text default null,
  p_services uuid[] default '{}', p_date date default null, p_notes text default null
) returns uuid
language plpgsql security definer set search_path = public as $$
declare new_id uuid;
begin
  if coalesce(trim(p_name), '') = '' or coalesce(trim(p_phone), '') = '' then
    raise exception 'Nome e WhatsApp são obrigatórios';
  end if;
  insert into waitlist (client_name, client_phone, client_email, service_ids, wanted_date, notes)
  values (trim(p_name), trim(p_phone), nullif(trim(p_email), ''), coalesce(p_services, '{}'), p_date, left(p_notes, 500))
  returning id into new_id;
  return new_id;
end $$;

grant execute on function join_waitlist to anon, authenticated;
