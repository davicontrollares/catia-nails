# Bela Flor Nails

App de agendamento para um studio de unhas. Next.js 15, Tailwind v4, shadcn/ui com Base UI, Supabase, e-mail via Resend. Publicado na Vercel a partir da `main`.

## Rodar

```bash
npm install
cp .env.example .env.local   # preencher com as chaves do Supabase e do Resend
npm run dev
```

Antes de subir: `npx tsc --noEmit`, `npm run lint` e `npm run build`. Pare o servidor de dev antes do build, porque os dois usam a pasta `.next`.

## Regras de design

- Paleta rosé: fundo rosa bebê no claro, botão rosé profundo (`bg-pink`) com texto branco. O escuro também é rosado.
- Fontes: Playfair Display nos títulos (`font-display`) e Plus Jakarta Sans no resto.
- Bordas arredondadas em fotos, cartões, campos e botões. Liquid Glass (`glass`, `glass-strong`) em cabeçalho, barra inferior, resumo da reserva e cartões sobre fotos.
- Usar os componentes shadcn de `src/components/ui`.
- Visual de plataforma premium, moderna e feminina, sem cara de IA.
- Mobile em primeiro lugar (375px e 414px). Nunca deve haver rolagem horizontal (use `min-w-0` nos filhos de grid). Alvos de toque com pelo menos 44px.
- Nada de `confirm()` ou `alert()` do navegador. Usar `ConfirmDialog` (`src/components/confirm-dialog.tsx`) e `sonner`.

## Textos

- Português do Brasil, tom natural e direto.
- Sem travessões (em dash).

## Dados

- Migrations em `supabase/migrations`, em ordem numérica. Mudança de banco vira um novo arquivo, nunca edição de um antigo.
- `appointments` chega em `services` por dois caminhos (`service_id` e `appointment_services`). Nas consultas, usar o embed com a FK explícita: `services!appointments_service_id_fkey(name)`.
- Não mudar a lógica de agendamento (`book_appointment_multi`, `get_slots_for_duration`) sem combinar antes.
- Chaves ficam só em `.env.local` e na Vercel. Nunca commitar.

## Onde está o resto

Relatório do que já foi feito: `docs/RELATORIO.md`. Passo a passo para quem entra no projeto: `docs/COLABORAR.md`.

## Trabalho em dupla

Cada pessoa trabalha em uma branch (`git checkout -b nome-da-mudanca`), faz `git pull` antes de começar e abre Pull Request para a `main`. A Vercel gera um link de prévia para cada PR.
