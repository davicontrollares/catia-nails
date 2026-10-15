-- Bela Flor Nails: troca o nome do studio e da profissional no banco.
-- Rodar uma vez no SQL Editor.

update settings set business_name = 'Bela Flor Nails', instagram = 'belaflornails', facebook = 'studiobelaflor' where id = 1;

update professionals set name = 'Bela Flor'
where id = '00000000-0000-0000-0000-000000000001';
