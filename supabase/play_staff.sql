begin;
create table espia_private.staff_invites(email text primary key,role text not null check(role='gdf'));
alter table espia_private.staff_invites enable row level security;
insert into espia_private.staff_invites(email,role) values('lucia.coimbra@cg.df.gov.br','gdf');
create function espia_private.claim_staff() returns text language plpgsql security definer set search_path='' as $$
declare mail text;r text;existing text;
begin
 select lower(email) into mail from auth.users where id=auth.uid() and email_confirmed_at is not null;
 if mail is null then raise exception 'Confirme o e-mail antes de entrar no painel'; end if;
 select role into existing from public.espia_profiles where user_id=auth.uid();
 if existing='team' then raise exception 'Use uma conta pessoal verificada para o painel'; end if;
 select role into r from espia_private.staff_invites where email=mail;
 if r is null and exists(select 1 from public.espia_teams where lower(registration_data->'mentor'->>'email')=mail) then r:='teacher';end if;
 if r is null and existing in ('teacher','gdf') then r:=existing;end if;
 if r is null then raise exception 'E-mail ainda não vinculado a equipes ou ao painel GDF';end if;
 insert into public.espia_profiles(user_id,display_name,role) values(auth.uid(),mail,r) on conflict(user_id) do nothing;
 if r='teacher' then update public.espia_teams set teacher_id=auth.uid() where teacher_id is null and lower(registration_data->'mentor'->>'email')=mail;end if;
 return r;
end $$;
create function public.espia_claim_staff() returns text language sql security invoker set search_path='' as $$select espia_private.claim_staff()$$;
revoke all on function espia_private.claim_staff(),public.espia_claim_staff() from public,anon;
grant execute on function espia_private.claim_staff(),public.espia_claim_staff() to authenticated;
commit;
