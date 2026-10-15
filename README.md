# Bela Flor Nails

Site de agendamento online e painel de gestão do studio Bela Flor Nails (São José do Rio Preto, SP).

Next.js 15, Tailwind v4, shadcn/ui (Base UI), Supabase e Vercel.

## O que tem

- Landing page com serviços, valores, galeria e perguntas frequentes.
- Agendamento em 4 passos (serviço, data, horário, dados). A agenda só mostra horários livres e o banco recusa dois atendimentos no mesmo horário.
- E-mail de confirmação automático com botões para Google Agenda e Outlook e um anexo `.ics` para Apple Calendar.
- Área da cliente para ver e cancelar horários.
- Painel da dona em `/admin`: visão geral, agenda do dia com atualização em tempo real, disponibilidade (expediente, folgas e bloqueios), serviços e preços, finanças (receitas, despesas, comissões, exportação CSV), clientes e configurações.

Sem as variáveis do Supabase, o app roda em modo de demonstração com dados de exemplo.

## Rodar localmente

```bash
npm install
cp .env.example .env.local   # preencha as variáveis
npm run dev
```

## Deploy (GitHub + Vercel + Supabase)

1. Crie um repositório no GitHub e envie este projeto (`git remote add origin ...` e `git push -u origin main`).
2. Na Vercel, importe o repositório.
3. Em Storage, adicione a integração Supabase. Ela cria o banco e preenche `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. No painel do Supabase, abra o SQL Editor e rode, nesta ordem:
   - `supabase/migrations/0001_init.sql`
   - `supabase/seed.sql`
   - `supabase/migrations/0002_multi_service.sql` (vários serviços no mesmo agendamento)
   - `supabase/migrations/0003_repeat_last.sql` (repetir o último atendimento)
   - `supabase/migrations/0004_rebrand_bela_flor.sql` (nome e dados da Bela Flor)
5. Em Authentication > URL Configuration, coloque a URL da Vercel em Site URL e `https://SEU-DOMINIO/auth/callback` em Redirect URLs.
6. Para o e-mail de confirmação, crie uma conta no [Resend](https://resend.com), verifique o domínio e adicione na Vercel `RESEND_API_KEY` e `EMAIL_FROM`.
7. Crie sua conta no site em `/entrar` e rode no SQL Editor para virar dona:

```sql
update profiles set role = 'owner'
where id = (select id from auth.users where email = 'SEU-EMAIL');
```

## Variáveis de ambiente

| Nome | Uso |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública do Supabase |
| `RESEND_API_KEY` | Envio do e-mail de confirmação (opcional) |
| `EMAIL_FROM` | Remetente, ex. `Bela Flor Nails <agendamento@seudominio.com.br>` |

## Fotos

Coloque as fotos do Instagram do studio em `public/instagram/` (.jpg, .png ou .webp). A carrossel da página inicial usa essas fotos automaticamente. Enquanto a pasta estiver vazia, aparecem as fotos de exemplo do Pexels (`src/lib/images.ts`).

## Pagamento

O passo de pagamento (Pix e cartão via Mercado Pago) é uma simulação: nenhum valor é cobrado. Para cobrar de verdade, é preciso integrar a API do Mercado Pago (Pix e Checkout) com as credenciais da conta do studio.
