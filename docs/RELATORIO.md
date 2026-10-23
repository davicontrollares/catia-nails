# Relatório do projeto Bela Flor Nails

Estado em 23/10/2026. App de agendamento para um studio de unhas, com painel para a dona.

## Stack e endereços

- Next.js 15, Tailwind v4, shadcn/ui (Base UI), Supabase, e-mail pelo Resend.
- Repositório: `github.com/davicontrollares/website_belaflor` (público). A `main` publica sozinha na Vercel.
- Projeto na Vercel: `catia-nails`.
- Endereços no ar: `belaflor.controllares.com.br` e `belaflor.nailbooklink.com`.
- DNS de `nailbooklink.com` fica no Wargoo. Registro: `A belaflor 76.76.21.21`.

## O que o site tem hoje

**Home** (ordem): hero, faixa de benefícios, serviços (deslizam para o lado, com abas por categoria), experiência (3 fotos), dois blocos alternados (fibra de vidro e banho em gel), Quem somos, depoimentos (só aparecem com itens reais), dúvidas frequentes, contato com mapa, rodapé.

**Mobile e desktop** têm hero diferentes: no celular, foto cheia com a marca no meio e cartão de vidro de reserva embaixo; no desktop, faixa larga com foto à direita.

**Reserva** em 4 passos: Serviço, Horário, Dados e Pagamento.
- Serviço com abas por categoria e seleção de mais de um.
- Horário com calendário do mês, horários por período (manhã, tarde, noite) e botão de próximo horário livre.
- Barra fixa com total no celular.
- Confirmação com a data em destaque, WhatsApp e salvar na agenda.
- Pagamento online é **simulado** (Pix e cartão). Falta integrar de verdade.

**Duração variável**: o serviço pode ter faixa (por exemplo 2h a 4h). A agenda reserva o máximo. Ao encerrar o atendimento mais cedo no painel, o resto do horário volta a ficar livre.

**Lista de espera**: a cliente entra quando o dia está lotado. A dona avisa por WhatsApp ou por e-mail em `/admin/espera`.

**Painel** (`/admin`): visão geral, agenda, disponibilidade (cards por dia no celular), serviços, finanças, clientes, lista de espera e configurações.

## Banco (Supabase)

Migrations em `supabase/migrations`, de `0001` a `0005`. A `0005` cria `services.duration_max_min`, a tabela `waitlist` e a função `join_waitlist`.

## Decisões de design

- Paleta rosé, texto escuro, botão rosé profundo com texto branco.
- Bordas arredondadas e vidro (Liquid Glass) em cabeçalho, barra inferior, resumo e cartões sobre fotos.
- Títulos em Playfair Display, texto em Plus Jakarta Sans.
- Sem travessões nos textos.
- Fotos de exemplo do Pexels. Trocar pelas fotos reais do studio.

## Cuidados que já deram problema

- `appointments` chega em `services` por dois caminhos. Use `services!appointments_service_id_fkey(name)` nas consultas, senão a Agenda e os Clientes aparecem vazios.
- Faixas horizontais precisam de `min-w-0` no pai, senão a página ganha rolagem horizontal.

## Pendências

- Cadastrar depoimentos reais em `src/lib/reviews.ts`.
- Trocar fotos de exemplo pelas do studio.
- Integrar pagamento real (Pix e cartão).
- Adicionar o novo domínio nas URLs permitidas do login no Supabase (Authentication, URL Configuration) e definir `NEXT_PUBLIC_SITE_URL` na Vercel para os links dos e-mails.
- Testar uma reserva completa em produção depois de cada mudança grande no fluxo.

## Demonstrações para outros estúdios

Projeto separado dentro da pasta `demos/` (veja `demos/README.md`), com três sites de conceito (Hope Nail Spa, Unique Nails, Katie's Nails & Spa), em inglês, com reserva simulada, mapa e botão para trocar a paleta (5 paletas). Estão em `hope-nail-spa.nailbooklink.com`, `unique-nails.nailbooklink.com` e `katies-nails-spa.nailbooklink.com`. São conceitos privados, não os sites oficiais dessas empresas, e usam fotos de exemplo.
