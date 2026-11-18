-- ESPIA DF — equipes EVENTOS 3A — professora Keila Rosa
-- Execute todo o arquivo no SQL Editor do projeto ESPIADF, como postgres.
-- Não apaga dados. Uma segunda execução preserva contas e senhas existentes.
-- Equipe de 5: Rebeca Matos acumula escuta e participação.
begin;
do $cadastro$
declare
 teacher uuid;
 item jsonb;
 payload jsonb;
 uid uuid;
 mail text;
 existing public.espia_teams%rowtype;
begin
 select u.id into strict teacher from auth.users u
 join public.espia_profiles p on p.user_id=u.id
 where lower(u.email)='keila.rosa@ifb.edu.br'
 and u.email_confirmed_at is not null and p.role='teacher';

 for item in select value from jsonb_array_elements($equipes$
[
  {
    "id": "eventos3a_espia_em_cena",
    "name": "Espia em Cena",
    "login": "ESPIA-CENA-3A",
    "password": "Cena3A!2026",
    "names": [
      "Júlia Vieira Barbosa",
      "Lavínea Alves Pinto",
      "Letícia Carvalho Coutinho",
      "Manuela Rodrigues Morgado",
      "Maria Eduarda Mendes dos Santos",
      "Maria Eduarda Miranda Santos"
    ],
    "avatars": [
      "Júlia",
      "Lavínea",
      "Letícia",
      "Manuela",
      "Duda Mendes",
      "Duda Miranda"
    ],
    "members": [
      {
        "id": "eventos3a_espia_em_cena_m1",
        "name": "Júlia Vieira Barbosa",
        "avatarName": "Júlia",
        "missionRole": "escuta",
        "role": "campo",
        "email": "keila.rosa@ifb.edu.br",
        "phone": "11964149570",
        "turma": "EVENTOS 3A",
        "avatar": {
          "cartoonLook": 1,
          "characterGender": "menina"
        }
      },
      {
        "id": "eventos3a_espia_em_cena_m2",
        "name": "Lavínea Alves Pinto",
        "avatarName": "Lavínea",
        "missionRole": "campo",
        "role": "campo",
        "email": "keila.rosa@ifb.edu.br",
        "phone": "11964149570",
        "turma": "EVENTOS 3A",
        "avatar": {
          "cartoonLook": 3,
          "characterGender": "menina"
        }
      },
      {
        "id": "eventos3a_espia_em_cena_m3",
        "name": "Letícia Carvalho Coutinho",
        "avatarName": "Letícia",
        "missionRole": "verificacao",
        "role": "campo",
        "email": "keila.rosa@ifb.edu.br",
        "phone": "11964149570",
        "turma": "EVENTOS 3A",
        "avatar": {
          "cartoonLook": 6,
          "characterGender": "menina"
        }
      },
      {
        "id": "eventos3a_espia_em_cena_m4",
        "name": "Manuela Rodrigues Morgado",
        "avatarName": "Manuela",
        "missionRole": "dados",
        "role": "campo",
        "email": "keila.rosa@ifb.edu.br",
        "phone": "11964149570",
        "turma": "EVENTOS 3A",
        "avatar": {
          "cartoonLook": 8,
          "characterGender": "menina"
        }
      },
      {
        "id": "eventos3a_espia_em_cena_m5",
        "name": "Maria Eduarda Mendes dos Santos",
        "avatarName": "Duda Mendes",
        "missionRole": "articulacao",
        "role": "campo",
        "email": "keila.rosa@ifb.edu.br",
        "phone": "11964149570",
        "turma": "EVENTOS 3A",
        "avatar": {
          "cartoonLook": 10,
          "characterGender": "menina"
        }
      },
      {
        "id": "eventos3a_espia_em_cena_m6",
        "name": "Maria Eduarda Miranda Santos",
        "avatarName": "Duda Miranda",
        "missionRole": "participacao",
        "role": "campo",
        "email": "keila.rosa@ifb.edu.br",
        "phone": "11964149570",
        "turma": "EVENTOS 3A",
        "avatar": {
          "cartoonLook": 12,
          "characterGender": "menina"
        }
      }
    ]
  },
  {
    "id": "eventos3a_conexao_cidada",
    "name": "Conexão Cidadã",
    "login": "CONEXAO-CIDADA-3A",
    "password": "Conexao3A!2026",
    "names": [
      "Rebeca de Jesus Matos",
      "Rebekah Menezes Fernandes Fischer",
      "Rebeka Santos Placido",
      "Thamyres Yasmin Ramiro Souza Lara",
      "Yasmim Neres Souza Santos"
    ],
    "avatars": [
      "Rebeca Matos",
      "Rebekah Fischer",
      "Rebeka Santos",
      "Thamyres",
      "Yasmim"
    ],
    "members": [
      {
        "id": "eventos3a_conexao_cidada_m1",
        "name": "Rebeca de Jesus Matos",
        "avatarName": "Rebeca Matos",
        "missionRole": "escuta",
        "role": "campo",
        "email": "keila.rosa@ifb.edu.br",
        "phone": "11964149570",
        "turma": "EVENTOS 3A",
        "avatar": {
          "cartoonLook": 1,
          "characterGender": "menina"
        }
      },
      {
        "id": "eventos3a_conexao_cidada_m2",
        "name": "Rebekah Menezes Fernandes Fischer",
        "avatarName": "Rebekah Fischer",
        "missionRole": "campo",
        "role": "campo",
        "email": "keila.rosa@ifb.edu.br",
        "phone": "11964149570",
        "turma": "EVENTOS 3A",
        "avatar": {
          "cartoonLook": 3,
          "characterGender": "menina"
        }
      },
      {
        "id": "eventos3a_conexao_cidada_m3",
        "name": "Rebeka Santos Placido",
        "avatarName": "Rebeka Santos",
        "missionRole": "verificacao",
        "role": "campo",
        "email": "keila.rosa@ifb.edu.br",
        "phone": "11964149570",
        "turma": "EVENTOS 3A",
        "avatar": {
          "cartoonLook": 6,
          "characterGender": "menina"
        }
      },
      {
        "id": "eventos3a_conexao_cidada_m4",
        "name": "Thamyres Yasmin Ramiro Souza Lara",
        "avatarName": "Thamyres",
        "missionRole": "dados",
        "role": "campo",
        "email": "keila.rosa@ifb.edu.br",
        "phone": "11964149570",
        "turma": "EVENTOS 3A",
        "avatar": {
          "cartoonLook": 8,
          "characterGender": "menina"
        }
      },
      {
        "id": "eventos3a_conexao_cidada_m5",
        "name": "Yasmim Neres Souza Santos",
        "avatarName": "Yasmim",
        "missionRole": "articulacao",
        "role": "campo",
        "email": "keila.rosa@ifb.edu.br",
        "phone": "11964149570",
        "turma": "EVENTOS 3A",
        "avatar": {
          "cartoonLook": 10,
          "characterGender": "menina"
        }
      }
    ]
  }
]
$equipes$::jsonb) loop
  select * into existing from public.espia_teams where id=item->>'id';
  if found then
   if existing.login is distinct from item->>'login' or existing.teacher_id is distinct from teacher then
    raise exception 'Cadastro existente diferente: %',item->>'id';
   end if;
   continue;
  end if;
  mail:=lower(item->>'login')||'@equipes.espiadf.invalid';
  if exists(select 1 from auth.users where lower(email)=mail)
   or exists(select 1 from public.espia_teams where login=item->>'login') then
   raise exception 'Login já utilizado: %',item->>'login';
  end if;
  uid:=gen_random_uuid();
  insert into auth.users (
   instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,
   raw_app_meta_data,raw_user_meta_data,created_at,updated_at,
   confirmation_token,recovery_token,email_change_token_new,email_change)
  values (
   '00000000-0000-0000-0000-000000000000',uid,'authenticated','authenticated',mail,
   extensions.crypt(item->>'password',extensions.gen_salt('bf')),now(),
   '{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),'','','','');
  insert into auth.identities (
   id,provider_id,user_id,identity_data,provider,created_at,updated_at)
  values (
   gen_random_uuid(),uid::text,uid,
   jsonb_build_object('sub',uid::text,'email',mail,'email_verified',true,'phone_verified',false),
   'email',now(),now());
  payload:=(item-'password'-'names'-'avatars')||jsonb_build_object(
   'school','IFB - Campus Brasília','turma','EVENTOS 3A','ra','Plano Piloto',
   'mentor',jsonb_build_object('name','Keila Rosa','email','keila.rosa@ifb.edu.br',
   'school','IFB - Campus Brasília','phone','11964149570','area','Eventos'),
   'createdAt',now(),'rolesLocked',true);
  perform public.espia_register_team_internal(payload,uid);
  update public.espia_teams set teacher_id=teacher where id=item->>'id' and team_user_id=uid;
 end loop;
end
$cadastro$;
select t.name as equipe,t.login,t.class_name as turma,count(m.id) as integrantes,
 count(m.avatar_name) as avatares_nomeados,p.role as perfil_professora
from public.espia_teams t
join public.espia_members m on m.team_id=t.id
join public.espia_profiles p on p.user_id=t.teacher_id
where t.id in ('eventos3a_espia_em_cena','eventos3a_conexao_cidada')
group by t.id,p.role order by t.name;
commit;

