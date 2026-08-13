# 🥂 Graviranje na čašama — Next.js App

Personalizovani konfigurator za graviranje na staklenim čašama.

## Tech stack
- **Next.js** (App Router, TypeScript)
- **Better Auth** + magic link (Resend)
- **Prisma** + PostgreSQL (Supabase)
- **React Three Fiber** + drei (3D scena)
- **Zustand** (state konfiguratora)

## Setup

### 1. Instalirajte zavisnosti
```bash
npm install
```

### 2. Popunite .env
```bash
cp .env.example .env
# Popunite sve vrednosti
```

### 3. Supabase baza
Napravite projekat na https://supabase.com, kopirajte connection string u .env.

### 4. Prisma migracija
```bash
npm run db:push
```

### 5. Pokrenite
```bash
npm run dev
# http://localhost:3000
```

## Flow
1. Korisnik konfiguriše tekst/sliku na 3D čaši
2. Klikne "Poruči sada" → pomera se na order sekciju
3. Ako nije ulogovan → unosi email → Better Auth šalje magic link
4. Klik na link → sesija uspostavljena → popunjava ime i adresu
5. Porudžbina čuva u Prisma bazi

## Produkcija
```bash
npm run build && npm start
```
