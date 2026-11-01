/**
 * Supabase Auth 테스트 사용자 10명을 만드는 일회성 로컬 도구입니다.
 *
 * 실행 전:
 * 1. .env.test-users.example을 .env.test-users로 복사합니다.
 * 2. Project URL과 Secret key를 입력합니다.
 * 3. node create_test_users.js 명령으로 실행합니다.
 *
 * 주의: 이 파일은 브라우저 또는 GitHub Pages에서 실행하지 않습니다.
 */

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const projectFolder = __dirname;
const envPath = path.join(projectFolder, ".env.test-users");
const accountListPath = path.join(projectFolder, "test_accounts.local.md");

const testUsers = [
  { email: "ceo01@test.local", name: "윤서준", team: "경영진", role: "사장" },
  { email: "vp01@test.local", name: "한지민", team: "경영진", role: "부사장" },
  { email: "sales01@test.local", name: "김서준", team: "세일즈팀", role: "팀장" },
  { email: "sales02@test.local", name: "이지우", team: "세일즈팀", role: "팀원" },
  { email: "sales03@test.local", name: "박도윤", team: "세일즈팀", role: "팀원" },
  { email: "sales04@test.local", name: "최하은", team: "세일즈팀", role: "팀원" },
  { email: "sales05@test.local", name: "정민재", team: "세일즈팀", role: "팀원" },
  { email: "marketing01@test.local", name: "윤서아", team: "마케팅팀", role: "팀장" },
  { email: "marketing02@test.local", name: "한지호", team: "마케팅팀", role: "팀원" },
  { email: "marketing03@test.local", name: "오유진", team: "마케팅팀", role: "팀원" },
  { email: "finance01@test.local", name: "강현우", team: "재무팀", role: "팀장" },
  { email: "finance02@test.local", name: "문채원", team: "재무팀", role: "팀원" }
];

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(
      ".env.test-users 파일이 없습니다. .env.test-users.example을 복사해 만들어 주세요."
    );
  }

  const values = {};
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf("=");

    if (separatorIndex < 1) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    let value = trimmedLine.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
}

function validateSettings(settings) {
  const projectUrl = settings.SUPABASE_URL || "";
  const secretKey = settings.SUPABASE_SECRET_KEY || "";

  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(projectUrl)) {
    throw new Error("SUPABASE_URL 형식이 올바르지 않습니다.");
  }

  if (!secretKey.startsWith("sb_secret_")) {
    throw new Error(
      "SUPABASE_SECRET_KEY에는 sb_secret_으로 시작하는 Secret key를 입력해 주세요."
    );
  }

  if (secretKey.startsWith("sb_publishable_")) {
    throw new Error("Publishable key가 아닌 Secret key가 필요합니다.");
  }

  return {
    projectUrl: projectUrl.replace(/\/$/, ""),
    secretKey
  };
}

function createPassword() {
  return `${crypto.randomBytes(15).toString("base64url")}Aa1!`;
}

function readSavedPasswords() {
  const savedPasswords = new Map();

  if (!fs.existsSync(accountListPath)) {
    return savedPasswords;
  }

  const content = fs.readFileSync(accountListPath, "utf8");
  const rowPattern = /^\|\s*([^|\s]+@[^|\s]+)\s*\|\s*`([^`]+)`\s*\|/gm;
  let match;

  while ((match = rowPattern.exec(content)) !== null) {
    savedPasswords.set(match[1].toLowerCase(), match[2]);
  }

  return savedPasswords;
}

function saveAccountList(passwords, statuses) {
  const lines = [
    "# Day09 Todo List 테스트 계정",
    "",
    "> 테스트 전용 계정입니다. 실제 서비스에서 사용하지 마세요.",
    "> 이 파일은 GitHub에서 제외되며 다른 사람에게 전달하지 않습니다.",
    "",
    "| 아이디 | 비밀번호 | 이름 | 팀 | 역할 | 생성 상태 |",
    "| --- | --- | --- | --- | --- | --- |"
  ];

  for (const user of testUsers) {
    const password = passwords.get(user.email) || "확인 불가";
    const status = statuses.get(user.email) || "생성 전";
    lines.push(
      `| ${user.email} | \`${password}\` | ${user.name} | ${user.team} | ${user.role} | ${status} |`
    );
  }

  lines.push(
    "",
    "팀과 팀장 여부는 seed.sql 실행 후 적용됩니다.",
    "이 파일에는 Secret key가 저장되지 않습니다."
  );

  fs.writeFileSync(accountListPath, `${lines.join("\n")}\n`, "utf8");
}

async function requestAdminApi(projectUrl, secretKey, endpoint, options = {}) {
  const response = await fetch(`${projectUrl}/auth/v1/admin${endpoint}`, {
    ...options,
    headers: {
      apikey: secretKey,
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const responseText = await response.text();
  let responseData = null;

  if (responseText) {
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { message: responseText };
    }
  }

  if (!response.ok) {
    const message =
      responseData?.msg ||
      responseData?.message ||
      responseData?.error_description ||
      `HTTP ${response.status}`;
    throw new Error(message);
  }

  return responseData;
}

async function getExistingUserEmails(projectUrl, secretKey) {
  const data = await requestAdminApi(
    projectUrl,
    secretKey,
    "/users?page=1&per_page=1000",
    { method: "GET" }
  );

  return new Set((data?.users || []).map((user) => user.email?.toLowerCase()));
}

async function createAuthUser(projectUrl, secretKey, user, password) {
  return requestAdminApi(projectUrl, secretKey, "/users", {
    method: "POST",
    body: JSON.stringify({
      email: user.email,
      password,
      email_confirm: true,
      user_metadata: {
        display_name: user.name
      }
    })
  });
}

async function main() {
  const settings = validateSettings(readEnvFile(envPath));
  const existingEmails = await getExistingUserEmails(
    settings.projectUrl,
    settings.secretKey
  );
  const passwords = readSavedPasswords();
  const statuses = new Map();

  for (const user of testUsers) {
    if (existingEmails.has(user.email)) {
      statuses.set(user.email, "기존 계정 - 건너뜀");
      console.log(`[건너뜀] ${user.email} - 이미 존재하는 계정입니다.`);
      continue;
    }

    const password = passwords.get(user.email) || createPassword();

    try {
      await createAuthUser(settings.projectUrl, settings.secretKey, user, password);
      passwords.set(user.email, password);
      statuses.set(user.email, "생성 완료");
      console.log(`[완료] ${user.email} (${user.name})`);
    } catch (error) {
      statuses.set(user.email, `생성 실패: ${error.message}`);
      console.error(`[실패] ${user.email} - ${error.message}`);
    }

    // 중간에 실행이 멈춰도 이미 생성된 계정의 로그인 정보를 보존합니다.
    saveAccountList(passwords, statuses);
  }

  saveAccountList(passwords, statuses);

  const completedCount = [...statuses.values()].filter(
    (status) => status === "생성 완료" || status === "기존 계정 - 건너뜀"
  ).length;

  console.log("");
  console.log(`처리 결과: ${completedCount}/${testUsers.length}개 계정 확인`);
  console.log("로그인 정보: test_accounts.local.md");

  if (completedCount !== testUsers.length) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`실행 중단: ${error.message}`);
  process.exitCode = 1;
});
