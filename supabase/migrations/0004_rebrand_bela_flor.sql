-- Bela Flor Nails: troca o nome e os dados do studio no banco.
-- Rodar uma vez no SQL Editor. Depois ajuste endereço e WhatsApp reais em /admin > Configurações.

update settings set
  business_name = 'Bela Flor Nails',
  tagline = 'Studio de unhas em gel e fibra de vidro',
  address = 'Av. Exemplo, 100 - Centro, São José do Rio Preto - SP',
  whatsapp = '5517999990000',
  instagram = null,
  facebook = null
where id = 1;

update professionals set
  name = 'Bela Flor',
  bio = 'Especialista em alongamento em fibra de vidro e banho em gel.'
where id = '00000000-0000-0000-0000-000000000001';
