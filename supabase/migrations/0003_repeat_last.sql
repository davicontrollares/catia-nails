-- Catia Rodrigues Nails: repetir o último atendimento.
-- A cliente informa e-mail e telefone; só devolve os serviços e o nome,
-- e só quando os dois batem com o mesmo agendamento.

create or replace function last_booking(p_email text, p_phone text)
returns table (client_name text, service_ids uuid[])
language sql stable security definer set search_path = public as $$
  with last as (
    select a.id, a.client_name
    from appointments a
    where lower(a.client_email) = lower(trim(p_email))
      and regexp_replace(a.client_phone, '\D', '', 'g') = regexp_replace(p_phone, '\D', '', 'g')
      and a.status in ('confirmed', 'completed')
    order by a.starts_at desc
    limit 1
  )
  select last.client_name,
         coalesce(
           (select array_agg(s.service_id) from appointment_services s join services sv on sv.id = s.service_id
             where s.appointment_id = last.id and sv.active),
           (select array[a.service_id] from appointments a join services sv on sv.id = a.service_id
             where a.id = last.id and sv.active)
         )
  from last;
$$;

grant execute on function last_booking to anon, authenticated;
