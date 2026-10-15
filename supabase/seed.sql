-- Dados de exemplo: Bela Flor Nails (preços aproximados, ajustar no painel)

insert into settings (business_name, tagline, address, whatsapp, instagram, facebook)
values (
  'Bela Flor Nails',
  'Studio de unhas em gel e fibra de vidro',
  'Av. Exemplo, 100 - Centro, São José do Rio Preto - SP',
  '5517999990000',
  null,
  null
) on conflict (id) do nothing;

with p as (
  insert into professionals (id, name, bio, commission_pct)
  values ('00000000-0000-0000-0000-000000000001', 'Bela Flor',
          'Especialista em alongamento em fibra de vidro e banho em gel.', 0)
  returning id
), s as (
  insert into services (name, description, category, duration_min, price, sort) values
    ('Alongamento Fibra de Vidro', 'Alongamento com aparência natural, acabamento fino e alta durabilidade.', 'Alongamento', 150, 220, 1),
    ('Manutenção de Alongamento', 'Manutenção a cada 20 a 25 dias para manter o alongamento perfeito.', 'Alongamento', 90, 130, 2),
    ('Banho em Gel', 'Camada de gel sobre a unha natural para fortalecer e dar brilho.', 'Gel', 90, 120, 3),
    ('Esmaltação em Gel', 'Esmaltação que dura semanas sem descascar.', 'Gel', 60, 70, 4),
    ('Mão e Pé', 'Cutilagem e esmaltação tradicional.', 'Manicure', 90, 70, 5),
    ('Massagem Relaxante', 'Massagem relaxante para o corpo.', 'Estética', 60, 100, 6)
  returning id
)
insert into professional_services select p.id, s.id from p, s;

-- terça a sábado, 08h às 18h com almoço 12h às 13h
insert into working_hours (professional_id, weekday, start_time, end_time)
select '00000000-0000-0000-0000-000000000001', d, t.s, t.e
from generate_series(2, 6) d,
     (values ('08:00'::time, '12:00'::time), ('13:00'::time, '18:00'::time)) t(s, e);

insert into expenses (category, description, amount, spent_on) values
  ('Aluguel', 'Aluguel do studio', 1200, date_trunc('month', current_date)::date),
  ('Produtos', 'Géis, fibras e esmaltes', 480, current_date - 10),
  ('Marketing', 'Impulsionamento Instagram', 150, current_date - 5);

-- Depois de criar sua conta no app, rode para virar dona:
-- update profiles set role = 'owner' where id = (select id from auth.users where email = 'SEU-EMAIL');
