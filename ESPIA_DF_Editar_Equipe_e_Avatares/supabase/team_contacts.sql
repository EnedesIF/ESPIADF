create or replace function espia_private.edit_team_contacts(p_team text,p_members jsonb)
returns void language plpgsql security definer set search_path='' as $$
declare m jsonb; stored jsonb; n integer;
begin
 if not espia_private.can_play(p_team) then raise exception 'Acesso da equipe necessário'; end if;
 if jsonb_typeof(p_members) is distinct from 'array' then raise exception 'Contatos inválidos'; end if;
 select count(*) into n from public.espia_members where team_id=p_team;
 if jsonb_array_length(p_members)<>n or (select count(distinct value->>'id') from jsonb_array_elements(p_members))<>n then raise exception 'Confira todos os integrantes'; end if;
 for m in select value from jsonb_array_elements(p_members) loop
  if not exists(select 1 from public.espia_members where team_id=p_team and id=m->>'id') then raise exception 'Integrante não pertence à equipe'; end if;
  if length(coalesce(m->>'email',''))>254 or coalesce(m->>'email','') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'Confira o e-mail'; end if;
  if length(coalesce(m->>'phone',''))>30 then raise exception 'Confira o telefone'; end if;
 end loop;
 select registration_data into stored from public.espia_teams where id=p_team for update;
 stored:=jsonb_set(stored,'{members}',(
  select jsonb_agg(old.value||jsonb_build_object('email',trim(new.value->>'email'),'phone',trim(coalesce(new.value->>'phone',''))) order by old.ord)
  from jsonb_array_elements(stored->'members') with ordinality old(value,ord)
  join jsonb_array_elements(p_members) new(value) on new.value->>'id'=old.value->>'id'
 ));
 update public.espia_teams set registration_data=stored where id=p_team;
end $$;
revoke all on function espia_private.edit_team_contacts(text,jsonb) from public,anon;
grant execute on function espia_private.edit_team_contacts(text,jsonb) to authenticated;
create or replace function public.espia_edit_team_contacts(p_team text,p_members jsonb)
returns void language sql security invoker set search_path='' as $$
 select espia_private.edit_team_contacts(p_team,p_members);
$$;
revoke all on function public.espia_edit_team_contacts(text,jsonb) from public,anon;
grant execute on function public.espia_edit_team_contacts(text,jsonb) to authenticated;

