begin;
create function espia_private.play_capacity() returns table(challenge_id text,occupied bigint) language sql stable security definer set search_path='' as $$select c.id,count(en.team_id) from public.espia_challenges c left join (public.espia_enrollments en join public.espia_teams t on t.id=en.team_id and not t.is_test) on en.challenge_id=c.id where auth.uid() is not null group by c.id$$;
revoke all on function espia_private.play_capacity() from public,anon;
grant execute on function espia_private.play_capacity() to authenticated;
create or replace function public.espia_play_capacity() returns table(challenge_id text,occupied bigint) language sql stable security invoker set search_path='' as $$select * from espia_private.play_capacity()$$;
commit;
