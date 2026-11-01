-- Day09 팀 Todo List - 조직도 테스트 데이터
-- create_test_users.js 실행 후, organization_migration.sql 다음에 실행합니다.
-- 사장 1명, 부사장 1명, 팀장 3명, 팀원 7명을 트리 구조로 연결합니다.

begin;

do $$
declare
  v_profile_count integer;
begin
  select count(*)
    into v_profile_count
  from public.profiles
  where login_id in (
    'ceo01@test.local',
    'vp01@test.local',
    'sales01@test.local', 'sales02@test.local', 'sales03@test.local', 'sales04@test.local', 'sales05@test.local',
    'marketing01@test.local', 'marketing02@test.local', 'marketing03@test.local',
    'finance01@test.local', 'finance02@test.local'
  );

  if v_profile_count <> 12 then
    raise exception '조직도 테스트 프로필은 12개여야 하지만 %개가 확인되었습니다. create_test_users.js를 먼저 실행하세요.', v_profile_count;
  end if;
end;
$$;

-- 먼저 기존 연결을 초기화해 재실행해도 같은 결과가 나오게 합니다.
update public.profiles
set manager_id = null
where login_id like '%@test.local';

-- 사장과 부사장은 별도 팀 없이 경영진으로 표시합니다.
update public.profiles
set position_title = '사장', team_id = null, is_leader = false
where login_id = 'ceo01@test.local';

update public.profiles as vp
set
  position_title = '부사장',
  team_id = null,
  is_leader = false,
  manager_id = ceo.id
from public.profiles as ceo
where vp.login_id = 'vp01@test.local'
  and ceo.login_id = 'ceo01@test.local';

-- 각 팀장은 부사장에게 보고합니다.
update public.profiles as leader
set
  position_title = team.name || ' 팀장',
  manager_id = vp.id
from public.profiles as vp,
  public.teams as team
where vp.login_id = 'vp01@test.local'
  and team.id = leader.team_id
  and leader.is_leader = true
  and leader.login_id in ('sales01@test.local', 'marketing01@test.local', 'finance01@test.local');

-- 팀원은 각자의 팀장에게 보고합니다.
update public.profiles as member
set
  position_title = '팀원',
  manager_id = leader.id
from public.profiles as leader
where leader.team_id = member.team_id
  and leader.is_leader = true
  and member.is_leader = false
  and member.login_id in (
    'sales02@test.local', 'sales03@test.local', 'sales04@test.local', 'sales05@test.local',
    'marketing02@test.local', 'marketing03@test.local',
    'finance02@test.local'
  );

commit;

select
  p.display_name,
  p.position_title,
  manager.display_name as manager_name,
  coalesce(t.name, '경영진') as team_name
from public.profiles as p
left join public.profiles as manager
  on manager.id = p.manager_id
left join public.teams as t
  on t.id = p.team_id
where p.login_id like '%@test.local'
order by p.position_title, p.display_name;
