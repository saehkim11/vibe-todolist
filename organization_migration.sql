-- Day09 팀 Todo List - 조직도 / 상하 관계 확장
-- 1) create_test_users.js 실행으로 사장·부사장 계정을 만든 뒤
-- 2) Supabase SQL Editor에서 이 파일을 한 번 실행합니다.
-- 기존 업무와 팀 데이터는 삭제하지 않습니다.

begin;

-- 프로필에 직책과 상급자 정보를 추가합니다.
alter table public.profiles
  add column if not exists position_title text not null default '팀원',
  add column if not exists manager_id uuid references public.profiles(id);

create index if not exists profiles_manager_id_idx
  on public.profiles (manager_id);

alter table public.profiles
  drop constraint if exists profiles_position_title_not_blank;

alter table public.profiles
  add constraint profiles_position_title_not_blank
  check (char_length(btrim(position_title)) > 0);

-- 상급자는 자신 아래에 연결된 모든 구성원의 업무를 조회할 수 있습니다.
-- 업무 생성·수정·재배분 권한은 기존처럼 해당 팀장에게만 있습니다.
create or replace function public.is_my_subordinate(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  with recursive subordinate_tree(id, path) as (
    select p.id, array[p.id]
    from public.profiles as p
    where p.manager_id = auth.uid()

    union all

    select child.id, tree.path || child.id
    from public.profiles as child
    join subordinate_tree as tree
      on child.manager_id = tree.id
    where not child.id = any(tree.path)
  )
  select exists (
    select 1
    from subordinate_tree
    where id = p_profile_id
  );
$$;

revoke all on function public.is_my_subordinate(uuid) from public;
revoke all on function public.is_my_subordinate(uuid) from anon;
grant execute on function public.is_my_subordinate(uuid) to authenticated;

-- 일반 사용자는 조직 구조용 프로필(이름/직책/팀)을 읽을 수 있습니다.
drop policy if exists profiles_select_self_or_team on public.profiles;
drop policy if exists profiles_select_authenticated on public.profiles;
create policy profiles_select_authenticated
on public.profiles for select
to authenticated
using (true);

-- 기존의 같은 팀 업무 조회는 유지하고, 상급자는 자신의 하위 조직 업무도 조회합니다.
drop policy if exists tasks_select_own_team on public.tasks;
drop policy if exists tasks_select_visible_organization on public.tasks;
create policy tasks_select_visible_organization
on public.tasks for select
to authenticated
using (
  team_id = public.current_team_id()
  or public.is_my_subordinate(assignee_id)
);

-- 상급자가 하위 조직 업무의 상세 화면을 열었을 때 댓글도 읽을 수 있게 합니다.
drop policy if exists task_comments_select_own_team on public.task_comments;
drop policy if exists task_comments_select_visible_organization on public.task_comments;
create policy task_comments_select_visible_organization
on public.task_comments for select
to authenticated
using (
  exists (
    select 1
    from public.tasks as t
    where t.id = task_comments.task_id
      and (
        t.team_id = public.current_team_id()
        or public.is_my_subordinate(t.assignee_id)
      )
  )
);

-- 사용자가 스스로 직책·상급자를 바꾸지 못하도록 기존 보호 규칙을 확장합니다.
create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.uid() is not null then
    if new.id is distinct from old.id
      or new.login_id is distinct from old.login_id
      or new.team_id is distinct from old.team_id
      or new.is_leader is distinct from old.is_leader
      or new.position_title is distinct from old.position_title
      or new.manager_id is distinct from old.manager_id
      or new.created_at is distinct from old.created_at then
      raise exception '팀, 직책, 상급자 및 로그인 정보는 사용자가 변경할 수 없습니다.';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.protect_profile_fields() from public;
revoke all on function public.protect_profile_fields() from anon, authenticated;

commit;

-- 실행 확인: 사장 → 부사장 → 각 팀장 → 팀원 구조가 보이는지 확인합니다.
select
  p.display_name,
  p.login_id,
  p.position_title,
  manager.display_name as manager_name,
  t.name as team_name
from public.profiles as p
left join public.profiles as manager
  on manager.id = p.manager_id
left join public.teams as t
  on t.id = p.team_id
order by p.position_title, p.display_name;
