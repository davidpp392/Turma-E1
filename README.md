# Site da Turma 2527-E1

Portal da turma com **Firebase Auth** + **Supabase** (Postgres + Storage).

## Arquitetura híbrida

| Camada | Tecnologia |
|--------|------------|
| Login / registro / senha | **Firebase Auth** |
| Perfis, atividades, anotações, notificações | **Supabase Postgres** |
| Upload de arquivos (avatar, PDFs) | **Supabase Storage** |
| Tempo real | **Supabase Realtime** (`postgres_changes`) |

O `id` em `profiles` é o **Firebase UID**. Após login, o app vincula a sessão Supabase via `signInWithIdToken({ provider: 'firebase' })`.

## Configuração

### 1. Firebase Console
- Crie projeto e app Web
- Ative **Authentication → Email/Password**
- Copie as credenciais para `.env.local`

### 2. Supabase Dashboard
- Crie projeto e copie URL + anon key
- **Authentication → Third-party → Firebase** → habilite e vincule o projeto Firebase
- Execute no SQL Editor (ordem):
  1. `supabase/schema.sql`
  2. `supabase/policies.sql`
  3. `supabase/seed.sql`
- Se já tinha banco com UUID: execute também `supabase/migration-firebase-hybrid.sql`

### 3. Variáveis (.env.local)

```env
# Firebase Auth
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...  # apenas scripts locais
```

### 4. Rodar

```bash
npm install
npm run dev
```

## Fluxo de autenticação

```
Registro/Login → Firebase Auth → getIdToken()
       ↓
signInWithIdToken (Supabase) → sessão + RLS com auth.uid()
       ↓
upsertProfile(firebaseUid) → tabela profiles no Supabase
```

## Estrutura principal

```
src/lib/firebase/     → Auth (login, registro, senha)
src/lib/supabase/       → client, db, bridge, middleware, storage
src/components/         → UI (Tailwind + GSAP)
supabase/               → schema, policies, migrations SQL
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Desenvolvimento |
| `npm run build` | Build produção |
| `npm test` | Testes |
| `npx tsx scripts/seed.ts` | Seed matérias (service role) |

## Deploy (Vercel)

Adicione todas as variáveis `NEXT_PUBLIC_FIREBASE_*` e `NEXT_PUBLIC_SUPABASE_*`.

No Supabase → Authentication → URL Configuration, adicione a URL da Vercel.
