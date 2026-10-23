# Como mexer neste projeto (passo a passo para quem entra)

Você vai usar a **sua própria conta do Claude** e o **GitHub**. Não precisa do computador de ninguém. Tudo que for para a `main` vai ao ar sozinho na Vercel.

## 1. Entrar no repositório

1. Crie ou use sua conta no GitHub e passe o seu **usuário** para o Davi.
2. O Davi convida você em *Settings, Collaborators, Add people* (permissão **Write**).
3. Aceite o convite que chega por e-mail.

Sem convite, dá para fazer um *fork* e abrir Pull Request, mas o caminho acima é o mais simples.

Repositório: `https://github.com/davicontrollares/website_belaflor`

## 2. Abrir no Claude

**Pelo navegador (não instala nada):**

1. Entre em `claude.ai/code` com a sua conta.
2. Conecte o GitHub quando ele pedir e escolha o repositório `website_belaflor`.
3. Inicie uma sessão. O Claude lê o arquivo `CLAUDE.md` sozinho e já conhece as regras do projeto.

**Pelo Claude Code no computador (opcional):**

```bash
git clone https://github.com/davicontrollares/website_belaflor.git
cd website_belaflor
npm install
claude
```

## 3. Trabalhar sem quebrar a produção

1. Peça ao Claude para criar uma **branch** (`git checkout -b nome-da-mudanca`). Não mexa direto na `main`.
2. Descreva a mudança em português. Exemplo: "troque a foto do hero" ou "mude o texto de Quem somos".
3. Peça para ele rodar as checagens: `npx tsc --noEmit`, `npm run lint` e `npm run build`.
4. Peça para ele dar **commit e push** da branch e abrir um **Pull Request** para a `main`.
5. A Vercel cria um **link de prévia** no Pull Request. Abra, confira no celular e no computador.
6. O Davi (ou você, se tiver permissão) faz o **merge**. Em cerca de 1 minuto a mudança está em produção.

Ver o resultado: `https://belaflor.nailbooklink.com` e `https://belaflor.controllares.com.br`.

## 4. O que você não precisa ter

- **Chaves e senhas**: ficam na Vercel. Nunca coloque no código nem no chat.
- **Rodar o site no seu computador**: não é necessário. O link de prévia do Pull Request já mostra tudo funcionando com o banco real.

Se um dia quiser rodar local, copie `.env.example` para `.env.local` e peça as chaves ao Davi por um gerenciador de senhas.

## 5. Mudanças no banco de dados

O banco é o Supabase. Mudança de tabela vira um **novo arquivo** em `supabase/migrations` (por exemplo `0006_nome.sql`). Nunca edite os antigos. Avise o Davi para rodar o arquivo novo no SQL Editor do Supabase **antes** do merge.

## 6. Regras rápidas

- Textos em português do Brasil, sem travessões.
- Visual: rosé, bordas arredondadas, vidro (Liquid Glass) só em pontos de destaque. Veja `CLAUDE.md`.
- Mobile primeiro (375px e 414px), sem rolagem horizontal.
- Não mude a lógica de agendamento sem combinar com o Davi.

## 7. Onde está cada coisa

| Assunto | Arquivo |
|---|---|
| Home (seções e ordem) | `src/app/(public)/page.tsx` e `src/components/landing/*` |
| Reserva em passos | `src/app/(public)/agendar/wizard.tsx`, `payment.tsx`, `waitlist.tsx` |
| Painel da dona | `src/app/admin/*` |
| Fotos de exemplo | `src/lib/images.ts` |
| Depoimentos (aparecem quando houver itens) | `src/lib/reviews.ts` |
| Cores, vidro e fontes | `src/app/globals.css` e `src/app/layout.tsx` |

Os três sites de demonstração para outros estúdios ficam na pasta `demos/` (veja `demos/README.md`).

O relatório completo do que já foi feito está em `docs/RELATORIO.md`.
