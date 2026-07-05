-- Schema Supabase pour STRTS

-- Extension uuid
create extension if not exists "uuid-ossp";

-- Votes sur les blagues
create table if not exists votes_blagues (
  id          uuid default uuid_generate_v4() primary key,
  blague_id   text not null,
  user_id     uuid references auth.users(id) on delete set null,
  vote        text check (vote in ('up', 'down')) not null,
  created_at  timestamptz default now()
);
create unique index if not exists votes_blagues_user_blague on votes_blagues(blague_id, user_id) where user_id is not null;
alter table votes_blagues enable row level security;
create policy "Tout le monde peut voir les votes" on votes_blagues for select using (true);
create policy "Utilisateurs authentifiés peuvent voter" on votes_blagues for insert with check (auth.uid() = user_id);
create policy "Utilisateurs peuvent supprimer leur vote" on votes_blagues for delete using (auth.uid() = user_id);

-- Parties multijoueur
create table if not exists parties_multijoueur (
  id          uuid default uuid_generate_v4() primary key,
  code        text unique not null,
  hote_id     uuid references auth.users(id) on delete set null,
  etat        jsonb not null default '{}',
  statut      text check (statut in ('attente', 'en_cours', 'terminee')) default 'attente',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
alter table parties_multijoueur enable row level security;
create policy "Tout le monde peut voir les parties actives" on parties_multijoueur for select using (statut != 'terminee');
create policy "Hôte authentifié peut créer une partie" on parties_multijoueur for insert with check (auth.uid() = hote_id);
create policy "Hôte peut mettre à jour sa partie" on parties_multijoueur for update using (auth.uid() = hote_id);

-- Joueurs dans une partie multijoueur
create table if not exists joueurs_multijoueur (
  id          uuid default uuid_generate_v4() primary key,
  partie_id   uuid references parties_multijoueur(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete set null,
  nom         text not null,
  est_hote    boolean default false,
  est_connecte boolean default true,
  donnees     jsonb default '{}',
  created_at  timestamptz default now()
);
alter table joueurs_multijoueur enable row level security;
create policy "Tout le monde peut voir les joueurs d'une partie" on joueurs_multijoueur for select using (true);
create policy "Joueurs peuvent s'inscrire" on joueurs_multijoueur for insert with check (true);
create policy "Joueurs peuvent se déconnecter" on joueurs_multijoueur for update using (auth.uid() = user_id or user_id is null);

-- Fonction pour générer un code de partie unique (6 lettres majuscules)
create or replace function generer_code_partie()
returns text as $$
declare
  _code text;
  _existe boolean;
begin
  loop
    _code := upper(substr(md5(random()::text), 1, 6));
    select exists(select 1 from parties_multijoueur where parties_multijoueur.code = _code and statut != 'terminee') into _existe;
    exit when not _existe;
  end loop;
  return _code;
end;
$$ language plpgsql;
