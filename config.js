// Supabase Dashboard → Project Settings → API에서 확인합니다.
// 브라우저에는 Project URL과 Publishable key만 사용합니다.
// Secret key 또는 service_role key는 절대 입력하지 마세요.

const SUPABASE_URL = "https://pogcmysuurtpogbochxc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_FH-NQYN_Z90Kg9zFoc2EOA_dZ1cqlUq";

const isSupabaseConfigured =
  SUPABASE_URL.startsWith("https://") &&
  !SUPABASE_URL.includes("여기에") &&
  SUPABASE_PUBLISHABLE_KEY.length > 20 &&
  !SUPABASE_PUBLISHABLE_KEY.includes("여기에");

const sb = isSupabaseConfigured
  ? supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
  : null;
