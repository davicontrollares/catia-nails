-- Bela Flor Nails: remove os dados de exemplo antes de ir para produção.
-- Rodar uma vez no SQL Editor. NÃO apaga agendamentos, clientes, serviços nem horários.

delete from expenses
where (category, description) in (
  ('Aluguel', 'Aluguel do studio'),
  ('Produtos', 'Géis, fibras e esmaltes'),
  ('Marketing', 'Impulsionamento Instagram')
);
