# Vibe Todo List

Supabase와 순수 HTML, CSS, JavaScript로 만든 팀 업무 관리 웹페이지입니다.

## 웹페이지

<https://saehkim11.github.io/vibe-todolist/>

## 주요 기능

- Supabase Auth 회원가입·로그인·로그아웃
- 세일즈팀, 마케팅팀, 재무팀별 데이터 분리
- 팀 전체 업무와 내 업무 전환
- 날짜·진행 상태 필터
- 팀장의 업무 배정·수정·재배분
- 담당자의 시작 전·진행 중·작업 완료 상태 변경
- 담당자 메모
- 같은 팀 구성원의 업무 댓글
- 작업 완료 시 팀장 알림
- PC·태블릿·스마트폰 반응형 화면
- Supabase RLS를 이용한 팀·사용자별 권한 제한

## 파일 구성

| 파일 | 역할 |
| --- | --- |
| `index.html` | 웹페이지 구조 |
| `style.css` | Notion 스타일과 반응형 화면 |
| `app.js` | 로그인, 업무, 댓글, 알림 기능 |
| `config.js` | Supabase Project URL과 Publishable key |
| `database.sql` | 테이블, 함수, 트리거, RLS 구성 |
| `seed.sql` | 테스트 팀원과 5일치 업무 배정 |
| `create_test_users.js` | 테스트 Auth 사용자 생성용 로컬 도구 |

## Supabase 설정 순서

1. 새 Supabase 프로젝트를 만듭니다.
2. SQL Editor에서 `database.sql`을 실행합니다.
3. `.env.test-users.example`을 `.env.test-users`로 복사합니다.
4. 로컬 환경 파일에 Project URL과 Secret key를 입력합니다.
5. `node create_test_users.js`를 실행합니다.
6. SQL Editor에서 `seed.sql`을 실행합니다.
7. `config.js`에 Project URL과 Publishable key를 입력합니다.

## 보안 주의사항

- `config.js`에는 공개용 Publishable key만 사용합니다.
- Secret key 또는 기존 `service_role` 키를 브라우저 코드에 넣지 않습니다.
- `.env.test-users`와 `test_accounts.local.md`는 GitHub에 올리지 않습니다.
- 실제 데이터 권한은 화면의 버튼이 아니라 Supabase RLS가 최종적으로 제한합니다.

## 테스트 계정

테스트 계정의 아이디와 비밀번호는 로컬에서 생성되는 `test_accounts.local.md`에서 확인합니다. 이 파일은 GitHub에서 제외됩니다.
