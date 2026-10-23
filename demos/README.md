# Demos para outros estúdios

Três sites de **conceito** para mostrar como a plataforma ficaria em outros estúdios de unhas. São privados, não são os sites oficiais dessas empresas, e usam fotos de exemplo do Pexels.

| Estúdio | Endereço no ar | Arquivo de dados |
|---|---|---|
| Hope Nail Spa | `hope-nail-spa.nailbooklink.com` | `src/lib/studios.ts` |
| Unique Nails | `unique-nails.nailbooklink.com` | `src/lib/studios.ts` |
| Katie's Nails & Spa | `katies-nails-spa.nailbooklink.com` | `src/lib/studios.ts` |

Também abrem em `demo-estudios-k7q2.vercel.app/<slug>` (`hope-nail-spa`, `unique-nails`, `katies-nails-spa`).

## O que tem

- Mesma estrutura da Bela Flor: hero (celular e desktop), benefícios, serviços que deslizam, experiência, blocos alternados, sobre, contato com mapa.
- **Reserva simulada** em 3 passos (serviço, horário, confirmar). Não envia nada nem cobra nada.
- Botão **Colors** que troca a paleta ao vivo. As 5 paletas (Rosé, Cacau, Floresta, Magenta, Noite) estão em `src/lib/studios.ts`, no objeto `PALETTES`.
- Texto em inglês, porque os estúdios são da Flórida (EUA).

## Onde mexer

| O que | Arquivo |
|---|---|
| Nome, endereço, telefone, serviços, preços de exemplo, paleta inicial | `src/lib/studios.ts` |
| Página inteira (seções e visual) | `src/components/studio-site.tsx` |
| Fluxo de reserva simulada | `src/components/booking-demo.tsx` |
| Um subdomínio abrir a página do estúdio | `src/middleware.ts` |

Para adicionar um estúdio novo, crie um item em `STUDIOS` (`src/lib/studios.ts`) e inclua o `slug` na lista de `src/middleware.ts`.

## Rodar

```bash
cd demos
npm install
npm run dev -- -p 3030
```

Antes de subir: `npx tsc --noEmit`, `npm run lint` e `npm run build`.

## Publicar

O projeto na Vercel é `demo-estudios-k7q2` (conta `controllares`). Hoje a publicação é manual, pela Vercel CLI, a partir desta pasta:

```bash
cd demos
vercel deploy --prod
```

Para publicar sozinho a cada push, o Davi conecta esse projeto da Vercel ao repositório e define **Root Directory** como `demos`.

## Domínios

Cada estúdio tem um subdomínio de `nailbooklink.com`, com registro `A` apontando para `76.76.21.21` no painel DNS do Wargoo e o domínio adicionado ao projeto `demo-estudios-k7q2` na Vercel. O `src/middleware.ts` mostra a página certa conforme o endereço.

## Cuidados

- Usar só fotos livres (Pexels) ou fotos que o próprio estúdio autorizou.
- Preços, serviços e textos são **exemplos**. Combinar com o dono antes de qualquer uso real.
- Não colocar chaves nem senhas aqui.
