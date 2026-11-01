# Day09 팀 Todo List 프로젝트 단계별 프롬프트

이 문서는 아래 프롬프트를 **1번부터 순서대로 하나씩** 사용하기 위한 실습 문서입니다.

> 중요: 한 번에 모든 기능을 요청하지 말고, 각 단계가 정상 동작하는지 확인한 뒤 다음 단계로 넘어갑니다.

## 프로젝트 기본 결정

- 위치: `Day09/Todo_List`
- 프런트엔드: 순수 HTML, CSS, JavaScript
- DB 및 회원관리: Supabase PostgreSQL, Supabase Auth
- 배포: GitHub Pages
- 로그인 아이디: 이메일 형식의 아이디
- 화면 스타일: Notion처럼 단순하고 직관적인 업무 화면
- 화면 종류: 팀 전체 업무 / 내 업무 전환
- 지원 화면: PC, 태블릿, 스마트폰
- 팀 구성:
  - 세일즈팀 5명
  - 마케팅팀 3명
  - 재무팀 2명
  - 각 팀에 팀장 1명
- 업무 상태: 시작 전 / 진행 중 / 작업 완료
- 초기 데이터: 팀 3개, 테스트 사용자 10명, 5일치 업무, 예시 메모·댓글
- 메모 권한: 업무 담당자만 작성·수정, 같은 팀 구성원은 조회
- 댓글 권한: 같은 팀 구성원은 작성, 작성자 본인만 수정·삭제
- 완료 알림: 담당자가 완료 처리하면 같은 팀 팀장에게 자동 생성
- 재배분 권한: 팀장은 자기 팀 업무를 자기 팀의 다른 구성원에게 재배분 가능

Supabase Auth는 기본적으로 이메일과 비밀번호 로그인을 지원합니다. 따라서 이 프로젝트에서는 화면에 `아이디(이메일)`로 안내합니다. 비밀번호는 별도 사용자 테이블에 저장하지 않습니다.

테스트 사용자 아이디와 비밀번호는 로컬 관리자 스크립트가 임의로 생성합니다. 비밀번호는 Supabase Auth에만 저장하며, 로그인 확인용 계정 목록은 GitHub에서 제외되는 로컬 파일에만 기록합니다.

---

## 1. 프로젝트 규칙 설정

```text
지금부터 Day09/Todo_List 폴더에 Supabase를 사용하는 팀 Todo List를 단계별로 만든다.

기술:
- 순수 HTML, CSS, JavaScript
- Supabase JavaScript SDK v2
- Supabase Auth
- Supabase PostgreSQL과 RLS
- GitHub Pages 배포
- React, Node.js 서버, 빌드 도구는 사용하지 않는다.

주요 기능:
- 이메일 형식 아이디와 비밀번호로 회원가입·로그인·로그아웃
- 세일즈팀 5명, 마케팅팀 3명, 재무팀 2명
- 각 팀의 팀장 1명 지정
- 팀 전체 업무와 내 업무 화면 전환
- 팀장이 자기 팀원과 본인에게 업무 배정
- 담당자가 업무 상태를 시작 전, 진행 중, 작업 완료로 변경
- 작업 완료 시 같은 팀 팀장에게 DB 알림 생성
- 팀장 화면에서 완료 알림 확인
- 업무별 메모와 댓글 작성
- PC와 모바일 반응형 화면

권한 원칙:
- 로그인한 사용자만 앱을 사용할 수 있다.
- 사용자는 자기 팀의 구성원과 업무만 볼 수 있다.
- 팀장은 자기 팀의 업무만 만들고 자기 팀원에게만 배정할 수 있다.
- 팀장은 자기 팀 업무의 담당자를 같은 팀 구성원으로 재배분할 수 있다.
- 팀원은 본인에게 배정된 업무의 상태와 담당자 메모만 변경할 수 있다.
- 재배분된 업무는 새 담당자만 상태와 담당자 메모를 변경할 수 있다.
- 업무 제목, 설명, 담당자, 날짜 변경은 해당 팀의 팀장만 가능하다.
- 댓글은 같은 팀 사용자만 조회·작성할 수 있다.
- 댓글 수정·삭제는 작성자만 가능하다.
- 팀장 여부와 팀 소속은 사용자가 가입 화면에서 임의로 정할 수 없게 한다.
- 화면에서 버튼을 숨기는 것과 별도로 DB의 RLS로 권한을 강제한다.

보안 규칙:
- 비밀번호를 public 테이블, 코드, localStorage에 저장하지 않는다.
- 회원 인증은 Supabase Auth를 사용한다.
- Secret key와 service_role key를 웹 코드와 GitHub에 넣지 않는다.
- 브라우저에서는 Project URL과 Publishable key만 사용한다.
- RLS를 끄지 않는다.
- 사용자 입력을 innerHTML로 직접 출력하지 않는다.
- 모든 Supabase 응답의 error를 확인한다.
- 기존 데이터와 정상 동작하는 기능을 임의로 삭제하지 않는다.
- 내가 요청한 단계만 진행한다.

지금은 파일을 만들지 말고, 요구사항과 진행 순서를 이해했는지만 한국어로 짧게 설명해 줘.
```

---

## 2. Supabase DB 구성 SQL 만들기

```text
Day09/Todo_List 팀 Todo List의 Supabase DB 구성 SQL을 작성해 줘.

새 Supabase 프로젝트에서 처음 한 번 실행할 파일:
Day09/Todo_List/database.sql

아직 HTML, CSS, JavaScript 파일은 만들지 마.

테이블 이름은 SQL 예약어와 혼동되지 않도록 다음 이름을 사용한다.

1. public.teams
- id: bigint 자동 생성 기본키
- name: 중복 불가, 필수
- created_at: timestamptz, 기본값 now(), 필수
- 기본 팀: 세일즈팀, 마케팅팀, 재무팀

2. public.profiles
- id: auth.users.id를 참조하는 uuid 기본키, ON DELETE CASCADE
- login_id: 화면에 표시할 이메일 형식 아이디, 중복 불가, 필수
- display_name: 이름, 필수
- team_id: public.teams.id 참조, 가입 직후에는 NULL 허용
- is_leader: boolean, 기본값 false, 필수
- created_at, updated_at
- 한 팀에는 팀장이 정확히 1명만 있도록 가능한 범위에서 DB 제약 또는 부분 unique index 적용
- 일반 사용자가 자신의 team_id나 is_leader를 변경할 수 없게 구성

3. public.tasks
- id: bigint 자동 생성 기본키
- team_id: public.teams.id 참조, 필수
- title: 업무명, 1~200자, 필수
- description: 업무 설명, 필수
- task_date: date, 필수
- assignee_id: public.profiles.id 참조, 필수
- created_by: public.profiles.id 참조, 필수
- status: start_before, in_progress, completed 중 하나, 기본값 start_before
- assignee_memo: 담당자 메모, 기본값 빈 문자열
- completed_at: timestamptz, 작업 완료 전에는 NULL
- created_at, updated_at
- team_id, assignee_id, task_date, status 인덱스 추가
- 담당자는 해당 업무와 같은 팀 소속이어야 함
- created_by는 해당 팀의 팀장이어야 함

4. public.task_comments
- id: bigint 자동 생성 기본키
- task_id: public.tasks.id 참조, ON DELETE CASCADE, 필수
- user_id: public.profiles.id 참조, 필수
- content: 공백 제외 1~1000자, 필수
- created_at, updated_at
- task_id와 user_id 인덱스 추가

5. public.notifications
- id: bigint 자동 생성 기본키
- recipient_id: 알림을 받을 팀장 profiles.id, 필수
- task_id: public.tasks.id 참조, ON DELETE CASCADE, 필수
- type: task_completed만 허용
- message: 알림 문구, 필수
- is_read: boolean, 기본값 false
- created_at
- recipient_id, is_read, created_at 인덱스 추가
- 같은 업무가 작업 완료 상태가 될 때마다 중복 알림이 여러 개 생기지 않도록 처리

자동 처리:
- Auth 회원가입 시 public.profiles 기본 행을 만드는 안전한 trigger 함수 작성
- login_id는 가입 이메일을 사용하고 display_name은 가입 metadata의 display_name을 사용
- 가입 화면에서 team_id와 is_leader를 임의 지정하지 못하게 함
- tasks가 다른 상태에서 completed로 바뀔 때 completed_at 기록
- 완료 처리 시 해당 팀 팀장에게 notifications 자동 생성
- completed에서 다른 상태로 되돌리면 completed_at을 NULL로 변경
- updated_at 자동 갱신 함수와 trigger 작성
- SECURITY DEFINER 함수는 search_path를 안전하게 고정하고 불필요한 PUBLIC 실행 권한을 회수

RLS 및 권한:
- 모든 public 테이블에서 RLS 활성화
- anon은 public 테이블 접근 불가
- authenticated만 필요한 작업 가능
- teams는 로그인 사용자가 조회 가능
- profiles는 본인 행을 항상 조회할 수 있고, 팀이 배정된 뒤에는 같은 팀 구성원도 조회 가능
- 본인은 display_name만 제한적으로 수정 가능
- 사용자가 team_id와 is_leader를 직접 변경할 수 없음
- tasks는 같은 팀 사용자만 조회 가능
- tasks 생성은 해당 팀 팀장만 가능
- 팀장은 같은 팀 사용자에게만 업무 배정 가능
- 팀장은 자기 팀 업무의 제목, 설명, 날짜를 변경하고 담당자를 같은 팀 구성원으로 재배분 가능
- 재배분할 때 다른 팀 사용자를 담당자로 지정할 수 없음
- 재배분이 완료되면 기존 담당자는 해당 업무의 status와 assignee_memo를 더 이상 변경할 수 없음
- 담당자는 자기 업무의 status와 assignee_memo만 변경 가능
- 담당자 메모는 같은 팀 사용자가 조회할 수 있지만 작성·수정은 해당 업무 담당자만 가능
- 팀원이 UPDATE 요청으로 team_id, assignee_id, created_by 등을 바꿀 수 없게 DB에서 강제
- task_comments는 같은 팀 사용자만 조회·작성 가능
- 댓글 수정·삭제는 작성자만 가능
- notifications는 recipient_id가 auth.uid()인 사용자만 조회 및 읽음 처리 가능
- 알림 INSERT는 완료 trigger만 수행하며 웹 사용자의 직접 INSERT는 금지
- 필요한 schema, table, sequence, function 권한만 명시
- anon과 authenticated의 기존 권한을 먼저 회수한 뒤 필요한 권한만 부여

샘플 데이터 원칙:
- teams 3개는 database.sql에서 INSERT
- auth.users에 가짜 UUID나 비밀번호를 SQL로 직접 INSERT하지 않음
- 사용자 10명은 별도 로컬 관리자 스크립트로 Supabase Auth에 생성
- 사용자 팀 배정, 5일치 업무, 예시 메모·댓글은 별도 seed.sql에서 처리
- 이번 database.sql 단계에서는 사용자와 업무 샘플을 넣지 않음

SQL 작성 규칙:
- 전체 작업을 가능한 범위에서 하나의 transaction으로 구성
- DROP TABLE 및 기존 데이터 삭제 금지
- 한국어 주석 작성
- PostgreSQL과 Supabase에서 실행 가능하게 작성
- 같은 파일 재실행 시 중복 오류를 줄이도록 멱등성 고려
- 정책과 trigger 이름을 명확하게 작성

완료 후 다음을 검토해 줘.
- 팀 간 데이터가 RLS로 분리되는가?
- 팀원이 자신을 팀장으로 바꿀 수 없는가?
- 팀원이 다른 팀 또는 다른 담당자의 업무를 바꿀 수 없는가?
- 완료 알림이 팀장에게만 생성되는가?
- 댓글 권한이 같은 팀으로 제한되는가?
- 같은 SQL을 다시 실행할 때 문제가 있는가?

마지막에 Supabase SQL Editor에 복사할 파일 이름을 알려줘.
```

---

## 3. SQL 실행 오류 수정용 프롬프트

오류가 있을 때만 사용합니다.

```text
Day09/Todo_List/database.sql을 Supabase SQL Editor에서 실행했는데 다음 오류가 발생했다.

[여기에 오류 메시지 전체를 붙여 넣기]

현재 database.sql과 오류 메시지를 먼저 확인해 줘.

규칙:
- 기존 테이블과 데이터를 삭제하지 않는다.
- RLS를 끄지 않는다.
- 원인을 확인한 뒤 가장 작은 범위로 수정한다.
- 원본 database.sql 전체를 다시 실행할지, 별도 수정 SQL만 실행할지 구분한다.
- 별도 수정이 필요하면 Day09/Todo_List/fix.sql로 작성한다.
- 수정한 이유와 SQL Editor에서 실행할 순서를 한국어로 설명한다.
```

---

## 4. 가입·로그인 기본 화면 만들기

```text
Day09/Todo_List/database.sql을 읽고 가입·로그인 기본 화면을 만들어 줘.

생성 파일:
- Day09/Todo_List/index.html
- Day09/Todo_List/style.css
- Day09/Todo_List/config.js
- Day09/Todo_List/app.js

이번 단계에서는 업무 목록, 업무 생성, 댓글, 알림 기능을 만들지 마.

조건:
- 순수 HTML, CSS, JavaScript 사용
- Supabase JavaScript SDK v2를 CDN으로 불러오기
- SDK → config.js → app.js 순서로 실행
- 브라우저 Supabase 클라이언트 변수명은 sb 사용
- config.js에는 Project URL과 Publishable key 자리표시자만 작성
- Secret key와 service_role key 사용 금지
- GitHub Pages에서 동작하는 상대 경로 사용
- 화면은 한국어로 작성
- Notion처럼 흰색 중심, 충분한 여백, 단순한 테두리, 읽기 쉬운 글자 사용
- 가입 화면: 아이디(이메일), 이름, 비밀번호, 비밀번호 확인
- 팀과 팀장 여부는 가입 화면에서 선택하지 않음
- 로그인 화면: 아이디(이메일), 비밀번호
- signUp, signInWithPassword, signOut 사용
- 가입 metadata에 display_name만 전달
- 비밀번호는 type=password이며 코드나 localStorage에 직접 저장하지 않음
- getSession으로 새로고침 후 세션 복원
- onAuthStateChange로 화면 갱신
- 가입 직후 팀 미배정 사용자는 '관리자가 팀을 배정할 때까지 기다려 주세요' 표시
- 요청 중 버튼 비활성화
- 성공·오류 메시지를 한국어로 표시
- 모든 Supabase 응답의 error 확인
- 사용자 입력을 innerHTML로 직접 출력하지 않음
- 모바일에서 입력창과 버튼이 화면 밖으로 나가지 않게 반응형 적용

완료 후 config.js에 Project URL과 Publishable key를 넣는 위치와 확인 방법을 알려줘.
```

---

## 5. 테스트 계정 자동 생성 및 초기 데이터 저장

Supabase Auth 계정은 일반 테이블 INSERT로 만들지 않습니다. 테스트 프로젝트에서만 사용하는 **로컬 관리자 스크립트**로 계정을 생성하고, 팀·업무·메모·댓글은 `seed.sql`로 저장합니다.

| 팀 | 인원 | 임시 이름 | 팀장 |
| --- | ---: | --- | --- |
| 세일즈팀 | 5명 | 김서준, 이지우, 박도윤, 최하은, 정민재 | 김서준 |
| 마케팅팀 | 3명 | 윤서아, 한지호, 오유진 | 윤서아 |
| 재무팀 | 2명 | 강현우, 문채원 | 강현우 |

### 5-1. 테스트 계정 생성 스크립트

```text
Day09/Todo_List/database.sql을 읽고 Supabase Auth 테스트 계정 10명을 만드는 로컬 관리자 스크립트를 작성해 줘.

생성 파일:
- Day09/Todo_List/create_test_users.js
- Day09/Todo_List/.env.test-users.example
- Day09/Todo_List/.gitignore에 로컬 비밀 파일 제외 규칙 추가

계정 규칙:
- 세일즈팀: sales01@test.local ~ sales05@test.local
- 마케팅팀: marketing01@test.local ~ marketing03@test.local
- 재무팀: finance01@test.local ~ finance02@test.local
- 이름: 김서준, 이지우, 박도윤, 최하은, 정민재, 윤서아, 한지호, 오유진, 강현우, 문채원
- 비밀번호는 각 계정마다 충분히 긴 테스트용 값을 임의 생성
- 이메일 확인이 완료된 테스트 사용자로 생성
- user_metadata에는 display_name만 저장
- team_id와 is_leader는 Auth metadata에 저장하지 않음

실행 방식:
- Supabase Admin API를 사용하되 브라우저 앱에서는 절대 호출하지 않음
- SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY는 .env.test-users에서만 읽음
- service_role key를 코드에 직접 작성하지 않음
- 외부 패키지 없이 현재 Node.js의 fetch와 crypto로 실행 가능하게 작성
- 이 스크립트는 계정 초기 생성을 위한 일회성 로컬 도구이며 GitHub Pages에 포함하지 않음

안전 조건:
- .env.test-users와 test_accounts.local.md를 반드시 .gitignore에 추가
- 생성한 로그인 아이디와 비밀번호는 Day09/Todo_List/test_accounts.local.md에만 기록
- test_accounts.local.md에는 테스트 전용이며 실제 서비스에서 사용 금지라고 표시
- 이미 같은 아이디가 있으면 중복 생성하거나 비밀번호를 임의 변경하지 말고 건너뛴 결과를 표시
- 생성 실패와 성공을 계정별로 구분
- service_role key 전체를 콘솔에 출력하지 않음
- public 테이블이나 SQL 파일에 비밀번호를 저장하지 않음

완료 후 .env.test-users 생성 방법, 실행 명령, Supabase Authentication 화면에서 확인하는 방법을 알려줘.
```

### 5-2. 팀 배정과 5일치 업무·메모·댓글 생성

테스트 계정 10개가 Supabase Auth에 생성되고 `profiles` 행이 만들어진 것을 확인한 뒤 사용합니다.

```text
Supabase Auth 테스트 사용자 10명과 public.profiles 행이 생성된 상태다.

Day09/Todo_List/database.sql을 읽고 사용자 팀 배정 및 5일치 샘플 업무 SQL을
Day09/Todo_List/seed.sql 파일로 만들어 줘.

사용자 아이디와 팀 배정:
- 세일즈팀: sales01@test.local 김서준(팀장), sales02~05 순서대로 이지우, 박도윤, 최하은, 정민재
- 마케팅팀: marketing01@test.local 윤서아(팀장), marketing02~03 순서대로 한지호, 오유진
- 재무팀: finance01@test.local 강현우(팀장), finance02@test.local 문채원

샘플 업무:
- 오늘 날짜를 기준으로 연속 5일치 업무를 만든다.
- 10명 모두에게 날짜별 업무가 고르게 배정되도록 한다.
- 업무명과 설명은 팀 업무에 맞는 명확한 가상 데이터로 작성한다.
- 세일즈팀: 고객 연락, 제안서, 상담 기록 등
- 마케팅팀: 콘텐츠, 캠페인, 성과 확인 등
- 재무팀: 비용 확인, 정산, 보고서 등
- 모든 초기 상태는 start_before로 한다.
- created_by는 각 팀의 팀장 id로 설정한다.
- 실제 회사명, 고객명, 금액, 개인정보를 만들지 않는다.
- 처음 로그인했을 때 팀 전체와 내 업무 화면이 비어 있지 않도록 모든 사용자에게 업무를 배정한다.

예시 메모와 댓글:
- 담당자 메모 사용을 확인할 수 있도록 각 팀에서 1개 이상의 업무에 짧은 예시 메모를 넣는다.
- 댓글 사용을 확인할 수 있도록 각 팀에서 1개 이상의 업무에 같은 팀 사용자의 예시 댓글을 넣는다.
- 메모 작성자는 반드시 해당 업무 담당자로 간주할 수 있는 데이터만 넣는다.
- 댓글 작성자는 반드시 해당 업무와 같은 팀 사용자여야 한다.
- 예시 문구는 테스트 데이터임이 분명하도록 작성한다.

안전 조건:
- auth.users에 직접 INSERT하지 않는다.
- 비밀번호를 SQL에 넣지 않는다.
- profiles의 login_id로 기존 가입 사용자를 찾아 UPDATE한다.
- 목록에 없는 사용자에게 영향을 주지 않는다.
- 사용자를 찾지 못하면 잘못된 데이터가 들어가지 않도록 예외를 발생시킨다.
- 기존 업무를 삭제하지 않는다.
- 같은 seed.sql을 두 번 실행해도 샘플 업무가 중복되지 않도록 구분값 또는 조건을 둔다.
- 메모와 댓글도 재실행 시 중복되지 않게 한다.
- 전체를 transaction으로 구성한다.
- SQL Editor에서만 실행할 관리자용 초기 설정임을 주석으로 표시한다.

완료 후 SQL Editor 실행 순서와 팀·사용자·업무·메모·댓글 확인용 SELECT를 알려줘.
```

---

## 6. 팀 전체·내 업무 화면 만들기

```text
Day09/Todo_List의 현재 database.sql, index.html, style.css, config.js, app.js를 읽어 줘.

기존 가입·로그인 기능을 유지하면서 업무 조회 화면을 추가해 줘.

기능:
- 로그인 후 사용자 이름, 팀 이름, 팀장 또는 팀원 표시
- 팀 전체 / 내 업무 전환 버튼
- 팀 전체: 같은 팀 업무만 조회
- 내 업무: assignee_id가 로그인 사용자 id인 업무만 조회
- 날짜별로 업무를 묶어 표시
- 업무 카드에 날짜, 업무명, 설명, 담당자, 상태, 담당자 메모 표시
- 5일 날짜 선택 필터
- 상태 필터: 전체, 시작 전, 진행 중, 작업 완료
- 최신 조회 요청만 화면에 반영해 빠른 화면 전환 오류 방지

디자인:
- Notion처럼 단순한 상단 바와 탭 구조
- 상태는 글자와 배지로 함께 구분하고 색상에만 의존하지 않음
- 로딩, 결과 없음, 오류 상태 표시
- 데스크톱에서는 보기 쉬운 목록 또는 카드
- 모바일에서는 한 열로 배치하고 버튼이 겹치지 않음
- 불필요한 가로 스크롤 금지

개발 조건:
- Supabase에서 필요한 컬럼만 SELECT
- profiles와 teams 정보는 필요한 관계만 조회
- 모든 응답의 error 확인
- DB 문자열은 textContent로 표시
- RLS가 최종 접근 권한을 담당
- IndexedDB나 임시 배열로 대체하지 않음
- 아직 업무 생성·수정, 상태 변경, 댓글, 알림 기능은 만들지 않음
```

---

## 7. 팀장 업무 배정·재배분 기능 만들기

```text
Day09/Todo_List의 현재 코드와 database.sql을 읽고 팀장 업무 배정 및 재배분 기능을 추가해 줘.

기존 로그인, 팀 전체, 내 업무 기능은 유지한다.

기능:
- 팀장에게만 '새 업무' 버튼 표시
- 업무명, 설명, 업무 날짜, 담당자 선택
- 담당자 목록은 로그인한 팀장과 같은 팀 사용자만 표시
- 팀장은 본인에게도 업무 배정 가능
- 업무 생성 시 created_by는 DB가 auth.uid() 기준으로 안전하게 확인
- 초기 상태는 start_before
- 등록 성공 후 현재 업무 목록 갱신
- 팀장은 기존 업무의 제목, 설명, 날짜, 담당자를 수정 가능
- 팀장은 기존 업무를 같은 팀의 다른 구성원 또는 본인에게 재배분 가능
- 재배분 전 현재 담당자와 변경할 담당자를 명확하게 표시
- 재배분 전 확인 메시지 표시
- 재배분 후 새 담당자 이름이 팀 전체 화면과 내 업무 화면에 즉시 반영
- 재배분된 업무는 기존 담당자의 내 업무 화면에서 사라지고 새 담당자의 내 업무 화면에 표시
- 기존 담당자가 열어 둔 화면에서 상태나 메모 저장을 시도해도 RLS가 차단
- 다른 팀 사용자는 담당자 선택 목록에 표시하지 않으며 직접 요청으로 지정해도 DB에서 거절
- 기존 상태와 담당자 메모는 재배분 시 임의로 초기화하지 않고 그대로 유지
- 수정·등록 중 버튼 비활성화
- 성공·실패 메시지 구분
- 팀원이 개발자 도구로 요청해도 업무를 생성하거나 다른 담당자로 변경할 수 없도록 RLS와 DB 검증 유지
- 업무명은 1~200자, 설명은 공백만 입력 불가
- 모든 Supabase error 확인
- 기존 정상 기능 변경 금지
- 아직 상태 변경, 댓글, 알림 화면은 만들지 않음

완료 후 팀장, 기존 담당자, 새 담당자, 다른 팀 사용자 계정으로 배정·재배분 권한을 확인할 테스트 방법을 알려줘.
```

---

## 8. 담당자 상태 및 메모 기능 만들기

```text
Day09/Todo_List의 현재 코드와 database.sql을 읽고 담당자의 상태 변경과 메모 기능을 추가해 줘.

기존 기능은 유지한다.

기능:
- 업무 담당자에게만 상태 변경 UI 표시
- 상태: 시작 전(start_before), 진행 중(in_progress), 작업 완료(completed)
- 담당자만 assignee_memo 작성·수정 가능
- 상태와 메모 저장 중 중복 요청 방지
- 완료 전 확인 메시지 표시
- 작업 완료 시 completed_at이 DB trigger로 기록되는지 확인
- 완료 성공 후 팀 전체 화면과 내 업무 화면 갱신
- 담당자가 아닌 사용자는 UI와 직접 API 요청 모두에서 변경 불가
- 팀장도 본인이 담당자가 아닌 업무의 담당자 상태·메모를 대신 바꾸지 않음
- UPDATE는 업무 id와 assignee_id 조건을 함께 사용하고 최종 권한은 RLS가 강제
- 로그아웃 또는 사용자 전환 시 이전 편집 상태 초기화
- 이전 비동기 응답이 새 사용자 화면에 섞이지 않도록 처리
- 모든 Supabase error와 실제 변경 행 존재 여부 확인

아직 댓글과 알림 목록 UI는 만들지 않는다. 완료 trigger가 notification을 생성하는지는 SQL 확인 방법만 알려줘.
```

---

## 9. 업무 댓글 기능 만들기

```text
Day09/Todo_List의 현재 코드와 database.sql을 읽고 업무별 댓글 기능을 추가해 줘.

기존 기능은 유지한다.

기능:
- 업무 카드를 선택하면 상세 영역 또는 접근 가능한 대화상자 표시
- 업무 설명, 담당자 메모, 댓글 목록 표시
- 같은 팀 사용자는 댓글 조회·작성 가능
- 댓글은 오래된 순서대로 표시
- 댓글 작성자 이름과 작성일 표시
- 댓글 내용은 공백 제외 1~1000자
- 댓글 작성자는 자기 댓글만 수정·삭제 가능
- 삭제 전 확인 메시지 표시
- 작성·수정·삭제 중 버튼 비활성화
- 성공 후 현재 업무의 댓글만 다시 조회
- 업무를 빠르게 바꿀 때 이전 업무 댓글이 현재 업무에 표시되지 않게 처리
- 다른 팀 업무나 댓글은 조회할 수 없어야 함
- 모든 Supabase error 확인
- 사용자 입력을 innerHTML로 직접 삽입하지 않음
- 최종 권한은 RLS로 강제

완료 후 팀장, 같은 팀 팀원, 다른 팀 사용자 관점의 테스트 방법을 알려줘.
```

---

## 10. 팀장 완료 알림 화면 만들기

```text
Day09/Todo_List의 현재 코드와 database.sql을 읽고 팀장 완료 알림 화면을 추가해 줘.

기존 기능은 유지한다.

기능:
- 팀장에게만 알림 버튼 표시
- 읽지 않은 알림 수를 숫자로 표시
- 담당자가 업무를 작업 완료로 변경하면 해당 팀장의 알림 목록에 나타남
- 알림에 담당자 이름, 업무명, 완료 시각 표시
- 알림 선택 시 해당 업무 상세 열기
- 개별 알림 읽음 처리
- 모두 읽음 처리
- recipient_id가 로그인 사용자 id인 알림만 조회·수정
- 팀원은 다른 사람의 알림을 조회할 수 없음
- 페이지 진입과 업무 완료 후 알림 목록 갱신
- 우선은 단순하고 안정적인 새로고침 방식으로 구현하고, Supabase Realtime은 추가하지 않음
- 모든 Supabase error 확인
- 읽음 처리 시 실제 변경 행 확인
- 로그아웃 시 알림과 숫자 즉시 비우기
- 사용자 전환 시 이전 사용자의 알림 응답이 표시되지 않게 처리

완료 후 담당자 완료 → 팀장 확인 과정을 단계별로 테스트하는 방법을 알려줘.
```

---

## 11. 반응형 디자인 및 접근성 점검

```text
Day09/Todo_List의 현재 HTML, CSS, JavaScript를 검토하고 화면 디자인을 정리해 줘.

목표:
- Notion처럼 직관적이고 차분한 업무용 화면
- PC, 태블릿, 스마트폰에서 사용 가능
- 기존 기능과 데이터 처리 방식은 변경하지 않음

점검:
- 데스크톱, 768px 전후, 390px 전후 화면
- 가로 스크롤, 버튼 겹침, 잘린 글자, 너무 작은 클릭 영역 수정
- 팀 전체/내 업무 전환이 명확하게 보임
- 상태 배지는 색상뿐 아니라 텍스트로 구분
- 모든 input에 label 연결
- 버튼 목적을 글자로 명확히 표시
- 키보드로 탭, 폼, 대화상자 사용 가능
- 대화상자 ESC 닫기와 포커스 처리
- 오류·성공 메시지를 화면 읽기 도구가 알 수 있도록 처리
- 충분한 글자 크기와 색상 대비
- 과도한 애니메이션과 색상 사용 금지

실제 문제가 확인된 부분만 작은 범위로 수정하고 변경한 파일을 알려줘.
```

---

## 12. 전체 기능 및 보안 최종 점검

```text
Day09/Todo_List 프로젝트 전체를 검토하고 가능한 검증을 실행해 줘.

점검 항목:
- 가입, 로그인, 로그아웃, 세션 복원
- 가입 사용자의 팀 미배정 안내
- 팀별 사용자와 업무 데이터 분리
- 팀 전체 / 내 업무 전환
- 날짜 및 상태 필터
- 팀장만 같은 팀에 업무 배정
- 팀장만 자기 팀 안에서 업무 재배분
- 재배분 후 기존 담당자의 상태·메모 변경 차단
- 재배분 후 새 담당자의 내 업무 표시 및 상태·메모 변경 허용
- 담당자만 상태와 담당자 메모 변경
- 작업 완료 시 팀장 알림 생성
- 팀장만 자신의 알림 조회 및 읽음 처리
- 같은 팀 댓글 작성
- 댓글 작성자만 수정·삭제
- 다른 팀 데이터 접근 차단
- RLS 및 중요 컬럼 변경 방지
- 비밀번호와 Secret key가 코드에 없는지 확인
- XSS 방지
- 중복 요청 방지와 빠른 화면 전환 처리
- 데스크톱과 모바일 레이아웃
- GitHub Pages 상대 경로 호환성

규칙:
- 실제 오류가 확인된 부분만 수정
- 기존 정상 기능 유지
- 기존 데이터 삭제 금지
- RLS 비활성화 금지
- 불필요한 패키지나 프레임워크 추가 금지
- 코드 검토와 실제 실행 검증 결과를 구분해서 보고
- 검증하지 못한 내용은 성공했다고 단정하지 말고 수동 확인 방법 제공

최종적으로 팀장, 팀원, 다른 팀 사용자별 테스트 체크리스트를 Day09/Todo_List/TEST_CHECKLIST.md로 작성해 줘.
```

---

## 13. GitHub 저장소 생성 및 Pages 배포 준비

```text
Day09/Todo_List 프로젝트를 GitHub Pages에 배포할 수 있도록 최종 준비해 줘.

작업:
- 현재 파일 구조와 Git 상태 확인
- config.js에 Secret key 또는 service_role key가 없는지 확인
- Project URL과 Publishable key는 공개 가능한 브라우저 연결 정보임을 설명
- 절대 경로를 사용한 부분이 있다면 GitHub Pages용 상대 경로로 수정
- 불필요한 개발 파일을 배포 대상에서 제외
- Day09/Todo_List/README.md 작성

README 내용:
- 프로젝트 소개
- 주요 기능
- 파일 구성
- Supabase database.sql과 seed.sql 실행 순서
- config.js 설정 방법
- 로컬 실행 방법
- GitHub 저장소 생성 및 push 명령
- GitHub Pages 설정: main 브랜치와 배포 폴더 선택
- 테스트 계정 비밀번호는 GitHub에 올리지 않고 test_accounts.local.md에서만 확인한다는 안내
- 팀장·팀원 테스트 방법

주의:
- 내 확인 없이 기존 Git 저장소의 remote를 변경하지 않는다.
- 내 확인 없이 실제 GitHub 저장소를 만들거나 push하지 않는다.
- 먼저 현재 저장소 구조에 맞는 가장 단순한 배포 방법을 제안한다.
- Day09/Todo_List가 저장소의 하위 폴더이면 GitHub Pages 접속 URL에 /Day09/Todo_List/가 포함되는 점을 설명한다.

파일을 준비한 뒤, 실제로 사용자가 실행할 Git 명령과 GitHub 화면에서 누를 위치를 순서대로 알려줘.
```

---

## 실제 진행 순서 요약

1. 프로젝트 규칙 확인
2. `database.sql` 생성
3. Supabase SQL Editor에서 `database.sql` 실행
4. 가입·로그인 화면 생성
5. Supabase URL과 Publishable key 설정
6. 로컬 관리자 스크립트 생성
7. 로컬 관리자 환경 파일에 URL과 service_role key 입력
8. 관리자 스크립트로 테스트 Auth 사용자 10명 생성
9. `test_accounts.local.md`에서 테스트 아이디와 비밀번호 확인
10. `seed.sql` 생성
11. Supabase SQL Editor에서 `seed.sql` 실행
12. 팀·사용자·5일치 업무·예시 메모·댓글 확인
13. 팀 전체·내 업무 화면 구현
14. 팀장 업무 배정 구현
15. 담당자 상태·메모 구현
16. 댓글 구현
17. 완료 알림 구현
18. 반응형·접근성 점검
19. 전체 기능과 RLS 검증
20. GitHub 저장소 및 Pages 배포

## Supabase와 GitHub에서 사용자가 직접 해야 하는 작업

- Supabase 새 프로젝트 생성
- `database.sql`, `seed.sql`을 SQL Editor에서 실행
- Project URL과 Publishable key를 `config.js`에 입력
- 로컬 관리자 환경 파일에 service_role key를 한 번 입력
- 테스트 계정 생성 스크립트 실행 후 `test_accounts.local.md`에서 계정 확인
- GitHub 로그인 및 저장소 생성 확인
- GitHub Pages 배포 설정

테스트 계정 비밀번호, Secret key, service_role key는 GitHub에 기록하거나 배포하지 않습니다.
