-- Catia Rodrigues Nails: vários serviços no mesmo agendamento.
-- Rodar no SQL Editor depois do 0001_init.sql.

alter table appointments add column if not exists service_label text;

create table if not exists appointment_services (
  appointment_id uuid not null references appointments on delete cascade,
  service_id uuid not null references services,
  price numeric(10,2) not null,
  duration_min int not null,
  primary key (appointment_id, service_id)
);

alter table appointment_services enable row level security;
create policy "owner all" on appointment_services for all using (is_owner());
create policy "client reads own" on appointment_services for select using (
  exists (select 1 from appointments a where a.id = appointment_id and a.client_id = auth.uid())
);

-- horários livres para uma duração total (soma dos serviços escolhidos)
create or replace function get_slots_for_duration(p_professional uuid, p_date date, p_duration int)
returns setof timestamptz
language plpgsql stable security definer set search_path = public as $$
declare
  s settings;
  wh record;
  slot timestamptz;
  tz text := 'America/Sao_Paulo';
begin
  if p_duration is null or p_duration <= 0 then return; end if;
  select * into s from settings where id = 1;
  if p_date > (now() at time zone tz)::date + s.max_days_ahead then return; end if;

  for wh in
    select start_time, end_time from working_hours
    where professional_id = p_professional and weekday = extract(dow from p_date)
  loop
    slot := (p_date + wh.start_time) at time zone tz;
    while slot + make_interval(mins => p_duration) <= (p_date + wh.end_time) at time zone tz loop
      if slot >= now() + make_interval(hours => s.min_notice_hours)
        and not exists (
          select 1 from appointments a
          where a.professional_id = p_professional
            and a.status in ('confirmed', 'completed')
            and tstzrange(a.starts_at, a.ends_at) && tstzrange(slot, slot + make_interval(mins => p_duration)))
        and not exists (
          select 1 from time_off t
          where t.professional_id = p_professional
            and tstzrange(t.starts_at, t.ends_at) && tstzrange(slot, slot + make_interval(mins => p_duration)))
      then
        return next slot;
      end if;
      slot := slot + make_interval(mins => s.slot_step_min);
    end loop;
  end loop;
end $$;

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

  select sum(duration_min), sum(price), string_agg(name, ' + ' order by sort), (array_agg(id order by sort))[1]
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
  select new_id, id, price, duration_min from services where id = any(p_services);

  return new_id;
end $$;

grant execute on function get_slots_for_duration, book_appointment_multi to anon, authenticated;
