-- ═══════════════════════════════════════════════════════════
--  SYLVE — Setup Supabase
--  À exécuter dans : Supabase Dashboard > SQL Editor
-- ═══════════════════════════════════════════════════════════

-- 1. Table profiles (liée à auth.users)
create table public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  email       text not null,
  prenom      text,
  entreprise  text,
  metier      text check (metier in ('be_moe', 'travaux', 'independant')),
  created_at  timestamp with time zone default timezone('utc', now())
);

-- 2. Activer Row Level Security
alter table public.profiles enable row level security;

-- 3. Policies : chaque utilisateur ne voit que son propre profil
create policy "Lecture profil personnel"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Mise à jour profil personnel"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Insertion profil personnel"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 4. Trigger : crée automatiquement un profil vide à l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
