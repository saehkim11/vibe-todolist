-- Day09 팀 Todo List - 테스트 초기 데이터
-- database.sql 실행 및 테스트 Auth 사용자 10명 생성 후 SQL Editor에서 실행합니다.
-- 비밀번호는 이 파일에 저장하지 않습니다.
-- 기존 사용자와 업무를 삭제하지 않습니다.

begin;

-- =========================================================
-- 1. 필요한 팀과 테스트 프로필 확인
-- =========================================================

do $$
declare
  v_team_count integer;
  v_profile_count integer;
begin
  select count(*)
    into v_team_count
  from public.teams
  where name in ('세일즈팀', '마케팅팀', '재무팀');

  if v_team_count <> 3 then
    raise exception '세일즈팀, 마케팅팀, 재무팀이 모두 필요합니다. database.sql을 먼저 확인하세요.';
  end if;

  select count(*)
    into v_profile_count
  from public.profiles
  where login_id in (
    'sales01@test.local',
    'sales02@test.local',
    'sales03@test.local',
    'sales04@test.local',
    'sales05@test.local',
    'marketing01@test.local',
    'marketing02@test.local',
    'marketing03@test.local',
    'finance01@test.local',
    'finance02@test.local'
  );

  if v_profile_count <> 10 then
    raise exception '테스트 프로필은 10개여야 하지만 %개가 확인되었습니다.', v_profile_count;
  end if;
end;
$$;

-- =========================================================
-- 2. 사용자별 팀과 팀장 지정
-- =========================================================

-- 재실행할 때 팀장 unique index와 충돌하지 않도록 테스트 계정의 팀장 표시를 먼저 해제합니다.
update public.profiles
set is_leader = false
where login_id in (
  'sales01@test.local',
  'sales02@test.local',
  'sales03@test.local',
  'sales04@test.local',
  'sales05@test.local',
  'marketing01@test.local',
  'marketing02@test.local',
  'marketing03@test.local',
  'finance01@test.local',
  'finance02@test.local'
);

update public.profiles as p
set
  team_id = t.id,
  is_leader = (p.login_id = 'sales01@test.local')
from public.teams as t
where t.name = '세일즈팀'
  and p.login_id in (
    'sales01@test.local',
    'sales02@test.local',
    'sales03@test.local',
    'sales04@test.local',
    'sales05@test.local'
  );

update public.profiles as p
set
  team_id = t.id,
  is_leader = (p.login_id = 'marketing01@test.local')
from public.teams as t
where t.name = '마케팅팀'
  and p.login_id in (
    'marketing01@test.local',
    'marketing02@test.local',
    'marketing03@test.local'
  );

update public.profiles as p
set
  team_id = t.id,
  is_leader = (p.login_id = 'finance01@test.local')
from public.teams as t
where t.name = '재무팀'
  and p.login_id in (
    'finance01@test.local',
    'finance02@test.local'
  );

-- =========================================================
-- 3. 오늘부터 5일치 업무 생성
-- =========================================================

with team_members as (
  select
    p.id as assignee_id,
    p.display_name,
    p.team_id,
    t.name as team_name,
    leader.id as leader_id
  from public.profiles as p
  join public.teams as t
    on t.id = p.team_id
  join public.profiles as leader
    on leader.team_id = p.team_id
   and leader.is_leader = true
  where p.login_id in (
    'sales01@test.local',
    'sales02@test.local',
    'sales03@test.local',
    'sales04@test.local',
    'sales05@test.local',
    'marketing01@test.local',
    'marketing02@test.local',
    'marketing03@test.local',
    'finance01@test.local',
    'finance02@test.local'
  )
),
planned_tasks as (
  select
    tm.team_id,
    tm.assignee_id,
    tm.leader_id,
    current_date + day_number as task_date,
    case tm.team_name
      when '세일즈팀' then
        (array[
          '신규 고객 연락 계획',
          '상담 내용 정리',
          '제안서 초안 확인',
          '고객 후속 연락',
          '주간 영업 결과 정리'
        ])[day_number + 1]
      when '마케팅팀' then
        (array[
          '콘텐츠 주제 정리',
          '캠페인 문구 작성',
          '게시 일정 확인',
          '반응 데이터 점검',
          '주간 마케팅 결과 정리'
        ])[day_number + 1]
      when '재무팀' then
        (array[
          '비용 증빙 확인',
          '지출 내역 정리',
          '정산 자료 검토',
          '예산 사용 현황 확인',
          '주간 재무 보고서 정리'
        ])[day_number + 1]
    end || ' · ' || tm.display_name as title,
    case tm.team_name
      when '세일즈팀' then '테스트용 세일즈 업무입니다. 결과와 특이사항을 담당자 메모에 남겨 주세요.'
      when '마케팅팀' then '테스트용 마케팅 업무입니다. 진행 내용과 확인 결과를 담당자 메모에 남겨 주세요.'
      when '재무팀' then '테스트용 재무 업무입니다. 검토 내용과 확인 결과를 담당자 메모에 남겨 주세요.'
    end as description
  from team_members as tm
  cross join generate_series(0, 4) as days(day_number)
)
insert into public.tasks (
  team_id,
  title,
  description,
  task_date,
  assignee_id,
  created_by,
  status,
  assignee_memo
)
select
  pt.team_id,
  pt.title,
  pt.description,
  pt.task_date,
  pt.assignee_id,
  pt.leader_id,
  'start_before',
  ''
from planned_tasks as pt
where not exists (
  select 1
  from public.tasks as existing
  where existing.assignee_id = pt.assignee_id
    and existing.task_date = pt.task_date
    and existing.title = pt.title
);

-- =========================================================
-- 4. 담당자 메모 예시
-- =========================================================

update public.tasks as task
set assignee_memo = '테스트 메모: 오늘 확인할 항목을 먼저 정리했습니다.'
from public.profiles as assignee
where assignee.id = task.assignee_id
  and assignee.login_id in (
    'sales01@test.local',
    'marketing01@test.local',
    'finance01@test.local'
  )
  and task.task_date = current_date
  and task.assignee_memo = '';

-- =========================================================
-- 5. 같은 팀 사용자의 댓글 예시
-- =========================================================

with sample_comments as (
  select *
  from (values
    (
      'sales01@test.local',
      'sales02@test.local',
      '테스트 댓글: 고객 연락 후 확인된 내용을 함께 공유해 주세요.'
    ),
    (
      'marketing01@test.local',
      'marketing02@test.local',
      '테스트 댓글: 초안이 준비되면 팀에서 함께 검토하겠습니다.'
    ),
    (
      'finance01@test.local',
      'finance02@test.local',
      '테스트 댓글: 누락된 증빙이 있는지 함께 확인하겠습니다.'
    )
  ) as rows(assignee_login_id, comment_user_login_id, content)
),
comment_targets as (
  select
    task.id as task_id,
    comment_user.id as user_id,
    sample.content
  from sample_comments as sample
  join public.profiles as assignee
    on assignee.login_id = sample.assignee_login_id
  join public.profiles as comment_user
    on comment_user.login_id = sample.comment_user_login_id
   and comment_user.team_id = assignee.team_id
  join public.tasks as task
    on task.assignee_id = assignee.id
   and task.task_date = current_date
)
insert into public.task_comments (task_id, user_id, content)
select target.task_id, target.user_id, target.content
from comment_targets as target
where not exists (
  select 1
  from public.task_comments as existing
  where existing.task_id = target.task_id
    and existing.user_id = target.user_id
    and existing.content = target.content
);

commit;

-- =========================================================
-- 6. 실행 결과 확인
-- =========================================================

select
  t.name as team_name,
  count(*) as member_count,
  count(*) filter (where p.is_leader = true) as leader_count
from public.profiles as p
join public.teams as t
  on t.id = p.team_id
where p.login_id like '%@test.local'
group by t.id, t.name
order by t.id;

select
  t.name as team_name,
  count(task.id) as task_count,
  min(task.task_date) as first_date,
  max(task.task_date) as last_date
from public.tasks as task
join public.teams as t
  on t.id = task.team_id
group by t.id, t.name
order by t.id;

select count(*) as sample_comment_count
from public.task_comments;
